import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDataApi, putDataApi } from "../utils/fetch";
import { useSelector } from "react-redux";
import { selectDevice } from "../redux/selector";
import { clampNonNegativeNumber, datetimeLocalToMs, fmtTimeMs } from "../utils";

export default function DeviceControl() {
    const { selectedId } = useSelector(selectDevice);
    // server state
    const [serverNow, setServerNow] = useState(0);
    const [status, setStatus] = useState({
        device_id: "",
        is_active: false,
        schedule_ms: 0,
        duration_ms: 0,
        now_ms: 0,
        version: 0
    });

    const [quickSeconds, setQuickSeconds] = useState(0); // bật ngay X giây
    const [delaySeconds, setDelaySeconds] = useState(10); // hẹn sau N giây
    const [delayDurationSeconds, setDelayDurationSeconds] = useState(5); // kéo dài M giây

    // form hẹn giờ theo "thời điểm"
    const [scheduleAtLocal, setScheduleAtLocal] = useState(""); // datetime-local string
    const [durationSeconds, setDurationSeconds] = useState(5);

    const fetchStatus = useCallback(async () => {
        if (!selectedId.trim()) return;
        try {
            const res = await getDataApi("/device-control", { device_id: selectedId });
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
    }, [selectedId]);

    const turnOff = async () => {
        try {
            await putDataApi("/device-control", {
                device_id: selectedId,
                is_active: false,
                schedule_ms: 0,
                duration_ms: 0
            });
            await fetchStatus();
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.error || "Lỗi tắt máy bơm");
        }
    };

    const turnOnIndefinite = async () => {
        try {
            await putDataApi("/device-control", {
                device_id: selectedId,
                is_active: true,
                schedule_ms: 0,
                duration_ms: 0
            });
            await fetchStatus();
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.error || "Lỗi bật vô thời hạn");
        }
    };

    const turnOnQuick = async () => {
        const durMs = clampNonNegativeNumber(quickSeconds) * 1000;
        try {
            await putDataApi("/device-control", {
                device_id: selectedId,
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

    const scheduleAfterDelay = async () => {
        const delayMs = clampNonNegativeNumber(delaySeconds) * 1000;
        const durMs = clampNonNegativeNumber(delayDurationSeconds) * 1000;
        const startAt = Date.now() + delayMs;
        try {
            await putDataApi("/device-control", {
                device_id: selectedId,
                is_active: true,
                schedule_ms: startAt,
                duration_ms: durMs
            });
            await fetchStatus();
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.error || "Lỗi hẹn giờ sau N giây");
        }
    };

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
                is_active: true,
                schedule_ms: atMs,
                duration_ms: durMs
            });
            await fetchStatus();
        } catch (e) {
            alert(e?.response?.data?.error || "Lỗi hẹn giờ theo thời điểm");
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return (
        <div className="mx-auto max-w-5xl p-4 sm:p-6">
            <h1 className="text-2xl font-semibold mb-4">Điều khiển máy bơm</h1>

            {/* Instant Controls */}
            <div className="rounded-2xl border bg-white border-gray-200 p-4 sm:p-6 mb-4">
                <h2 className="text-lg font-semibold mb-4">Điều khiển tức thì</h2>
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
                    <button
                        onClick={status.is_active ? turnOff : turnOnQuick}
                        className={`w-full rounded-lg text-white px-4 py-2  ${
                            status.is_active ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {status.is_active ? "Tắt ngay" : "Bật ngay"}
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Hẹn giờ</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Hẹn sau N giây */}
                    <div className="rounded-xl border border-gray-300 p-4">
                        <div className="text-base font-medium mb-3">Hẹn giờ sau N giây, kéo dài M giây</div>
                        <div className="flex items-end gap-3">
                            <div>
                                <label className="block text-sm text-slate-700 mb-1">Sau (giây)</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={delaySeconds}
                                    onChange={(e) => setDelaySeconds(clampNonNegativeNumber(e.target.value, 10))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-700 mb-1">Kéo dài (giây)</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={delayDurationSeconds}
                                    onChange={(e) => setDelayDurationSeconds(clampNonNegativeNumber(e.target.value, 5))}
                                />
                            </div>
                            <div>
                                <button
                                    onClick={scheduleAfterDelay}
                                    className="w-32 rounded-lg bg-emerald-600 text-white  x-3 py-2 hover:bg-emerald-700"
                                >
                                    Đặt lịch
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-2">
                            <div className="font-semibold">
                                <span> Lịch hẹn máy bơm </span>
                            </div>
                            <div className="text-sm text-slate-600">
                                <span className="inline-block min-w-20">Sẽ bật lúc:</span>
                                <span className="font-medium">
                                    {fmtTimeMs(Date.now() + clampNonNegativeNumber(delaySeconds) * 1000)}
                                </span>
                            </div>

                            <div className="mt-2 text-sm text-slate-600">
                                <span className="inline-block  min-w-20">Sẽ tắt lúc:</span>
                                <span className="font-medium">
                                    {fmtTimeMs(
                                        Date.now() +
                                            clampNonNegativeNumber(delaySeconds) * 1000 +
                                            clampNonNegativeNumber(delayDurationSeconds) * 1000
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Hẹn tại thời điểm cụ thể */}
                    <div className="rounded-xl border p-4">
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
                                    className="w-full rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                                >
                                    Đặt lịch
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 text-sm text-slate-600">
                            {scheduleAtLocal ? (
                                <div>
                                    <span>Sẽ bật lúc:</span>
                                    <span className="font-medium">
                                        {fmtTimeMs(datetimeLocalToMs(scheduleAtLocal) || 0)}
                                    </span>
                                </div>
                            ) : (
                                "Chọn thời điểm để đặt lịch"
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
