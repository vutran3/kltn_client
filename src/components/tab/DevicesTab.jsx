import React, { useEffect, useMemo, useState } from "react";
import { getDataApi, postDataApi, patchDataApi, deleteDataApi } from "../../utils/fetch";
import { useDispatch, useSelector } from "react-redux";
import { getMyDevices } from "../../redux/thunks/deviceThunk";
import { selectDevice } from "../../redux/selector";

const initialForm = { device_id: "", device_name: "", apiKey: "", is_active: true };

export default function DevicesTab() {
    const dispatch = useDispatch();
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const { items } = useSelector(selectDevice);

    const filtered = useMemo(() => {
        if (!search) return items;
        const s = search.toLowerCase();
        return items.filter(
            (it) => it.device_id?.toLowerCase().includes(s) || it.device_name?.toLowerCase().includes(s)
        );
    }, [items, search]);

    const load = async () => {
        try {
            setLoading(true);
            dispatch(getMyDevices());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await patchDataApi(`/devices/${editingId}`, form);
            } else {
                await postDataApi("/devices", form);
            }
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
            device_id: it.device_id ?? "",
            device_name: it.device_name ?? "",
            apiKey: it.apiKey ?? "",
            is_active: !!it.is_active
        });
    };

    const onDelete = async (id) => {
        if (!confirm("Xóa thiết bị này?")) return;
        await deleteDataApi(`/devices/${id}`);
        await load();
    };

    const onCancel = () => {
        setEditingId(null);
        setForm(initialForm);
    };

    return (
        <div className="space-y-6">
            {/* Form */}
            <form onSubmit={onSubmit} className="bg-white shadow-sm rounded-xl p-4 grid md:grid-cols-4 gap-3">
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã thiết bị</label>
                    <input
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 border px-3 py-2"
                        value={form.device_id}
                        onChange={(e) => setForm({ ...form, device_id: e.target.value })}
                        placeholder="esp32-01"
                        required
                        disabled={!!editingId}
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị</label>
                    <input
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 border px-3 py-2"
                        value={form.device_name}
                        onChange={(e) => setForm({ ...form, device_name: e.target.value })}
                        placeholder="Thiết bị giám sát"
                        required
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <input
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 border px-3 py-2"
                        value={form.apiKey}
                        onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                        placeholder="abc123"
                    />
                </div>
                <div className="md:col-span-1 flex items-end gap-3">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 border "
                            checked={form.is_active}
                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                        />
                        <span>Hoạt động</span>
                    </label>
                    <div className="ml-auto flex gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {editingId ? "Cập nhật" : "Tạo mới"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg border">
                                Hủy
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 text-nowrap mr-4">
                    {loading ? "Đang tải..." : `Tổng: ${items.length} thiết bị`}
                </div>
                <input
                    placeholder="Tìm kiếm..."
                    className="w-64 rounded-lg border-gray-300 outline-none border px-3 py-2 flex-1"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white shadow-sm rounded-xl">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">Mã</th>
                            <th className="px-4 py-3 text-left font-semibold">Tên</th>
                            <th className="px-4 py-3 text-left font-semibold">API Key</th>
                            <th className="px-4 py-3 text-left font-semibold">Hoạt động</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map((it) => (
                            <tr key={it._id}>
                                <td className="px-4 py-3">{it.device_id}</td>
                                <td className="px-4 py-3">{it.device_name}</td>
                                <td className="px-4 py-3">{it.apiKey || "-"}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={
                                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                                            (it.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")
                                        }
                                    >
                                        {it.is_active ? "Online" : "Offline"}
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
                                <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                                    Không có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
