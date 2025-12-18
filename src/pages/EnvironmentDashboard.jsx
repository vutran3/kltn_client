import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectDevice } from "../redux/selector";
import { getDataApi } from "../utils/fetch";

import NpkCard from "../components/env/NpkCard";
import AIAdvisor from "../components/env/AIAdvisor";
import { CROP_PRESETS, AI_NOTES_VN, AI_NOTES_GROUP_MODES, AI_NOTES_GROUP_EXCLUSIVE_PAIRS } from "../constants";
import NotePicker from "../components/env/NotePicker";

const POLL_MS = Number(import.meta.env?.POLL_API_MS || 10000);
const HISTORY_LIMIT = 200;

const fetchLatest = async (deviceId, limit = 50) => {
    const res = await getDataApi(
        `/readings?deviceId=${deviceId}`,
        { limit: String(limit), sort: "-1" },
        { cache: "no-store" }
    );
    return res?.data?.data?.rows ?? [];
};

export default function EnvironmentDashboard() {
    const { selectedId } = useSelector(selectDevice);

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedCrop, setSelectedCrop] = useState("Cải xanh");
    const [selectedNotes, setSelectedNotes] = useState([]);

    // tải dữ liệu
    const loadRows = async (did) => {
        if (!did) return;
        setLoading(true);
        try {
            const res = await fetchLatest(did, HISTORY_LIMIT);
            setRows([...res].reverse());
        } catch (e) {
            console.error(e?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let timer;
        if (selectedId) {
            loadRows(selectedId);
            timer = setInterval(() => loadRows(selectedId), POLL_MS);
        }
        return () => timer && clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId]);

    // KPI nhanh
    const stats = useMemo(() => {
        const safe = (v) => (v === null || v === undefined ? null : Number(v));
        const pick = (k) => rows.map((r) => ({ t: r.t, v: safe(r[k]) })).filter((x) => x.v !== null);
        const calc = (arr) => {
            if (!arr.length) return { min: null, max: null, avg: null, last: null };
            const vs = arr.map((x) => x.v);
            const sum = vs.reduce((a, b) => a + b, 0);
            return { min: Math.min(...vs), max: Math.max(...vs), avg: sum / vs.length, last: arr[arr.length - 1].v };
        };
        return {
            ph: calc(pick("ph")),
            soilMoist: calc(pick("soil_humidity")),
            soilTemp: calc(pick("soil_temperature")),
            airTemp: calc(pick("air_temperature")),
            airHumid: calc(pick("air_humidity")),
            light: calc(pick("light_raw")),
            n: calc(pick("nitrogen")),
            p: calc(pick("phosphorus")),
            k: calc(pick("potassium"))
        };
    }, [rows]);

    // bands/npk theo giống
    const { bands, npkTargets } = CROP_PRESETS[selectedCrop] || {};

    return (
        <div className="p-6 lg:p-6 space-y-6 bg-white rounded-lg">
            {/* Header + chọn giống */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Kiểm tra chất lượng môi trường</h1>
                    <p className="text-sm text-slate-500">
                        Chọn giống rau họ cải để xem ngưỡng tối ưu & nhận tư vấn AI theo bối cảnh Việt Nam
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <label className="text-sm text-slate-600">Giống:</label>
                    <select
                        className="border border-gray-300 rounded px-3 py-2"
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                    >
                        {Object.keys(CROP_PRESETS).map((crop) => (
                            <option key={crop} value={crop}>
                                {crop}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <NpkCard rows={rows} targets={npkTargets} />

            <NotePicker
                groups={AI_NOTES_VN}
                value={selectedNotes}
                onChange={setSelectedNotes}
                groupModes={AI_NOTES_GROUP_MODES}
                groupExclusivePairs={AI_NOTES_GROUP_EXCLUSIVE_PAIRS}
            />

            {/* AI Advisor */}
            <AIAdvisor
                deviceId={selectedId}
                rows={rows}
                bands={bands}
                npkTargets={npkTargets}
                loadingSource={loading}
                selectedCrop={selectedCrop}
                selectedNotes={selectedNotes}
            />
        </div>
    );
}
