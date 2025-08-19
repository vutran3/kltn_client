export function fmtTime(d) {
    const time = d.toLocaleTimeString("vi-VN", { hour12: false, hour: "2-digit", minute: "2-digit" });
    const ddmm = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    return `${time} (${ddmm})`;
}

export const fmtTs = (tsOrDate) => {
    const d = new Date(tsOrDate);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    return `${hh}:${mm} (${dd}/${mo})`;
};

export const toMs = (dateStr) => {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.getTime();
};

export function mapApiRowsToSeries(rows) {
    const sorted = [...rows].sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());
    return sorted.map((r) => {
        const dt = new Date(r.t);
        return {
            time: fmtTime(dt),
            temp: typeof r.airTemperature === "number" ? Number(r.airTemperature.toFixed(1)) : null,
            rain: typeof r.rainRaw === "number" ? r.rainRaw : null
        };
    });
}
