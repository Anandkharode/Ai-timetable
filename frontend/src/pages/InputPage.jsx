import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getFaculty } from "../utils/facultyStore";
import "./InputPage.css";

/* ───── Faculty Dropdown Component ───── */
function FacultySelect({ value, onChange, error, id }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setFacultyList(getFaculty());
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = facultyList.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (faculty) => {
    onChange(faculty.name);
    setSearch("");
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setSearch("");
  };

  const hasStoredFaculty = facultyList.length > 0;

  return (
    <div className="faculty-select-wrapper" ref={wrapperRef}>
      {hasStoredFaculty ? (
        <>
          <div
            className={`faculty-select-trigger ${error ? "error" : ""} ${open ? "focused" : ""}`}
            onClick={() => setOpen(!open)}
            id={id}
            role="combobox"
            aria-expanded={open}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setOpen(!open);
              if (e.key === "Escape") setOpen(false);
            }}
          >
            {value ? (
              <span className="faculty-select-value">
                <span className="select-avatar">
                  {value.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                </span>
                {value}
                <button
                  className="select-clear"
                  onClick={(e) => { e.stopPropagation(); handleClear(); }}
                  aria-label="Clear selection"
                >
                  ✕
                </button>
              </span>
            ) : (
              <span className="faculty-select-placeholder">Select faculty member...</span>
            )}
            <span className={`select-chevron ${open ? "open" : ""}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>

          {open && (
            <div className="faculty-dropdown">
              <div className="dropdown-search-wrap">
                <input
                  className="dropdown-search"
                  type="text"
                  placeholder="Search faculty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="dropdown-list">
                {filtered.length === 0 ? (
                  <div className="dropdown-empty">No matching faculty found</div>
                ) : (
                  filtered.map((f) => (
                    <div
                      key={f.id}
                      className={`dropdown-item ${value === f.name ? "selected" : ""}`}
                      onClick={() => handleSelect(f)}
                    >
                      <span className="dropdown-avatar">
                        {f.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                      <span className="dropdown-item-info">
                        <span className="dropdown-item-name">{f.name}</span>
                        <span className="dropdown-item-dept">{f.department}</span>
                      </span>
                      {value === f.name && (
                        <span className="dropdown-check">✓</span>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="dropdown-footer">
                Or type a name manually below
              </div>
            </div>
          )}

          {/* Fallback manual input */}
          <input
            type="text"
            className="faculty-manual-input"
            placeholder="Or type name manually..."
            value={value && !facultyList.find(f => f.name === value) ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            style={{ marginTop: "0.5rem" }}
          />
        </>
      ) : (
        /* If no saved faculty, show regular text input */
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

/* ───── Main InputPage ───── */
function InputPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([
    { subject: "", faculty: "", lecturesPerWeek: 1 }
  ]);

  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);

    // Clear errors for this field
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const addSubject = () => {
    setSubjects([
      ...subjects,
      { subject: "", faculty: "", lecturesPerWeek: 1 }
    ]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      const updated = subjects.filter((_, i) => i !== index);
      setSubjects(updated);
    }
  };

  const validate = () => {
    const newErrors = {};

    subjects.forEach((sub, index) => {
      if (!sub.subject.trim()) {
        newErrors[`${index}-subject`] = "Subject is required";
      }
      if (!sub.faculty.trim()) {
        newErrors[`${index}-faculty`] = "Faculty is required";
      }
      if (sub.lecturesPerWeek < 1) {
        newErrors[`${index}-lecturesPerWeek`] = "Must be at least 1";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateTimetable = async () => {
    if (!validate()) {
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjects }),
      });

      if (res.ok) {
        navigate("/timetable");
      } else {
        setErrors({ general: "Failed to generate timetable. Please try again." });
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: "Network error. Please check your connection." });
    } finally {
      setIsGenerating(false);
    }
  };

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
            <h1 className="input-title">Build Your Schedule</h1>
            <p className="input-subtitle">
              Add your subjects and let us create the perfect timetable
            </p>
          </div>
          <div className="subject-count">
            <span className="count-number">{subjects.length}</span>
            <span className="count-label">Subject{subjects.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {errors.general && (
          <div className="general-error-banner">
            {errors.general}
          </div>
        )}

        <div className="subjects-list">
          {subjects.map((sub, index) => (
            <div key={index} className="subject-card">
              <div className="card-header">
                <span className="card-number">{index + 1}</span>
                {subjects.length > 1 && (
                  <button
                    className="remove-btn"
                    onClick={() => removeSubject(index)}
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
                  <label htmlFor={`subject-${index}`}>Subject Name</label>
                  <input
                    id={`subject-${index}`}
                    type="text"
                    placeholder="e.g., Mathematics"
                    value={sub.subject}
                    onChange={(e) => handleChange(index, "subject", e.target.value)}
                    className={errors[`${index}-subject`] ? "error" : ""}
                  />
                  {errors[`${index}-subject`] && (
                    <span className="field-error">{errors[`${index}-subject`]}</span>
                  )}
                </div>

                <div className="input-field">
                  <label htmlFor={`faculty-${index}`}>Faculty Name</label>
                  <FacultySelect
                    id={`faculty-${index}`}
                    value={sub.faculty}
                    onChange={(val) => handleChange(index, "faculty", val)}
                    error={errors[`${index}-faculty`]}
                  />
                  {errors[`${index}-faculty`] && (
                    <span className="field-error">{errors[`${index}-faculty`]}</span>
                  )}
                </div>

                <div className="input-field lectures-field">
                  <label htmlFor={`lectures-${index}`}>Lectures per Week</label>
                  <div className="number-input-wrapper">
                    <button
                      className="number-btn"
                      onClick={() => handleChange(index, "lecturesPerWeek", Math.max(1, sub.lecturesPerWeek - 1))}
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <input
                      id={`lectures-${index}`}
                      type="number"
                      min="1"
                      max="10"
                      value={sub.lecturesPerWeek}
                      onChange={(e) => handleChange(index, "lecturesPerWeek", Number(e.target.value))}
                      className={errors[`${index}-lecturesPerWeek`] ? "error" : ""}
                    />
                    <button
                      className="number-btn"
                      onClick={() => handleChange(index, "lecturesPerWeek", Math.min(10, sub.lecturesPerWeek + 1))}
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  {errors[`${index}-lecturesPerWeek`] && (
                    <span className="field-error">{errors[`${index}-lecturesPerWeek`]}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="add-subject-btn" onClick={addSubject}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Another Subject
        </button>

        <div className="action-footer">
          <button
            className="generate-btn"
            onClick={generateTimetable}
            disabled={isGenerating}
          >
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
                Generate Timetable
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputPage;