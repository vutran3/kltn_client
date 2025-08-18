import React, { useState, useEffect } from "react";
import { Droplets } from "lucide-react";
import CalendarWeather from "../components/home/CalendarWeather";
import Notification from "../components/home/Notification";
import MetricCard from "../components/home/MetricCard";

const { POLL_API_MS } = import.meta.env;

const API_BASE = "http://192.168.0.101:8000/api";
const DEFAULT_DEVICE_ID = "esp32s3-01";
const HISTORY_LIMIT = 100;
const POLL_MS = 10000;

const fmtTs = (ts) => {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    return `${hh}:${mm} (${dd}/${mo})`;
};

const Home = () => {
    const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);

    const [last, setLast] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");

    const fetchData = async (did) => {
        setErr(null);
        setLoading(true);
        try {
            const r1 = await fetch(`${API_BASE}/v1/readings/last?deviceId=${encodeURIComponent(did)}`);
            const j1 = await r1.json();
            setLast(j1?.data?.last ?? null);

            const r2 = await fetch(
                `${API_BASE}/v1/readings?deviceId=${encodeURIComponent(did)}&limit=${HISTORY_LIMIT}`
            );
            const j2 = await r2.json();
            setHistory(j2?.data?.rows ?? []);
        } catch (e) {
            setErr(e?.message || "Fetch error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(deviceId);
        const id = setInterval(() => fetchData(deviceId), POLL_MS);
        return () => clearInterval(id);
    }, [deviceId]);

    const notifications = []
        .concat(
            last?.wetPct != null && last.wetPct < 30
                ? {
                      id: 1,
                      type: "warning",
                      message: `Độ ướt thấp: ${last.wetPct}% (cảnh báo < 30%)`,
                      time: new Date().toLocaleTimeString("vi-VN")
                  }
                : null
        )
        .concat(
            last?.raining === 1
                ? {
                      id: 2,
                      type: "info",
                      message: `Đang mưa tại cảm biến (raining = 1)`,
                      time: new Date().toLocaleTimeString("vi-VN")
                  }
                : null
        )
        .filter(Boolean);

    const warnWet = last?.wetPct != null ? last.wetPct < 30 : false;
    const warnLight = last?.lightPct != null ? last.lightPct > 90 : false;
    const warnVolt = last?.lightVolt != null ? last.lightVolt > 3.3 : false;

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
                    <div className="text-sm">
                        {loading ? (
                            <span className="text-gray-700">Đang tải...</span>
                        ) : err ? (
                            <span className="text-red-700">Lỗi: {err}</span>
                        ) : last ? (
                            <span className="text-gray-800">
                                Cập nhật: <strong>{fmtTs(last.ts)}</strong>
                            </span>
                        ) : (
                            <span className="text-gray-700">Chưa có dữ liệu</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <MetricCard title="MƯA (RAW)" value={last?.rainRaw ?? "—"} unit="" />
                    <MetricCard
                        title="ĐỘ ƯỚT BỀ MẶT"
                        value={last?.wetPct != null ? last.wetPct.toFixed(1) : "—"}
                        unit="%"
                        warning={warnWet}
                    />
                    <MetricCard
                        title="ĐANG MƯA"
                        value={
                            last?.raining === 1 ? (
                                <span className="inline-flex items-center gap-1">
                                    Có mưa <Droplets className="w-5 h-5" />
                                </span>
                            ) : last?.raining === 0 ? (
                                "Không"
                            ) : (
                                "—"
                            )
                        }
                        unit=""
                        warning={last?.raining === 1}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <MetricCard title="ÁNH SÁNG (RAW)" value={last?.lightRaw ?? "—"} unit="" />
                    <MetricCard
                        title="ÁNH SÁNG (%)"
                        value={last?.lightPct != null ? last.lightPct.toFixed(1) : "—"}
                        unit="%"
                        warning={warnLight}
                    />
                    <MetricCard
                        title="ĐIỆN ÁP ÁNH SÁNG"
                        value={last?.lightVolt != null ? last.lightVolt.toFixed(2) : "—"}
                        unit="V"
                        warning={warnVolt}
                    />
                </div>

                {/* History Section */}
                <div className="bg-white rounded-lg p-6">
                    <h2 className="text-xl font-bold text-blue-800 mb-4 text-center">LỊCH SỬ</h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Từ:</label>
                            <input
                                type="date"
                                value={filterFrom}
                                onChange={(e) => setFilterFrom(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Đến:</label>
                            <input
                                type="date"
                                value={filterTo}
                                onChange={(e) => setFilterTo(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-2 mb-4">
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => fetchData(deviceId)}
                        >
                            LỌC DỮ LIỆU
                        </button>
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            onClick={() => {
                                setFilterFrom("");
                                setFilterTo("");
                                fetchData(deviceId);
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

                    {/* Data Table */}
                    <div className="overflow-x-auto max-h-64">
                        <table className="w-full text-sm">
                            <thead className="bg-blue-600 text-white sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left">THỜI GIAN</th>
                                    <th className="px-3 py-2 text-left">rainRaw</th>
                                    <th className="px-3 py-2 text-left">wetPct (%)</th>
                                    <th className="px-3 py-2 text-left">raining</th>
                                    <th className="px-3 py-2 text-left">lightRaw</th>
                                    <th className="px-3 py-2 text-left">lightPct (%)</th>
                                    <th className="px-3 py-2 text-left">lightVolt (V)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {history.map((row, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="px-3 py-2">{fmtTs(row.ts)}</td>
                                        <td className="px-3 py-2">{row.rainRaw ?? "—"}</td>
                                        <td className="px-3 py-2">
                                            {row.wetPct != null ? Number(row.wetPct).toFixed(1) : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row.raining === 1 ? "Có" : row.raining === 0 ? "Không" : "—"}
                                        </td>
                                        <td className="px-3 py-2">{row.lightRaw ?? "—"}</td>
                                        <td className="px-3 py-2">
                                            {row.lightPct != null ? Number(row.lightPct).toFixed(1) : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row.lightVolt != null ? Number(row.lightVolt).toFixed(2) : "—"}
                                        </td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
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
            <div>
                <Notification notifications={notifications} />
                <CalendarWeather />
            </div>
        </div>
    );
};

export default Home;
