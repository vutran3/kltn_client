import React, { useCallback, useEffect, useState } from "react";
import { getDataApi, putDataApi } from "../utils/fetch";
import { useSelector } from "react-redux";
import { selectDevice } from "../redux/selector";
import { clampNonNegativeNumber, datetimeLocalToMs, fmtTimeMs } from "../utils";

const emptyStatus = {
    device_id: "",
    is_active: false,
    schedule_ms: 0,
    duration_ms: 0,
    now_ms: 0,
    version: 0
};

export default function DeviceControl() {
    const { selectedId } = useSelector(selectDevice);
    const [serverNow, setServerNow] = useState(0);
    const [status, setStatus] = useState({
        light: { ...emptyStatus },
        pump: { ...emptyStatus }
    });
    const [activeType, setActiveType] = useState("pump");
    const [quickSeconds, setQuickSeconds] = useState(0);
    const [scheduleAtLocal, setScheduleAtLocal] = useState("");
    const [durationSeconds, setDurationSeconds] = useState(5);
    const currentStatus = status[activeType] || emptyStatus;

    // Lịch đã lưu trong DB cho thiết bị hiện tại
    const hasSchedule = currentStatus.schedule_ms > 0 && currentStatus.schedule_ms > currentStatus.now_ms;
    const scheduleStartMs = hasSchedule ? currentStatus.schedule_ms : 0;
    const scheduleEndMs =
        hasSchedule && currentStatus.duration_ms > 0 ? currentStatus.schedule_ms + currentStatus.duration_ms : 0;

    const deviceLabel = activeType === "pump" ? "máy bơm" : "đèn";

    const fetchStatus = useCallback(async () => {
        if (!selectedId?.trim()) return;
        try {
            const res = await getDataApi("/device-control", { device_id: selectedId });
            const data = res?.data || {};

            const lightData = data.light || {};
            const pumpData = data.pump || {};

            const newLight = {
                device_id: lightData.device_id || selectedId,
                is_active: !!lightData.is_active,
                schedule_ms: Number(lightData.schedule_ms) || 0,
                duration_ms: Number(lightData.duration_ms) || 0,
                now_ms: Number(lightData.now_ms) || Date.now(),
                version: Number(lightData.version) || 0
            };

            const newPump = {
                device_id: pumpData.device_id || selectedId,
                is_active: !!pumpData.is_active,
                schedule_ms: Number(pumpData.schedule_ms) || 0,
                duration_ms: Number(pumpData.duration_ms) || 0,
                now_ms: Number(pumpData.now_ms) || Date.now(),
                version: Number(pumpData.version) || 0
            };

            setStatus({
                light: newLight,
                pump: newPump
            });

            // ưu tiên now_ms từ pump, fallback sang light, rồi Date.now()
            setServerNow(Number(pumpData.now_ms) || Number(lightData.now_ms) || Date.now());
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.error || "Lỗi lấy trạng thái thiết bị");
        }
    }, [selectedId]);

    // TẮT thiết bị hiện tại (đồng thời reset lịch trong DB => lịch sử sẽ mất)
    const turnOff = async () => {
        try {
            await putDataApi("/device-control", {
                device_id: selectedId,
                type: activeType,
                is_active: false,
                schedule_ms: 0,
                duration_ms: 0
            });
            await fetchStatus();
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.error || "Lỗi tắt thiết bị");
        }
    };

    // BẬT nhanh X giây thiết bị hiện tại
    const turnOnQuick = async () => {
        const durMs = clampNonNegativeNumber(quickSeconds) * 1000;
        try {
            await putDataApi("/device-control", {
                device_id: selectedId,
                type: activeType,
                is_active: true,
                schedule_ms: 0,
                duration_ms: durMs
            });
            await fetchStatus();
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.error || "Lỗi bật nhanh");
        }
    };

    // Hẹn vào thời điểm cụ thể cho thiết bị hiện tại
    const scheduleAt = async () => {
        const atMs = datetimeLocalToMs(scheduleAtLocal);
        if (!atMs || atMs <= 0) {
            alert("Thời điểm không hợp lệ");
            return;
        }
        const durMs = clampNonNegativeNumber(durationSeconds) * 1000;
        try {
            await putDataApi("/device-control", {
                device_id: selectedId,
                type: activeType,
                is_active: true,
                schedule_ms: atMs,
                duration_ms: durMs
            });
            await fetchStatus();
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.error || "Lỗi hẹn giờ theo thời điểm");
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return (
        <div className="m-1 p-4 rounded-lg">
            {/* Tab chọn thiết bị */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setActiveType("pump")}
                    className={`px-4 py-2 rounded-lg border ${
                        activeType === "pump"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-800 border-slate-300"
                    }`}
                >
                    Máy bơm
                </button>
                <button
                    onClick={() => setActiveType("light")}
                    className={`px-4 py-2 rounded-lg border ${
                        activeType === "light"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-800 border-slate-300"
                    }`}
                >
                    Đèn
                </button>
                <div className="ml-auto text-sm text-slate-500">Server now: {fmtTimeMs(serverNow)}</div>
            </div>

            {/* Instant Controls */}
            <div className="rounded-2xl border bg-white border-gray-300 p-4 sm:p-6 mb-4">
                <h2 className="text-lg font-semibold mb-4">Điều khiển tức thì ({deviceLabel})</h2>
                <div className="rounded-xl border border-gray-300 p-3 w-full">
                    <div className="mb-2">
                        <label className="block text-sm text-slate-700 mb-1">Bật ngay trong (giây)</label>
                        <input
                            type="number"
                            min={1}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={quickSeconds}
                            onChange={(e) => setQuickSeconds(clampNonNegativeNumber(e.target.value, 5))}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={currentStatus.is_active ? turnOff : turnOnQuick}
                            className={`flex-1 rounded-lg text-white px-4 py-2 cursor-pointer ${
                                currentStatus.is_active
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {currentStatus.is_active ? "Tắt ngay" : "Bật ngay"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Scheduling */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Hẹn giờ ({deviceLabel})</h2>

                <div className="rounded-xl border border-gray-300 p-4">
                    <div className="text-base font-medium mb-3">Hẹn vào thời điểm cụ thể</div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="block text-sm text-slate-700 mb-1">Thời điểm</label>
                            <input
                                type="datetime-local"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={scheduleAtLocal}
                                onChange={(e) => setScheduleAtLocal(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-700 mb-1">Kéo dài (giây)</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={durationSeconds}
                                onChange={(e) => setDurationSeconds(clampNonNegativeNumber(e.target.value, 5))}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={scheduleAt}
                                className={`w-full rounded-lg text-white px-4 py-2 cursor-pointer ${
                                    hasSchedule ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                                {hasSchedule ? "Đã đặt lịch" : "Đặt lịch"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lịch đã lưu (lịch sử đặt lịch) theo từng thiết bị */}
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm">
                    <div className="font-semibold mb-1">Lịch đã lưu cho {deviceLabel}</div>
                    {hasSchedule ? (
                        <>
                            <div>
                                <span className="inline-block min-w-24">Sẽ bật lúc:</span>
                                <span className="font-medium">{fmtTimeMs(scheduleStartMs)}</span>
                            </div>
                            {scheduleEndMs > 0 && (
                                <div className="mt-1">
                                    <span className="inline-block min-w-24">Sẽ tắt lúc:</span>
                                    <span className="font-medium">{fmtTimeMs(scheduleEndMs)}</span>
                                </div>
                            )}
                            {scheduleEndMs === 0 && (
                                <div className="mt-1 text-slate-600">
                                    Lịch này không có thời điểm tắt (kéo dài vô thời hạn sau khi bật).
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-slate-500">
                            Hiện chưa có lịch hẹn cho {deviceLabel}. Khi bạn đặt lịch, thông tin sẽ hiển thị ở đây và sẽ
                            tự reset nếu bạn bật/tắt ngay (do dữ liệu trong database bị thay đổi).
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
