import { useEffect, useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOTS = ["9-10", "10-11", "11-12", "1-2", "2-3"];

function TimetablePage() {
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/timetable")
      .then((res) => res.json())
      .then((data) => setTimetable(data));
  }, []);

  const getCell = (day, slot) => {
    const entry = timetable.find(
      (t) => t.day === day && t.slot === slot
    );
    return entry ? `${entry.subject} (${entry.faculty})` : "-";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Generated Timetable</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Day / Time</th>
            {SLOTS.map((slot) => (
              <th key={slot}>{slot}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => (
            <tr key={day}>
              <td><b>{day}</b></td>
              {SLOTS.map((slot) => (
                <td key={slot}>{getCell(day, slot)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TimetablePage;
