/**
 * Room Store – localStorage-backed persistence layer
 * Keeps room data available across Dashboard & InputPage.
 */

const STORAGE_KEY = "ai_timetable_rooms";

export function getRooms() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveRooms(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addRoom(room) {
    const list = getRooms();
    const newRoom = {
        ...room,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        createdAt: new Date().toISOString(),
    };
    list.push(newRoom);
    saveRooms(list);
    return newRoom;
}

export function updateRoom(id, updates) {
    const list = getRooms().map((r) =>
        r.id === id ? { ...r, ...updates } : r
    );
    saveRooms(list);
    return list;
}

export function removeRoom(id) {
    const list = getRooms().filter((r) => r.id !== id);
    saveRooms(list);
    return list;
}
