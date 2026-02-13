import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFaculty } from "../utils/facultyStore";
import { getRooms } from "../utils/roomStore";
import { getSettings } from "../utils/settingsStore";
import FacultyPanel from "./FacultyPanel";
import RoomsPanel from "./RoomsPanel";
import SettingsPanel from "./SettingsPanel";
import ProfilePanel from "./ProfilePanel";
import "./Dashboard.css";

/* ───────── Icon Components (inline SVGs) ───────── */
const Icons = {
    Dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
    ),
    Faculty: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    Rooms: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    Settings: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    CheckCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    MoreVertical: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
        </svg>
    ),
    Layers: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    ),
    Menu: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    ),
    Sparkle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
        </svg>
    ),
};

/* ───────── Sample Timetable Data ───────── */
const sampleTimetables = [
    {
        id: 1,
        title: "Spring 2026 – CS Department",
        description: "Complete schedule for Computer Science department including labs, tutorials, and lectures.",
        status: "active",
        date: "Feb 10, 2026",
        faculty: 24,
        rooms: 12,
    },
    {
        id: 2,
        title: "Final Exams Schedule",
        description: "End-semester examination timetable with room allocations and invigilator assignments.",
        status: "active",
        date: "Feb 8, 2026",
        faculty: 32,
        rooms: 18,
    },
    {
        id: 3,
        title: "SY IT Semester Plan",
        description: "Second year Information Technology semester-long academic schedule with elective slots.",
        status: "draft",
        date: "Feb 5, 2026",
        faculty: 16,
        rooms: 8,
    },
    {
        id: 4,
        title: "Workshop & Lab Sessions",
        description: "Specialized lab and workshop sessions across engineering departments for hands-on learning.",
        status: "active",
        date: "Jan 28, 2026",
        faculty: 10,
        rooms: 6,
    },
    {
        id: 5,
        title: "Summer Bridge Program",
        description: "Intensive summer schedule for incoming freshmen covering orientation and preparatory courses.",
        status: "archived",
        date: "Jan 15, 2026",
        faculty: 8,
        rooms: 4,
    },
    {
        id: 6,
        title: "Faculty Development Week",
        description: "Training and development sessions for faculty members including research methodology workshops.",
        status: "draft",
        date: "Jan 10, 2026",
        faculty: 42,
        rooms: 6,
    },
];

/* ───────── Dashboard Component ───────── */
export default function Dashboard() {
    const [activeNav, setActiveNav] = useState("dashboard");
    const [activeFilter, setActiveFilter] = useState("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [facultyCount, setFacultyCount] = useState(0);
    const [roomCount, setRoomCount] = useState(0);
    const navigate = useNavigate();

    // Refresh counts when switching tabs or on mount
    useEffect(() => {
        setFacultyCount(getFaculty().length);
        setRoomCount(getRooms().length);
        window.scrollTo(0, 0);
    }, [activeNav]);

    // Apply saved dark mode on mount
    useEffect(() => {
        const s = getSettings();
        document.documentElement.classList.toggle("dark-mode", s.theme === "dark");
    }, []);

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: <Icons.Dashboard /> },
        { id: "faculty", label: "Faculty", icon: <Icons.Faculty /> },
        { id: "rooms", label: "Rooms", icon: <Icons.Rooms /> },
        { id: "settings", label: "Settings", icon: <Icons.Settings /> },
    ];

    const filters = [
        { id: "all", label: "All" },
        { id: "active", label: "Active" },
        { id: "draft", label: "Draft" },
        { id: "archived", label: "Archived" },
    ];

    const filteredTimetables =
        activeFilter === "all"
            ? sampleTimetables
            : sampleTimetables.filter((t) => t.status === activeFilter);

    const stats = [
        {
            icon: <Icons.Calendar />,
            value: sampleTimetables.length,
            label: "Timetables",
            className: "timetables",
        },
        {
            icon: <Icons.Faculty />,
            value: facultyCount,
            label: "Faculty Members",
            className: "faculty",
        },
        {
            icon: <Icons.Rooms />,
            value: roomCount,
            label: "Rooms Available",
            className: "rooms",
        },
        {
            icon: <Icons.CheckCircle />,
            value: "0",
            label: "Conflicts Found",
            className: "conflicts",
        },
    ];

    const handleCreateNew = () => {
        navigate("/create");
    };

    return (
        <div className="dashboard-layout">
            {/* Mobile menu button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
                id="mobile-menu-toggle"
            >
                <Icons.Menu />
            </button>

            {/* Mobile overlay */}
            <div
                className={`mobile-overlay ${sidebarOpen ? "open visible" : ""}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} id="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <Icons.Sparkle />
                    </div>
                    <div className="brand-text">
                        <span className="brand-name">AI Timetable</span>
                        <span className="brand-tagline">Smart Scheduling</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            id={`nav-${item.id}`}
                            className={`nav-item ${activeNav === item.id ? "active" : ""}`}
                            onClick={() => {
                                setActiveNav(item.id);
                                setSidebarOpen(false);
                            }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div
                        className={`sidebar-user ${showUserMenu ? "menu-open" : ""}`}
                        id="sidebar-user-profile"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="user-avatar">AK</div>
                        <div className="user-info">
                            <span className="user-name">Admin User</span>
                            <span className="user-role">Administrator</span>
                        </div>
                        <span className={`user-menu-chevron ${showUserMenu ? "open" : ""}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </span>
                    </div>
                    {showUserMenu && (
                        <div className="user-dropdown">
                            <button
                                className="user-dropdown-item"
                                onClick={() => {
                                    setActiveNav("profile");
                                    setShowUserMenu(false);
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                Profile
                            </button>
                            <button
                                className="user-dropdown-item logout"
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    window.location.href = "/login";
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <main className="main-content">
                {activeNav === "faculty" ? (
                    <FacultyPanel />
                ) : activeNav === "rooms" ? (
                    <RoomsPanel />
                ) : activeNav === "settings" ? (
                    <SettingsPanel />
                ) : activeNav === "profile" ? (
                    <ProfilePanel />
                ) : (
                    <>
                        {/* Header */}
                        <header className="content-header">
                            <div className="header-left">
                                <span className="page-greeting">Welcome back, Admin 👋</span>
                                <h1 className="page-title">
                                    Your <span>Timetables</span>
                                </h1>
                            </div>
                            <button
                                className="create-btn"
                                id="create-new-timetable"
                                onClick={handleCreateNew}
                            >
                                <span className="create-btn-icon">+</span>
                                <span className="create-btn-text">Create New Timetable</span>
                            </button>
                        </header>

                        {/* Stats */}
                        <div className="stats-row">
                            {stats.map((s, idx) => (
                                <div className="stat-card" key={idx} id={`stat-${s.className}`}>
                                    <div className={`stat-icon ${s.className}`}>{s.icon}</div>
                                    <div className="stat-details">
                                        <span className="stat-value">{s.value}</span>
                                        <span className="stat-label">{s.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Section header with filters */}
                        <div className="section-header">
                            <h2 className="section-title">Recent Timetables</h2>
                            <div className="section-filter">
                                {filters.map((f) => (
                                    <button
                                        key={f.id}
                                        id={`filter-${f.id}`}
                                        className={`filter-btn ${activeFilter === f.id ? "active" : ""}`}
                                        onClick={() => setActiveFilter(f.id)}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Card grid */}
                        <div className="card-grid">
                            {filteredTimetables.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <Icons.Layers />
                                    </div>
                                    <h3 className="empty-title">No timetables found</h3>
                                    <p className="empty-desc">
                                        There are no timetables matching this filter. Try a different
                                        filter or create a new timetable.
                                    </p>
                                </div>
                            ) : (
                                filteredTimetables.map((tt) => (
                                    <article
                                        className="timetable-card"
                                        key={tt.id}
                                        id={`timetable-card-${tt.id}`}
                                    >
                                        <div className="card-header">
                                            <span className={`card-badge ${tt.status}`}>
                                                <span
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        background: "currentColor",
                                                    }}
                                                />
                                                {tt.status}
                                            </span>
                                            <button className="card-menu-btn" aria-label="Card options">
                                                <Icons.MoreVertical />
                                            </button>
                                        </div>
                                        <h3 className="card-title">{tt.title}</h3>
                                        <p className="card-description">{tt.description}</p>
                                        <div className="card-meta">
                                            <span className="meta-item">
                                                <span className="meta-icon">
                                                    <Icons.Calendar />
                                                </span>
                                                {tt.date}
                                            </span>
                                            <span className="meta-item">
                                                <span className="meta-icon">
                                                    <Icons.Faculty />
                                                </span>
                                                {tt.faculty} Faculty
                                            </span>
                                            <span className="meta-item">
                                                <span className="meta-icon">
                                                    <Icons.Rooms />
                                                </span>
                                                {tt.rooms} Rooms
                                            </span>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
