import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Droplets,
    Sprout,
    Bug,
    Scissors,
    Calendar,
    Plus,
    Trash2,
    Image as ImageIcon,
    UploadCloud,
    X,
    Loader2,
    Filter,
    RefreshCw,
    ClipboardList,
    Edit
} from "lucide-react";

import { getDataApi, postDataApi, patchDataApi, deleteDataApi } from "../utils/fetch";
import { useSelector } from "react-redux";
import { selectDevice } from "../redux/selector";

const ENDPOINT = "/product-history";

const getProcessTypeConfig = (type) => {
    switch (type?.toLowerCase()) {
        case "watering":
            return { color: "bg-blue-100 text-blue-700", icon: <Droplets size={16} />, label: "Tưới nước" };
        case "fertilizing":
            return { color: "bg-amber-100 text-amber-700", icon: <Sprout size={16} />, label: "Bón phân" };
        case "pesticide":
            return { color: "bg-red-100 text-red-700", icon: <Bug size={16} />, label: "Phun thuốc" };
        case "pruning":
            return { color: "bg-green-100 text-green-700", icon: <Scissors size={16} />, label: "Cắt tỉa" };
        case "harvest":
            return { color: "bg-orange-100 text-orange-700", icon: <ClipboardList size={16} />, label: "Thu hoạch" };
        default:
            return { color: "bg-gray-100 text-gray-700", icon: <Calendar size={16} />, label: "Hoạt động khác" };
    }
};

const ProductHistoryManager = () => {
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { selectedId: deviceId } = useSelector(selectDevice);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEdit, setCurrentEdit] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [isDragging, setIsDragging] = useState(false);

    // --- CẬP NHẬT STATE BỘ LỌC ---
    const [filterType, setFilterType] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [formData, setFormData] = useState({
        processType: "WATERING",
        process_date: new Date().toISOString().slice(0, 16),
        notes: "",
        image: ""
    });

    const fetchHistory = async () => {
        if (!deviceId) return;
        setLoading(true);
        try {
            const params = {
                device_id: deviceId,
                sort: "ctime", // Sắp xếp mới nhất
                limit: 50 // Tăng giới hạn hiển thị nếu cần
            };

            if (startDate) params.process_date_start = startDate;
            if (endDate) params.process_date_end = endDate;

            const res = await getDataApi(ENDPOINT, params);

            if (res.data?.metadata?.results) {
                setHistories(res.data.metadata.results);
            } else {
                setHistories([]);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            setHistories([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredHistories = useMemo(() => {
        return histories.filter((item) => {
            const matchType = filterType === "ALL" || item.processType === filterType;
            return matchType;
        });
    }, [histories, filterType]);

    // Gọi lại API khi thay đổi deviceId hoặc filter ngày tháng
    useEffect(() => {
        fetchHistory();
    }, [deviceId, startDate, endDate]);

    const processFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chỉ chọn file hình ảnh!");
            return;
        }
        setSelectedFile(file);
        setFormData((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
            e.dataTransfer.clearData();
        }
    }, []);

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setFormData({ ...formData, image: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append("processType", formData.processType);
        data.append("process_date", formData.process_date);
        data.append("notes", formData.notes);

        if (!currentEdit && deviceId) data.append("device_id", deviceId);
        if (selectedFile) data.append("file", selectedFile);

        try {
            if (currentEdit) await patchDataApi(`${ENDPOINT}/${currentEdit._id}`, data);
            else await postDataApi(ENDPOINT, data, { device_id: deviceId });

            setIsModalOpen(false);
            fetchHistory(); // Tải lại dữ liệu sau khi submit
            resetForm();
        } catch (error) {
            console.error("Lỗi lưu dữ liệu:", error);
            alert("Có lỗi xảy ra khi lưu dữ liệu.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa lịch sử này?")) return;
        try {
            await deleteDataApi(`${ENDPOINT}/${id}`);
            fetchHistory();
        } catch (error) {
            console.error("Lỗi xóa:", error);
            alert("Không thể xóa dữ liệu.");
        }
    };

    useEffect(() => {
        return () => {
            if (selectedFile && formData.image?.startsWith("blob:")) URL.revokeObjectURL(formData.image);
        };
    }, [selectedFile]);

    const resetForm = () => {
        setCurrentEdit(null);
        setSelectedFile(null);
        setIsDragging(false);
        setFormData({
            processType: "WATERING",
            process_date: new Date().toISOString().slice(0, 16),
            notes: "",
            image: ""
        });
    };

    const openEdit = (item) => {
        setCurrentEdit(item);
        setSelectedFile(null);
        setFormData({
            processType: item.processType,
            process_date: item.process_date
                ? new Date(item.process_date).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16),
            notes: item.notes,
            image: item.image || ""
        });
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-white p-4 font-sans text-slate-800 rounded-lg">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Nhật Ký Chăm Sóc</h1>
                        <p className="text-sm text-gray-500 mt-1">Quản lý danh sách các hoạt động nông nghiệp</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => {
                                resetForm();
                                setIsModalOpen(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium whitespace-nowrap"
                        >
                            <Plus size={18} /> <span>Thêm mới</span>
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-1 rounded-lg border border-gray-200 mb-6 flex flex-col lg:flex-row gap-3 items-start lg:items-center shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium min-w-fit px-3 py-2">
                        <Filter size={16} /> Bộ lọc:
                    </div>

                    <div className="h-6 w-px bg-gray-200 hidden lg:block"></div>

                    {/* Lọc loại hoạt động */}
                    <div className="w-full lg:w-auto">
                        <select
                            className="w-full p-2 bg-transparent text-sm outline-none font-medium text-gray-700 cursor-pointer hover:bg-gray-50 rounded border lg:border-none border-gray-100"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="ALL">Tất cả hoạt động</option>
                            <option value="WATERING">Tưới nước</option>
                            <option value="FERTILIZING">Bón phân</option>
                            <option value="PESTICIDE">Phun thuốc</option>
                            <option value="PRUNING">Cắt tỉa</option>
                            <option value="HARVEST">Thu hoạch</option>
                            <option value="OTHER">Khác</option>
                        </select>
                    </div>

                    <div className="h-6 w-px bg-gray-200 hidden lg:block"></div>

                    {/* Lọc khoảng thời gian - THAY ĐỔI LỚN TẠI ĐÂY */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto items-center">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs text-gray-400 whitespace-nowrap px-2">Từ:</span>
                            <input
                                type="date"
                                className="w-full sm:w-auto p-2 bg-transparent text-sm outline-none text-gray-600 cursor-pointer hover:bg-gray-50 rounded border border-gray-200 lg:border-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs text-gray-400 whitespace-nowrap px-2">Đến:</span>
                            <input
                                type="date"
                                className="w-full sm:w-auto p-2 bg-transparent text-sm outline-none text-gray-600 cursor-pointer hover:bg-gray-50 rounded border border-gray-200 lg:border-none"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Nút Reset Filter */}
                    {(filterType !== "ALL" || startDate || endDate) && (
                        <button
                            onClick={() => {
                                setFilterType("ALL");
                                setStartDate("");
                                setEndDate("");
                            }}
                            className="ml-auto mr-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Xóa bộ lọc"
                        >
                            <RefreshCw size={16} />
                        </button>
                    )}
                </div>

                {/* Table View */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                            <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                        </div>
                    ) : filteredHistories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <ClipboardList size={40} className="text-gray-400" />
                            </div>
                            <h3 className="text-gray-900 font-medium text-lg">Chưa có dữ liệu</h3>
                            <p className="text-gray-500 text-sm mt-1 mb-6">
                                {filterType !== "ALL" || startDate || endDate
                                    ? "Không tìm thấy kết quả phù hợp với bộ lọc."
                                    : "Bắt đầu ghi lại nhật ký chăm sóc ngay hôm nay."}
                            </p>
                            {filterType === "ALL" && !startDate && !endDate && (
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setIsModalOpen(true);
                                    }}
                                    className="text-indigo-600 font-medium text-sm hover:underline hover:text-indigo-800 flex items-center gap-1"
                                >
                                    <Plus size={16} /> Tạo nhật ký đầu tiên
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 text-gray-600 uppercase text-xs font-semibold tracking-wider border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 w-48">Thời gian</th>
                                        <th className="px-6 py-4 w-40">Hoạt động</th>
                                        <th className="px-6 py-4">Ghi chú</th>
                                        <th className="px-6 py-4 w-24 text-center text-nowrap">Hình ảnh</th>
                                        <th className="px-6 py-4 w-24 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredHistories.map((item) => {
                                        const config = getProcessTypeConfig(item.processType);
                                        const dateObj = new Date(item.process_date);

                                        return (
                                            <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {dateObj.toLocaleDateString("vi-VN", {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric"
                                                            })}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {dateObj.toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
                                                    >
                                                        {config.icon}
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p
                                                        className="text-sm text-gray-600 max-w-md truncate"
                                                        title={item.notes}
                                                    >
                                                        {item.notes || (
                                                            <span className="text-gray-400 italic">
                                                                Không có ghi chú
                                                            </span>
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {item.image ? (
                                                        <div className="relative h-10 w-10 mx-auto rounded overflow-hidden border border-gray-200 group/img">
                                                            <img
                                                                src={item.image}
                                                                alt="Proof"
                                                                className="h-full w-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                                                onClick={() => window.open(item.image, "_blank")}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300">
                                                            <ImageIcon size={20} className="mx-auto" />
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEdit(item)}
                                                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit size={16} color="orange" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 size={16} color="red" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Phần này giữ nguyên, không thay đổi */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                            <h3 className="font-bold text-lg text-gray-800">
                                {currentEdit ? "Cập nhật hoạt động" : "Ghi nhận hoạt động mới"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại hoạt động</label>
                                <select
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                                    value={formData.processType}
                                    onChange={(e) => setFormData({ ...formData, processType: e.target.value })}
                                >
                                    <option value="WATERING">Tưới nước</option>
                                    <option value="FERTILIZING">Bón phân</option>
                                    <option value="PESTICIDE">Phun thuốc</option>
                                    <option value="PRUNING">Cắt tỉa</option>
                                    <option value="HARVEST">Thu hoạch</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                                    value={formData.process_date}
                                    onChange={(e) => setFormData({ ...formData, process_date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                <textarea
                                    rows="3"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                                    placeholder="Chi tiết công việc..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hình ảnh đính kèm
                                </label>
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors relative 
                                    ${
                                        isDragging
                                            ? "border-indigo-500 bg-indigo-50"
                                            : "border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {formData.image ? (
                                        <div className="relative w-full">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="h-48 w-full object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                                            >
                                                <X size={16} />
                                            </button>
                                            <label className="absolute bottom-2 right-2 bg-white/90 text-gray-700 px-3 py-1 rounded-md text-xs font-medium cursor-pointer hover:bg-white shadow-sm flex items-center gap-1">
                                                <Edit size={12} /> Thay đổi
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 text-center pointer-events-none">
                                            <UploadCloud
                                                className={`mx-auto h-12 w-12 ${
                                                    isDragging ? "text-indigo-500" : "text-gray-400"
                                                }`}
                                            />
                                            <div className="flex text-sm text-gray-600 justify-center pointer-events-auto">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                    <span>Tải ảnh lên</span>
                                                    <input
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                    />
                                                </label>
                                                <p className="pl-1">hoặc kéo thả</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG tối đa 5MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                                    disabled={submitting}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="animate-spin" size={18} />}
                                    {currentEdit ? "Lưu thay đổi" : "Tạo mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductHistoryManager;
