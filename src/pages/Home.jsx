import React, { useState, useEffect } from "react";
import { Droplets } from "lucide-react";
import CalendarWeather from "../components/home/CalendarWeather";
import Notification from "../components/home/Notification";
import MetricCard from "../components/home/MetricCard";
import { getDataApi } from "../utils/fetch";
import { fmtTs, toMs } from "../utils";
import { useDispatch, useSelector } from "react-redux";
import { fetchData } from "../redux/thunks/productThunk";
import { countSelector } from "../redux/selector";
import { decrease, increase } from "../redux/slices/countSlice";

const DEFAULT_DEVICE_ID = "esp32s3-01";
const HISTORY_LIMIT = 100;
const POLL_MS = Number(import.meta.env?.POLL_API_MS || 10000);

const fetchLast = async (deviceId) => {
    const res = await getDataApi(`/readings/last?deviceId=${deviceId}`, null, { cache: "no-store" });
    return res?.data?.data?.last || null;
};

const fetchHistory = async ({ deviceId, limit, fromMs, toMs, sort = -1 }) => {
    let params = null;
    if (fromMs && toMs) {
        params = {
            from: String(fromMs),
            to: String(toMs),
            sort: "1"
        };
    } else {
        params = {
            limit: String(limit ?? HISTORY_LIMIT),
            sort: String(sort)
        };
    }

    const res = await getDataApi(`/readings?deviceId=${deviceId}`, params, {
        cache: "no-store"
    });

    return res?.data?.data?.rows ?? [];
};

const Home = () => {
    const dispatch = useDispatch();
    const { value } = useSelector(countSelector);
    const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);

    const [last, setLast] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");

    const loadData = async (did, { useFilter = false } = {}) => {
        setErr(null);
        setLoading(true);
        try {
            const [lastRow, rows] = await Promise.all([
                fetchLast(did),
                useFilter && (filterFrom || filterTo)
                    ? fetchHistory({
                          deviceId: did,
                          fromMs: toMs(filterFrom) ?? Date.now() - 24 * 3600 * 1000,
                          toMs: toMs(filterTo) ?? Date.now(),
                          sort: 1
                      })
                    : fetchHistory({ deviceId: did, limit: HISTORY_LIMIT, sort: -1 })
            ]);

            setLast(lastRow);
            setHistory(rows);
        } catch (e) {
            setErr(e?.message || "Fetch error");
        } finally {
            setLoading(false);
        }
    };

    // Test redux
    useEffect(() => {
        loadData(deviceId);
        const id = setInterval(() => loadData(deviceId), POLL_MS);
        return () => clearInterval(id);
    }, [deviceId]);

    useEffect(() => {
        dispatch(fetchData());
    });

    const onDecrease = () => {
        dispatch(decrease());
    };
    const onIncrease = () => {
        dispatch(increase());
    };

    const notifications = [];

    const warnSoilHumidity = typeof last?.soilHumidity === "number" ? last.soilHumidity < 30 : false;
    const warnAirTemp = typeof last?.airTemperature === "number" ? last.airTemperature > 35 : false;
    const warnPH = typeof last?.ph === "number" ? last.ph < 5.5 || last.ph > 7.5 : false;

    return (
        <div className="flex gap-1">
            {/* Current Metrics */}
            <div className="flex-1 bg-white p-6 rounded-sm shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Device ID:</label>
                        <input
                            value={deviceId}
                            onChange={(e) => setDeviceId(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
                            placeholder="esp32s3-01"
                        />
                    </div>

                    <div className="flex gap-2 items-center">
                        <div
                            onClick={onDecrease}
                            className="w-8 h-8 rounded-lg bg-amber-100 cursor-pointer flex justify-center items-center"
                        >
                            -
                        </div>
                        <span className="font-semibold">{value}</span>
                        <div
                            onClick={onIncrease}
                            className="w-8 h-8 rounded-lg bg-amber-100 cursor-pointer flex justify-center items-center"
                        >
                            +
                        </div>
                    </div>
                    <div className="text-sm">
                        {loading ? (
                            <span className="text-gray-700">Đang tải...</span>
                        ) : err ? (
                            <span className="text-red-700">Lỗi: {err}</span>
                        ) : last ? (
                            <span className="text-gray-800">
                                Cập nhật: <strong>{fmtTs(last.t)}</strong>
                            </span>
                        ) : (
                            <span className="text-gray-700">Chưa có dữ liệu</span>
                        )}
                    </div>
                </div>

                {/* Hàng 1: Không khí + Mưa/Ánh sáng */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <MetricCard
                        title="NHIỆT ĐỘ KHÔNG KHÍ"
                        value={last?.airTemperature != null ? last.airTemperature.toFixed(1) : "—"}
                        unit="°C"
                        warning={warnAirTemp}
                    />
                    <MetricCard
                        title="ĐỘ ẨM KHÔNG KHÍ"
                        value={last?.airHumidity != null ? last.airHumidity.toFixed(1) : "—"}
                        unit="%"
                    />
                    <MetricCard title="MƯA (RAW)" value={last?.rainRaw ?? "—"} unit="" />
                    <MetricCard title="ÁNH SÁNG (RAW)" value={last?.lightRaw ?? "—"} unit="" />
                </div>

                {/* Hàng 2: Đất + pH */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <MetricCard
                        title="NHIỆT ĐỘ ĐẤT"
                        value={last?.soilTemperature != null ? last.soilTemperature.toFixed(1) : "—"}
                        unit="°C"
                    />
                    <MetricCard
                        title="ĐỘ ẨM ĐẤT"
                        value={last?.soilHumidity != null ? last.soilHumidity.toFixed(1) : "—"}
                        unit="%"
                        warning={warnSoilHumidity}
                    />
                    <MetricCard
                        title="pH"
                        value={last?.ph != null ? Number(last.ph).toFixed(2) : "—"}
                        unit=""
                        warning={warnPH}
                    />
                    <MetricCard
                        title="TÌNH TRẠNG MƯA"
                        value={
                            last?.rainRaw === 1 ? (
                                <span className="inline-flex items-center gap-1">
                                    Có mưa <Droplets className="w-5 h-5" />
                                </span>
                            ) : last?.rainRaw === 0 ? (
                                "Không"
                            ) : (
                                "—"
                            )
                        }
                        unit=""
                        warning={last?.rainRaw === 1}
                    />
                </div>

                {/* Hàng 3: NPK */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <MetricCard
                        title="NITƠ (N)"
                        value={last?.nitrogen != null ? Number(last.nitrogen).toFixed(2) : "—"}
                        unit="ppm"
                    />
                    <MetricCard
                        title="LÂN (P)"
                        value={last?.phosphorus != null ? Number(last.phosphorus).toFixed(2) : "—"}
                        unit="ppm"
                    />
                    <MetricCard
                        title="KALI (K)"
                        value={last?.potassium != null ? Number(last.potassium).toFixed(2) : "—"}
                        unit="ppm"
                    />
                </div>

                {/* History Section */}
                <div className="bg-white rounded-lg p-6">
                    <h2 className="text-xl font-bold text-blue-800 mb-4 text-center">LỊCH SỬ</h2>

                    <div className="flex gap-2 items-center mb-4">
                        <div className="flex gap-2 items-center">
                            <input
                                type="date"
                                value={filterFrom}
                                onChange={(e) => setFilterFrom(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />

                            <input
                                type="date"
                                value={filterTo}
                                onChange={(e) => setFilterTo(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        <div className="flex gap-2 items-center border-l border-gray-200 px-2">
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                onClick={() => loadData(deviceId, { useFilter: true })}
                            >
                                LỌC DỮ LIỆU
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={() => {
                                    setFilterFrom("");
                                    setFilterTo("");
                                    loadData(deviceId);
                                }}
                            >
                                RESET
                            </button>
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                onClick={() => window.print()}
                            >
                                IN BÁO CÁO
                            </button>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto overflow-y-auto max-h-[500px] border border-gray-300">
                        <table className="w-full text-sm">
                            <thead className="bg-blue-600 text-white sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left">THỜI GIAN</th>
                                    <th className="px-3 py-2 text-left">Air temperature (°C)</th>
                                    <th className="px-3 py-2 text-left">Air humidity (%)</th>
                                    <th className="px-3 py-2 text-left">Light</th>
                                    <th className="px-3 py-2 text-left">Rain</th>
                                    <th className="px-3 py-2 text-left">Soil temperature (°C)</th>
                                    <th className="px-3 py-2 text-left">Soil humidity (%)</th>
                                    <th className="px-3 py-2 text-left">N (ppm)</th>
                                    <th className="px-3 py-2 text-left">P (ppm)</th>
                                    <th className="px-3 py-2 text-left">K (ppm)</th>
                                    <th className="px-3 py-2 text-left">PH</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {history.map((row, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="px-3 py-2">{fmtTs(row.t)}</td>
                                        <td className="px-3 py-2">
                                            {row.airTemperature != null ? Number(row.airTemperature).toFixed(1) : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row.airHumidity != null ? Number(row.airHumidity).toFixed(1) : "—"}
                                        </td>
                                        <td className="px-3 py-2">{row.lightRaw ?? "—"}</td>
                                        <td className="px-3 py-2">{row.rainRaw ?? "—"}</td>
                                        <td className="px-3 py-2">
                                            {row.soilTemperature != null ? Number(row.soilTemperature).toFixed(1) : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row.soilHumidity != null ? Number(row.soilHumidity).toFixed(1) : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row.nitrogen != null ? Number(row.nitrogen).toFixed(2) : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row.phosphorus != null ? Number(row.phosphorus).toFixed(2) : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row.potassium != null ? Number(row.potassium).toFixed(2) : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row.ph != null ? Number(row.ph).toFixed(2) : "—"}
                                        </td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="px-3 py-6 text-center text-gray-500">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="flex flex-col gap-4">
                <Notification notifications={notifications} />
                <CalendarWeather />
            </div>
        </div>
    );
};

export default Home;
