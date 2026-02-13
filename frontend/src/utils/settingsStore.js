/**
 * Settings Store – localStorage-backed persistence
 * Stores application preferences.
 */

const STORAGE_KEY = "ai_timetable_settings";

const DEFAULT_SETTINGS = {
    institutionName: "",
    academicYear: "2025-2026",
    semester: "Spring",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    slotsPerDay: 6,
    slotDuration: 60,
    startTime: "09:00",
    endTime: "17:00",
    breakAfterSlot: 3,
    breakDuration: 15,
    theme: "light",
    notifications: true,
};

export function getSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

export function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function resetSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return { ...DEFAULT_SETTINGS };
}
