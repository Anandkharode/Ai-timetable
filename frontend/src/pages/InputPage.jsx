import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFaculty, getFacultyDisplayName } from "../utils/facultyStore";
import { getSettings } from "../utils/settingsStore";
import { generateTimeSlots } from "../utils/timetableUtils";
import "./InputPage.css";

const YEAR_GROUPS = [
  { year: "1st Year", section: "A" },
  { year: "2nd Year", section: "A" },
  { year: "3rd Year", section: "A" },
  { year: "4th Year", section: "A" },
];

const createEmptySubject = () => ({
  subject: "",
  faculty: "",
  lecturesPerWeek: 1,
  sessionType: "Lecture",
});

function FacultySelect({ value, onChange, error, id }) {
  const [facultyList, setFacultyList] = useState([]);

  useEffect(() => {
    const loadFaculty = () => {
      setFacultyList(getFaculty());
    };

    loadFaculty();

    window.addEventListener("focus", loadFaculty);
    window.addEventListener("storage", loadFaculty);

    return () => {
      window.removeEventListener("focus", loadFaculty);
      window.removeEventListener("storage", loadFaculty);
    };
  }, []);

  const filtered = facultyList.filter((f) =>
    Boolean(getFacultyDisplayName(f))
  );

  const hasStoredFaculty = facultyList.length > 0;
  const matchesSavedFaculty = facultyList.some((f) => getFacultyDisplayName(f) === value);

  return (
    <div className="faculty-select-wrapper">
      {hasStoredFaculty ? (
        <>
          <select
            id={id}
            className={error ? "error" : ""}
            value={matchesSavedFaculty ? value : "__manual__"}
            onChange={(e) => {
              if (e.target.value === "__manual__") {
                if (matchesSavedFaculty) {
                  onChange("");
                }
                return;
              }
              onChange(e.target.value);
            }}
          >
            <option value="">Select saved faculty...</option>
            {filtered.map((f) => {
              const displayName = getFacultyDisplayName(f);
              return (
                <option key={f.id} value={displayName}>
                  {displayName} ({f.department})
                </option>
              );
            })}
            <option value="__manual__">Enter manually</option>
          </select>

          <input
            type="text"
            className="faculty-manual-input"
            placeholder="Or type faculty name manually..."
            value={matchesSavedFaculty ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            style={{ marginTop: "0.5rem" }}
          />
        </>
      ) : (
        <input
          id={id}
          type="text"
          placeholder="e.g., Dr. Smith"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "error" : ""}
        />
      )}
    </div>
  );
}

function InputPage() {
  const navigate = useNavigate();
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDesc, setScheduleDesc] = useState("");
  const [department, setDepartment] = useState("");
  const [groupConfigs, setGroupConfigs] = useState(
    YEAR_GROUPS.map((group) => ({
      ...group,
      subjects: [createEmptySubject()],
    }))
  );
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const updateSubject = (groupIndex, subjectIndex, field, value) => {
    setGroupConfigs((current) =>
      current.map((group, gi) => {
        if (gi !== groupIndex) return group;
        return {
          ...group,
          subjects: group.subjects.map((subject, si) =>
            si === subjectIndex ? { ...subject, [field]: value } : subject
          ),
        };
      })
    );

    const errorKey = `${groupIndex}-${subjectIndex}-${field}`;
    if (errors[errorKey]) {
      const nextErrors = { ...errors };
      delete nextErrors[errorKey];
      setErrors(nextErrors);
    }
  };

  const addSubject = (groupIndex) => {
    setGroupConfigs((current) =>
      current.map((group, gi) =>
        gi === groupIndex
          ? { ...group, subjects: [...group.subjects, createEmptySubject()] }
          : group
      )
    );
  };

  const removeSubject = (groupIndex, subjectIndex) => {
    setGroupConfigs((current) =>
      current.map((group, gi) => {
        if (gi !== groupIndex || group.subjects.length === 1) return group;
        return {
          ...group,
          subjects: group.subjects.filter((_, si) => si !== subjectIndex),
        };
      })
    );
  };

  const validate = () => {
    const newErrors = {};

    if (!scheduleTitle.trim()) {
      newErrors.general = "Please provide a title for your schedule.";
    }

    groupConfigs.forEach((group, groupIndex) => {
      const validSubjects = group.subjects.filter(
        (sub) => sub.subject.trim() || sub.faculty.trim() || Number(sub.lecturesPerWeek) > 1
      );

      if (validSubjects.length === 0) {
        newErrors[`group-${groupIndex}`] = `Add at least one subject for ${group.year}.`;
      }

      group.subjects.forEach((sub, subjectIndex) => {
        const touched = sub.subject.trim() || sub.faculty.trim() || Number(sub.lecturesPerWeek) > 1;
        if (!touched) return;

        if (!sub.subject.trim()) {
          newErrors[`${groupIndex}-${subjectIndex}-subject`] = "Subject is required";
        }
        if (!sub.faculty.trim()) {
          newErrors[`${groupIndex}-${subjectIndex}-faculty`] = "Faculty is required";
        }
        if (Number(sub.lecturesPerWeek) < 1) {
          newErrors[`${groupIndex}-${subjectIndex}-lecturesPerWeek`] = "Must be at least 1";
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateTimetable = async () => {
    if (!validate()) return;

    setIsGenerating(true);

    try {
      const currentSettings = getSettings();
      const currentSlots = generateTimeSlots(currentSettings);

      const groups = groupConfigs.map((group) => ({
        department: department.trim(),
        year: group.year,
        section: group.section,
        subjects: group.subjects
          .filter((sub) => sub.subject.trim() && sub.faculty.trim())
          .map((sub) => ({
            subject: sub.subject.trim(),
            faculty: sub.faculty.trim(),
            lecturesPerWeek: Number(sub.lecturesPerWeek) || 1,
            sessionType: sub.sessionType || "Lecture",
          })),
      }));

      const genRes = await fetch("http://localhost:5000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: department.trim(),
          groups,
          days: currentSettings.workingDays,
          slots: currentSlots,
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || "AI generation failed");

      const saveRes = await fetch("http://localhost:5000/api/timetable/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: scheduleTitle.trim(),
          description: scheduleDesc || "Generated AI Schedule",
          department: department.trim(),
          groups: groups.map((group) => ({
            department: group.department,
            year: group.year,
            section: group.section,
            subjectCount: group.subjects.length,
          })),
          entries: genData.timetable,
          unscheduled: genData.unscheduled || [],
          summary: genData.summary || {},
          settings: currentSettings,
        }),
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json();
        throw new Error(errData.message || "Failed to save generated timetable.");
      }

      const savedData = await saveRes.json();
      navigate(`/timetable?id=${savedData._id}`);
    } catch (err) {
      console.error(err);
      setErrors({ general: err.message || "Something went wrong. Please try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  const totalSubjects = groupConfigs.reduce((count, group) => count + group.subjects.length, 0);

  return (
    <div className="input-page">
      <div className="input-background">
        <div className="grid-pattern"></div>
        <div className="accent-blob blob-1"></div>
        <div className="accent-blob blob-2"></div>
      </div>

      <div className="input-container">
        <div className="input-header">
          <div className="header-content">
            <h1 className="input-title">Build Multi-Year Schedule</h1>
            <p className="input-subtitle">
              Create 1st, 2nd, 3rd, and 4th year timetables together so shared faculty never clash
            </p>
            <div className="header-meta-fields">
              <div className="meta-field">
                <input
                  type="text"
                  placeholder="Schedule Title"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  className={`title-input ${errors.general && !scheduleTitle ? "error" : ""}`}
                />
              </div>
              <div className="meta-field">
                <input
                  type="text"
                  placeholder="Department (e.g. CSE)"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="desc-input"
                />
              </div>
              <div className="meta-field">
                <input
                  type="text"
                  placeholder="Short description (optional)"
                  value={scheduleDesc}
                  onChange={(e) => setScheduleDesc(e.target.value)}
                  className="desc-input"
                />
              </div>
            </div>
          </div>
          <div className="subject-count">
            <span className="count-number">{totalSubjects}</span>
            <span className="count-label">Rows Across 4 Years</span>
          </div>
        </div>

        {errors.general && <div className="general-error-banner">{errors.general}</div>}

        <div className="year-groups">
          {groupConfigs.map((group, groupIndex) => (
            <section key={`${group.year}-${group.section}`} className="year-section">
              <div className="year-section-header">
                <div>
                  <h2 className="year-section-title">{group.year}</h2>
                  <p className="year-section-subtitle">
                    Section {group.section} {department.trim() ? `• ${department.trim()}` : ""}
                  </p>
                </div>
                <div className="year-section-badge">
                  {group.subjects.length} subject{group.subjects.length !== 1 ? "s" : ""}
                </div>
              </div>

              {errors[`group-${groupIndex}`] && (
                <div className="general-error-banner group-error">{errors[`group-${groupIndex}`]}</div>
              )}

              <div className="subjects-list">
                {group.subjects.map((sub, subjectIndex) => (
                  <div key={`${group.year}-${subjectIndex}`} className="subject-card">
                    <div className="card-header">
                      <span className="card-number">{subjectIndex + 1}</span>
                      {group.subjects.length > 1 && (
                        <button
                          className="remove-btn"
                          onClick={() => removeSubject(groupIndex, subjectIndex)}
                          aria-label="Remove subject"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="card-inputs">
                      <div className="input-field">
                        <label htmlFor={`subject-${groupIndex}-${subjectIndex}`}>Subject Name</label>
                        <input
                          id={`subject-${groupIndex}-${subjectIndex}`}
                          type="text"
                          placeholder="e.g., Mathematics"
                          value={sub.subject}
                          onChange={(e) => updateSubject(groupIndex, subjectIndex, "subject", e.target.value)}
                          className={errors[`${groupIndex}-${subjectIndex}-subject`] ? "error" : ""}
                        />
                        {errors[`${groupIndex}-${subjectIndex}-subject`] && (
                          <span className="field-error">{errors[`${groupIndex}-${subjectIndex}-subject`]}</span>
                        )}
                      </div>

                      <div className="input-field">
                        <label htmlFor={`faculty-${groupIndex}-${subjectIndex}`}>Faculty Name</label>
                        <FacultySelect
                          id={`faculty-${groupIndex}-${subjectIndex}`}
                          value={sub.faculty}
                          onChange={(value) => updateSubject(groupIndex, subjectIndex, "faculty", value)}
                          error={errors[`${groupIndex}-${subjectIndex}-faculty`]}
                        />
                        {errors[`${groupIndex}-${subjectIndex}-faculty`] && (
                          <span className="field-error">{errors[`${groupIndex}-${subjectIndex}-faculty`]}</span>
                        )}
                      </div>

                      <div className="input-field session-type-field">
                        <label htmlFor={`type-${groupIndex}-${subjectIndex}`}>Session Type</label>
                        <select
                          id={`type-${groupIndex}-${subjectIndex}`}
                          value={sub.sessionType || "Lecture"}
                          onChange={(e) => updateSubject(groupIndex, subjectIndex, "sessionType", e.target.value)}
                        >
                          <option value="Lecture">Lecture</option>
                          <option value="Practical">Practical</option>
                        </select>
                      </div>

                      <div className="input-field lectures-field">
                        <label htmlFor={`lectures-${groupIndex}-${subjectIndex}`}>
                          {sub.sessionType === "Practical" ? "Practicals per Week" : "Lectures per Week"}
                        </label>
                        <div className="number-input-wrapper">
                          <button
                            className="number-btn"
                            onClick={() =>
                              updateSubject(
                                groupIndex,
                                subjectIndex,
                                "lecturesPerWeek",
                                Math.max(1, Number(sub.lecturesPerWeek) - 1)
                              )
                            }
                            aria-label="Decrease"
                          >
                            -
                          </button>
                          <input
                            id={`lectures-${groupIndex}-${subjectIndex}`}
                            type="number"
                            min="1"
                            max="10"
                            value={sub.lecturesPerWeek}
                            onChange={(e) =>
                              updateSubject(groupIndex, subjectIndex, "lecturesPerWeek", Number(e.target.value))
                            }
                            className={errors[`${groupIndex}-${subjectIndex}-lecturesPerWeek`] ? "error" : ""}
                          />
                          <button
                            className="number-btn"
                            onClick={() =>
                              updateSubject(
                                groupIndex,
                                subjectIndex,
                                "lecturesPerWeek",
                                Math.min(10, Number(sub.lecturesPerWeek) + 1)
                              )
                            }
                            aria-label="Increase"
                          >
                            +
                          </button>
                        </div>
                        {errors[`${groupIndex}-${subjectIndex}-lecturesPerWeek`] && (
                          <span className="field-error">{errors[`${groupIndex}-${subjectIndex}-lecturesPerWeek`]}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="add-subject-btn year-add-btn" onClick={() => addSubject(groupIndex)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Add Subject To {group.year}
              </button>
            </section>
          ))}
        </div>

        <div className="action-footer">
          <button className="generate-btn" onClick={generateTimetable} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M17 10L3 10M17 10L12 5M17 10L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Generate All Years Together
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputPage;
