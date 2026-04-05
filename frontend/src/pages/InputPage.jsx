import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFaculty, getFacultyDisplayName } from "../utils/facultyStore";
import { getSettings } from "../utils/settingsStore";
import { getSavedSubjects, mergeSavedSubjects } from "../utils/subjectStore";
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
  batches: [],
});

const createInitialGroups = () =>
  YEAR_GROUPS.map((group) => ({
    ...group,
    subjects: [createEmptySubject()],
  }));

function parseBatchInput(value) {
  return Array.from(
    new Set(
      String(value || "")
        .split(/[,/|\n]+/)
        .map((batch) => batch.trim())
        .filter(Boolean)
    )
  );
}

function formatBatchInput(batches) {
  return Array.isArray(batches) ? batches.join(", ") : "";
}

function isSubjectTouched(subject) {
  return Boolean(
    subject.subject.trim() ||
      subject.faculty.trim() ||
      Number(subject.lecturesPerWeek) > 1 ||
      (Array.isArray(subject.batches) && subject.batches.length > 0)
  );
}

function buildSubjectCatalog(groupConfigs, department) {
  const records = [];
  const seen = new Set();

  groupConfigs.forEach((group) => {
    group.subjects.forEach((subject) => {
      const name = subject.subject.trim();
      const faculty = subject.faculty.trim();
      if (!name || !faculty) return;

      const record = {
        name,
        year: group.year,
        faculty,
        department: department.trim(),
        sessionType: subject.sessionType || "Lecture",
        batches: Array.isArray(subject.batches) ? subject.batches : [],
      };

      const key = [
        record.name.toLowerCase(),
        record.year.toLowerCase(),
        record.faculty.toLowerCase(),
        record.department.toLowerCase(),
        record.sessionType.toLowerCase(),
        record.batches.join("|").toLowerCase(),
      ].join("__");

      if (seen.has(key)) return;
      seen.add(key);
      records.push(record);
    });
  });

  return records;
}

function getSubjectSuggestions(subjects, facultyName, departmentName, yearName) {
  const faculty = String(facultyName || "").trim().toLowerCase();
  const department = String(departmentName || "").trim().toLowerCase();
  const year = String(yearName || "").trim().toLowerCase();

  return subjects
    .filter((subject) => {
      if (!subject.name) return false;
      const sameFaculty = faculty ? subject.faculty.toLowerCase() === faculty : true;
      const sameDepartment = department ? subject.department.toLowerCase() === department : true;
      const sameYear = year ? String(subject.year || "").trim().toLowerCase() === year : true;
      return sameFaculty && sameDepartment && sameYear;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function DepartmentSelect({ departments, value, onChange }) {
  const matchesSavedDepartment = departments.includes(value);

  return (
    <div className="faculty-select-wrapper">
      {departments.length > 0 ? (
        <>
          <select
            value={matchesSavedDepartment ? value : value ? "__manual__" : ""}
            onChange={(event) => {
              const nextValue = event.target.value;
              if (nextValue === "__manual__") {
                if (matchesSavedDepartment) onChange("");
                return;
              }
              onChange(nextValue);
            }}
            className="desc-input"
          >
            <option value="">Select saved department...</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
            <option value="__manual__">Enter manually</option>
          </select>

          <input
            type="text"
            placeholder="Or type department manually..."
            value={matchesSavedDepartment ? "" : value}
            onChange={(event) => onChange(event.target.value)}
            className="faculty-manual-input"
            style={{ marginTop: "0.5rem" }}
          />
        </>
      ) : (
        <input
          type="text"
          placeholder="Department (e.g. CSE)"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="desc-input"
        />
      )}
    </div>
  );
}

function FacultySelect({ facultyList, value, onChange, error, id, department }) {
  const filteredFaculty = facultyList.filter((faculty) => {
    const displayName = getFacultyDisplayName(faculty);
    if (!displayName) return false;
    if (!department.trim()) return true;
    return faculty.department.trim().toLowerCase() === department.trim().toLowerCase();
  });

  const hasStoredFaculty = filteredFaculty.length > 0;
  const matchesSavedFaculty = filteredFaculty.some((faculty) => getFacultyDisplayName(faculty) === value);

  return (
    <div className="faculty-select-wrapper">
      {hasStoredFaculty ? (
        <>
          <select
            id={id}
            className={error ? "error" : ""}
            value={matchesSavedFaculty ? value : value ? "__manual__" : ""}
            onChange={(event) => {
              const nextValue = event.target.value;
              if (nextValue === "__manual__") {
                if (matchesSavedFaculty) onChange("");
                return;
              }
              onChange(nextValue);
            }}
          >
            <option value="">
              {department.trim() ? "Select faculty from department..." : "Select saved faculty..."}
            </option>
            {filteredFaculty.map((faculty) => {
              const displayName = getFacultyDisplayName(faculty);
              return (
                <option key={faculty.id} value={displayName}>
                  {displayName} ({faculty.department})
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
            onChange={(event) => onChange(event.target.value)}
            style={{ marginTop: "0.5rem" }}
          />
        </>
      ) : (
        <input
          id={id}
          type="text"
          placeholder="e.g., Dr. Smith"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={error ? "error" : ""}
        />
      )}
    </div>
  );
}

function SubjectSelect({ id, value, onChange, error, options, faculty }) {
  const matchesSavedSubject = options.some((subject) => subject.name === value);

  return (
    <div className="faculty-select-wrapper">
      {options.length > 0 ? (
        <>
          <select
            id={id}
            className={error ? "error" : ""}
            value={matchesSavedSubject ? value : value ? "__manual__" : ""}
            onChange={(event) => {
              const nextValue = event.target.value;
              if (nextValue === "__manual__") {
                if (matchesSavedSubject) onChange("");
                return;
              }
              onChange(nextValue);
            }}
          >
            <option value="">
              {faculty.trim() ? "Select saved subject..." : "Select faculty first for saved subjects"}
            </option>
            {options.map((subject) => (
              <option key={`${subject.faculty}-${subject.name}-${subject.sessionType}`} value={subject.name}>
                {subject.name}
                {subject.sessionType === "Practical" && subject.batches?.length
                  ? ` (${subject.batches.join("/")})`
                  : ""}
              </option>
            ))}
            <option value="__manual__">Enter manually</option>
          </select>

          <input
            type="text"
            className="faculty-manual-input"
            placeholder="Or type subject manually..."
            value={matchesSavedSubject ? "" : value}
            onChange={(event) => onChange(event.target.value)}
            style={{ marginTop: "0.5rem" }}
          />
        </>
      ) : (
        <input
          id={id}
          type="text"
          placeholder={faculty.trim() ? "e.g., Operating Systems" : "Select faculty, then add subject"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
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
  const [groupConfigs, setGroupConfigs] = useState(createInitialGroups);
  const [facultyList, setFacultyList] = useState([]);
  const [savedSubjects, setSavedSubjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadSavedData = () => {
      setFacultyList(getFaculty());
      setSavedSubjects(getSavedSubjects());
    };

    loadSavedData();
    window.addEventListener("focus", loadSavedData);
    window.addEventListener("storage", loadSavedData);

    return () => {
      window.removeEventListener("focus", loadSavedData);
      window.removeEventListener("storage", loadSavedData);
    };
  }, []);

  const savedDepartments = useMemo(
    () =>
      Array.from(
        new Set(
          facultyList
            .map((faculty) => faculty.department.trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [facultyList]
  );

  const currentCatalog = useMemo(
    () => buildSubjectCatalog(groupConfigs, department),
    [groupConfigs, department]
  );

  const mergedCatalog = useMemo(() => {
    const catalog = [...savedSubjects, ...currentCatalog];
    const unique = new Map();
    catalog.forEach((subject) => {
      const key = [
        subject.name?.toLowerCase(),
        String(subject.year || "").toLowerCase(),
        subject.faculty?.toLowerCase(),
        subject.department?.toLowerCase(),
        subject.sessionType?.toLowerCase(),
        (subject.batches || []).join("|").toLowerCase(),
      ].join("__");
      if (!subject.name || !subject.faculty || unique.has(key)) return;
      unique.set(key, subject);
    });
    return Array.from(unique.values());
  }, [currentCatalog, savedSubjects]);

  const facultyLoadSummary = useMemo(() => {
    const summaryMap = new Map();

    groupConfigs.forEach((group) => {
      group.subjects.forEach((subject) => {
        const faculty = subject.faculty.trim();
        const name = subject.subject.trim();
        if (!faculty || !name) return;

        const existing = summaryMap.get(faculty) || {
          faculty,
          lectures: 0,
          practicals: 0,
          total: 0,
          subjects: new Set(),
        };

        const load = Number(subject.lecturesPerWeek) || 0;
        if ((subject.sessionType || "Lecture") === "Practical") {
          existing.practicals += load;
        } else {
          existing.lectures += load;
        }
        existing.total += load;
        existing.subjects.add(name);

        summaryMap.set(faculty, existing);
      });
    });

    return Array.from(summaryMap.values())
      .map((item) => ({
        ...item,
        subjects: Array.from(item.subjects).sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => b.total - a.total || a.faculty.localeCompare(b.faculty));
  }, [groupConfigs]);

  const updateSubject = (groupIndex, subjectIndex, field, value) => {
    setGroupConfigs((current) =>
      current.map((group, gi) => {
        if (gi !== groupIndex) return group;
        return {
          ...group,
          subjects: group.subjects.map((subject, si) => {
            if (si !== subjectIndex) return subject;
            if (field === "sessionType" && value === "Lecture") {
              return { ...subject, sessionType: value, batches: [] };
            }
            return { ...subject, [field]: value };
          }),
        };
      })
    );

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[`${groupIndex}-${subjectIndex}-${field}`];
      if (field === "sessionType" || field === "batches") {
        delete nextErrors[`${groupIndex}-${subjectIndex}-batches`];
      }
      return nextErrors;
    });
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
    const nextErrors = {};

    if (!scheduleTitle.trim()) {
      nextErrors.general = "Please provide a title for your schedule.";
    }

    groupConfigs.forEach((group, groupIndex) => {
      const validSubjects = group.subjects.filter(isSubjectTouched);

      if (validSubjects.length === 0) {
        nextErrors[`group-${groupIndex}`] = `Add at least one subject for ${group.year}.`;
      }

      group.subjects.forEach((subject, subjectIndex) => {
        const touched = isSubjectTouched(subject);
        if (!touched) return;

        if (!subject.subject.trim()) {
          nextErrors[`${groupIndex}-${subjectIndex}-subject`] = "Subject is required";
        }
        if (!subject.faculty.trim()) {
          nextErrors[`${groupIndex}-${subjectIndex}-faculty`] = "Faculty is required";
        }
        if (Number(subject.lecturesPerWeek) < 1) {
          nextErrors[`${groupIndex}-${subjectIndex}-lecturesPerWeek`] = "Must be at least 1";
        }
        if ((subject.sessionType || "Lecture") === "Practical" && subject.batches.length === 0) {
          nextErrors[`${groupIndex}-${subjectIndex}-batches`] = "Add at least one practical batch";
        }
      });
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
          .filter((subject) => subject.subject.trim() && subject.faculty.trim())
          .map((subject) => ({
            subject: subject.subject.trim(),
            faculty: subject.faculty.trim(),
            lecturesPerWeek: Number(subject.lecturesPerWeek) || 1,
            sessionType: subject.sessionType || "Lecture",
            batches: Array.isArray(subject.batches) ? subject.batches : [],
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

      mergeSavedSubjects(buildSubjectCatalog(groupConfigs, department));

      const savedData = await saveRes.json();
      navigate(`/timetable?id=${savedData._id}`);
    } catch (error) {
      console.error(error);
      setErrors({ general: error.message || "Something went wrong. Please try again." });
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
                  onChange={(event) => setScheduleTitle(event.target.value)}
                  className={`title-input ${errors.general && !scheduleTitle ? "error" : ""}`}
                />
              </div>
              <div className="meta-field">
                <DepartmentSelect
                  departments={savedDepartments}
                  value={department}
                  onChange={setDepartment}
                />
              </div>
              <div className="meta-field">
                <input
                  type="text"
                  placeholder="Short description (optional)"
                  value={scheduleDesc}
                  onChange={(event) => setScheduleDesc(event.target.value)}
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

        {facultyLoadSummary.length > 0 && (
          <section className="faculty-load-panel">
            <div className="faculty-load-header">
              <div>
                <h2 className="faculty-load-title">Faculty Load Summary</h2>
                <p className="faculty-load-subtitle">
                  See how many lectures and practical slots each faculty member gets per week.
                </p>
              </div>
              <div className="year-section-badge">
                {facultyLoadSummary.length} faculty member{facultyLoadSummary.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="faculty-load-grid">
              {facultyLoadSummary.map((item) => (
                <article key={item.faculty} className="faculty-load-card">
                  <div className="faculty-load-name">{item.faculty}</div>
                  <div className="faculty-load-metrics">
                    <span>Total: {item.total}</span>
                    <span>Lectures: {item.lectures}</span>
                    <span>Practicals: {item.practicals}</span>
                  </div>
                  <div className="faculty-load-subjects">{item.subjects.join(", ")}</div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="year-groups">
          {groupConfigs.map((group, groupIndex) => (
            <section key={`${group.year}-${group.section}`} className="year-section">
              <div className="year-section-header">
                <div>
                  <h2 className="year-section-title">{group.year}</h2>
                  <p className="year-section-subtitle">
                    Section {group.section} {department.trim() ? `- ${department.trim()}` : ""}
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
                {group.subjects.map((subject, subjectIndex) => {
                  const subjectSuggestions = getSubjectSuggestions(
                    mergedCatalog,
                    subject.faculty,
                    department,
                    group.year
                  );

                  return (
                    <div key={`${group.year}-${subjectIndex}`} className="subject-card">
                      <div className="card-header">
                        <div className="card-header-main">
                          <span className="card-number">{subjectIndex + 1}</span>
                          {(subject.sessionType || "Lecture") === "Practical" && subject.batches.length > 0 && (
                            <div className="batch-preview">
                              {subject.batches.map((batch) => (
                                <span key={batch} className="batch-chip">
                                  {batch}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {group.subjects.length > 1 && (
                          <button
                            className="remove-btn"
                            onClick={() => removeSubject(groupIndex, subjectIndex)}
                            aria-label="Remove subject"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path
                                d="M15 5L5 15M5 5L15 15"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="card-inputs">
                        <div className="input-field">
                          <label htmlFor={`faculty-${groupIndex}-${subjectIndex}`}>Faculty Name</label>
                          <FacultySelect
                            id={`faculty-${groupIndex}-${subjectIndex}`}
                            facultyList={facultyList}
                            value={subject.faculty}
                            onChange={(value) => updateSubject(groupIndex, subjectIndex, "faculty", value)}
                            error={errors[`${groupIndex}-${subjectIndex}-faculty`]}
                            department={department}
                          />
                          {errors[`${groupIndex}-${subjectIndex}-faculty`] && (
                            <span className="field-error">{errors[`${groupIndex}-${subjectIndex}-faculty`]}</span>
                          )}
                        </div>

                        <div className="input-field">
                          <label htmlFor={`subject-${groupIndex}-${subjectIndex}`}>Subject Name</label>
                          <SubjectSelect
                            id={`subject-${groupIndex}-${subjectIndex}`}
                            value={subject.subject}
                            onChange={(value) => updateSubject(groupIndex, subjectIndex, "subject", value)}
                            error={errors[`${groupIndex}-${subjectIndex}-subject`]}
                            options={subjectSuggestions}
                            faculty={subject.faculty}
                          />
                          {errors[`${groupIndex}-${subjectIndex}-subject`] && (
                            <span className="field-error">{errors[`${groupIndex}-${subjectIndex}-subject`]}</span>
                          )}
                        </div>

                        <div className="input-field session-type-field">
                          <label htmlFor={`type-${groupIndex}-${subjectIndex}`}>Session Type</label>
                          <select
                            id={`type-${groupIndex}-${subjectIndex}`}
                            value={subject.sessionType || "Lecture"}
                            onChange={(event) =>
                              updateSubject(groupIndex, subjectIndex, "sessionType", event.target.value)
                            }
                          >
                            <option value="Lecture">Lecture</option>
                            <option value="Practical">Practical</option>
                          </select>
                        </div>

                        {(subject.sessionType || "Lecture") === "Practical" && (
                          <div className="input-field practical-batches-field">
                            <label htmlFor={`batches-${groupIndex}-${subjectIndex}`}>
                              Practical Batches
                            </label>
                            <input
                              id={`batches-${groupIndex}-${subjectIndex}`}
                              type="text"
                              placeholder="e.g., A, B, C"
                              value={formatBatchInput(subject.batches)}
                              onChange={(event) =>
                                updateSubject(
                                  groupIndex,
                                  subjectIndex,
                                  "batches",
                                  parseBatchInput(event.target.value)
                                )
                              }
                              className={errors[`${groupIndex}-${subjectIndex}-batches`] ? "error" : ""}
                            />
                            <span className="input-hint">
                              These batches will be shown as separate boxes inside the practical cell.
                            </span>
                            {errors[`${groupIndex}-${subjectIndex}-batches`] && (
                              <span className="field-error">{errors[`${groupIndex}-${subjectIndex}-batches`]}</span>
                            )}
                          </div>
                        )}

                        <div className="input-field lectures-field">
                          <label htmlFor={`lectures-${groupIndex}-${subjectIndex}`}>
                            {(subject.sessionType || "Lecture") === "Practical"
                              ? "Practical Slots per Week"
                              : "Lectures per Week"}
                          </label>
                          <div className="number-input-wrapper">
                            <button
                              className="number-btn"
                              onClick={() =>
                                updateSubject(
                                  groupIndex,
                                  subjectIndex,
                                  "lecturesPerWeek",
                                  Math.max(1, Number(subject.lecturesPerWeek) - 1)
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
                              value={subject.lecturesPerWeek}
                              onChange={(event) =>
                                updateSubject(
                                  groupIndex,
                                  subjectIndex,
                                  "lecturesPerWeek",
                                  Number(event.target.value)
                                )
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
                                  Math.min(10, Number(subject.lecturesPerWeek) + 1)
                                )
                              }
                              aria-label="Increase"
                            >
                              +
                            </button>
                          </div>
                          {errors[`${groupIndex}-${subjectIndex}-lecturesPerWeek`] && (
                            <span className="field-error">
                              {errors[`${groupIndex}-${subjectIndex}-lecturesPerWeek`]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  <path
                    d="M17 10L3 10M17 10L12 5M17 10L12 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
