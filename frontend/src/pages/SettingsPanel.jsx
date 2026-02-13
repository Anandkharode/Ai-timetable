import { useState, useEffect } from "react";
import { getSettings, saveSettings, resetSettings } from "../utils/settingsStore";
import "./SettingsPanel.css";

/* ───── Icons ───── */
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const InstitutionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const SlidersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
);

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SettingsPanel() {
    const [settings, setSettings] = useState(getSettings);
    const [showSuccess, setShowSuccess] = useState("");

    useEffect(() => {
        if (showSuccess) {
            const t = setTimeout(() => setShowSuccess(""), 3000);
            return () => clearTimeout(t);
        }
    }, [showSuccess]);

    const update = (field, value) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
    };

    const toggleDarkMode = (checked) => {
        const newTheme = checked ? "dark" : "light";
        update("theme", newTheme);
        document.documentElement.classList.toggle("dark-mode", checked);
    };

    // Apply saved theme on mount
    useEffect(() => {
        document.documentElement.classList.toggle("dark-mode", settings.theme === "dark");
    }, []);

    const toggleDay = (day) => {
        setSettings((prev) => {
            const days = prev.workingDays.includes(day)
                ? prev.workingDays.filter((d) => d !== day)
                : [...prev.workingDays, day];
            return { ...prev, workingDays: days };
        });
    };

    const handleSave = () => {
        saveSettings(settings);
        setShowSuccess("Settings saved successfully!");
    };

    const handleReset = () => {
        if (window.confirm("Reset all settings to default values?")) {
            const defaults = resetSettings();
            setSettings(defaults);
            setShowSuccess("Settings reset to defaults.");
        }
    };

    return (
        <div className="settings-panel">
            {/* Header */}
            <div className="panel-header" style={{ marginBottom: "1.5rem" }}>
                <div className="panel-header-left">
                    <h1 className="panel-title">Settings</h1>
                    <p className="panel-subtitle">
                        Configure your institution details and scheduling preferences.
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

            {/* Institution section */}
            <div className="settings-section">
                <h2 className="section-heading">
                    <span className="section-heading-icon inst"><InstitutionIcon /></span>
                    Institution Details
                </h2>
                <p className="section-desc">Basic information about your college or university.</p>
                <div className="settings-grid">
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="inst-name">Institution Name</label>
                        <input
                            id="inst-name"
                            className="settings-input"
                            type="text"
                            placeholder="e.g., National Institute of Technology"
                            value={settings.institutionName}
                            onChange={(e) => update("institutionName", e.target.value)}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="acad-year">Academic Year</label>
                        <select
                            id="acad-year"
                            className="settings-select"
                            value={settings.academicYear}
                            onChange={(e) => update("academicYear", e.target.value)}
                        >
                            <option value="2024-2025">2024 – 2025</option>
                            <option value="2025-2026">2025 – 2026</option>
                            <option value="2026-2027">2026 – 2027</option>
                        </select>
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="semester">Semester</label>
                        <select
                            id="semester"
                            className="settings-select"
                            value={settings.semester}
                            onChange={(e) => update("semester", e.target.value)}
                        >
                            <option value="Spring">Spring</option>
                            <option value="Fall">Fall</option>
                            <option value="Summer">Summer</option>
                            <option value="Winter">Winter</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Schedule section */}
            <div className="settings-section">
                <h2 className="section-heading">
                    <span className="section-heading-icon schedule"><ClockIcon /></span>
                    Schedule Configuration
                </h2>
                <p className="section-desc">Define the structure of your timetable slots and breaks.</p>
                <div className="settings-grid">
                    <div className="settings-field full-width">
                        <label className="settings-label">Working Days</label>
                        <div className="days-grid">
                            {ALL_DAYS.map((day) => (
                                <span key={day}>
                                    <input
                                        type="checkbox"
                                        className="day-checkbox"
                                        id={`day-${day}`}
                                        checked={settings.workingDays.includes(day)}
                                        onChange={() => toggleDay(day)}
                                    />
                                    <label className="day-label" htmlFor={`day-${day}`}>
                                        {day.slice(0, 3)}
                                    </label>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="slots-per-day">Slots per Day</label>
                        <input
                            id="slots-per-day"
                            className="settings-input"
                            type="number"
                            min="1"
                            max="12"
                            value={settings.slotsPerDay}
                            onChange={(e) => update("slotsPerDay", Number(e.target.value))}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="slot-duration">Slot Duration (min)</label>
                        <input
                            id="slot-duration"
                            className="settings-input"
                            type="number"
                            min="15"
                            max="180"
                            step="5"
                            value={settings.slotDuration}
                            onChange={(e) => update("slotDuration", Number(e.target.value))}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="start-time">Start Time</label>
                        <input
                            id="start-time"
                            className="settings-input"
                            type="time"
                            value={settings.startTime}
                            onChange={(e) => update("startTime", e.target.value)}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="end-time">End Time</label>
                        <input
                            id="end-time"
                            className="settings-input"
                            type="time"
                            value={settings.endTime}
                            onChange={(e) => update("endTime", e.target.value)}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="break-after">Break After Slot #</label>
                        <input
                            id="break-after"
                            className="settings-input"
                            type="number"
                            min="1"
                            max="12"
                            value={settings.breakAfterSlot}
                            onChange={(e) => update("breakAfterSlot", Number(e.target.value))}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="break-duration">Break Duration (min)</label>
                        <input
                            id="break-duration"
                            className="settings-input"
                            type="number"
                            min="5"
                            max="60"
                            step="5"
                            value={settings.breakDuration}
                            onChange={(e) => update("breakDuration", Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            {/* Preferences section */}
            <div className="settings-section">
                <h2 className="section-heading">
                    <span className="section-heading-icon pref"><SlidersIcon /></span>
                    Preferences
                </h2>
                <p className="section-desc">Customize your application experience.</p>
                <div>
                    <div className="toggle-row">
                        <div className="toggle-info">
                            <span className="toggle-label">Email Notifications</span>
                            <span className="toggle-desc">Receive alerts when timetables are generated or conflicts are detected.</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.notifications}
                                onChange={(e) => update("notifications", e.target.checked)}
                            />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                    <div className="toggle-row">
                        <div className="toggle-info">
                            <span className="toggle-label">Dark Mode</span>
                            <span className="toggle-desc">Switch to a darker theme for reduced eye strain.</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.theme === "dark"}
                                onChange={(e) => toggleDarkMode(e.target.checked)}
                            />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="settings-footer">
                <button className="reset-btn" onClick={handleReset}>
                    Reset to Defaults
                </button>
                <button className="save-settings-btn" id="save-settings" onClick={handleSave}>
                    <SaveIcon />
                    Save Settings
                </button>
            </div>
        </div>
    );
}
