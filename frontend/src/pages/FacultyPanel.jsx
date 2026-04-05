import { useEffect, useMemo, useState } from "react";
import {
  getFaculty,
  addFaculty,
  getFacultyDisplayName,
  removeFaculty,
} from "../utils/facultyStore";
import { getSavedSubjects, saveSubjects } from "../utils/subjectStore";
import "./FacultyPanel.css";

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FACULTY_TITLES = ["", "Prof.", "Dr.", "Mr.", "Ms.", "Mrs."];
const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function parseBatches(value) {
  return Array.from(
    new Set(
      String(value || "")
        .split(/[,/|\n]+/)
        .map((batch) => batch.trim())
        .filter(Boolean)
    )
  );
}

function formatBatches(batches) {
  return Array.isArray(batches) ? batches.join(", ") : "";
}

export default function FacultyPanel() {
  const [facultyList, setFacultyList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [showSuccess, setShowSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [subjectErrors, setSubjectErrors] = useState({});

  const [form, setForm] = useState({
    title: "",
    name: "",
    department: "",
    shortCode: "",
  });

  const [subjectForm, setSubjectForm] = useState({
    year: YEAR_OPTIONS[0],
    department: "",
    faculty: "",
    name: "",
    sessionType: "Lecture",
    batches: [],
  });

  useEffect(() => {
    setFacultyList(getFaculty());
    setSubjects(getSavedSubjects());
  }, []);

  useEffect(() => {
    if (!showSuccess) return undefined;
    const timeout = setTimeout(() => setShowSuccess(""), 3000);
    return () => clearTimeout(timeout);
  }, [showSuccess]);

  const departmentOptions = useMemo(
    () =>
      Array.from(new Set(facultyList.map((faculty) => faculty.department.trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [facultyList]
  );

  const availableFaculty = useMemo(
    () =>
      facultyList.filter((faculty) => {
        if (!subjectForm.department.trim()) return true;
        return faculty.department.trim().toLowerCase() === subjectForm.department.trim().toLowerCase();
      }),
    [facultyList, subjectForm.department]
  );

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubjectFormChange = (field, value) => {
    setSubjectForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "sessionType" && value === "Lecture") next.batches = [];
      if (field === "department" && prev.department !== value) next.faculty = "";
      return next;
    });
    if (subjectErrors[field]) {
      setSubjectErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleAddFaculty = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.department.trim()) errors.department = "Department is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const shortCode =
      form.shortCode.trim() ||
      form.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    const newFaculty = addFaculty({
      title: form.title,
      name: form.name.trim(),
      department: form.department.trim(),
      shortCode,
    });

    setFacultyList(getFaculty());
    setForm({ title: "", name: "", department: "", shortCode: "" });
    setFormErrors({});
    setShowSuccess(`${getFacultyDisplayName(newFaculty)} added successfully!`);
  };

  const handleAddSubject = () => {
    const errors = {};
    if (!subjectForm.year.trim()) errors.year = "Year is required";
    if (!subjectForm.department.trim()) errors.department = "Department is required";
    if (!subjectForm.faculty.trim()) errors.faculty = "Faculty is required";
    if (!subjectForm.name.trim()) errors.name = "Subject is required";
    if (subjectForm.sessionType === "Practical" && subjectForm.batches.length === 0) {
      errors.batches = "Add practical batches";
    }

    if (Object.keys(errors).length > 0) {
      setSubjectErrors(errors);
      return;
    }

    const nextSubjects = saveSubjects([
      ...subjects,
      {
        year: subjectForm.year.trim(),
        department: subjectForm.department.trim(),
        faculty: subjectForm.faculty.trim(),
        name: subjectForm.name.trim(),
        sessionType: subjectForm.sessionType,
        batches: subjectForm.batches,
      },
    ]);

    setSubjects(nextSubjects);
    setSubjectForm({
      year: YEAR_OPTIONS[0],
      department: subjectForm.department.trim(),
      faculty: "",
      name: "",
      sessionType: "Lecture",
      batches: [],
    });
    setSubjectErrors({});
    setShowSuccess("Saved subject added successfully!");
  };

  const handleDeleteFaculty = (id, name) => {
    if (window.confirm(`Remove ${name} from the faculty list?`)) {
      removeFaculty(id);
      setFacultyList(getFaculty());
    }
  };

  const handleDeleteSubject = (id, name) => {
    if (window.confirm(`Remove subject ${name}?`)) {
      const nextSubjects = saveSubjects(subjects.filter((subject) => subject.id !== id));
      setSubjects(nextSubjects);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleAddFaculty();
  };

  const facultyFiltered = facultyList.filter((faculty) => {
    const query = search.toLowerCase();
    return (
      getFacultyDisplayName(faculty).toLowerCase().includes(query) ||
      faculty.department.toLowerCase().includes(query) ||
      (faculty.shortCode && faculty.shortCode.toLowerCase().includes(query))
    );
  });

  const subjectFiltered = subjects.filter((subject) => {
    const query = subjectSearch.toLowerCase();
    return (
      subject.name.toLowerCase().includes(query) ||
      subject.year.toLowerCase().includes(query) ||
      subject.department.toLowerCase().includes(query) ||
      subject.faculty.toLowerCase().includes(query)
    );
  });

  const yearwiseSubjects = YEAR_OPTIONS.map((year) => ({
    year,
    subjects: subjectFiltered
      .filter((subject) => subject.year === year)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return (
    <div className="faculty-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <h1 className="panel-title">Faculty Members</h1>
          <p className="panel-subtitle">
            Add faculty and maintain a saved year-wise subject list for timetable creation.
          </p>
        </div>
      </div>

      {showSuccess && (
        <div className="success-toast" role="status">
          <CheckIcon />
          {showSuccess}
        </div>
      )}

      <div className="add-faculty-card" id="add-faculty-form">
        <div className="form-title">
          <span className="form-title-icon">+</span>
          Add New Faculty
        </div>
        <div className="faculty-form">
          <div className="form-field">
            <label className="form-label" htmlFor="faculty-title-input">
              Title
            </label>
            <select
              id="faculty-title-input"
              className="form-input"
              value={form.title}
              onChange={(event) => handleFormChange("title", event.target.value)}
              onKeyDown={handleKeyDown}
            >
              <option value="">None</option>
              {FACULTY_TITLES.filter(Boolean).map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
            <span className="form-error"></span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="faculty-name-input">
              Name *
            </label>
            <input
              id="faculty-name-input"
              className={`form-input ${formErrors.name ? "has-error" : ""}`}
              type="text"
              placeholder="e.g., Sarah Johnson"
              value={form.name}
              onChange={(event) => handleFormChange("name", event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span className="form-error">{formErrors.name || ""}</span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="faculty-dept-input">
              Department *
            </label>
            <input
              id="faculty-dept-input"
              className={`form-input ${formErrors.department ? "has-error" : ""}`}
              type="text"
              placeholder="e.g., Computer Science"
              value={form.department}
              onChange={(event) => handleFormChange("department", event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span className="form-error">{formErrors.department || ""}</span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="faculty-short-input">
              Short Code
            </label>
            <input
              id="faculty-short-input"
              className="form-input"
              type="text"
              placeholder="Auto (e.g., SJ)"
              value={form.shortCode}
              onChange={(event) => handleFormChange("shortCode", event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span className="form-error"></span>
          </div>

          <button className="add-faculty-btn" id="add-faculty-submit" onClick={handleAddFaculty}>
            <PlusIcon />
            Add
          </button>
        </div>
      </div>

      <div className="add-faculty-card subject-master-card">
        <div className="form-title">
          <span className="form-title-icon">+</span>
          Add Saved Subject
        </div>
        <div className="subject-form">
          <div className="form-field">
            <label className="form-label" htmlFor="subject-year-input">
              Year *
            </label>
            <select
              id="subject-year-input"
              className={`form-input ${subjectErrors.year ? "has-error" : ""}`}
              value={subjectForm.year}
              onChange={(event) => handleSubjectFormChange("year", event.target.value)}
            >
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <span className="form-error">{subjectErrors.year || ""}</span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="subject-dept-input">
              Department *
            </label>
            <input
              id="subject-dept-input"
              className={`form-input ${subjectErrors.department ? "has-error" : ""}`}
              type="text"
              list="department-options"
              placeholder="e.g., Computer Science"
              value={subjectForm.department}
              onChange={(event) => handleSubjectFormChange("department", event.target.value)}
            />
            <datalist id="department-options">
              {departmentOptions.map((department) => (
                <option key={department} value={department} />
              ))}
            </datalist>
            <span className="form-error">{subjectErrors.department || ""}</span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="subject-faculty-input">
              Faculty *
            </label>
            <select
              id="subject-faculty-input"
              className={`form-input ${subjectErrors.faculty ? "has-error" : ""}`}
              value={subjectForm.faculty}
              onChange={(event) => handleSubjectFormChange("faculty", event.target.value)}
            >
              <option value="">Select faculty...</option>
              {availableFaculty.map((faculty) => (
                <option key={faculty.id} value={getFacultyDisplayName(faculty)}>
                  {getFacultyDisplayName(faculty)} ({faculty.department})
                </option>
              ))}
            </select>
            <span className="form-error">{subjectErrors.faculty || ""}</span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="subject-name-input">
              Subject *
            </label>
            <input
              id="subject-name-input"
              className={`form-input ${subjectErrors.name ? "has-error" : ""}`}
              type="text"
              placeholder="e.g., Operating Systems"
              value={subjectForm.name}
              onChange={(event) => handleSubjectFormChange("name", event.target.value)}
            />
            <span className="form-error">{subjectErrors.name || ""}</span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="subject-type-input">
              Session Type
            </label>
            <select
              id="subject-type-input"
              className="form-input"
              value={subjectForm.sessionType}
              onChange={(event) => handleSubjectFormChange("sessionType", event.target.value)}
            >
              <option value="Lecture">Lecture</option>
              <option value="Practical">Practical</option>
            </select>
            <span className="form-error"></span>
          </div>

          {subjectForm.sessionType === "Practical" && (
            <div className="form-field subject-batches-field">
              <label className="form-label" htmlFor="subject-batches-input">
                Practical Batches *
              </label>
              <input
                id="subject-batches-input"
                className={`form-input ${subjectErrors.batches ? "has-error" : ""}`}
                type="text"
                placeholder="e.g., A, B, C"
                value={formatBatches(subjectForm.batches)}
                onChange={(event) => handleSubjectFormChange("batches", parseBatches(event.target.value))}
              />
              <span className="form-error">{subjectErrors.batches || ""}</span>
            </div>
          )}

          <button className="add-faculty-btn subject-add-btn" onClick={handleAddSubject}>
            <PlusIcon />
            Save Subject
          </button>
        </div>
      </div>

      <div className="faculty-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">
            <SearchIcon />
          </span>
          <input
            id="faculty-search"
            className="search-input"
            type="text"
            placeholder="Search faculty by name, department..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <span className="faculty-count-badge">
          {facultyFiltered.length} member{facultyFiltered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {facultyFiltered.length === 0 ? (
        <div className="faculty-empty">
          <div className="faculty-empty-icon">
            <UsersIcon />
          </div>
          <h3 className="faculty-empty-title">
            {search ? "No results found" : "No faculty added yet"}
          </h3>
          <p className="faculty-empty-desc">
            {search
              ? "Try a different search term."
              : "Add your first faculty member using the form above. They will appear in the timetable creator."}
          </p>
        </div>
      ) : (
        <div className="faculty-table">
          <div className="faculty-table-head">
            <span className="table-head-cell">Name</span>
            <span className="table-head-cell">Department</span>
            <span className="table-head-cell">Code</span>
            <span className="table-head-cell" style={{ textAlign: "right" }}>
              Actions
            </span>
          </div>
          <div className="faculty-table-body">
            {facultyFiltered.map((faculty) => (
              <div className="faculty-row" key={faculty.id} id={`faculty-${faculty.id}`}>
                <div className="faculty-name-cell">
                  <span className="faculty-avatar">{getInitials(getFacultyDisplayName(faculty))}</span>
                  <span className="faculty-name">{getFacultyDisplayName(faculty)}</span>
                </div>
                <span className="faculty-dept">{faculty.department}</span>
                <span className="faculty-short">{faculty.shortCode}</span>
                <div className="faculty-actions">
                  <button
                    className="delete-faculty-btn"
                    aria-label={`Delete ${getFacultyDisplayName(faculty)}`}
                    onClick={() => handleDeleteFaculty(faculty.id, getFacultyDisplayName(faculty))}
                  >
                    <TrashIcon />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="subject-panel-header">
        <div>
          <h2 className="faculty-list-title">Year-Wise Saved Subjects</h2>
          <p className="panel-subtitle">These subjects appear in the same kind of saved dropdown while creating timetables.</p>
        </div>
      </div>

      <div className="faculty-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">
            <SearchIcon />
          </span>
          <input
            className="search-input"
            type="text"
            placeholder="Search saved subjects by year, subject, faculty..."
            value={subjectSearch}
            onChange={(event) => setSubjectSearch(event.target.value)}
          />
        </div>
        <span className="faculty-count-badge">
          {subjectFiltered.length} subject{subjectFiltered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="subject-year-grid">
        {yearwiseSubjects.map((group) => (
          <section key={group.year} className="subject-year-card">
            <div className="subject-year-header">
              <h3>{group.year}</h3>
              <span className="faculty-count-badge">
                {group.subjects.length} saved
              </span>
            </div>

            {group.subjects.length === 0 ? (
              <div className="subject-year-empty">No saved subjects for {group.year}.</div>
            ) : (
              <div className="subject-year-list">
                {group.subjects.map((subject) => (
                  <div key={subject.id} className="subject-year-row">
                    <div className="subject-year-main">
                      <div className="subject-year-name">{subject.name}</div>
                      <div className="subject-year-meta">
                        <span>{subject.faculty}</span>
                        <span>{subject.department}</span>
                        <span>{subject.sessionType}</span>
                        {subject.batches?.length > 0 && <span>{subject.batches.join(", ")}</span>}
                      </div>
                    </div>
                    <button
                      className="delete-faculty-btn"
                      onClick={() => handleDeleteSubject(subject.id, subject.name)}
                    >
                      <TrashIcon />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
