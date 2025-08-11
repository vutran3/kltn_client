import React, { useState, useEffect } from "react";
import { Calendar, Bell, User, Search, Filter, FileText, AlertTriangle, Droplets } from "lucide-react";

const API_BASE = "http://192.168.0.101:8000/api";
const DEFAULT_DEVICE_ID = "esp32s3-01";
const HISTORY_LIMIT = 100;
const POLL_MS = 5000;

const fmtTs = (ts) => {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    return `${hh}:${mm} (${dd}/${mo})`;
};

const MetricCard = ({ title, value, unit, warning, large = false }) => (
    <div
        className={`bg-white rounded-lg p-4 shadow-sm border-2 ${warning ? "border-yellow-400" : "border-gray-200"} ${
            large ? "col-span-2" : ""
        }`}
    >
        <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">{title}</h3>
            <div className="flex items-center justify-center space-x-2">
                <span className={`text-2xl font-bold ${warning ? "text-red-600" : "text-gray-800"}`}>
                    {value} {unit}
                </span>
                {warning && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
            </div>
        </div>
    </div>
);

const Home = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);

    const [last, setLast] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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

    const weatherForecast = [
        { date: "T6, 13/6", temp: "31.02°C", humidity: "70.5%", rain: "2.53mm", icon: "☀️" },
        { date: "T7, 14/6", temp: "29.37°C", humidity: "75%", rain: "1.2mm", icon: "🌤️" }
    ];

    const getCurrentDate = () => {
        const now = new Date();
        const months = [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12"
        ];
        return `${months[now.getMonth()]}, ${now.getFullYear()}`;
    };

    const warnWet = last?.wetPct != null ? last.wetPct < 30 : false;
    const warnLight = last?.lightPct != null ? last.lightPct > 90 : false;
    const warnVolt = last?.lightVolt != null ? last.lightVolt > 3.3 : false;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-blue-800 text-white p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <span className="text-blue-800 font-bold text-sm">IUH</span>
                        </div>
                        <h1 className="text-xl font-bold">HỆ THỐNG GIÁM SÁT CHẤT LƯỢNG NÔNG SẢN</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-lg font-mono">{currentTime.toLocaleTimeString("vi-VN")}</span>
                        <div className="relative">
                            <Bell className="w-6 h-6" />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {notifications.length}
                            </span>
                        </div>
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5" />
                        </div>
                        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium">
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-16 bg-white shadow-sm">
                    <div className="p-4 space-y-6">
                        <button className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </button>
                        <nav className="space-y-4">
                            {[Calendar, Search, Filter, User].map((Icon, index) => (
                                <button
                                    key={index}
                                    className="w-8 h-8 text-gray-600 hover:text-blue-600 flex items-center justify-center"
                                >
                                    <Icon className="w-5 h-5" />
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 p-6 space-y-6">
                    <div className="grid grid-cols-4 gap-6">
                        {/* Current Metrics */}
                        <div className="col-span-3 bg-white p-6 rounded-xl shadow-xl">
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
                        <div className="space-y-6">
                            {/* Notifications */}
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">THÔNG BÁO</h3>
                                <div className="space-y-3">
                                    {notifications.length === 0 ? (
                                        <div className="text-sm text-gray-600 text-center">Không có thông báo</div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`p-3 rounded-lg text-sm ${
                                                    n.type === "warning"
                                                        ? "bg-red-100 border-l-4 border-red-500"
                                                        : "bg-blue-100 border-l-4 border-blue-500"
                                                }`}
                                            >
                                                <p className="font-medium">{n.message}</p>
                                                <p className="text-gray-600 text-xs mt-1">{n.time}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Calendar */}
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">LỊCH</h3>
                                <div className="text-center mb-4">
                                    <h4 className="font-medium">{getCurrentDate()}</h4>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-xs">
                                    {["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"].map((day) => (
                                        <div key={day} className="text-center p-1 font-medium text-gray-600">
                                            {day}
                                        </div>
                                    ))}
                                    {Array.from({ length: 35 }, (_, i) => {
                                        const day = i - 6;
                                        const isToday = day === new Date().getDate();
                                        return (
                                            <div
                                                key={i}
                                                className={`text-center p-1 ${
                                                    day > 0 && day <= 30 ? "text-gray-800" : "text-gray-300"
                                                } ${isToday ? "bg-blue-600 text-white rounded-full" : ""}`}
                                            >
                                                {day > 0 && day <= 30 ? day : ""}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Weather Forecast (mock) */}
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">DỰ BÁO THỜI TIẾT</h3>
                                <div className="space-y-4">
                                    {weatherForecast.map((forecast, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{forecast.date}</p>
                                                    <p className="text-red-600 font-bold">{forecast.temp}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-green-600 flex items-center">
                                                        <Droplets className="w-4 h-4 mr-1" />
                                                        {forecast.humidity}
                                                    </p>
                                                    <p className="text-blue-600 text-sm">Mưa nhẹ</p>
                                                    <p className="text-blue-600 flex items-center">
                                                        <span className="mr-1">🌧️</span>
                                                        {forecast.rain}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* /Right Sidebar */}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home;
