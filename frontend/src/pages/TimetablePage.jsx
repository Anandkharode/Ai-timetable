import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSettings } from "../utils/settingsStore";
import { generateTimeSlots } from "../utils/timetableUtils";
import "./TimetablePage.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function TimetablePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const timetableId = queryParams.get("id");

  const [timetableData, setTimetableData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [activeSettings, setActiveSettings] = useState(getSettings());
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        let url = "http://localhost:5000/api/timetable";
        if (timetableId) {
          url = `http://localhost:5000/api/timetable/${timetableId}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch timetable");
        const data = await res.json();

        if (Array.isArray(data)) {
          setTimetableData({
            title: "Preview Schedule",
            entries: data,
            settings: getSettings()
          });
          setTimeSlots(generateTimeSlots(getSettings()));
        } else {
          setTimetableData(data);
          if (data.settings) {
            setActiveSettings(data.settings);
            setTimeSlots(generateTimeSlots(data.settings));
          } else {
            setTimeSlots(generateTimeSlots(getSettings()));
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimetable();
  }, [timetableId]);

  const getCell = (day, slot) => {
    if (!timetableData) return null;
    const entry = timetableData.entries.find(
      (t) => t.day === day && t.slot === slot
    );
    return entry || null;
  };

  const handleCellClick = (day, slot, entry) => {
    if (entry) {
      setSelectedCell({ day, slot, entry });
    }
  };

  const getSubjectColor = (subject) => {
    // Generate consistent colors based on subject name
    const hash = subject.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const colors = [
      { bg: 'rgba(201, 169, 110, 0.15)', border: '#c9a96e', text: '#6b5d3f' },
      { bg: 'rgba(82, 166, 117, 0.15)', border: '#52a675', text: '#2d5a42' },
      { bg: 'rgba(106, 134, 198, 0.15)', border: '#6a86c6', text: '#3a4a75' },
      { bg: 'rgba(209, 73, 91, 0.15)', border: '#d1495b', text: '#7a2a35' },
      { bg: 'rgba(147, 112, 219, 0.15)', border: '#9370db', text: '#5a4281' },
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  const handlePrint = () => window.print();
  const handleEdit = () => navigate("/create");

  const handleDelete = async () => {
    if (!timetableId) return;
    if (window.confirm("Are you sure you want to delete this timetable?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/timetable/${timetableId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Failed to delete", err);
        alert("Error deleting timetable");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="timetable-page loading-state">
        <div className="loading-spinner-large"></div>
        <p className="loading-text">Generating your timetable...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timetable-page error-state">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Unable to Load Timetable</h2>
        <p className="error-message">{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="timetable-page">
      <div className="timetable-background">
        <div className="grid-overlay"></div>
        <div className="corner-accent accent-tl"></div>
        <div className="corner-accent accent-br"></div>
      </div>

      <div className="timetable-container">
        <div className="timetable-header">
          <div className="header-left">
            <div className="institution-badge">{activeSettings?.institutionName || "AI Timetable"}</div>
            <h1 className="timetable-title">{timetableData?.title || "Class Schedule"}</h1>
            <p className="timetable-subtitle">
              Generated for {activeSettings?.semester || "Current Term"} • {activeSettings?.academicYear || "2026"}
            </p>
          </div>
          <div className="header-actions">
            <button className="action-btn danger" onClick={handleDelete}>
              Delete
            </button>
            <button className="action-btn secondary" onClick={handleEdit}>
              Edit Schedule
            </button>
            <button className="action-btn primary" onClick={handlePrint}>
              Print
            </button>
          </div>
        </div>

        <div className="timetable-wrapper">
          <div className="timetable-scroll">
            <table className="timetable">
              <thead>
                <tr>
                  <th className="day-header corner-cell">
                    <div className="header-content">
                      <span className="header-label">Day</span>
                      <span className="header-divider">/</span>
                      <span className="header-label">Time</span>
                    </div>
                  </th>
                  {timeSlots.map((slot, index) => (
                    <th key={slot} className="time-header" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="time-badge">
                        <span className="time-text">{slot}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, dayIndex) => (
                  <tr key={day} style={{ animationDelay: `${dayIndex * 0.1}s` }}>
                    <td className="day-cell">
                      <div className="day-name">{day}</div>
                    </td>
                    {timeSlots.map((slot) => {
                      const entry = getCell(day, slot);
                      const colors = entry ? getSubjectColor(entry.subject) : null;

                      return (
                        <td
                          key={slot}
                          className={`schedule-cell ${entry ? 'has-class' : 'empty-cell'} ${selectedCell?.day === day && selectedCell?.slot === slot ? 'selected' : ''
                            }`}
                          onClick={() => handleCellClick(day, slot, entry)}
                          style={entry ? {
                            '--cell-bg': colors.bg,
                            '--cell-border': colors.border,
                            '--cell-text': colors.text,
                          } : {}}
                        >
                          {entry ? (
                            <div className="class-info">
                              <div className="subject-name">{entry.subject}</div>
                              <div className="faculty-name">{entry.faculty}</div>
                            </div>
                          ) : (
                            <div className="empty-slot">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedCell && (
          <div className="detail-panel" onClick={() => setSelectedCell(null)}>
            <div className="panel-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-panel" onClick={() => setSelectedCell(null)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="panel-header">
                <h3>{selectedCell.entry.subject}</h3>
              </div>
              <div className="panel-details">
                <div className="detail-row">
                  <span className="detail-label">Faculty</span>
                  <span className="detail-value">{selectedCell.entry.faculty}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Day</span>
                  <span className="detail-value">{selectedCell.day}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">{selectedCell.slot}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Room</span>
                  <span className="detail-value">{selectedCell.entry.room || "TBD"}</span>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}

export default TimetablePage;