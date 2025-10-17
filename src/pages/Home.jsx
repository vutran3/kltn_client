import React, { useState, useEffect, useMemo } from "react";
import CalendarWeather from "../components/home/CalendarWeather";
import Notification from "../components/home/Notification";
import MetricCard from "../components/home/MetricCard";
import { getDataApi } from "../utils/fetch";
import { fmtTs } from "../utils";
import HistoryTable from "../components/home/HistoryTable";
import { getProductByDeviceId } from "../redux/thunks/productThunk";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth, selectDevice } from "../redux/selector";
import { RULES } from "../constants";

const POLL_MS = Number(import.meta.env?.POLL_API_MS || 10000);

const inRange = (val, [min, max]) =>
    typeof val === "number" && Number.isFinite(val) && min != null && max != null ? val >= min && val <= max : true;

const Home = () => {
    const dispatch = useDispatch();
    const { items: myDevices, selectedId, isLoading: loadingDevices } = useSelector(selectDevice);
    const [last, setLast] = useState(null);
    const data = useSelector(selectAuth);
    const [product, setProduct] = useState(null);
    const cropType = useMemo(() => product?.name, [product]);
    const rule = useMemo(() => RULES[cropType], [cropType]);

    const fetchLast = async () => {
        const res = await getDataApi(`/readings/last?deviceId=${selectedId}`, null, { cache: "no-store" });
        return res?.data?.data?.last || null;
    };

    const fetchProductByDevice = async () => {
        const res = await dispatch(getProductByDeviceId(selectedId)).unwrap();
        return res ?? null;
    };

    const loadData = async (did) => {
        const [lastRow, prod] = await Promise.all([fetchLast(did), fetchProductByDevice(did)]);
        setLast(lastRow);
        setProduct(prod);
    };

    const notifications = [];

    const warn = {
        airTemp: false,
        airHumidity: false,
        soilHumidity: false,
        soilTemperature: false,
        ph: false,
        n: false,
        p: false,
        k: false
    };

    if (last && rule) {
        // Nhiệt độ không khí
        if (!inRange(last.airTemperature, rule.temperature)) {
            warn.airTemp = true;
            notifications.push({
                id: "airTemp",
                type: "warning",
                message: `Nhiệt độ không khí ${last.airTemperature?.toFixed?.(1)}°C vượt ngưỡng (${
                    rule.temperature[0]
                }–${rule.temperature[1]}°C) cho ${product?.name || cropType}.`,
                time: fmtTs(last.t)
            });
        }
        // RH
        if (!inRange(last.airHumidity, rule.rh)) {
            warn.airHumidity = true;
            notifications.push({
                id: "airHumidity",
                type: "warning",
                message: `Độ ẩm không khí ${last.airHumidity?.toFixed?.(1)}% vượt ngưỡng (${rule.rh[0]}–${
                    rule.rh[1]
                }%).`,
                time: fmtTs(last.t)
            });
        }
        // Soil moisture
        if (!inRange(last.soilHumidity, rule.soil)) {
            warn.soilHumidity = true;
            notifications.push({
                id: "soilHumidity",
                type: "warning",
                message: `Độ ẩm đất ${last.soilHumidity?.toFixed?.(1)}% vượt ngưỡng (${rule.soil[0]}–${
                    rule.soil[1]
                }%).`,
                time: fmtTs(last.t)
            });
        }
        // Soil Temperature
        if (!inRange(last.soilTemperature, rule.soilT)) {
            warn.soilTemperature = true;
            notifications.push({
                id: "soilTemperature",
                type: "warning",
                message: `Nhiệt độ đất ${last.soilTemperature?.toFixed?.(1)}°C vượt ngưỡng (${rule.soilT[0]}–${
                    rule.soilT[1]
                }°C).`,
                time: fmtTs(last.t)
            });
        }
        // pH
        if (!inRange(last.ph, rule.ph)) {
            warn.ph = true;
            notifications.push({
                id: "ph",
                type: "warning",
                message: `pH ${Number(last.ph).toFixed(2)} vượt ngưỡng (${rule.ph[0]}–${rule.ph[1]}).`,
                time: fmtTs(last.t)
            });
        }
        // NPK
        if (!inRange(last.nitrogen, rule.n)) {
            warn.n = true;
            notifications.push({
                id: "n",
                type: "warning",
                message: `N = ${Number(last.nitrogen).toFixed(2)} mg/kg vượt ngưỡng (${rule.n[0]}–${rule.n[1]}).`,
                time: fmtTs(last.t)
            });
        }
        if (!inRange(last.phosphorus, rule.p)) {
            warn.p = true;
            notifications.push({
                id: "p",
                type: "warning",
                message: `P = ${Number(last.phosphorus).toFixed(2)} mg/kg vượt ngưỡng (${rule.p[0]}–${rule.p[1]}).`,
                time: fmtTs(last.t)
            });
        }
        if (!inRange(last.potassium, rule.k)) {
            warn.k = true;
            notifications.push({
                id: "k",
                type: "warning",
                message: `K = ${Number(last.potassium).toFixed(2)} mg/kg vượt ngưỡng (${rule.k[0]}–${rule.k[1]}).`,
                time: fmtTs(last.t)
            });
        }
    }

    useEffect(() => {
        let timerId = null;
        if (selectedId) {
            loadData(selectedId);
            timerId = setInterval(() => loadData(selectedId), POLL_MS);
        }

        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [selectedId]);

    return (
        <div className="flex gap-1 w-full">
            {/* Current Metrics */}
            <div className=" bg-white p-6 rounded-sm shadow-xl flex-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Thiết bị:</label>

                            <select
                                disabled={loadingDevices}
                                value={selectedId}
                                onChange={(e) => dispatch(setSelectedDeviceId(e.target.value))}
                                className="border border-gray-300 rounded px-3 py-2 text-sm bg-white min-w-[260px]"
                            >
                                {loadingDevices && <option value="">Đang tải...</option>}
                                {!loadingDevices && myDevices?.length === 0 && (
                                    <option value="">— Không có thiết bị —</option>
                                )}
                                {!loadingDevices &&
                                    myDevices?.map((d) => (
                                        <option key={d._id} value={d.device_id}>
                                            {d.device_name} ({d.device_id})
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tên/loại cây đang theo dõi */}
                <div className="mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200">
                        <span className="text-xs text-gray-600">CÂY ĐANG THEO DÕI</span>
                        <span className="text-sm font-semibold text-green-700">
                            {product?.name || product?.type || "—"}
                        </span>
                    </div>
                    {!rule && (
                        <div className="text-xs text-amber-700 mt-2">
                            (Chưa tìm thấy tập luật cho loại cây này — sẽ không đánh dấu ngưỡng.)
                        </div>
                    )}
                </div>

                {/* Hàng 1: Không khí + Mưa/Ánh sáng */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <MetricCard
                        title="NHIỆT ĐỘ KHÔNG KHÍ"
                        value={last?.airTemperature != null ? last.airTemperature.toFixed(1) : "—"}
                        unit="°C"
                        warning={warn.airTemp}
                    />
                    <MetricCard
                        title="ĐỘ ẨM KHÔNG KHÍ"
                        value={last?.airHumidity != null ? last.airHumidity.toFixed(1) : "—"}
                        unit="%"
                        warning={warn.airHumidity}
                    />
                    <MetricCard title="ÁNH SÁNG (RAW)" value={last?.lightRaw ?? "—"} unit="" />
                </div>

                {/* Hàng 2: Đất + pH */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <MetricCard
                        title="NHIỆT ĐỘ ĐẤT"
                        value={last?.soilTemperature != null ? last.soilTemperature.toFixed(1) : "—"}
                        unit="°C"
                        warning={warn.soilTemperature}
                    />
                    <MetricCard
                        title="ĐỘ ẨM ĐẤT"
                        value={last?.soilHumidity != null ? last.soilHumidity.toFixed(1) : "—"}
                        unit="%"
                        warning={warn.soilHumidity}
                    />
                    <MetricCard
                        title="pH"
                        value={last?.ph != null ? Number(last.ph).toFixed(2) : "—"}
                        unit=""
                        warning={warn.ph}
                    />
                </div>

                {/* Hàng 3: NPK */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <MetricCard
                        title="NITƠ (N)"
                        value={last?.nitrogen != null ? Number(last.nitrogen).toFixed(2) : "—"}
                        unit="mg/kg"
                        warning={warn.n}
                    />
                    <MetricCard
                        title="LÂN (P)"
                        value={last?.phosphorus != null ? Number(last.phosphorus).toFixed(2) : "—"}
                        unit="mg/kg"
                        warning={warn.p}
                    />
                    <MetricCard
                        title="KALI (K)"
                        value={last?.potassium != null ? Number(last.potassium).toFixed(2) : "—"}
                        unit="mg/kg"
                        warning={warn.k}
                    />
                </div>

                <HistoryTable />
            </div>

            {/* Right Sidebar */}
            <div className="flex flex-col gap-4 w-[380px]">
                <Notification notifications={notifications} />
                <CalendarWeather />
            </div>
        </div>
    );
};

export default Home;
