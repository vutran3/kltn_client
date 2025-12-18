const NUM_KEYS = [
    "air_temperature",
    "air_humidity",
    "soil_temperature",
    "soil_humidity",
    "light_raw",
    "ph",
    "phosphorus",
    "nitrogen",
    "potassium",
    "airTemperature",
    "airHumidity",
    "soilTemperature",
    "soilHumidity",
    "lightRaw"
];
function camelToSnake(s) {
    let snake = s.replace(/([A-Z])/g, (match, p1, offset) => {
        if (offset > 0) {
            return `_${p1}`;
        }
        return p1;
    });
    return snake.toLowerCase();
}
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

export function averagePerDay(rows, { tzOffsetMinutes = 420 } = {}) {
    const tzMs = tzOffsetMinutes * 60 * 1000;
    const buckets = new Map();

    for (const r of rows) {
        const tMs = Date.parse(r.t);
        const dayKey = Math.floor((tMs + tzMs) / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000) - tzMs;

        let acc = buckets.get(dayKey);
        if (!acc) {
            acc = { sum: {}, cnt: {} };
            buckets.set(dayKey, acc);
        }

        for (const k of NUM_KEYS) {
            const key_type_snake = camelToSnake(k);
            const v = r[k];
            if (typeof v === "number" && Number.isFinite(v)) {
                acc.sum[key_type_snake] = (acc.sum[key_type_snake] ?? 0) + v;
                acc.cnt[key_type_snake] = (acc.cnt[key_type_snake] ?? 0) + 1;
            }
        }
    }

    const out = [];
    for (const [dayKey, { sum, cnt }] of buckets) {
        const averaged = {};
        for (const k of Object.keys(sum)) {
            averaged[k] = sum[k] / cnt[k];
        }
        out.push({
            t: new Date(dayKey).toISOString(),
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
            time: dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
            temp: typeof r.air_temperature === "number" ? Number(r.air_temperature.toFixed(1)) : null,
            air: typeof r.air_humidity === "number" ? r.air_humidity : null,
            ph: typeof r.ph === "number" ? r.ph : null,
            photpho: typeof r.phosphorus === "number" ? r.phosphorus : null,
            nitro: typeof r.nitrogen === "number" ? r.nitrogen : null,
            kali: typeof r.potassium === "number" ? r.potassium : null,
            soilHum: typeof r.soil_humidity === "number" ? r.soil_humidity : null
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
            expert_feedback: item?.expert_feedback || "",
            boxes: ai?.boxes || [],
            originalSize: {
                width: ai?.image_width || item?.image_predetect?.width || 0,
                height: ai?.image_height || item?.image_predetect?.height || 0
            }
        };
    });
}

export const calculateVPD = (temp, hum) => {
    if (!temp || !hum) return 0;
    const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    const avp = (hum / 100) * svp;
    return (svp - avp).toFixed(2);
};

export const calculateDewPoint = (temp, hum) => {
    if (!temp || !hum) return 0;
    return (temp - (100 - hum) / 5).toFixed(1);
};

export const calculateHeatIndex = (temp, hum) => {
    if (!temp || !hum) return 0;
    const T = temp;
    const R = hum;
    const c1 = -8.78469475556;
    const c2 = 1.61139411;
    const c3 = 2.33854883889;
    const c4 = -0.14611605;
    const c5 = -0.012308094;
    const c6 = -0.0164248277778;
    const c7 = 0.002211732;
    const c8 = 0.00072546;
    const c9 = -0.000003582;

    if (T < 27) return T.toFixed(1);

    const HI =
        c1 +
        c2 * T +
        c3 * R +
        c4 * T * R +
        c5 * T * T +
        c6 * R * R +
        c7 * T * T * R +
        c8 * T * R * R +
        c9 * T * T * R * R;
    return HI.toFixed(1);
};
