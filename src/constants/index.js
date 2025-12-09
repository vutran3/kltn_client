export const MAPPING_CRUCIFEROUS_PLANTS = {
    BOK_CHOY: "Cải Thìa",
    CABBAGE: "Bắp Cải",
    BROCCOLI: "Bông cải xanh",
    CAULIFLOWER: "Bông cải trắng",
    MUSTARD_GREENS: "Cải bẹ xanh",
    NAPA_CABBAGE: "Cải Thảo",
    CROWN_DAISY_GREENS: "Cải cúc",
    CHOY_SUM: "Cải ngọt",
    PAK_CHOI: "Cải bẹ trắng"
};

export const CRUCIFEROUS_PLANTS = Object.keys(MAPPING_CRUCIFEROUS_PLANTS);

export const RULES = {
    "Cải Thìa": {
        temperature: [15, 25],
        rh: [75, 85],
        soil: [60, 80],
        ph: [5.5, 6.5],
        n: [80, 150],
        p: [30, 60],
        k: [100, 180],
        soilT: [10, 30]
    },
    "Bắp Cải": {
        temperature: [15, 20],
        rh: [80, 90],
        soil: [70, 85],
        ph: [5.6, 6.5],
        n: [80, 150],
        p: [30, 60],
        k: [100, 180],
        soilT: [10, 30]
    },
    "Bông cải xanh": {
        temperature: [11, 24],
        rh: [70, 80],
        soil: [60, 80],
        ph: [5.5, 7.0],
        n: [80, 150],
        p: [30, 60],
        k: [100, 180],
        soilT: [10, 29]
    },
    "Bông cải trắng": {
        temperature: [11, 24],
        rh: [70, 80],
        soil: [75, 85],
        ph: [6.0, 7.0],
        n: [80, 150],
        p: [30, 60],
        k: [100, 180],
        soilT: [10, 29]
    },
    "Cải bẹ xanh": {
        temperature: [18, 25],
        rh: [75, 85],
        soil: [70, 80],
        ph: [6.0, 6.8],
        n: [80, 150],
        p: [30, 60],
        k: [100, 180],
        soilT: [10, 30]
    },
    "Cải Thảo": {
        temperature: [18, 22],
        rh: [85, 90],
        soil: [70, 80],
        ph: [6.0, 6.8],
        n: [80, 150],
        p: [30, 60],
        k: [100, 180],
        soilT: [10, 30]
    },
    "Cải cúc": {
        temperature: [15, 25],
        rh: [70, 80],
        soil: [60, 70],
        ph: [6.0, 6.8],
        n: [80, 150],
        p: [30, 60],
        k: [100, 180],
        soilT: [10, 25]
    }
};

export const CROP_PRESETS = {
    "Cải xanh": {
        bands: {
            ph: { min: 6.0, max: 7.5 },
            soilMoist: { min: 65, max: 80 },
            soilTemp: { min: 20, max: 28 },
            airTemp: { min: 22, max: 30 },
            airHumid: { min: 65, max: 85 },
            light: { min: 2500, max: 22000 }
        },
        npkTargets: { n: { low: 350, high: 800 }, p: { low: 250, high: 600 }, k: { low: 250, high: 700 } }
    },
    "Cải ngọt": {
        bands: {
            ph: { min: 6.0, max: 7.0 },
            soilMoist: { min: 60, max: 75 },
            soilTemp: { min: 20, max: 27 },
            airTemp: { min: 20, max: 29 },
            airHumid: { min: 60, max: 80 },
            light: { min: 2000, max: 20000 }
        },
        npkTargets: { n: { low: 300, high: 700 }, p: { low: 200, high: 500 }, k: { low: 200, high: 600 } }
    },
    "Cải thìa": {
        bands: {
            ph: { min: 6.2, max: 7.4 },
            soilMoist: { min: 65, max: 80 },
            soilTemp: { min: 21, max: 27 },
            airTemp: { min: 22, max: 30 },
            airHumid: { min: 65, max: 85 },
            light: { min: 3000, max: 23000 }
        },
        npkTargets: { n: { low: 350, high: 750 }, p: { low: 250, high: 600 }, k: { low: 250, high: 700 } }
    },
    "Cải xoăn": {
        bands: {
            ph: { min: 6.0, max: 7.2 },
            soilMoist: { min: 60, max: 75 },
            soilTemp: { min: 18, max: 25 },
            airTemp: { min: 18, max: 26 },
            airHumid: { min: 60, max: 80 },
            light: { min: 3000, max: 25000 }
        },
        npkTargets: { n: { low: 300, high: 800 }, p: { low: 200, high: 500 }, k: { low: 200, high: 600 } }
    },
    "Cải bó xôi": {
        bands: {
            ph: { min: 6.2, max: 7.5 },
            soilMoist: { min: 65, max: 80 },
            soilTemp: { min: 18, max: 24 },
            airTemp: { min: 18, max: 25 },
            airHumid: { min: 60, max: 80 },
            light: { min: 3000, max: 22000 }
        },
        npkTargets: { n: { low: 350, high: 850 }, p: { low: 250, high: 600 }, k: { low: 250, high: 700 } }
    },
    "Cải cúc": {
        bands: {
            ph: { min: 6.0, max: 7.0 },
            soilMoist: { min: 70, max: 85 },
            soilTemp: { min: 18, max: 25 },
            airTemp: { min: 18, max: 27 },
            airHumid: { min: 65, max: 85 },
            light: { min: 2500, max: 22000 }
        },
        npkTargets: { n: { low: 300, high: 700 }, p: { low: 200, high: 600 }, k: { low: 250, high: 700 } }
    },
    "Cải bẹ trắng": {
        bands: {
            ph: { min: 6.0, max: 7.5 },
            soilMoist: { min: 65, max: 80 },
            soilTemp: { min: 20, max: 28 },
            airTemp: { min: 22, max: 30 },
            airHumid: { min: 65, max: 85 },
            light: { min: 2500, max: 22000 }
        },
        npkTargets: { n: { low: 350, high: 800 }, p: { low: 250, high: 600 }, k: { low: 250, high: 700 } }
    },
    "Cải thảo": {
        bands: {
            ph: { min: 6.0, max: 7.2 },
            soilMoist: { min: 70, max: 85 },
            soilTemp: { min: 16, max: 24 },
            airTemp: { min: 18, max: 25 },
            airHumid: { min: 65, max: 85 },
            light: { min: 3000, max: 25000 }
        },
        npkTargets: { n: { low: 400, high: 900 }, p: { low: 250, high: 600 }, k: { low: 300, high: 800 } }
    }
};

export const AI_NOTES_VN = {
    "Vùng địa lý": [
        "Miền Bắc (Đồng bằng sông Hồng)",
        "Miền Trung (Duyên hải khô nóng)",
        "Miền Trung (Tây Nguyên, đất bazan)",
        "Miền Nam (Đông Nam Bộ, mưa theo mùa)",
        "Miền Nam (Đồng bằng sông Cửu Long, nhiễm mặn nhẹ)"
    ],
    "Mùa vụ / Thời tiết": [
        "Mùa mưa miền Nam (tháng 5–10)",
        "Mùa khô miền Nam (tháng 11–4)",
        "Mùa nồm ẩm miền Bắc (tháng 2–4)",
        "Mùa hanh khô miền Bắc (tháng 11–1)",
        "Khí hậu khô nóng miền Trung (thiếu mưa)",
        "Nhiệt độ chênh lệch ngày đêm cao"
    ],
    "Loại đất": [
        "Đất phù sa sông Hồng",
        "Đất phù sa Cửu Long (nguy cơ mặn/phèn)",
        "Đất cát ven biển (thoát nước nhanh, nghèo dinh dưỡng)",
        "Đất bazan Tây Nguyên (giàu K)",
        "Đất thịt nhẹ (giữ ẩm trung bình)",
        "Đất sét nặng (dễ úng, khó thoát nước)"
    ],
    "Hình thức canh tác": [
        "Trồng ngoài trời",
        "Trồng trong nhà lưới",
        "Có hệ thống tưới nhỏ giọt",
        "Không có mái che, dễ ngập úng",
        "Sử dụng phân hữu cơ sinh học",
        "Tiền sử bón phân P,K cao"
    ],
    "Nguồn nước / Rủi ro": [
        "Nguồn nước nhiễm mặn nhẹ",
        "Nguồn nước phèn",
        "Khu vực ngập úng sau mưa lớn",
        "Gió mạnh, ẩm không khí cao kéo dài"
    ]
};

export const AI_NOTES_GROUP_MODES = {
    "Vùng địa lý": "single",
    "Mùa vụ / Thời tiết": "single",
    "Loại đất": "multi",
    "Hình thức canh tác": "multi",
    "Nguồn nước / Rủi ro": "multi"
};

export const AI_NOTES_GROUP_EXCLUSIVE_PAIRS = {
    "Hình thức canh tác": [["Trồng ngoài trời", "Trồng trong nhà lưới"]]
};

export const CONTEXT_PRESETS = {
    "Miền Bắc (mùa nồm ẩm)": [
        "Miền Bắc (Đồng bằng sông Hồng)",
        "Mùa nồm ẩm miền Bắc (tháng 2–4)",
        "Đất phù sa sông Hồng",
        "Độ ẩm cao, nhiệt độ dao động 18–25°C"
    ],
    "Miền Trung (mùa khô)": [
        "Miền Trung (Duyên hải khô nóng)",
        "Khí hậu khô nóng miền Trung (thiếu mưa)",
        "Đất cát ven biển (thoát nước nhanh, nghèo dinh dưỡng)"
    ],
    "Miền Nam (mùa mưa)": [
        "Miền Nam (Đông Nam Bộ, mưa theo mùa)",
        "Mùa mưa miền Nam (tháng 5–10)",
        "Nguy cơ ngập úng và ẩm cao"
    ],
    "Miền Nam (mùa khô)": [
        "Miền Nam (Đông Nam Bộ, mưa theo mùa)",
        "Mùa khô miền Nam (tháng 11–4)",
        "Độ ẩm thấp, cần tăng tưới"
    ]
};

export function flattenNotesGroups(groups) {
    return Object.values(groups).reduce((acc, arr) => acc.concat(arr), []);
}
