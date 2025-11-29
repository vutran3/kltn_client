import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectDevice } from "../redux/selector";
import { getDataApi } from "../utils/fetch";

import HistoryTable from "../components/home/HistoryTable";
import KpiCard from "../components/soil/KpiCard";
import NpkCard from "../components/soil/NpkCard";
import AIAdvisor from "../components/soil/AIAdvisor";
import { CROP_PRESETS, AI_NOTES_VN, AI_NOTES_GROUP_MODES, AI_NOTES_GROUP_EXCLUSIVE_PAIRS } from "../constants";
import NotePicker from "../components/soil/NotePicker";

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

export default function SoilEnvironmentDashboard() {
    const { selectedId } = useSelector(selectDevice);

    const [rows, setRows] = useState([]);
    console.log(rows);
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
        <div className="p-6 lg:p-6 space-y-6 bg-white">
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

            {/* KPI */}
            {/* <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <KpiCard title="pH" value={stats.ph.last} unit="" band={bands.ph} />
                <KpiCard title="Độ ẩm đất" value={stats.soilMoist.last} unit="%" band={bands.soilMoist} />
                <KpiCard title="Nhiệt độ đất" value={stats.soilTemp.last} unit="°C" band={bands.soilTemp} />
                <KpiCard title="Nhiệt độ KK" value={stats.airTemp.last} unit="°C" band={bands.airTemp} />
                <KpiCard title="Độ ẩm KK" value={stats.airHumid.last} unit="%" band={bands.airHumid} />
                <KpiCard title="Ánh sáng" value={stats.light.last} unit="lux" band={bands.light} />
            </div> */}

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

            {/* Lịch sử */}
            <div className="border rounded-xl p-4">
                <HistoryTable />
            </div>
        </div>
    );
}
