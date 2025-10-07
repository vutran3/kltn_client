import React, { useEffect, useMemo, useRef, useState } from "react";
import { Power, Clock, Calendar, AlarmClock, RefreshCcw, Timer, X, Trash2, Download } from "lucide-react";

const DEFAULT_SCHEDULE = {
    enabled: false,
    onTime: "06:00",
    offTime: "06:10",
    days: [1, 2, 3, 4, 5] // Mon-Fri
};

const STORAGE_KEY = "device_schedules_v1";
const TIMER_STORAGE_KEY = "device_timers_v1";
const HISTORY_STORAGE_KEY = "device_history_v1"; // <— NEW

// --------- Helpers ---------
const tz = "Asia/Ho_Chi_Minh"; // for display only

function parseHHMM(time) {
    const [h, m] = time.split(":").map(Number);
    return { h: h || 0, m: m || 0 };
}

function nextOccurrence(time, days, from = new Date()) {
    // Returns the next Date >= now that matches HH:mm on any selected weekday
    const { h, m } = parseHHMM(time);
    const start = new Date(from.getTime());
    start.setSeconds(0, 0);

    for (let i = 0; i < 8; i++) {
        const d = new Date(start.getTime());
        d.setDate(start.getDate() + i);
        d.setHours(h, m, 0, 0);
        if (days.includes(d.getDay())) {
            if (d.getTime() >= from.getTime()) return d;
        }
    }
    // Fallback: in case days is empty, schedule to the far future
    const far = new Date(from.getTime());
    far.setFullYear(far.getFullYear() + 10);
    return far;
}

function formatDate(dt) {
    if (!dt) return "—";
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: tz
    }).format(dt);
}

function classNames(...xs) {
    return xs.filter(Boolean).join(" ");
}

// Simulate sending a command (replace with your HTTP/MQTT call)
async function sendDeviceCommand(device, on) {
    await new Promise((res) => setTimeout(res, 350));
}

// Persist schedules to server (optional integration)
async function syncScheduleToServer(device, schedule) {
    return; // no-op in demo
}

const DeviceControl = () => {
    const [devices, setDevices] = useState([
        { id: "pump", name: "Máy bơm", isOn: false, isBusy: false },
        { id: "light", name: "Đèn", isOn: false, isBusy: false }
    ]);

    const [schedules, setSchedules] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch {}
        return { pump: { ...DEFAULT_SCHEDULE }, light: { ...DEFAULT_SCHEDULE } };
    });

    const [timers, setTimers] = useState(() => {
        try {
            const raw = localStorage.getItem(TIMER_STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch {}
        return { pump: null, light: null };
    });

    // NEW: on/off history per device
    const [history, setHistory] = useState(() => {
        try {
            const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch {}
        return { pump: [], light: [] };
    });

    // Cache next triggers for each device
    const [nextOnOff, setNextOnOff] = useState({
        pump: { onAt: null, offAt: null },
        light: { onAt: null, offAt: null }
    });

    // Save schedules & timers & history
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    }, [schedules]);

    useEffect(() => {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timers));
    }, [timers]);

    useEffect(() => {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }, [history]);

    // Helper: push history entry
    // action: "ON" | "OFF"
    // source: "manual" | "schedule" | "timer" | "timer-auto"
    function addHistory(device, action, source, extra = {}) {
        setHistory((prev) => {
            const entry = { at: Date.now(), action, source, ...extra };
            const arr = [entry, ...(prev[device] || [])].slice(0, 200); // keep last 200
            return { ...prev, [device]: arr };
        });
    }

    // Compute next on/off times whenever schedule changes
    useEffect(() => {
        const now = new Date();
        const calc = (device) => {
            const s = schedules[device];
            if (!s || !s.enabled || s.days.length === 0) return { onAt: null, offAt: null };
            const onDt = nextOccurrence(s.onTime, s.days, now);
            const offDt = nextOccurrence(s.offTime, s.days, now);
            return { onAt: onDt.getTime(), offAt: offDt.getTime() };
        };
        setNextOnOff({ pump: calc("pump"), light: calc("light") });
    }, [schedules]);

    // Interval: check timers & schedule triggers
    useEffect(() => {
        const iv = setInterval(() => {
            const now = Date.now();

            // Handle quick timers (auto OFF when endAt reached)
            setTimers((prev) => {
                const next = { ...prev };
                Object.keys(prev).forEach((d) => {
                    const t = prev[d];
                    if (t && now >= t.endAt) {
                        // Auto turn off
                        setDevices((old) => old.map((x) => (x.id === d ? { ...x, isOn: false } : x)));
                        addHistory(d, "OFF", "timer-auto"); // <— NEW
                        next[d] = null;
                    }
                });
                return next;
            });

            // Handle schedule triggers
            setNextOnOff((prev) => {
                const copy = structuredClone(prev);
                Object.keys(prev).forEach((d) => {
                    const sch = schedules[d];
                    if (!sch?.enabled) return;
                    const item = prev[d];
                    // Tolerance window: fire if within the same minute
                    const tol = 1000 * 30; // 30s window

                    if (item.onAt && Math.abs(now - item.onAt) <= tol) {
                        // Turn ON
                        setDevices((old) => old.map((x) => (x.id === d ? { ...x, isOn: true } : x)));
                        addHistory(d, "ON", "schedule"); // <— NEW
                        const nxt = nextOccurrence(sch.onTime, sch.days, new Date(item.onAt + 60_000));
                        copy[d].onAt = nxt.getTime();
                    }
                    if (item.offAt && Math.abs(now - item.offAt) <= tol) {
                        // Turn OFF
                        setDevices((old) => old.map((x) => (x.id === d ? { ...x, isOn: false } : x)));
                        addHistory(d, "OFF", "schedule"); // <— NEW
                        const nxt = nextOccurrence(sch.offTime, sch.days, new Date(item.offAt + 60_000));
                        copy[d].offAt = nxt.getTime();
                    }
                });
                return copy;
            });
        }, 1000);
        return () => clearInterval(iv);
    }, [schedules]);

    // Toggle with source (default manual)
    const handleToggle = async (device, source = "manual") => {
        setDevices((prev) => prev.map((x) => (x.id === device ? { ...x, isBusy: true } : x)));
        const current = devices.find((d) => d.id === device);
        const nextState = !current?.isOn;
        try {
            await sendDeviceCommand(device, nextState);
            setDevices((prev) =>
                prev.map((x) =>
                    x.id === device ? { ...x, isOn: nextState, isBusy: false, lastUpdated: Date.now() } : x
                )
            );
            addHistory(device, nextState ? "ON" : "OFF", source); // <— NEW
        } catch (e) {
            console.error(e);
            setDevices((prev) => prev.map((x) => (x.id === device ? { ...x, isBusy: false } : x)));
            alert("Không thể gửi lệnh. Vui lòng thử lại.");
        }
    };

    const handleTimerStart = async (device, minutes) => {
        if (!Number.isFinite(minutes) || minutes <= 0) return alert("Số phút không hợp lệ");
        const endAt = Date.now() + minutes * 60 * 1000;
        // Turn ON immediately & set timer
        await handleEnsureOn(device);
        setTimers((prev) => ({ ...prev, [device]: { endAt } }));
    };

    const handleEnsureOn = async (device) => {
        const d = devices.find((x) => x.id === device);
        if (!d) return;
        if (!d.isOn) await handleToggle(device, "timer"); // <— mark as timer source
    };

    const handleTimerCancel = (device) => {
        setTimers((prev) => ({ ...prev, [device]: null }));
    };

    const saveSchedule = async (device, schedule) => {
        setSchedules((prev) => ({ ...prev, [device]: schedule }));
        try {
            await syncScheduleToServer(device, schedule);
        } catch (e) {
            console.warn("Không thể đồng bộ lịch lên server (demo).", e);
        }
    };

    const clearHistory = (device) => {
        if (!confirm("Xoá toàn bộ lịch sử của thiết bị này?")) return;
        setHistory((prev) => ({ ...prev, [device]: [] }));
    };

    const exportHistory = (device) => {
        const data = history[device] || [];
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${device}_history.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen w-full bg-slate-50">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
                <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlarmClock className="w-6 h-6" />
                        <h1 className="text-xl md:text-2xl font-semibold">Điều khiển thiết bị</h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6 md:grid-cols-2">
                {devices.map((dev) => (
                    <DeviceCard
                        key={dev.id}
                        device={dev}
                        schedule={schedules[dev.id]}
                        nextOnAt={nextOnOff[dev.id]?.onAt ?? null}
                        nextOffAt={nextOnOff[dev.id]?.offAt ?? null}
                        timer={timers[dev.id]}
                        historyItems={(history[dev.id] || []).slice(0, 20)} // show latest 20
                        onToggle={() => handleToggle(dev.id)}
                        onTimerStart={(mins) => handleTimerStart(dev.id, mins)}
                        onTimerCancel={() => handleTimerCancel(dev.id)}
                        onScheduleChange={(sch) => saveSchedule(dev.id, sch)}
                        onHistoryClear={() => clearHistory(dev.id)}
                        onHistoryExport={() => exportHistory(dev.id)}
                    />
                ))}
            </main>

            <footer className="py-8 text-center text-xs text-slate-500"></footer>
        </div>
    );
};

function DeviceCard({
    device,
    schedule,
    nextOnAt,
    nextOffAt,
    timer,
    historyItems,
    onToggle,
    onTimerStart,
    onTimerCancel,
    onScheduleChange,
    onHistoryClear,
    onHistoryExport
}) {
    const [minutes, setMinutes] = useState(10);
    const [local, setLocal] = useState(schedule ?? { ...DEFAULT_SCHEDULE });

    useEffect(() => {
        if (schedule) setLocal(schedule);
    }, [schedule]);

    const timeLeft = useTimeLeft(timer?.endAt ?? null);

    const statusColor = device.isOn ? "bg-emerald-500" : "bg-slate-300";
    const statusText = device.isOn ? "Đang bật" : "Đang tắt";

    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 flex items-center justify-between gap-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className={classNames("inline-block w-2.5 h-2.5 rounded-full", statusColor)} />
                    <h2 className="text-lg font-semibold">{device.name}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{statusText}</span>
                </div>
                <button
                    onClick={onToggle}
                    disabled={device.isBusy}
                    className={classNames(
                        "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-inset transition",
                        device.isOn
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-emerald-600/30"
                            : "bg-white hover:bg-slate-50 text-slate-900 ring-slate-200"
                    )}
                >
                    <Power className={classNames("w-4 h-4", device.isOn ? "animate-pulse" : "")} />
                    {device.isBusy ? "Đang gửi..." : device.isOn ? "Tắt" : "Bật"}
                </button>
            </div>

            {/* Quick Timer */}
            <div className="p-5 grid gap-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                    <Timer className="w-4 h-4" />
                    <h3 className="font-medium">Hẹn giờ nhanh</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm text-slate-600">Thời lượng (phút)</label>
                    <input
                        type="number"
                        value={minutes}
                        onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))}
                        className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        min={1}
                    />
                    <button
                        onClick={() => onTimerStart(minutes)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm"
                    >
                        Bật trong {minutes}′
                    </button>
                    {timer && (
                        <div className="ml-auto flex items-center gap-2 text-sm text-slate-700">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                                <Clock className="w-3.5 h-3.5" />
                                Còn lại: {timeLeft}
                            </span>
                            <button
                                onClick={onTimerCancel}
                                className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-slate-700 hover:bg-slate-50"
                            >
                                <X className="w-3.5 h-3.5" /> Hủy
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Scheduler */}
            <div className="p-5 grid gap-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4" />
                    <h3 className="font-medium">Lịch hẹn giờ</h3>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={local.enabled}
                            onChange={(e) => setLocal((s) => ({ ...s, enabled: e.target.checked }))}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Bật lịch cho thiết bị này
                    </label>
                    <button
                        onClick={() => onScheduleChange(local)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                    >
                        <RefreshCcw className="w-3.5 h-3.5" /> Lưu/Cập nhật lịch
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TimeField
                        label="Giờ bật"
                        value={local.onTime}
                        onChange={(v) => setLocal((s) => ({ ...s, onTime: v }))}
                    />
                    <TimeField
                        label="Giờ tắt"
                        value={local.offTime}
                        onChange={(v) => setLocal((s) => ({ ...s, offTime: v }))}
                    />
                </div>

                <WeekdayPicker value={local.days} onChange={(days) => setLocal((s) => ({ ...s, days }))} />

                <NextRunRow onAt={nextOnAt} offAt={nextOffAt} />
            </div>

            {/* History */}
            <div className="p-5 grid gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="w-4 h-4" />
                        <h3 className="font-medium">Lịch sử bật/tắt</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onHistoryExport}
                            className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm hover:bg-slate-50"
                            title="Xuất JSON"
                        >
                            <Download className="w-4 h-4" /> Xuất
                        </button>
                        <button
                            onClick={onHistoryClear}
                            className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm text-rose-600 hover:bg-rose-50 border-rose-200"
                            title="Xoá lịch sử"
                        >
                            <Trash2 className="w-4 h-4" /> Xoá
                        </button>
                    </div>
                </div>

                <HistoryTable items={historyItems} />
            </div>
        </section>
    );
}

function TimeField({ label, value, onChange }) {
    return (
        <label className="grid gap-1 text-sm">
            <span className="text-slate-600">{label}</span>
            <input
                type="time"
                step={60}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
        </label>
    );
}

const WEEK_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]; // Sun..Sat

function WeekdayPicker({ value, onChange }) {
    const toggle = (d) => {
        const set = new Set(value);
        if (set.has(d)) set.delete(d);
        else set.add(d);
        onChange([...set].sort((a, b) => a - b));
    };

    return (
        <div className="grid gap-2">
            <div className="text-sm text-slate-600">Lặp lại vào các ngày</div>
            <div className="flex flex-wrap gap-2">
                {WEEK_LABELS.map((label, idx) => {
                    const active = value.includes(idx);
                    return (
                        <button
                            type="button"
                            key={idx}
                            onClick={() => toggle(idx)}
                            className={classNames(
                                "min-w-10 rounded-full border px-3 py-1 text-sm transition",
                                active
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            )}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function NextRunRow({ onAt, offAt }) {
    const onDt = onAt ? new Date(onAt) : null;
    const offDt = offAt ? new Date(offAt) : null;
    return (
        <div className="mt-2 grid gap-1 text-sm text-slate-600">
            <div>
                🟢 Lần bật kế tiếp: <span className="font-medium">{formatDate(onDt)}</span>
            </div>
            <div>
                🔴 Lần tắt kế tiếp: <span className="font-medium">{formatDate(offDt)}</span>
            </div>
        </div>
    );
}

function HistoryTable({ items }) {
    const sourceLabel = (s) =>
        s === "manual"
            ? "Thao tác tay"
            : s === "schedule"
            ? "Theo lịch"
            : s === "timer"
            ? "Bắt đầu hẹn giờ"
            : s === "timer-auto"
            ? "Tự tắt khi hết giờ"
            : s;

    if (!items || items.length === 0) {
        return <div className="text-sm text-slate-500">Chưa có lịch sử.</div>;
    }

    return (
        <div className="rounded-lg border border-slate-200 max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                    <tr>
                        <th className="text-left px-3 py-2 border-b">Thời gian</th>
                        <th className="text-left px-3 py-2 border-b">Hành động</th>
                        <th className="text-left px-3 py-2 border-b">Nguồn</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-3 py-2 border-b">{formatDate(new Date(it.at))}</td>
                            <td
                                className={classNames(
                                    "px-3 py-2 border-b font-medium",
                                    it.action === "ON" ? "text-emerald-700" : "text-rose-700"
                                )}
                            >
                                {it.action === "ON" ? "Bật" : "Tắt"}
                            </td>
                            <td className="px-3 py-2 border-b">{sourceLabel(it.source)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function useTimeLeft(endAt) {
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!endAt) return;
        const iv = setInterval(() => setTick((x) => x + 1), 1000);
        return () => clearInterval(iv);
    }, [endAt]);
    if (!endAt) return "—";
    const left = Math.max(0, endAt - Date.now());
    const s = Math.floor(left / 1000);
    const mm = Math.floor(s / 60)
        .toString()
        .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
}

export default DeviceControl;
