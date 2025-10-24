const NUM_KEYS = [
    "airTemperature",
    "airHumidity",
    "soilTemperature",
    "soilHumidity",
    "lightRaw",
    "ph",
    "phosphorus",
    "nitrogen",
    "potassium"
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
    const tzMs = tzOffsetMinutes * 60 * 1000;
    const buckets = new Map();

    for (const r of rows) {
        const tMs = Date.parse(r.t);
        const minuteKey = Math.floor((tMs + tzMs) / 60000) * 60000 - tzMs;

        let acc = buckets.get(minuteKey);
        if (!acc) {
            acc = { sum: {}, cnt: {} };
            buckets.set(minuteKey, acc);
        }
        for (const k of NUM_KEYS) {
            const v = r[k];
            if (typeof v === "number" && Number.isFinite(v)) {
                acc.sum[k] = (acc.sum[k] ?? 0) + v;
                acc.cnt[k] = (acc.cnt[k] ?? 0) + 1;
            }
        }
    }

    const out = [];
    for (const [minuteKey, { sum, cnt }] of buckets) {
        const averaged = {};
        for (const k of Object.keys(sum)) {
            averaged[k] = sum[k] / cnt[k];
        }
        out.push({
            t: new Date(minuteKey).toISOString(),
            ...averaged
        });
    }
    out.sort((a, b) => Date.parse(a.t) - Date.parse(b.t));
    return out;
}

export function mapApiRowsToSeries(rows) {
    const sorted = [...rows].sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());
    return sorted.map((r) => {
        const dt = new Date(r.t);
        return {
            time: fmtTime(dt),
            temp: typeof r.airTemperature === "number" ? Number(r.airTemperature.toFixed(1)) : null,
            air: typeof r.airHumidity === "number" ? r.airHumidity : null,
            ph: typeof r.ph === "number" ? r.airHumidity : null,
            photpho: typeof r.phosphorus === "number" ? r.phosphorus : null,
            nitro: typeof r.nitrogen === "number" ? r.nitrogen : null,
            kali: typeof r.potassium === "number" ? r.potassium : null,
            soilHum: typeof r.soilHumidity === "number" ? r.soilHumidity : null
        };
    });
}

export function fmtTimeMs(ms) {
    if (!ms || ms <= 0) return "-";
    const d = new Date(ms);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export function fmtDuration(ms) {
    if (!ms || ms <= 0) return "0s";
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rs = s % 60;
    if (m < 60) return `${m}m ${rs}s`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}h ${rm}m ${rs}s`;
}

export function clampNonNegativeNumber(n, def = 0) {
    const num = Number(n);
    if (Number.isNaN(num) || num < 0) return def;
    return num;
}

export function datetimeLocalToMs(v) {
    if (!v) return null;
    const d = new Date(v);
    const t = d.getTime();
    return Number.isNaN(t) ? null : t;
}

export function computeEffectiveActive({ is_active, schedule_ms, now_ms, duration_ms }) {
    const hasSchedule = !!schedule_ms;
    const startedOk = !hasSchedule || now_ms >= schedule_ms;
    const offAt = (hasSchedule ? schedule_ms : now_ms) + (duration_ms || 0);
    const notExpired = !duration_ms || now_ms < offAt;
    return !!is_active && startedOk && notExpired;
}

export const fmtVN = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

export function mapResults(results, page, limit) {
    return results.map((item, idx) => {
        const ai = item?.ai_prediction || {};
        const originalUrl = item?.image_predetect?.image_url || "";
        const annotatedB64 = item?.ai_prediction?.annotated_image_base64;
        const detectedUrl = annotatedB64 ? `data:image/png;base64,${annotatedB64}` : originalUrl;

        const aiMessage = item?.predicting_description || item?.ai_prediction?.prediction_text || "";

        return {
            id: item?._id || `${page}-${idx}`,
            no: (page - 1) * (limit || 0) + idx + 1,
            originalUrl,
            detectedUrl,
            capturedAt: fmtVN(item?.inspection_date),
            aiMessage,
            boxes: ai?.boxes || [],
            originalSize: {
                width: ai?.image_width || item?.image_predetect?.width || 0,
                height: ai?.image_height || item?.image_predetect?.height || 0
            }
        };
    });
}
