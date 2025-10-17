import React, { useEffect, useMemo, useState } from "react";
import SectionCard from "../card/SectionCard";
import { useDispatch, useSelector } from "react-redux";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../../redux/thunks/productThunk";
import { selectFieldData, selectProductData } from "../../redux/selector";
import { getFields } from "../../redux/thunks/fieldThunk";

const initialForm = {
    field: "",
    name: "",
    type: "",
    planting_date: "",
    expected_harvest_date: "",
    actual_harvest_date: "",
    weight_unit: "",
    price_per_unit: "",
    status: "growing"
};

const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none";
const segBtn =
    "px-3.5 py-2 rounded-lg text-sm border transition " +
    "data-[active=true]:bg-indigo-600 data-[active=true]:text-white " +
    "data-[active=true]:border-indigo-600 hover:bg-indigo-50";

const status = [
    { value: "growing", label: "Đang trồng" },
    { value: "harvesting", label: "Thu hoạch" },
    { value: "selling", label: "Mua bán" }
];

export default function ProductsTab() {
    const dispatch = useDispatch();
    const { items: productList } = useSelector(selectProductData);
    const { items: fieldList } = useSelector(selectFieldData);

    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        if (!search) return productList;
        const s = search.toLowerCase();
        return productList.filter((it) => it.name?.toLowerCase().includes(s) || it.type?.toLowerCase().includes(s));
    }, [productList, search]);

    const onSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            price_per_unit: form.price_per_unit ? Number(form.price_per_unit) : undefined
        };
        try {
            if (editingId) {
                dispatch(
                    updateProduct({
                        productId: editingId,
                        data: payload
                    })
                );
            } else dispatch(createProduct(payload));

            load();

            setEditingId(null);
            setForm(initialForm);
        } catch (err) {
            alert(err?.response?.data?.message || "Error");
        }
    };

    const onEdit = (it) => {
        setEditingId(it._id);
        setForm({
            field: typeof it.field === "string" ? it.field : it.field?._id || "",
            name: it.name || "",
            type: it.type || "",
            planting_date: it.planting_date ? it.planting_date.substring(0, 10) : "",
            expected_harvest_date: it.expected_harvest_date ? it.expected_harvest_date.substring(0, 10) : "",
            actual_harvest_date: it.actual_harvest_date ? it.actual_harvest_date.substring(0, 10) : "",
            weight_unit: it.weight_unit || "",
            price_per_unit: it.price_per_unit ?? "",
            status: it.status || "growing"
        });
    };

    const onDelete = async (id) => {
        if (!confirm("Xóa nông sản này?")) return;
        dispatch(deleteProduct(id));

        load();
        setEditingId(null);
        setForm(initialForm);
    };

    const onCancel = () => {
        setEditingId(null);
        setForm(initialForm);
    };

    const load = async () => {
        try {
            setLoading(true);
            dispatch(getProducts());
            dispatch(getFields());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        fieldList &&
        productList && (
            <div className="space-y-6">
                <SectionCard
                    title={editingId ? "Cập nhật nông sản" : "Thêm nông sản"}
                    subtitle="Nhập thông tin cơ bản và lịch thu hoạch"
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
                                form="product-form"
                                type="submit"
                                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                {editingId ? "Lưu thay đổi" : "Tạo mới"}
                            </button>
                        </div>
                    }
                >
                    <form id="product-form" onSubmit={onSubmit} className="grid grid-cols-12 gap-4">
                        {/* Cột trái */}
                        <div className="col-span-12 lg:col-span-6 space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Nơi trồng</label>
                                </div>
                                <select
                                    className={inputCls}
                                    value={form.field}
                                    onChange={(e) => setForm({ ...form, field: e.target.value })}
                                    required
                                >
                                    <option value="">-- Chọn nơi trồng --</option>
                                    {fieldList.map((field) => (
                                        <option key={field._id} value={field._id}>
                                            {field.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên nông sản</label>
                                    <input
                                        className={inputCls}
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Dâu tây, xà lách…"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Loại nông sản
                                    </label>
                                    <input
                                        className={inputCls}
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        placeholder="rau/củ/quả…"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-nowrap">
                                        Ngày gieo trồng
                                    </label>
                                    <input
                                        type="date"
                                        className={inputCls}
                                        value={form.planting_date}
                                        onChange={(e) => setForm({ ...form, planting_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-nowrap">
                                        Thu hoạch dự kiến
                                    </label>
                                    <input
                                        type="date"
                                        className={inputCls}
                                        value={form.expected_harvest_date}
                                        onChange={(e) => setForm({ ...form, expected_harvest_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-nowrap">
                                        Thu hoạch thực tế
                                    </label>
                                    <input
                                        type="date"
                                        className={inputCls}
                                        value={form.actual_harvest_date}
                                        onChange={(e) => setForm({ ...form, actual_harvest_date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cột phải */}
                        <div className="col-span-12 lg:col-span-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Đơn vị cân nặng
                                    </label>
                                    <input
                                        className={inputCls}
                                        value={form.weight_unit}
                                        onChange={(e) => setForm({ ...form, weight_unit: e.target.value })}
                                        placeholder="kg, g…"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá/đơn vị</label>
                                    <input
                                        type="number"
                                        className={inputCls}
                                        value={form.price_per_unit}
                                        onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })}
                                        placeholder="vd: 25000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh nông sản</label>
                                <input id="image" type="file" className={inputCls} onChange={(e) => {}} hidden />
                                <label htmlFor="image" className={`inline-block ${inputCls}`}>
                                    Chọn ảnh nông sản
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200/80 p-1 bg-gray-50 w-full">
                                    {status.map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            data-active={form.status === item.value}
                                            onClick={() => setForm({ ...form, status: item.value })}
                                            className={segBtn + " flex-1"}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </form>
                </SectionCard>

                {/* Toolbar */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 text-nowrap mr-4">
                        {loading ? "Đang tải..." : `Tổng: ${productList.length} nông sản`}
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
                                    <th className="px-4 py-3 text-left font-semibold text-nowrap">Tên</th>
                                    <th className="px-4 py-3 text-left font-semibold text-nowrap">Nơi trồng</th>
                                    <th className="px-4 py-3 text-left font-semibold text-nowrap">Trạng thái</th>
                                    <th className="px-4 py-3 text-left font-semibold text-nowrap">Giá</th>
                                    <th className="px-4 py-3 text-left font-semibold text-nowrap">Đơn vị</th>

                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((it) => (
                                    <tr key={it._id} className="hover:bg-gray-50/60">
                                        <td className="px-4 py-3">{it.name}</td>
                                        <td className="px-4 py-3">
                                            {typeof it.field === "string" ? it.field : it.field?.name || "-"}
                                        </td>
                                        <td className="px-4 py-3 capitalize">
                                            <span
                                                className={
                                                    "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium " +
                                                    (it.status === "growing"
                                                        ? "bg-green-100 text-green-700"
                                                        : it.status === "harvesting"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-indigo-100 text-indigo-700")
                                                }
                                            >
                                                {status.find((status) => status.value === it.status)?.label || "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{it.price_per_unit ?? "-"}</td>
                                        <td className="px-4 py-3">{it.weight_unit ?? "-"}</td>
                                        <td className="px-4 py-3 text-right flex items-center flex-nowrap gap-2">
                                            <button
                                                onClick={() => onEdit(it)}
                                                className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 cursor-pointer"
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
