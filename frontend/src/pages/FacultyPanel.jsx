import { useState, useEffect } from "react";
import {
    getFaculty,
    addFaculty,
    removeFaculty,
} from "../utils/facultyStore";
import "./FacultyPanel.css";

/* ───── Inline SVG icons ───── */
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

/* ───── Helper ───── */
function getInitials(name) {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

/* ═══════════════════════════════════════════════════════════
   FacultyPanel Component
   ═══════════════════════════════════════════════════════════ */
export default function FacultyPanel() {
    const [facultyList, setFacultyList] = useState([]);
    const [search, setSearch] = useState("");
    const [showSuccess, setShowSuccess] = useState("");
    const [formErrors, setFormErrors] = useState({});

    // Form state
    const [form, setForm] = useState({
        name: "",
        department: "",
        shortCode: "",
    });

    // Load from store
    useEffect(() => {
        setFacultyList(getFaculty());
    }, []);

    // Auto-dismiss success toast
    useEffect(() => {
        if (showSuccess) {
            const t = setTimeout(() => setShowSuccess(""), 3000);
            return () => clearTimeout(t);
        }
    }, [showSuccess]);

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

    const handleAdd = () => {
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
                .map((w) => w[0])
                .join("")
                .toUpperCase();

        const newFaculty = addFaculty({
            name: form.name.trim(),
            department: form.department.trim(),
            shortCode,
        });

        setFacultyList(getFaculty());
        setForm({ name: "", department: "", shortCode: "" });
        setFormErrors({});
        setShowSuccess(`${newFaculty.name} added successfully!`);
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Remove ${name} from the faculty list?`)) {
            removeFaculty(id);
            setFacultyList(getFaculty());
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleAdd();
    };

    // Filtered list
    const filtered = facultyList.filter((f) => {
        const q = search.toLowerCase();
        return (
            f.name.toLowerCase().includes(q) ||
            f.department.toLowerCase().includes(q) ||
            (f.shortCode && f.shortCode.toLowerCase().includes(q))
        );
    });

    return (
        <div className="faculty-panel">
            {/* Header */}
            <div className="panel-header">
                <div className="panel-header-left">
                    <h1 className="panel-title">Faculty Members</h1>
                    <p className="panel-subtitle">
                        Add and manage your faculty. They will be available when creating
                        timetables.
                    </p>
                </div>
            </div>

            {/* Success toast */}
            {showSuccess && (
                <div className="success-toast" role="status">
                    <CheckIcon />
                    {showSuccess}
                </div>
            )}

            {/* Add form */}
            <div className="add-faculty-card" id="add-faculty-form">
                <div className="form-title">
                    <span className="form-title-icon">+</span>
                    Add New Faculty
                </div>
                <div className="faculty-form">
                    <div className="form-field">
                        <label className="form-label" htmlFor="faculty-name-input">
                            Full Name *
                        </label>
                        <input
                            id="faculty-name-input"
                            className={`form-input ${formErrors.name ? "has-error" : ""}`}
                            type="text"
                            placeholder="e.g., Dr. Sarah Johnson"
                            value={form.name}
                            onChange={(e) => handleFormChange("name", e.target.value)}
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
                            onChange={(e) => handleFormChange("department", e.target.value)}
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
                            onChange={(e) => handleFormChange("shortCode", e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <span className="form-error"></span>
                    </div>

                    <button
                        className="add-faculty-btn"
                        id="add-faculty-submit"
                        onClick={handleAdd}
                    >
                        <PlusIcon />
                        Add
                    </button>
                </div>
            </div>

            {/* Search + count */}
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
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <span className="faculty-count-badge">
                    {filtered.length} member{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Faculty table */}
            {filtered.length === 0 ? (
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
                            : "Add your first faculty member using the form above. They'll appear here and in the timetable creator."}
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
                        {filtered.map((f) => (
                            <div className="faculty-row" key={f.id} id={`faculty-${f.id}`}>
                                <div className="faculty-name-cell">
                                    <span className="faculty-avatar">{getInitials(f.name)}</span>
                                    <span className="faculty-name">{f.name}</span>
                                </div>
                                <span className="faculty-dept">{f.department}</span>
                                <span className="faculty-short">{f.shortCode}</span>
                                <div className="faculty-actions">
                                    <button
                                        className="delete-faculty-btn"
                                        aria-label={`Delete ${f.name}`}
                                        onClick={() => handleDelete(f.id, f.name)}
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
        </div>
    );
}
