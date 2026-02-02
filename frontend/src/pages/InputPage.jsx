import { useState } from "react";
import { useNavigate } from "react-router-dom";

function InputPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([
    { subject: "", faculty: "", lecturesPerWeek: 1 }
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const addSubject = () => {
    setSubjects([
      ...subjects,
      { subject: "", faculty: "", lecturesPerWeek: 1 }
    ]);
  };

const generateTimetable = () => {
  fetch("http://localhost:5000/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subjects }),
  })
    .then((res) => res.json())
    .then(() => navigate("/timetable"))
    .catch(err => console.error(err));
};


  return (
    <div style={{ padding: "20px" }}>
      <h2>Timetable Input</h2>

      {subjects.map((sub, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <input
            placeholder="Subject"
            value={sub.subject}
            onChange={(e) =>
              handleChange(index, "subject", e.target.value)
            }
          />

          <input
            placeholder="Faculty"
            value={sub.faculty}
            onChange={(e) =>
              handleChange(index, "faculty", e.target.value)
            }
          />

          <input
            type="number"
            min="1"
            placeholder="Lectures per Week"
            value={sub.lecturesPerWeek}
          onChange={(e) =>
  handleChange(index, "lecturesPerWeek", Number(e.target.value))
}
          />
        </div>
      ))}

      <button onClick={addSubject}>Add Subject</button>
      <br /><br />
      <button onClick={generateTimetable}>
        Generate Timetable
      </button>
    </div>
  );
}

export default InputPage;
