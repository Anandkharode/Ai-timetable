from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
SLOTS = ["9-10", "10-11", "11-12", "1-2", "2-3"]
ROOMS = ["R1", "R2"]

MAX_LECTURES_PER_DAY = 2
MAX_ATTEMPTS = 1000  

def generate_timetable(subjects, days, slots):
    timetable = []
    occupied_faculty = set()
    occupied_room = set()
    daily_load = {}

    for sub in subjects:
        required = sub.get("lecturesPerWeek", 1)
        faculty = sub.get("faculty")
        subject = sub.get("subject")

        attempts = 0
        while required > 0 and attempts < MAX_ATTEMPTS:
            attempts += 1

            day = random.choice(days)
            slot = random.choice(slots)
            room = random.choice(ROOMS)

            faculty_key = (day, slot, faculty)
            room_key = (day, slot, room)
            daily_key = (day, faculty)

            if faculty_key in occupied_faculty:
                continue
            if room_key in occupied_room:
                continue
            if daily_load.get(daily_key, 0) >= MAX_LECTURES_PER_DAY:
                continue

            timetable.append({
                "subject": subject,
                "faculty": faculty,
                "room": room,
                "day": day,
                "slot": slot
            })

            occupied_faculty.add(faculty_key)
            occupied_room.add(room_key)
            daily_load[daily_key] = daily_load.get(daily_key, 0) + 1
            required -= 1
            
    return timetable

@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json(force=True)
        subjects = data.get("subjects", [])
        
        # Use dynamic days and slots if provided
        custom_days = data.get("days", DAYS)
        custom_slots = data.get("slots", SLOTS)

        timetable = generate_timetable(subjects, custom_days, custom_slots)
        return jsonify(timetable)

    except Exception as e:
        print("AI ERROR:", str(e))
        return jsonify({ "error": "AI generation failed" }), 500


if __name__ == "__main__":
    app.run(port=5001)
