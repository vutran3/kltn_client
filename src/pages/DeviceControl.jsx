import React, { useCallback, useEffect, useState } from "react";
import { getDataApi, putDataApi } from "../utils/fetch";
import { Lightbulb, Waves } from "lucide-react";
import { useSelector } from "react-redux";
import { clampNonNegativeNumber, datetimeLocalToMs, fmtTimeMs } from "../utils";
import { selectDevice } from "../redux/selector";
export default function DeviceControl() {

    const { selectedId } = useSelector(selectDevice);

    const devices = [
        { id: "pump_1", name: "Máy bơm", type: "pump", icon: <Waves className="w-6 h-6 text-blue-600" /> },
        { id: "light_1", name: "Đèn", type: "light", icon: <Lightbulb className="w-6 h-6 text-yellow-500" /> }
    ];

    const [selectedDevice, setSelectedDevice] = useState(devices[0]);

    // Server state
    const [serverNow, setServerNow] = useState(0);
    const [status, setStatus] = useState({
        device_id: "",
        is_active: false,
        schedule_ms: 0,
        duration_ms: 0,
        now_ms: 0,
        version: 0
    });

    const [quickSeconds, setQuickSeconds] = useState(0);
    const [delaySeconds, setDelaySeconds] = useState(10);
    const [delayDurationSeconds, setDelayDurationSeconds] = useState(5);
    const [scheduleAtLocal, setScheduleAtLocal] = useState("");
    const [durationSeconds, setDurationSeconds] = useState(5);

    // Lấy trạng thái thiết bị
    const fetchStatus = useCallback(async () => {
        if (!selectedDevice) return;
        try {
            const res = await getDataApi("/device-control", {
                device_id: selectedId,
                type: selectedDevice.type
            });

            const data = res?.data || {};
            setStatus({
                device_id: data.device_id,
                is_active: !!data.is_active,
                schedule_ms: Number(data.schedule_ms) || 0,
                duration_ms: Number(data.duration_ms) || 0,
                now_ms: Number(data.now_ms) || Date.now(),
                version: Number(data.version) || 0
            });
            setServerNow(Number(data.now_ms) || Date.now());
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.error || "Lỗi lấy trạng thái");
        }
    }, [selectedDevice]);

    // API chung – thêm type vào
    const sendControl = async (payload) => {
        try {
            await putDataApi("/device-control", {
                device_id: selectedId,
                type: selectedDevice.type,
                ...payload
            });
            await fetchStatus();
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.error || "Lỗi điều khiển thiết bị");
        }
    };

    const turnOff = () => sendControl({ is_active: false, schedule_ms: 0, duration_ms: 0 });
    const turnOnIndefinite = () => sendControl({ is_active: true, schedule_ms: 0, duration_ms: 0 });

    const turnOnQuick = () => {
        const durMs = clampNonNegativeNumber(quickSeconds) * 1000;
        sendControl({ is_active: true, schedule_ms: 0, duration_ms: durMs });
    };

    const scheduleAfterDelay = () => {
        const delayMs = clampNonNegativeNumber(delaySeconds) * 1000;
        const durMs = clampNonNegativeNumber(delayDurationSeconds) * 1000;
        const startAt = Date.now() + delayMs;

        sendControl({
            is_active: true,
            schedule_ms: startAt,
            duration_ms: durMs
        });
    };

    const scheduleAt = () => {
        const atMs = datetimeLocalToMs(scheduleAtLocal);
        if (!atMs) {
            alert("Thời điểm không hợp lệ");
            return;
        }

        const durMs = clampNonNegativeNumber(durationSeconds) * 1000;

        sendControl({
            is_active: true,
            schedule_ms: atMs,
            duration_ms: durMs
        });
    };

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return (
        <div className="mx-auto max-w-5xl p-4 sm:p-6">

            {/* Chọn thiết bị */}
            <div className="mb-6">
                <div className="text-lg font-semibold mb-2">Chọn thiết bị</div>
                <div className="flex gap-4">
                    {devices.map((d) => (
                        <button
                            key={d.id}
                            onClick={() => setSelectedDevice(d)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border 
                                ${d.id === selectedDevice.id ? "bg-blue-100 border-blue-500" : "bg-white border-gray-300"}`}
                        >
                            {d.icon}
                            <span>{d.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tiêu đề theo thiết bị */}
            <h1 className="flex items-center text-2xl font-semibold mb-4 gap-2">
                {selectedDevice.icon}
                Điều khiển {String(selectedDevice.name).toLowerCase()}
            </h1>

            {/* khu bật ngay */}
            <div className="rounded-2xl border bg-white border-gray-200 p-4 sm:p-6 mb-4">
                <h2 className="text-lg font-semibold mb-4">Điều khiển tức thì</h2>
                <div className="rounded-xl border border-gray-300 p-3 w-full">
                    <div className="mb-2">
                        <label className="block text-sm text-slate-700 mb-1">Bật ngay trong (giây)</label>
                        <input
                            type="number"
                            min={1}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            value={quickSeconds}
                            onChange={(e) => setQuickSeconds(clampNonNegativeNumber(e.target.value, 5))}
                        />
                    </div>

                    <button
                        onClick={status.is_active ? turnOff : turnOnQuick}
                        className={`w-full rounded-lg text-white px-4 py-2  
                            ${status.is_active ? "bg-red-600" : "bg-blue-600"}`}
                    >
                        {status.is_active ? "Tắt ngay" : "Bật ngay"}
                    </button>
                </div>
            </div>

            {/* Hẹn giờ */}
            <div className="rounded-2xl border bg-white p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Hẹn giờ</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Hẹn sau N giây */}
                    <div className="rounded-xl border border-gray-300 p-4">
                        <div className="text-base font-medium mb-3">Hẹn giờ sau N giây, kéo dài M giây</div>

                        <div className="flex items-end gap-3">
                            <div>
                                <label className="block text-sm mb-1">Sau (giây)</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="w-full rounded-lg border px-3 py-2"
                                    value={delaySeconds}
                                    onChange={(e) => setDelaySeconds(clampNonNegativeNumber(e.target.value, 10))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Kéo dài (giây)</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="w-full rounded-lg border px-3 py-2"
                                    value={delayDurationSeconds}
                                    onChange={(e) => setDelayDurationSeconds(clampNonNegativeNumber(e.target.value, 5))}
                                />
                            </div>

                            <button
                                onClick={scheduleAfterDelay}
                                className="w-32 rounded-lg bg-blue-600 text-white py-2"
                            >
                                Đặt lịch
                            </button>
                        </div>
                    </div>

                    {/* Hẹn thời điểm */}
                    <div className="rounded-xl border p-4">
                        <div className="text-base font-medium mb-3">Hẹn vào thời điểm cụ thể</div>

                        <label className="block text-sm mb-1">Thời điểm</label>
                        <input
                            type="datetime-local"
                            className="w-full rounded-lg border px-3 py-2 mb-3"
                            value={scheduleAtLocal}
                            onChange={(e) => setScheduleAtLocal(e.target.value)}
                        />

                        <label className="block text-sm mb-1">Kéo dài (giây)</label>
                        <input
                            type="number"
                            min={0}
                            className="w-full rounded-lg border px-3 py-2 mb-3"
                            value={durationSeconds}
                            onChange={(e) => setDurationSeconds(clampNonNegativeNumber(e.target.value, 5))}
                        />

                        <button
                            onClick={scheduleAt}
                            className="w-full rounded-lg bg-blue-600 text-white py-2"
                        >
                            Đặt lịch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
