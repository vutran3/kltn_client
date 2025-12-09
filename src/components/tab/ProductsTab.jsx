import React, { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import SectionCard from "../card/SectionCard";
import { useDispatch, useSelector } from "react-redux";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../../redux/thunks/productThunk";
import { selectFieldData, selectProductData } from "../../redux/selector";
import { getFields } from "../../redux/thunks/fieldThunk";
import { RiPrinterFill } from "react-icons/ri";
import { FiDownload } from "react-icons/fi";
import { X } from "lucide-react";
import { MAPPING_CRUCIFEROUS_PLANTS } from "../../constants";
import { FaXmark } from "react-icons/fa6";

const initialForm = {
    field: "",
    name: "",
    planting_date: "",
    expected_harvest_date: "",
    actual_harvest_date: "",
    weight_unit: "",
    price_per_unit: "",
    status: "growing",
    image: ""
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

function QRCanvas({ qrProduct }) {
    return (
        <QRCodeCanvas
            id="qrCanvas"
            value={`${window.location.origin}/products/${qrProduct._id}`}
            size={220}
            level="H"
            includeMargin={true}
        />
    );
}

export default function ProductsTab() {
    const dispatch = useDispatch();
    const { items: productList } = useSelector(selectProductData) || {};
    const { items: fieldList } = useSelector(selectFieldData);

    const [file, setFile] = useState(null);
    const [qrProduct, setQrProduct] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        if (!search) return productList;
        const s = search.toLowerCase();
        return productList.filter((it) => it.name?.toLowerCase().includes(s) || it.type?.toLowerCase().includes(s));
    }, [productList, search]);

    const downloadQR = () => {
        const canvas = document.getElementById("qrCanvas");
        const url = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = url;
        link.download = `qr-${qrProduct._id}.png`;
        link.click();
    };

    const printQR = () => {
        const canvas = document.getElementById("qrCanvas");
        const dataUrl = canvas.toDataURL("image/png");

        const w = window.open("");
        w.document.write(`<img src="${dataUrl}" style="width:250px;">`);
        w.print();
        w.close();
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            price_per_unit: form.price_per_unit ? Number(form.price_per_unit) : undefined
        };

        const formData = new FormData();
        formData.append("data", JSON.stringify(payload));
        formData.append("file", file);

        try {
            if (editingId) {
                dispatch(
                    updateProduct({
                        productId: editingId,
                        data: formData
                    })
                );
            } else dispatch(createProduct(formData));

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
            planting_date: it.planting_date ? it.planting_date.substring(0, 10) : "",
            expected_harvest_date: it.expected_harvest_date ? it.expected_harvest_date.substring(0, 10) : "",
            actual_harvest_date: it.actual_harvest_date ? it.actual_harvest_date.substring(0, 10) : "",
            weight_unit: it.weight_unit || "",
            price_per_unit: it.price_per_unit ?? "",
            status: it.status || "growing",
            image: it.image || ""
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
            setFile(null);
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
                                    className="px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 font-semibold"
                                >
                                    Hủy
                                </button>
                            )}
                            <button
                                form="product-form"
                                type="submit"
                                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nông sản</label>
                                <select
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className={inputCls}
                                >
                                    <option value="">-- Chọn nông sản --</option>
                                    {Object.values(MAPPING_CRUCIFEROUS_PLANTS).map((value) => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
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
                                    <select
                                        className={inputCls}
                                        value={form.weight_unit}
                                        onChange={(e) => setForm({ ...form, weight_unit: e.target.value })}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                    </select>
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

                                {file || form.image ? (
                                    <div className="relative w-fit">
                                        <button
                                            onClick={() => (file ? setFile(null) : setForm({ ...form, image: "" }))}
                                            className="absolute flex justify-center items-center top-1 right-1 cursor-pointer text-red-600"
                                        >
                                            <FaXmark />
                                        </button>
                                        <img
                                            value={file ?? ""}
                                            src={file ? URL.createObjectURL(file) : form.image}
                                            alt="product_image"
                                            className="h-[150px] object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label htmlFor="image" className={`cursor-pointer inline-block ${inputCls}`}>
                                            Chọn ảnh nông sản
                                        </label>
                                        <input
                                            id="image"
                                            type="file"
                                            className={inputCls}
                                            onChange={(e) => setFile(e.target.files[0])}
                                            hidden
                                        />
                                    </div>
                                )}
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
                                            <span className="font-semibold">{item.label}</span>
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
                {/* Modal hiển thị mã QR */}
                {showQR && qrProduct && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 h-full">
                        <div className="bg-white p-6 rounded-2xl w-[360px] shadow-2xl space-y-5 animate-fade-in">
                            <h2 className="text-xl font-semibold text-gray-800 text-center">
                                Mã QR - {qrProduct.name}
                            </h2>

                            {/* QR Preview */}
                            <div className="flex justify-center">
                                <QRCanvas qrProduct={qrProduct} />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-between gap-2 pt-3">
                                {/* PRINT */}
                                <button
                                    onClick={printQR}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition shadow-sm"
                                >
                                    <RiPrinterFill size={20} />
                                    In
                                </button>

                                {/* DOWNLOAD */}
                                <button
                                    onClick={downloadQR}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                                >
                                    <FiDownload size={20} />
                                    Tải về
                                </button>

                                {/* CLOSE */}
                                <button
                                    onClick={() => setShowQR(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition shadow-sm"
                                >
                                    <X size={20} />
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                                    <th className="px-4 py-3">Thao tác</th>
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
                                                    "text-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium " +
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
                                        <td className="px-4 py-3">{it.price_per_unit || "Trống"}</td>
                                        <td className="px-4 py-3">{it.weight_unit || "Trống"}</td>
                                        <td className="px-4 py-3 flex items-center justify-center flex-nowrap gap-2">
                                            {it.status === "selling" && (
                                                <button
                                                    onClick={() => {
                                                        setQrProduct(it);
                                                        setShowQR(true);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-nowrap"
                                                >
                                                    Tạo QR
                                                </button>
                                            )}

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
