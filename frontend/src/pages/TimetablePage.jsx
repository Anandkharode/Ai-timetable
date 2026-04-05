import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSettings } from "../utils/settingsStore";
import { generateTimeSlots } from "../utils/timetableUtils";
import "./TimetablePage.css";

function formatSessionType(value) {
  if (!value) return "Lecture";
  const normalized = String(value).trim().toLowerCase();
  return normalized === "practical" ? "Practical" : "Lecture";
}

function normalizeBatches(batches) {
  return Array.isArray(batches)
    ? batches.map((batch) => String(batch || "").trim()).filter(Boolean)
    : [];
}

function buildFacultyLoad(entries = [], summaryLoad = []) {
  if (Array.isArray(summaryLoad) && summaryLoad.length > 0) {
    return summaryLoad;
  }

  const facultyMap = new Map();
  entries.forEach((entry) => {
    const faculty = String(entry.faculty || "").trim();
    if (!faculty) return;

    const existing = facultyMap.get(faculty) || {
      faculty,
      lectures: 0,
      practicals: 0,
      total: 0,
    };

    if (formatSessionType(entry.sessionType) === "Practical") {
      existing.practicals += 1;
    } else {
      existing.lectures += 1;
    }
    existing.total += 1;
    facultyMap.set(faculty, existing);
  });

  return Array.from(facultyMap.values()).sort(
    (a, b) => b.total - a.total || a.faculty.localeCompare(b.faculty)
  );
}

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
  const [activeGroupKey, setActiveGroupKey] = useState("");

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
          const settings = getSettings();
          setTimetableData({
            title: "Preview Schedule",
            entries: data,
            settings,
            groups: [],
            unscheduled: [],
            summary: {
              requestedSessions: data.length,
              scheduledSessions: data.length,
              unscheduledSessions: 0,
              groupCount: 1,
              facultyLoad: buildFacultyLoad(data),
            },
          });
          setActiveSettings(settings);
          setTimeSlots(generateTimeSlots(settings));
        } else {
          setTimetableData(data);
          const settings = data.settings || getSettings();
          setActiveSettings(settings);
          setTimeSlots(generateTimeSlots(settings));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, [timetableId]);

  const workingDays = activeSettings?.workingDays?.length
    ? activeSettings.workingDays
    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const breakAfterSlot = Number(activeSettings?.breakAfterSlot) || 0;
  const breakDuration = Number(activeSettings?.breakDuration) || 0;
  const hasRecess = breakAfterSlot > 0 && breakAfterSlot <= timeSlots.length;
  const beforeSlots = hasRecess ? timeSlots.slice(0, breakAfterSlot) : timeSlots;
  const afterSlots = hasRecess ? timeSlots.slice(breakAfterSlot) : [];

  const groups = useMemo(() => {
    if (!timetableData?.entries) return [];

    const derived = new Map();
    timetableData.entries.forEach((entry) => {
      const year = entry.year || "General";
      const section = entry.section || "A";
      const key = `${year}__${section}`;
      if (!derived.has(key)) {
        derived.set(key, { key, year, section });
      }
    });

    if (derived.size === 0) {
      derived.set("General__A", { key: "General__A", year: "General", section: "A" });
    }

    return Array.from(derived.values());
  }, [timetableData]);

  useEffect(() => {
    if (groups.length > 0 && !groups.find((group) => group.key === activeGroupKey)) {
      setActiveGroupKey(groups[0].key);
    }
  }, [groups, activeGroupKey]);

  const activeGroup = groups.find((group) => group.key === activeGroupKey) || groups[0] || null;

  const facultyLoad = useMemo(
    () => buildFacultyLoad(timetableData?.entries, timetableData?.summary?.facultyLoad),
    [timetableData]
  );

  const getCellEntries = (day, slot) => {
    if (!timetableData || !activeGroup) return [];
    return timetableData.entries.filter(
      (entry) =>
        entry.day === day &&
        entry.slot === slot &&
        (entry.year || "General") === activeGroup.year &&
        (entry.section || "A") === activeGroup.section
    );
  };

  const getSubjectColor = (subject) => {
    const hash = subject.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const colors = [
      { bg: "rgba(201, 169, 110, 0.15)", border: "#c9a96e", text: "#6b5d3f" },
      { bg: "rgba(82, 166, 117, 0.15)", border: "#52a675", text: "#2d5a42" },
      { bg: "rgba(106, 134, 198, 0.15)", border: "#6a86c6", text: "#3a4a75" },
      { bg: "rgba(209, 73, 91, 0.15)", border: "#d1495b", text: "#7a2a35" },
      { bg: "rgba(241, 146, 61, 0.15)", border: "#f1923d", text: "#8a5319" },
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  const handlePrint = () => window.print();
  const handleEdit = () => navigate("/create");
  const handleBackHome = () => navigate("/");

  const handleDelete = async () => {
    if (!timetableId) return;
    if (window.confirm("Are you sure you want to delete this timetable?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/timetable/${timetableId}`, {
          method: "DELETE",
        });
        if (res.ok) navigate("/dashboard");
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
        <div className="error-icon">!</div>
        <h2 className="error-title">Unable to Load Timetable</h2>
        <p className="error-message">{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  const summary = timetableData?.summary || {};
  const unscheduled = timetableData?.unscheduled || [];

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
              {timetableData?.department ? `${timetableData.department} - ` : ""}
              Generated for {activeSettings?.semester || "Current Term"} - {activeSettings?.academicYear || "2026"}
            </p>
          </div>
          <div className="header-actions">
            <button className="action-btn secondary" onClick={handleBackHome}>
              Back Home
            </button>
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

        <div className="multi-year-summary">
          <div className="summary-pill">Groups: {summary.groupCount || groups.length || 0}</div>
          <div className="summary-pill">Scheduled: {summary.scheduledSessions || timetableData?.entries?.length || 0}</div>
          <div className="summary-pill">Unscheduled: {summary.unscheduledSessions || 0}</div>
        </div>

        {facultyLoad.length > 0 && (
          <section className="faculty-load-board">
            <div className="faculty-load-board-header">
              <h3>Faculty Lecture Count</h3>
              <span>{facultyLoad.length} faculty</span>
            </div>
            <div className="faculty-load-board-grid">
              {facultyLoad.map((item) => (
                <article key={item.faculty} className="faculty-load-board-card">
                  <div className="faculty-load-board-name">{item.faculty}</div>
                  <div className="faculty-load-board-stats">
                    <span>Total {item.total}</span>
                    <span>Lecture {item.lectures}</span>
                    <span>Practical {item.practicals}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {groups.length > 1 && (
          <div className="group-tabs">
            {groups.map((group) => (
              <button
                key={group.key}
                className={`group-tab ${activeGroup?.key === group.key ? "active" : ""}`}
                onClick={() => {
                  setActiveGroupKey(group.key);
                  setSelectedCell(null);
                }}
              >
                {group.year} - Sec {group.section}
              </button>
            ))}
          </div>
        )}

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
                  {beforeSlots.map((slot, index) => (
                    <th key={slot} className="time-header" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="time-badge">
                        <span className="time-text">{slot}</span>
                      </div>
                    </th>
                  ))}
                  {hasRecess && (
                    <th className="recess-header">
                      <div className="recess-badge">
                        <span className="recess-title">Recess</span>
                        {breakDuration > 0 && <span className="recess-time">{breakDuration} min</span>}
                      </div>
                    </th>
                  )}
                  {afterSlots.map((slot, index) => (
                    <th
                      key={slot}
                      className="time-header"
                      style={{ animationDelay: `${(index + beforeSlots.length) * 0.1}s` }}
                    >
                      <div className="time-badge">
                        <span className="time-text">{slot}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workingDays.map((day, dayIndex) => (
                  <tr key={day} style={{ animationDelay: `${dayIndex * 0.1}s` }}>
                    <td className="day-cell">
                      <div className="day-name">{day}</div>
                    </td>
                    {beforeSlots.map((slot) => {
                      const entries = getCellEntries(day, slot);
                      const firstEntry = entries[0];
                      const colors = firstEntry ? getSubjectColor(firstEntry.subject) : null;

                      return (
                        <td
                          key={`${day}-${slot}`}
                          className={`schedule-cell ${entries.length ? "has-class" : "empty-cell"} ${
                            selectedCell?.day === day && selectedCell?.slot === slot ? "selected" : ""
                          }`}
                          onClick={() => entries.length && setSelectedCell({ day, slot, entries })}
                          style={
                            firstEntry
                              ? {
                                  "--cell-bg": colors.bg,
                                  "--cell-border": colors.border,
                                  "--cell-text": colors.text,
                                }
                              : {}
                          }
                        >
                          {entries.length ? (
                            <div className="class-stack">
                              {entries.map((entry, index) => (
                                <div key={`${entry.subject}-${entry.faculty}-${index}`} className="class-info">
                                  <div className="subject-name">
                                    {entry.subject}
                                    <span
                                      className={`session-badge ${
                                        formatSessionType(entry.sessionType) === "Practical" ? "practical" : ""
                                      }`}
                                    >
                                      {formatSessionType(entry.sessionType)}
                                    </span>
                                  </div>
                                  {normalizeBatches(entry.batches).length > 0 && (
                                    <div className="batch-boxes">
                                      {normalizeBatches(entry.batches).map((batch) => (
                                        <span key={`${entry.subject}-${batch}`} className="batch-box">
                                          {batch}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <div className="faculty-name">{entry.faculty}</div>
                                  {entry.room && <div className="room-name">{entry.room}</div>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="empty-slot">-</div>
                          )}
                        </td>
                      );
                    })}
                    {hasRecess && (
                      <td className="recess-cell">
                        <div className="recess-text">Recess</div>
                      </td>
                    )}
                    {afterSlots.map((slot) => {
                      const entries = getCellEntries(day, slot);
                      const firstEntry = entries[0];
                      const colors = firstEntry ? getSubjectColor(firstEntry.subject) : null;

                      return (
                        <td
                          key={`${day}-${slot}`}
                          className={`schedule-cell ${entries.length ? "has-class" : "empty-cell"} ${
                            selectedCell?.day === day && selectedCell?.slot === slot ? "selected" : ""
                          }`}
                          onClick={() => entries.length && setSelectedCell({ day, slot, entries })}
                          style={
                            firstEntry
                              ? {
                                  "--cell-bg": colors.bg,
                                  "--cell-border": colors.border,
                                  "--cell-text": colors.text,
                                }
                              : {}
                          }
                        >
                          {entries.length ? (
                            <div className="class-stack">
                              {entries.map((entry, index) => (
                                <div key={`${entry.subject}-${entry.faculty}-${index}`} className="class-info">
                                  <div className="subject-name">
                                    {entry.subject}
                                    <span
                                      className={`session-badge ${
                                        formatSessionType(entry.sessionType) === "Practical" ? "practical" : ""
                                      }`}
                                    >
                                      {formatSessionType(entry.sessionType)}
                                    </span>
                                  </div>
                                  {normalizeBatches(entry.batches).length > 0 && (
                                    <div className="batch-boxes">
                                      {normalizeBatches(entry.batches).map((batch) => (
                                        <span key={`${entry.subject}-${batch}`} className="batch-box">
                                          {batch}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <div className="faculty-name">{entry.faculty}</div>
                                  {entry.room && <div className="room-name">{entry.room}</div>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="empty-slot">-</div>
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

        {unscheduled.length > 0 && (
          <div className="unscheduled-panel">
            <h3>Unscheduled Sessions</h3>
            <div className="unscheduled-list">
              {unscheduled.map((item, index) => (
                <div key={`${item.year}-${item.section}-${item.subject}-${index}`} className="unscheduled-item">
                  <strong>{item.year} Sec {item.section}</strong> {item.subject}{" "}
                  {item.sessionType ? `(${formatSessionType(item.sessionType)})` : ""} - {item.faculty}
                  {normalizeBatches(item.batches).length > 0
                    ? ` [${normalizeBatches(item.batches).join(", ")}]`
                    : ""}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCell && (
          <div className="detail-panel" onClick={() => setSelectedCell(null)}>
            <div className="panel-content" onClick={(event) => event.stopPropagation()}>
              <button className="close-panel" onClick={() => setSelectedCell(null)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="panel-header">
                <h3>
                  {selectedCell.day} - {selectedCell.slot}
                </h3>
              </div>
              <div className="session-detail-list">
                {selectedCell.entries.map((entry, index) => (
                  <div key={`${entry.subject}-${entry.faculty}-${index}`} className="session-detail-card">
                    <div className="session-detail-title">{entry.subject}</div>
                    <div className="panel-details">
                      <div className="detail-row">
                        <span className="detail-label">Session Type</span>
                        <span className="detail-value">{formatSessionType(entry.sessionType)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Year</span>
                        <span className="detail-value">{entry.year || "General"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Section</span>
                        <span className="detail-value">{entry.section || "A"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Faculty</span>
                        <span className="detail-value">{entry.faculty}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Room</span>
                        <span className="detail-value">{entry.room || "TBD"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Batches</span>
                        <span className="detail-value">
                          {normalizeBatches(entry.batches).length > 0
                            ? normalizeBatches(entry.batches).join(", ")
                            : "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimetablePage;
