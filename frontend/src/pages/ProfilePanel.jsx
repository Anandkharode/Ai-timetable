import { useState, useEffect } from "react";
import "./SettingsPanel.css";

/* ───── Icons ───── */
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

const STORAGE_KEY = "ai_timetable_profile";

function getProfile() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {
            fullName: "Admin User",
            email: "admin@institution.edu",
            phone: "",
            role: "Administrator",
            department: "Computer Science",
            bio: "",
        };
    } catch {
        return { fullName: "Admin User", email: "", phone: "", role: "Administrator", department: "", bio: "" };
    }
}

export default function ProfilePanel() {
    const [profile, setProfile] = useState(getProfile);
    const [showSuccess, setShowSuccess] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwdError, setPwdError] = useState("");

    useEffect(() => {
        if (showSuccess) {
            const t = setTimeout(() => setShowSuccess(""), 3000);
            return () => clearTimeout(t);
        }
    }, [showSuccess]);

    const update = (field, value) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        setShowSuccess("Profile updated successfully!");
    };

    const handleChangePassword = () => {
        setPwdError("");
        if (!currentPassword) { setPwdError("Enter current password"); return; }
        if (newPassword.length < 6) { setPwdError("New password must be at least 6 characters"); return; }
        if (newPassword !== confirmPassword) { setPwdError("Passwords do not match"); return; }

        // Simulated — in production this would call a backend API
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowSuccess("Password changed successfully!");
    };

    const initials = profile.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="settings-panel">
            {/* Header */}
            <div className="panel-header" style={{ marginBottom: "1.25rem" }}>
                <div className="panel-header-left">
                    <h1 className="panel-title">My Profile</h1>
                    <p className="panel-subtitle">
                        Manage your personal information and account settings.
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

            {/* Profile avatar + name section */}
            <div className="settings-section">
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: 18,
                        background: "linear-gradient(135deg, rgba(201,169,110,0.2), rgba(201,169,110,0.08))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.5rem", fontWeight: 700, color: "var(--accent-color)",
                        border: "2px solid rgba(201,169,110,0.2)", flexShrink: 0,
                    }}>
                        {initials}
                    </div>
                    <div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: 2 }}>
                            {profile.fullName}
                        </h2>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>
                            {profile.role} · {profile.department}
                        </p>
                    </div>
                </div>

                <h2 className="section-heading">
                    <span className="section-heading-icon inst"><UserIcon /></span>
                    Personal Information
                </h2>
                <p className="section-desc">Update your name, email, and contact details.</p>
                <div className="settings-grid">
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="profile-name">Full Name</label>
                        <input
                            id="profile-name"
                            className="settings-input"
                            type="text"
                            value={profile.fullName}
                            onChange={(e) => update("fullName", e.target.value)}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="profile-email">Email Address</label>
                        <input
                            id="profile-email"
                            className="settings-input"
                            type="email"
                            placeholder="admin@institution.edu"
                            value={profile.email}
                            onChange={(e) => update("email", e.target.value)}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="profile-phone">Phone Number</label>
                        <input
                            id="profile-phone"
                            className="settings-input"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={profile.phone}
                            onChange={(e) => update("phone", e.target.value)}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="profile-dept">Department</label>
                        <input
                            id="profile-dept"
                            className="settings-input"
                            type="text"
                            placeholder="e.g., Computer Science"
                            value={profile.department}
                            onChange={(e) => update("department", e.target.value)}
                        />
                    </div>
                    <div className="settings-field full-width">
                        <label className="settings-label" htmlFor="profile-bio">Bio</label>
                        <textarea
                            id="profile-bio"
                            className="settings-input"
                            rows="3"
                            placeholder="A short bio about yourself..."
                            value={profile.bio}
                            onChange={(e) => update("bio", e.target.value)}
                            style={{ resize: "vertical", minHeight: 72 }}
                        />
                    </div>
                </div>
            </div>

            {/* Change password */}
            <div className="settings-section">
                <h2 className="section-heading">
                    <span className="section-heading-icon schedule"><ShieldIcon /></span>
                    Change Password
                </h2>
                <p className="section-desc">Update your account password for security.</p>
                <div className="settings-grid">
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="current-pwd">Current Password</label>
                        <input
                            id="current-pwd"
                            className="settings-input"
                            type="password"
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="new-pwd">New Password</label>
                        <input
                            id="new-pwd"
                            className="settings-input"
                            type="password"
                            placeholder="At least 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="confirm-pwd">Confirm New Password</label>
                        <input
                            id="confirm-pwd"
                            className="settings-input"
                            type="password"
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
                {pwdError && (
                    <p style={{ color: "var(--error-color)", fontSize: "0.825rem", fontWeight: 500, marginTop: "0.75rem" }}>
                        {pwdError}
                    </p>
                )}
                <button
                    className="save-settings-btn"
                    style={{ marginTop: "1rem" }}
                    onClick={handleChangePassword}
                >
                    <ShieldIcon />
                    Update Password
                </button>
            </div>

            {/* Save profile */}
            <div className="settings-footer">
                <div />
                <button className="save-settings-btn" id="save-profile" onClick={handleSave}>
                    <SaveIcon />
                    Save Profile
                </button>
            </div>
        </div>
    );
}
