import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TimetablePage.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOTS = ["9-10", "10-11", "11-12", "1-2", "2-3"];

function TimetablePage() {
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/timetable")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch timetable");
        return res.json();
      })
      .then((data) => {
        setTimetable(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const getCell = (day, slot) => {
    const entry = timetable.find(
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

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    navigate("/input");
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
            <h1 className="timetable-title">Your Schedule</h1>
            <p className="timetable-subtitle">
              {timetable.length} classes scheduled this week
            </p>
          </div>
          <div className="header-actions">
            <button className="action-btn secondary" onClick={handleEdit}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M12.75 2.25L15.75 5.25M1.5 16.5L4.125 16.125L15.375 4.875C15.5745 4.67554 15.7333 4.43933 15.8425 4.17937C15.9516 3.91942 16.0088 3.64073 16.0107 3.35904C16.0126 3.07735 15.9591 2.79787 15.8534 2.53634C15.7476 2.27481 15.5917 2.03623 15.395 1.83494C15.1984 1.63366 14.965 1.47293 14.7085 1.36193C14.4519 1.25093 14.1771 1.19172 13.8995 1.18741C13.6219 1.18311 13.3455 1.23378 13.0858 1.33641C12.8261 1.43903 12.5884 1.59161 12.3863 1.78688L1.125 13.125L0.75 16.5H1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit Schedule
            </button>
            <button className="action-btn primary" onClick={handlePrint}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4.5 6.75V1.5H13.5V6.75M4.5 13.5H3C2.60218 13.5 2.22064 13.342 1.93934 13.0607C1.65804 12.7794 1.5 12.3978 1.5 12V8.25C1.5 7.85218 1.65804 7.47064 1.93934 7.18934C2.22064 6.90804 2.60218 6.75 3 6.75H15C15.3978 6.75 15.7794 6.90804 16.0607 7.18934C16.342 7.47064 16.5 7.85218 16.5 8.25V12C16.5 12.3978 16.342 12.7794 16.0607 13.0607C15.7794 13.342 15.3978 13.5 15 13.5H13.5M4.5 11.25H13.5V16.5H4.5V11.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
                  {SLOTS.map((slot, index) => (
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
                    {SLOTS.map((slot) => {
                      const entry = getCell(day, slot);
                      const colors = entry ? getSubjectColor(entry.subject) : null;
                      
                      return (
                        <td
                          key={slot}
                          className={`schedule-cell ${entry ? 'has-class' : 'empty-cell'} ${
                            selectedCell?.day === day && selectedCell?.slot === slot ? 'selected' : ''
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
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
              </div>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
}

export default TimetablePage;