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
                        {/* Thông tin chính */}
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
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày thành lập
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

                        {/* Thiết bị & trạng thái */}
                        <div className="col-span-12 lg:col-span-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Thiết bị</label>
                                <div className="flex flex-wrap gap-2">
                                    {deviceList.map((d) => {
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
                                                {d.device_name}
                                            </button>
                                        );
                                    })}
                                    {deviceList.length === 0 && (
                                        <span className="text-sm text-gray-500">Chưa có thiết bị</span>
                                    )}
                                </div>
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

                {/* Toolbar */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 text-nowrap mr-4">
                        {loading ? "Đang tải..." : `Tổng: ${fieldList.length} nơi trồng`}
                    </div>
                    <input
                        placeholder="Tìm theo tên/loại…"
                        className={inputCls + " w-72"}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Table */}
                <div className="overflow-hidden bg-white rounded-2xl border border-gray-200/70 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Tên</th>
                                    <th className="px-4 py-3 text-left font-semibold">Loại</th>
                                    <th className="px-4 py-3 text-left font-semibold">Thiết bị</th>
                                    <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((it) => (
                                    <tr key={it._id} className="hover:bg-gray-50/60">
                                        <td className="px-4 py-3">{it.name}</td>
                                        <td className="px-4 py-3">{it.field_type || "-"}</td>
                                        <td className="px-4 py-3">
                                            {Array.isArray(it.devices) && it.devices.length
                                                ? it.devices
                                                      .map((d) =>
                                                          typeof d === "string" ? d : d?.device_name || d?.device_id
                                                      )
                                                      .join(", ")
                                                : "-"}
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
