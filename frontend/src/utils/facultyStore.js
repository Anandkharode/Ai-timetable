/**
 * Faculty Store – localStorage-backed persistence layer
 * Keeps faculty data available across Dashboard & InputPage.
 */

const STORAGE_KEY = "ai_timetable_faculty";

export function getFaculty() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveFaculty(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addFaculty(faculty) {
    const list = getFaculty();
    const newFaculty = {
        ...faculty,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        createdAt: new Date().toISOString(),
    };
    list.push(newFaculty);
    saveFaculty(list);
    return newFaculty;
}

export function updateFaculty(id, updates) {
    const list = getFaculty().map((f) =>
        f.id === id ? { ...f, ...updates } : f
    );
    saveFaculty(list);
    return list;
}

export function removeFaculty(id) {
    const list = getFaculty().filter((f) => f.id !== id);
    saveFaculty(list);
    return list;
}
