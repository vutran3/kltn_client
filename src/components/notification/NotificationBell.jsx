import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
    Bell,
    CheckCheck,
    X,
    Clock,
    AlertTriangle,
    ImageIcon,
    Check,
    Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useNotificationSocket from "../../hooks/useNotificationSocket";
import {
    fetchNotification,
    markRead,
    deleteNotifi
} from "../../redux/thunks/notificationThunk";
import { selectUnread, selectList } from "../../redux/selector";

// format time
const fmtTime = (iso) => {
    try {
        return new Date(iso).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
        });
    } catch {
        return "";
    }
};

export default function NotificationBell() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const unread = useSelector(selectUnread);
    const items = useSelector(selectList, shallowEqual);

    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState("all");
    const [deletingId, setDeletingId] = useState(null);
    const [deletingAll, setDeletingAll] = useState(false);
    const panelRef = useRef(null);
    const btnRef = useRef(null);

    useNotificationSocket();

    
    useEffect(() => {
        dispatch(
            fetchNotification({ page: 1, limit: 10, read: "all", sort: "-ctime" })
        );
    }, [dispatch]);


    useEffect(() => {
        if (!open) return;
        const handle = (e) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target) &&
                btnRef.current &&
                !btnRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        const onEsc = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", handle);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", handle);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    const refreshList = useCallback(() => {
       return dispatch(
            fetchNotification({ page: 1, limit: 10, read: "all", sort: "-ctime" })
        );
    }, [dispatch]);

    const onMarkAll = useCallback(async () => {
        await dispatch(markRead());
        refreshList();
    }, [dispatch, refreshList]);

    const onClickItem = useCallback(
        async (notif) => {
            try {
                await dispatch(markRead([notif._id]));
            } catch (error) {
                console.warn("Mark read error", error);
            }
            const hcid = notif?.data?.healthCheckId || notif?.data?.healthCheckID;
            if (hcid) navigate(`/quality-check?hcid=${encodeURIComponent(hcid)}`);
            setOpen(false);
        },
        [dispatch, navigate]
    );

    // XOÁ 1 THÔNG BÁO
    const onDeleteItem = useCallback(
        async (notif) => {
              if (!notif?._id) return;
              if (!confirm("Xoá thông báo này?")) return;
              setDeletingId(notif._id);
              try {
                 await dispatch(deleteNotifi({ id: notif._id, option: 'one' })).unwrap();
              } catch (e) {
                console.warn("Delete failed", e);
              } finally {
                setDeletingId(null);
                await refreshList();
              }
            return;
        },
        [dispatch,refreshList]
    );

    // XOÁ TẤT CẢ
    const onDeleteAll = useCallback(async () => {
        if (!confirm("Xoá tất cả thông báo?")) return;
        setDeletingAll(true);
        try {
            await dispatch(deleteNotifi({ option: 'all' })).unwrap();
        } catch (e) {
            try {
               
            } catch (e2) {
                console.warn("Delete all failed", e2);
            }
        } finally {
            setDeletingAll(false);
            await refreshList();
        }
        return;
    }, [dispatch, refreshList]);

    const filtered = useMemo(() => {
        if (!Array.isArray(items)) return [];
        return tab === "unread" ? items.filter((x) => !x.read) : items;
    }, [items, tab]);

    const renderLeadingIcon = (it) => {
        const isAlert =
            it?.data?.isDiseased === true ||
            it?.title?.toLowerCase?.().includes("cảnh báo");
        const Icon = isAlert ? AlertTriangle : Check;
        const iconClass = isAlert ? "text-rose-600" : "text-emerald-600";
        const bgClass = isAlert ? "bg-rose-50" : "bg-emerald-50";
        return (
            <div className={`h-10 w-10 ${bgClass} rounded-xl flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${iconClass}`} />
            </div>
        );
    };

    return (
        <div className="relative">
            <button
                ref={btnRef}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setOpen((o) => !o)}
                aria-label="Notifications"
            >
                <div className="h-8 w-8 bg-white flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                    <Bell className="h-5 w-5 text-gray-700" />
                </div>
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow ring-1 ring-red-400/40">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <div
                    ref={panelRef}
                    className="absolute right-0 mt-2 w-[420px] rounded-2xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden z-50"
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
                        <div className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Bell className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-semibold leading-tight text-slate-900">
                                        Thông báo
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        Nhấn để mở đúng bản ghi kiểm định chất lượng
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                                aria-label="Đóng"
                                title="Đóng"
                            >
                                <X className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="px-4 pb-3">
                            <div
                                role="tablist"
                                aria-label="Notification tabs"
                                className="grid grid-cols-2 gap-2"
                            >
                                <button
                                    role="tab"
                                    aria-selected={tab === "all"}
                                    onClick={() => setTab("all")}
                                    className={
                                        "h-9 text-sm font-medium rounded-lg transition-all border " +
                                        (tab === "all"
                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
                                    }
                                >
                                    Tất cả
                                </button>
                                <button
                                    role="tab"
                                    aria-selected={tab === "unread"}
                                    onClick={() => setTab("unread")}
                                    className={
                                        "h-9 text-sm font-medium rounded-lg transition-all border " +
                                        (tab === "unread"
                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
                                    }
                                >
                                    Chưa đọc {unread > 0 ? `(${unread})` : ""}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[460px] overflow-auto divide-y divide-gray-100 bg-white">
                        {filtered.length > 0 ? (
                            filtered.map((it) => (
                                <div
                                    key={it._id}
                                    className={`group w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${it.read ? "opacity-70" : ""
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {renderLeadingIcon(it)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-semibold line-clamp-1 text-slate-900">
                                                    {it.title || "Thông báo"}
                                                </div>
                                                {!it.read && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                                                        <Clock className="h-3 w-3" />
                                                        Mới
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onClickItem(it)}
                                                className="text-left block w-full"
                                                title="Mở trong Quality Check"
                                            >
                                                <div className="text-sm text-slate-600 line-clamp-2">
                                                    {it.body}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-500">
                                                    {fmtTime(it.createdAt)}
                                                </div>
                                                {(it?.data?.deviceId || it?.data?.healthCheckId) && (
                                                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
                                                        {it?.data?.deviceId && (
                                                            <span className="px-1.5 py-0.5 rounded bg-gray-100">
                                                                Thiết bị: {it.data.deviceId}
                                                            </span>
                                                        )}
                                                        {it?.data?.healthCheckId && (
                                                            <span className="px-1.5 py-0.5 rounded bg-gray-100">
                                                                HCID: {String(it.data.healthCheckId).slice(0, 8)}…
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </button>
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={() => onDeleteItem(it)}
                                            disabled={deletingId === it._id}
                                            className="opacity-0 group-hover:opacity-100 ml-2 mt-1 h-8 w-8 rounded-lg hover:bg-rose-50 flex items-center justify-center transition disabled:opacity-50"
                                            title="Xoá thông báo này"
                                        >
                                            <Trash2 className="h-4 w-4 text-rose-600" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-12 text-center text-sm text-slate-500">
                                Không có thông báo nào {tab === "unread" ? "chưa đọc" : ""}.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onMarkAll}
                                className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-800 hover:underline"
                                title="Đánh dấu tất cả là đã đọc"
                            >
                                <CheckCheck className="h-4 w-4" />
                                Đánh dấu tất cả đã đọc
                            </button>
                            <button
                                onClick={onDeleteAll}
                                disabled={deletingAll}
                                className="inline-flex items-center gap-1.5 text-sm text-rose-700 hover:text-rose-800 hover:underline disabled:opacity-60"
                                title="Xoá tất cả thông báo"
                            >
                                <Trash2 className="h-4 w-4" />
                                Xoá tất cả
                            </button>
                        </div>
                        <div className="text-[11px] text-slate-500">
                            {unread > 0 ? `${unread} thông báo chưa đọc` : "Đã đọc hết"}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}