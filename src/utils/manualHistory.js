const LS_KEY = "manual_detect_history_v1";
const MAX_ITEMS = 10;

export function loadManualHistory() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

export function saveManualHistoryItem(item) {
    try {
        const arr = loadManualHistory();
        const filtered = arr.filter((x) => x.id !== item.id);
        filtered.unshift(item);
        const trimmed = filtered.slice(0, MAX_ITEMS);
        localStorage.setItem(LS_KEY, JSON.stringify(trimmed));
        return trimmed;
    } catch {
        return null;
    }
}

export function clearManualHistory() {
    localStorage.removeItem(LS_KEY);
}

export function removeManualHistoryItem(id) {
    const arr = loadManualHistory().filter((x) => x.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
    return arr;
}
