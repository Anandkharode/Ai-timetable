import { useState, useEffect } from "react";
import { getRooms, addRoom, removeRoom } from "../utils/roomStore";
import "./FacultyPanel.css"; /* shared table / form styles */
import "./RoomsPanel.css";

/* ───── Icons ───── */
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const RoomIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const ROOM_TYPES = ["Lecture", "Lab", "Seminar", "Auditorium"];

export default function RoomsPanel() {
    const [roomList, setRoomList] = useState([]);
    const [search, setSearch] = useState("");
    const [showSuccess, setShowSuccess] = useState("");
    const [formErrors, setFormErrors] = useState({});

    const [form, setForm] = useState({
        name: "",
        type: "Lecture",
        capacity: "",
        building: "",
    });

    useEffect(() => {
        setRoomList(getRooms());
    }, []);

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
        if (!form.name.trim()) errors.name = "Room name is required";
        if (!form.capacity || Number(form.capacity) < 1) errors.capacity = "Enter valid capacity";

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const newRoom = addRoom({
            name: form.name.trim(),
            type: form.type,
            capacity: Number(form.capacity),
            building: form.building.trim() || "Main Campus",
        });

        setRoomList(getRooms());
        setForm({ name: "", type: "Lecture", capacity: "", building: "" });
        setFormErrors({});
        setShowSuccess(`${newRoom.name} added successfully!`);
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Remove "${name}" from the rooms list?`)) {
            removeRoom(id);
            setRoomList(getRooms());
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleAdd();
    };

    const filtered = roomList.filter((r) => {
        const q = search.toLowerCase();
        return (
            r.name.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q) ||
            (r.building && r.building.toLowerCase().includes(q))
        );
    });

    const maxCapacity = roomList.length > 0 ? Math.max(...roomList.map((r) => r.capacity)) : 100;

    return (
        <div className="rooms-panel faculty-panel">
            {/* Header */}
            <div className="panel-header">
                <div className="panel-header-left">
                    <h1 className="panel-title">Rooms & Venues</h1>
                    <p className="panel-subtitle">
                        Manage classrooms, labs, and other venues for scheduling.
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
            <div className="add-faculty-card" id="add-room-form">
                <div className="form-title">
                    <span className="form-title-icon">+</span>
                    Add New Room
                </div>
                <div className="room-form">
                    <div className="form-field">
                        <label className="form-label" htmlFor="room-name-input">Room Name *</label>
                        <input
                            id="room-name-input"
                            className={`form-input ${formErrors.name ? "has-error" : ""}`}
                            type="text"
                            placeholder="e.g., Room 301"
                            value={form.name}
                            onChange={(e) => handleFormChange("name", e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <span className="form-error">{formErrors.name || ""}</span>
                    </div>

                    <div className="form-field">
                        <label className="form-label" htmlFor="room-type-input">Type</label>
                        <select
                            id="room-type-input"
                            className="form-select"
                            value={form.type}
                            onChange={(e) => handleFormChange("type", e.target.value)}
                        >
                            {ROOM_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <span className="form-error"></span>
                    </div>

                    <div className="form-field">
                        <label className="form-label" htmlFor="room-capacity-input">Capacity *</label>
                        <input
                            id="room-capacity-input"
                            className={`form-input ${formErrors.capacity ? "has-error" : ""}`}
                            type="number"
                            min="1"
                            placeholder="e.g., 60"
                            value={form.capacity}
                            onChange={(e) => handleFormChange("capacity", e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <span className="form-error">{formErrors.capacity || ""}</span>
                    </div>

                    <div className="form-field">
                        <label className="form-label" htmlFor="room-building-input">Building</label>
                        <input
                            id="room-building-input"
                            className="form-input"
                            type="text"
                            placeholder="e.g., Block A"
                            value={form.building}
                            onChange={(e) => handleFormChange("building", e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <span className="form-error"></span>
                    </div>

                    <button className="add-faculty-btn" id="add-room-submit" onClick={handleAdd}>
                        <PlusIcon />
                        Add
                    </button>
                </div>
            </div>

            {/* Search & count */}
            <div className="faculty-toolbar">
                <div className="search-wrapper">
                    <span className="search-icon"><SearchIcon /></span>
                    <input
                        id="room-search"
                        className="search-input"
                        type="text"
                        placeholder="Search rooms by name, type, building..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <span className="faculty-count-badge">
                    {filtered.length} room{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Room table */}
            {filtered.length === 0 ? (
                <div className="faculty-empty">
                    <div className="faculty-empty-icon">
                        <RoomIcon />
                    </div>
                    <h3 className="faculty-empty-title">
                        {search ? "No results found" : "No rooms added yet"}
                    </h3>
                    <p className="faculty-empty-desc">
                        {search
                            ? "Try a different search term."
                            : "Add your first room using the form above. They'll be available when generating timetables."}
                    </p>
                </div>
            ) : (
                <div className="faculty-table">
                    <div className="room-table-head">
                        <span className="table-head-cell">Room</span>
                        <span className="table-head-cell">Building</span>
                        <span className="table-head-cell">Capacity</span>
                        <span className="table-head-cell">Type</span>
                        <span className="table-head-cell" style={{ textAlign: "right" }}>Actions</span>
                    </div>
                    <div className="faculty-table-body">
                        {filtered.map((r) => (
                            <div className="room-row" key={r.id} id={`room-${r.id}`}>
                                <div className="room-name-cell">
                                    <span className="room-icon-box"><RoomIcon /></span>
                                    <span className="room-name">{r.name}</span>
                                </div>
                                <span className="faculty-dept">{r.building || "—"}</span>
                                <div className="capacity-indicator">
                                    <div className="capacity-bar">
                                        <div
                                            className="capacity-fill"
                                            style={{ width: `${Math.min(100, (r.capacity / maxCapacity) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="capacity-text">{r.capacity}</span>
                                </div>
                                <span className={`room-type-badge ${r.type.toLowerCase()}`}>{r.type}</span>
                                <div className="faculty-actions">
                                    <button
                                        className="action-btn delete"
                                        aria-label={`Delete ${r.name}`}
                                        title="Remove"
                                        onClick={() => handleDelete(r.id, r.name)}
                                    >
                                        <TrashIcon />
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
