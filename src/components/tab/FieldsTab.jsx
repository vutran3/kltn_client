import React, { useEffect, useMemo, useState } from "react";
import { postDataApi, patchDataApi, deleteDataApi } from "../../utils/fetch";
import SectionCard from "../card/SectionCard";
import { useDispatch, useSelector } from "react-redux";
import { selectDevice, selectFieldData } from "../../redux/selector";
import { getFields } from "../../redux/thunks/fieldThunk";
import { getDevices, getUnassignedDevices } from "../../redux/thunks/deviceThunk";

const initialForm = {
    name: "",
    established_date: "",
    description: "",
    total_area: "",
    field_type: "",
    is_active: true,
    devices: []
};

const inputCls =
    "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 ";

export default function FieldsTab() {
    const dispatch = useDispatch();
    const { items: fieldList } = useSelector(selectFieldData);
    const { unassigned: deviceList } = useSelector(selectDevice);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // --- Tính toán danh sách thiết bị hiển thị ---
    const availableDevices = useMemo(() => {
        let list = [...deviceList];
        if (editingId) {
            const currentField = fieldList.find((f) => f._id === editingId);
            if (currentField && Array.isArray(currentField.devices)) {
                const currentDevices = currentField.devices.filter((d) => typeof d === "object");
                list = [...list, ...currentDevices];
            }
        }
        const uniqueList = [];
        const map = new Map();
        for (const item of list) {
            if (!item?._id) continue;
            if (!map.has(item._id)) {
                map.set(item._id, true);
                uniqueList.push(item);
            }
        }
        return uniqueList;
    }, [deviceList, editingId, fieldList]);

    const filtered = useMemo(() => {
        if (!search) return fieldList;
        const s = search.toLowerCase();
        return fieldList.filter((it) => it.name?.toLowerCase().includes(s) || it.field_type?.toLowerCase().includes(s));
    }, [fieldList, search]);

    const onSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            total_area: form.total_area ? Number(form.total_area) : undefined,
            established_date: form.established_date || undefined
        };
        try {
            if (editingId) await patchDataApi(`/fields/${editingId}`, payload);
            else await postDataApi("/fields", payload);

            setForm(initialForm);
            setEditingId(null);

            await load();
        } catch (err) {
            alert(err?.response?.data?.message || "Error");
        }
    };

    const onEdit = (it) => {
        setEditingId(it._id);
        setForm({
            name: it.name || "",
            established_date: it.established_date ? it.established_date.substring(0, 10) : "",
            description: it.description || "",
            total_area: it.total_area ?? "",
            field_type: it.field_type || "",
            is_active: !!it.is_active,
            devices: (it.devices || []).map((d) => (typeof d === "string" ? d : d?._id))
        });
    };

    const onDelete = async (id) => {
        if (!confirm("Xóa nơi trồng này?")) return;
        await deleteDataApi(`/fields/${id}`);
        await load();
        setForm(initialForm);
        setEditingId(null);
    };

    const onCancel = () => {
        setEditingId(null);
        setForm(initialForm);
    };

    const toggleDevice = (id) => {
        setForm((f) => {
            const set = new Set(f.devices);
            set.has(id) ? set.delete(id) : set.add(id);
            return { ...f, devices: Array.from(set) };
        });
    };

    const load = async () => {
        try {
            setLoading(true);
            dispatch(getFields());
            dispatch(getUnassignedDevices());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        fieldList &&
        deviceList && (
            <div className="space-y-6">
                <SectionCard
                    title={editingId ? "Cập nhật nơi trồng" : "Thêm nơi trồng"}
                    subtitle="Mô tả chung, thiết bị gắn kèm và trạng thái hoạt động"
                    actions={
                        <div className="flex gap-2">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                            )}
                            <button
                                form="field-form"
                                type="submit"
                                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                {editingId ? "Lưu thay đổi" : "Tạo mới"}
                            </button>
                        </div>
                    }
                >
                    <form id="field-form" onSubmit={onSubmit} className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 lg:col-span-7 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên nơi trồng
                                    </label>
                                    <input
                                        className={inputCls}
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                        placeholder="Khai báo nơi trồng"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày khai báo
                                    </label>
                                    <input
                                        type="date"
                                        className={inputCls}
                                        value={form.established_date}
                                        onChange={(e) => setForm({ ...form, established_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tổng diện tích (m²)
                                    </label>
                                    <input
                                        type="number"
                                        className={inputCls}
                                        value={form.total_area}
                                        onChange={(e) => setForm({ ...form, total_area: e.target.value })}
                                        placeholder="vd: 1200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                                    <input
                                        className={inputCls}
                                        value={form.field_type}
                                        onChange={(e) => setForm({ ...form, field_type: e.target.value })}
                                        placeholder="nhà kính / ruộng / vườn…"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    rows={4}
                                    className={inputCls}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Ghi chú khí hậu, hệ thống tưới, giống cây…"
                                />
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Thiết bị</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableDevices.map((d) => {
                                        const checked = form.devices.includes(d._id);
                                        return (
                                            <button
                                                key={d._id}
                                                type="button"
                                                onClick={() => toggleDevice(d._id)}
                                                className={
                                                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition " +
                                                    (checked
                                                        ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")
                                                }
                                            >
                                                <span
                                                    className={
                                                        "h-2 w-2 rounded-full " +
                                                        (checked ? "bg-indigo-600" : "bg-gray-300")
                                                    }
                                                />
                                                {d.device_name || d.device_id}
                                            </button>
                                        );
                                    })}
                                    {availableDevices.length === 0 && (
                                        <span className="text-sm text-gray-500">Không có thiết bị khả dụng</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 italic">
                                    * Chỉ hiện thiết bị chưa sử dụng hoặc đang gắn ở đây.
                                </p>
                            </div>
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={form.is_active}
                                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                />
                                <span className="text-sm">Hoạt động</span>
                            </label>
                        </div>
                    </form>
                </SectionCard>

                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 text-nowrap mr-4 font-semibold">
                        {loading ? "Đang tải..." : `Tổng: ${fieldList.length} nơi trồng`}
                    </div>
                    <input
                        placeholder="Tìm theo tên/loại…"
                        className={inputCls + " w-72"}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-visible">
                    <div className="overflow-visible">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Tên</th>
                                    <th className="px-4 py-3 text-left font-semibold">Loại</th>
                                    <th className="px-4 py-3 text-left font-semibold">Thiết bị</th>
                                    <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((it, index) => (
                                    <tr key={it._id} className="hover:bg-gray-50/60">
                                        <td className="px-4 py-3 font-medium text-[#333]">{it.name}</td>
                                        <td className="px-4 py-3 font-medium text-[#333]">{it.field_type || "-"}</td>
                                        <td className="px-4 py-3 max-w-[300px]">
                                            {Array.isArray(it.devices) && it.devices.length > 0 ? (
                                                (() => {
                                                    const allNames = it.devices.map((d) =>
                                                        typeof d === "string"
                                                            ? d
                                                            : d?.device_name || d?.device_id || "Unknown"
                                                    );
                                                    const DISPLAY_LIMIT = 2;
                                                    const visibleNames = allNames.slice(0, DISPLAY_LIMIT);
                                                    const hiddenNames = allNames.slice(DISPLAY_LIMIT);
                                                    const remainingCount = hiddenNames.length;

                                                    return (
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            {visibleNames.map((name, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-flex items-center px-2 py-1 rounded bg-gray-100 border border-gray-200 text-xs font-medium text-gray-700 whitespace-nowrap"
                                                                >
                                                                    {name}
                                                                </span>
                                                            ))}
                                                            {remainingCount > 0 && (
                                                                <div className="relative group">
                                                                    <span className="cursor-pointer inline-flex items-center px-2 py-1 rounded bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-600 whitespace-nowrap">
                                                                        +{remainingCount} khác
                                                                    </span>

                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 p-3 bg-white rounded-xl shadow-xl border border-gray-200 z-[100] hidden group-hover:block animate-fade-in-up">
                                                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45"></div>

                                                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider">
                                                                            Thiết bị khác
                                                                        </p>
                                                                        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                                                                            {hiddenNames.map((name, i) => (
                                                                                <div
                                                                                    key={i}
                                                                                    className="text-xs text-gray-700 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 truncate hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                                                                >
                                                                                    {name}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={
                                                    "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium " +
                                                    (it.is_active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600")
                                                }
                                            >
                                                {it.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button
                                                onClick={() => onEdit(it)}
                                                className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => onDelete(it._id)}
                                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {!loading && filtered.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-10 text-center text-gray-500" colSpan={5}>
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                )}
                                {loading && (
                                    <tr>
                                        <td className="px-4 py-6 text-gray-400" colSpan={5}>
                                            Đang tải…
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    );
}
