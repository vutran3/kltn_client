
const NUM_KEYS = [
    "airTemperature", "airHumidity",
    "soilTemperature", "soilHumidity",
    "lightRaw", "ph", "phosphorus", "nitrogen", "potassium",
];

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

export function averagePerMinute(rows, { tzOffsetMinutes = 420 } = {}) {
    const tzMs = tzOffsetMinutes * 60 * 1000
    const buckets = new Map();

    for (const r of rows) {
        const tMs = Date.parse(r.t)
        const minuteKey = Math.floor((tMs + tzMs) / 60000) * 60000 - tzMs

        let acc = buckets.get(minuteKey)
        if (!acc) {
            acc = { sum: {}, cnt: {} }
            buckets.set(minuteKey, acc)
        }
        for (const k of NUM_KEYS) {
            const v = r[k]
            if (typeof v === 'number' && Number.isFinite(v)) {
                acc.sum[k] = (acc.sum[k] ?? 0) + v
                acc.cnt[k] = (acc.cnt[k] ?? 0) + 1
            }
        }
    }

    const out = []
    for (const [minuteKey, { sum, cnt }] of buckets) {
        const averaged = {}
        for (const k of Object.keys(sum)) {
            averaged[k] = sum[k] / cnt[k]
        }
        out.push({
            t: new Date(minuteKey).toISOString(),
            ...averaged
        })
    }
    out.sort((a, b) => Date.parse(a.t) - Date.parse(b.t))
    return out
}

export function mapApiRowsToSeries(rows) {
    const sorted = [...rows].sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());
    return sorted.map((r) => {
        const dt = new Date(r.t);
        return {
            time: fmtTime(dt),
            temp: typeof r.airTemperature === "number" ? Number(r.airTemperature.toFixed(1)) : null,
            air: typeof r.airHumidity === "number" ? r.airHumidity : null,
            ph: typeof r.ph === 'number' ? r.airHumidity : null,
            photpho: typeof r.phosphorus === 'number' ? r.phosphorus : null,
            nitro: typeof r.nitrogen === 'number' ? r.nitrogen : null,
            kali: typeof r.potassium === 'number' ? r.potassium : null,
            soilHum: typeof r.soilHumidity === 'number' ? r.soilHumidity : null
        };
    });
}
