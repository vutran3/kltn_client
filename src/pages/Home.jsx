import React, { useState, useEffect } from "react";
import CalendarWeather from "../components/home/CalendarWeather";
import Notification from "../components/home/Notification";
import MetricCard from "../components/home/MetricCard";
import { getDataApi } from "../utils/fetch";
<<<<<<< Updated upstream
import { fmtTs, toMs } from "../utils";
import { useDispatch, useSelector } from "react-redux";
import { fetchData } from "../redux/thunks/productThunk";
import { countSelector } from "../redux/selector";
import { decrease, increase } from "../redux/slices/countSlice";
=======
import { fmtTs } from "../utils";
import HistoryTable from "../components/home/HistoryTable";
>>>>>>> Stashed changes

const DEFAULT_DEVICE_ID = "esp32s3-01";
const POLL_MS = Number(import.meta.env?.POLL_API_MS || 10000);

const fetchLast = async (deviceId) => {
    const res = await getDataApi(`/readings/last?deviceId=${deviceId}`, null, { cache: "no-store" });
    return res?.data?.data?.last || null;
};

const Home = () => {
<<<<<<< Updated upstream
    const dispatch = useDispatch();
    const { value } = useSelector(countSelector);
=======
>>>>>>> Stashed changes
    const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);

    const [last, setLast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const loadData = async (did, { useFilter = false } = {}) => {
        setErr(null);
        setLoading(true);
        try {
            const lastRow = await fetchLast(did);
            setLast(lastRow);
        } catch (e) {
            setErr(e?.message || "Fetch error");
        } finally {
            setLoading(false);
        }
    };

<<<<<<< Updated upstream
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

=======
>>>>>>> Stashed changes
    const notifications = [];

    const warnSoilHumidity = typeof last?.soilHumidity === "number" ? last.soilHumidity < 30 : false;
    const warnAirTemp = typeof last?.airTemperature === "number" ? last.airTemperature > 35 : false;
    const warnPH = typeof last?.ph === "number" ? last.ph < 5.5 || last.ph > 7.5 : false;

    useEffect(() => {
        loadData(deviceId);
        const id = setInterval(() => loadData(deviceId), POLL_MS);
        return () => clearInterval(id);
    }, [deviceId]);

    return (
        <div className="flex gap-1 w-full">
            {/* Current Metrics */}
            <div className=" bg-white p-6 rounded-sm shadow-xl flex-1">
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

<<<<<<< Updated upstream
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
=======
>>>>>>> Stashed changes
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                    <MetricCard title="ÁNH SÁNG (RAW)" value={last?.lightRaw ?? "—"} unit="" />
                </div>

                {/* Hàng 2: Đất + pH */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

                <HistoryTable />
            </div>

            {/* Right Sidebar */}
            <div className="flex flex-col gap-4 min-w-84">
                <Notification notifications={notifications} />
                <CalendarWeather />
            </div>
        </div>
    );
};

export default Home;
