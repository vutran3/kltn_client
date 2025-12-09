import { useEffect, useMemo, useRef, useState } from "react";

function getInitials(nameOrEmail = "") {
    const s = String(nameOrEmail).trim();
    if (!s) return "?";
    if (s.includes("@")) {
        const [left, right] = s.split("@");
        return (left[0] + (right?.[0] || "")).toUpperCase();
    }
    const parts = s.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFromString(str = "") {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 45%)`;
}

function fmtDate(iso) {
    if (!iso) return "—";
    try {
        const d = new Date(iso);
        return d.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch {
        return iso;
    }
}

export default function UserAvatar({ user = {}, size = 40, className = "" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const display = useMemo(
        () => ({
            name: user?.name || "—",
            email: user?.email || "—",
            role: user?.role || "—",
            phone: user?.phone || "—",
            isActive: Boolean(user?.isActive),
            createdAt: fmtDate(user?.createdAt),
            updatedAt: fmtDate(user?.updatedAt),
            id: user?._id || "—"
        }),
        [user]
    );

    const initials = getInitials(user?.name || user?.email || "");
    const bg = colorFromString(user?.name || user?.email || "");

    const mapRole = (role) => {
        switch (role) {
            case "user":
                return "Người dùng";
            case "admin":
                return "Quản trị viên";
            default:
                return "Không có";
        }
    };

    // Đóng khi click ra ngoài
    useEffect(() => {
        const onClick = (e) => {
            if (!ref.current) return;
            if (open && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div ref={ref} className={`relative inline-block ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="flex items-center justify-center rounded-full text-white font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ width: size, height: size, background: bg }}
                title={display.name}
            >
                {initials}
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label="Thông tin người dùng"
                    className="absolute right-0 z-[60] mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl"
                >
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <div
                                className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
                                style={{ width: 48, height: 48, background: bg }}
                            >
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate">{display.name}</div>
                                <div className="text-sm text-slate-500 truncate">{display.email}</div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span
                                className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-semibold ${
                                    display.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                }`}
                            >
                                {display.isActive ? "Đang hoạt động" : "Bị khóa"}
                            </span>
                            <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                                Vai trò: {mapRole(display.role)}
                            </span>
                        </div>

                        {/* Body */}
                        <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
                            <div className="col-span-1 text-slate-500">Số điện thoại: </div>
                            <div className="col-span-2 text-slate-800">{display.phone}</div>

                            <div className="col-span-1 text-slate-500">Ngày tạo: </div>
                            <div className="col-span-2 text-slate-800">{display.createdAt}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
