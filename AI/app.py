from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
SLOTS = ["9-10", "10-11", "11-12", "1-2", "2-3"]
ROOMS = ["R1", "R2", "R3", "LAB1"]

MAX_LECTURES_PER_DAY = 3


def normalize_groups(data):
    department = data.get("department", "").strip()
    groups = data.get("groups")

    if groups:
        normalized_groups = []
        for index, group in enumerate(groups):
            normalized_groups.append({
                "department": (group.get("department") or department).strip(),
                "year": (group.get("year") or f"Year {index + 1}").strip(),
                "section": (group.get("section") or "A").strip(),
                "subjects": group.get("subjects", []),
            })
        return normalized_groups

    # Backwards compatibility for the old single-list payload
    subjects = data.get("subjects", [])
    if not subjects:
        return []

    return [{
        "department": department,
        "year": (data.get("year") or "General").strip(),
        "section": (data.get("section") or "A").strip(),
        "subjects": subjects,
    }]


def normalize_session_type(value):
    if not value:
        return "lecture"
    value = str(value).strip().lower()
    if value.startswith("prac"):
        return "practical"
    return "lecture"


def build_sessions(groups):
    sessions = []
    faculty_demand = {}

    for group in groups:
        department = group.get("department", "")
        year = group.get("year", "")
        section = group.get("section", "A")

        for sub in group.get("subjects", []):
            subject = (sub.get("subject") or "").strip()
            faculty = (sub.get("faculty") or "").strip()
            required = int(sub.get("lecturesPerWeek", 1) or 1)
            session_type = normalize_session_type(sub.get("sessionType") or sub.get("type"))
            batches = [
                str(batch).strip()
                for batch in (sub.get("batches") or [])
                if str(batch).strip()
            ]

            if not subject or not faculty or required < 1:
                continue

            faculty_demand[faculty] = faculty_demand.get(faculty, 0) + required

            for lecture_index in range(required):
                sessions.append({
                    "department": department,
                    "year": year,
                    "section": section,
                    "subject": subject,
                    "faculty": faculty,
                    "session_type": session_type,
                    "batches": batches,
                    "session_index": lecture_index,
                })

    random.shuffle(sessions)
    sessions.sort(
        key=lambda session: (
            -faculty_demand.get(session["faculty"], 0),
            session["year"],
            session["section"],
            session["subject"],
        )
    )
    return sessions


def generate_timetable(groups, days, slots):
    timetable = []
    unscheduled = []
    occupied_faculty = set()
    occupied_room = set()
    occupied_classes = set()
    daily_faculty_load = {}
    daily_subject_load = {}
    sessions = build_sessions(groups)
    faculty_load = {}

    room_list = ROOMS[:]
    lab_rooms = [room for room in ROOMS if "LAB" in room.upper()]

    for session in sessions:
        candidates = []
        candidate_rooms = lab_rooms[:] if session["session_type"] == "practical" and lab_rooms else room_list[:]
        random.shuffle(candidate_rooms)

        for day in days:
            class_subject_key = (
                day,
                session["year"],
                session["section"],
                session["subject"],
                session["session_type"],
            )
            if daily_subject_load.get(class_subject_key, 0) >= 1:
                continue

            faculty_day_key = (day, session["faculty"])
            if daily_faculty_load.get(faculty_day_key, 0) >= MAX_LECTURES_PER_DAY:
                continue

            slot_order = slots[:]
            random.shuffle(slot_order)

            for slot in slot_order:
                faculty_key = (day, slot, session["faculty"])
                class_key = (day, slot, session["year"], session["section"])

                if faculty_key in occupied_faculty:
                    continue
                if class_key in occupied_classes:
                    continue

                for room in candidate_rooms:
                    room_key = (day, slot, room)
                    if room_key in occupied_room:
                        continue
                    candidates.append((day, slot, room))

        if not candidates:
            unscheduled.append({
                "department": session["department"],
                "year": session["year"],
                "section": session["section"],
                "subject": session["subject"],
                "faculty": session["faculty"],
                "sessionType": session["session_type"],
                "batches": session["batches"],
                "reason": "No available slot without faculty/class/room conflict",
            })
            continue

        day, slot, room = random.choice(candidates)

        timetable.append({
            "department": session["department"],
            "year": session["year"],
            "section": session["section"],
            "subject": session["subject"],
            "faculty": session["faculty"],
            "sessionType": session["session_type"],
            "batches": session["batches"],
            "room": room,
            "day": day,
            "slot": slot,
        })

        occupied_faculty.add((day, slot, session["faculty"]))
        occupied_room.add((day, slot, room))
        occupied_classes.add((day, slot, session["year"], session["section"]))

        faculty_day_key = (day, session["faculty"])
        daily_faculty_load[faculty_day_key] = daily_faculty_load.get(faculty_day_key, 0) + 1
        faculty_load.setdefault(session["faculty"], {"lectures": 0, "practicals": 0, "total": 0})
        if session["session_type"] == "practical":
            faculty_load[session["faculty"]]["practicals"] += 1
        else:
            faculty_load[session["faculty"]]["lectures"] += 1
        faculty_load[session["faculty"]]["total"] += 1

        class_subject_key = (
            day,
            session["year"],
            session["section"],
            session["subject"],
            session["session_type"],
        )
        daily_subject_load[class_subject_key] = daily_subject_load.get(class_subject_key, 0) + 1

    return {
        "entries": timetable,
        "unscheduled": unscheduled,
        "summary": {
            "requestedSessions": len(sessions),
            "scheduledSessions": len(timetable),
            "unscheduledSessions": len(unscheduled),
            "groupCount": len(groups),
            "facultyLoad": [
                {
                    "faculty": faculty,
                    "lectures": load["lectures"],
                    "practicals": load["practicals"],
                    "total": load["total"],
                }
                for faculty, load in sorted(
                    faculty_load.items(),
                    key=lambda item: (-item[1]["total"], item[0])
                )
            ],
        },
    }


@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json(force=True)
        groups = normalize_groups(data)
        custom_days = data.get("days", DAYS)
        custom_slots = data.get("slots", SLOTS)

        result = generate_timetable(groups, custom_days, custom_slots)
        return jsonify(result)

    except Exception as e:
        print("AI ERROR:", str(e))
        return jsonify({"error": "AI generation failed"}), 500


if __name__ == "__main__":
    app.run(port=5001)
