const LS_KEY_KNOWLEDGE = "knowledge_upload_history_v1";
const MAX_HISTORY_ITEMS = 10;

export function loadKnowledgeHistory() {
    try {
        const raw = localStorage.getItem(LS_KEY_KNOWLEDGE);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

export function saveKnowledgeHistoryItem(item) {
    try {
        const arr = loadKnowledgeHistory();
        const filtered = arr.filter((x) => x.content !== item.content);
        filtered.unshift(item);
        const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(LS_KEY_KNOWLEDGE, JSON.stringify(trimmed));
        return trimmed;
    } catch {
        return null;
    }
}

export function clearKnowledgeHistory() {
    localStorage.removeItem(LS_KEY_KNOWLEDGE);
}

export function removeKnowledgeHistoryItem(id) {
    const arr = loadKnowledgeHistory().filter((x) => x.id !== id);
    localStorage.setItem(LS_KEY_KNOWLEDGE, JSON.stringify(arr));
    return arr;
}
