import React, { useState, useEffect } from "react";
import {
    Droplets,
    Sprout,
    Bug,
    Scissors,
    Calendar,
    Plus,
    Trash2,
    Edit2,
    Image as ImageIcon,
    Search
} from "lucide-react";

// Import các hàm helper của bạn
// Giả sử file api helper nằm ở thư mục cha utils hoặc services
import { getDataApi, postDataApi, patchDataApi, deleteDataApi } from "../utils/fetch";

// Endpoint cơ sở (giả sử axios config base URL chưa bao gồm path này)
const ENDPOINT = "/product-history";

// Helper map màu sắc và icon (Giữ nguyên)
const getProcessTypeConfig = (type) => {
    switch (type?.toLowerCase()) {
        case "watering":
            return { color: "bg-blue-100 text-blue-600", icon: <Droplets size={18} />, label: "Tưới nước" };
        case "fertilizing":
            return { color: "bg-amber-100 text-amber-600", icon: <Sprout size={18} />, label: "Bón phân" };
        case "pesticide":
            return { color: "bg-red-100 text-red-600", icon: <Bug size={18} />, label: "Phun thuốc" };
        case "pruning":
            return { color: "bg-green-100 text-green-600", icon: <Scissors size={18} />, label: "Cắt tỉa" };
        default:
            return { color: "bg-gray-100 text-gray-600", icon: <Calendar size={18} />, label: type || "Khác" };
    }
};

const ProductHistoryManager = () => {
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deviceId, setDeviceId] = useState("esp32-01");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEdit, setCurrentEdit] = useState(null);

    const [formData, setFormData] = useState({
        processType: "WATERING",
        process_date: new Date().toISOString().slice(0, 16),
        notes: "",
        image: ""
    });

    // --- API HANDLERS (ĐÃ CẬP NHẬT) ---

    const fetchHistory = async () => {
        setLoading(true);
        try {
            // Sử dụng getDataApi: params được truyền vào đối tượng thứ 2
            const res = await getDataApi(ENDPOINT, {
                device_id: deviceId,
                sort: "ctime"
            });

            // Axios trả về res, data thực tế nằm trong res.data.metadata
            if (res.data?.metadata?.results) {
                setHistories(res.data.metadata.results);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            // Có thể thêm toast notification lỗi ở đây
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentEdit) {
                // --- UPDATE (PATCH) ---
                // Patch không cần gửi device_id header theo yêu cầu cũ, chỉ body
                await patchDataApi(`${ENDPOINT}/${currentEdit._id}`, formData);
            } else {
                // --- CREATE (POST) ---
                // Backend yêu cầu header "device_id" khi tạo mới
                // postDataApi(uri, data, headers)
                await postDataApi(ENDPOINT, formData, { device_id: deviceId });
            }

            setIsModalOpen(false);
            fetchHistory(); // Refresh list
            resetForm();
        } catch (error) {
            console.error("Lỗi lưu dữ liệu:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa lịch sử này?")) return;
        try {
            // --- DELETE ---
            await deleteDataApi(`${ENDPOINT}/${id}`);
            fetchHistory();
        } catch (error) {
            console.error("Lỗi xóa:", error);
        }
    };

    // --- EFFECTS & HELPERS ---
    useEffect(() => {
        if (deviceId) fetchHistory();
    }, [deviceId]);

    const resetForm = () => {
        setCurrentEdit(null);
        setFormData({
            processType: "WATERING",
            process_date: new Date().toISOString().slice(0, 16),
            notes: "",
            image: ""
        });
    };

    const openEdit = (item) => {
        setCurrentEdit(item);
        setFormData({
            processType: item.processType,
            process_date: new Date(item.process_date).toISOString().slice(0, 16),
            notes: item.notes,
            image: item.image || ""
        });
        setIsModalOpen(true);
    };

    // --- RENDER (GIỮ NGUYÊN UI) ---
    return (
        <div className="min-h-screen  bg-white p-4 md:p-8 font-sans text-slate-800 rounded-lg">
            <div className="max-w-4xl mx-auto">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-green-800">Nhật Ký Chăm Sóc</h1>
                        <p className="text-sm text-gray-500 mt-1">Theo dõi quá trình phát triển của nông sản</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group flex-1 md:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={deviceId}
                                onChange={(e) => setDeviceId(e.target.value)}
                                placeholder="Nhập Device ID..."
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full text-sm shadow-sm"
                            />
                        </div>
                        <button
                            onClick={() => {
                                resetForm();
                                setIsModalOpen(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all text-sm font-medium"
                        >
                            <Plus size={18} /> <span className="hidden sm:inline">Thêm mới</span>
                        </button>
                    </div>
                </div>

                {/* TIMELINE LIST */}
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Đang tải dữ liệu...</div>
                    ) : histories.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100 ml-10">
                            Không tìm thấy nhật ký nào cho thiết bị này.
                        </div>
                    ) : (
                        histories.map((item) => {
                            const config = getProcessTypeConfig(item.processType);
                            const dateObj = new Date(item.process_date);

                            return (
                                <div
                                    key={item._id}
                                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                                >
                                    {/* ICON */}
                                    <div
                                        className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2 md:translate-x-0 z-10 ${config.color
                                            .replace("text", "bg")
                                            .replace("100", "500")} text-white`}
                                    >
                                        {config.icon}
                                    </div>

                                    {/* CARD */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ml-auto md:ml-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-semibold ${config.color}`}
                                                >
                                                    {config.label}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {dateObj.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </span>
                                            </div>

                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-gray-800 font-semibold text-lg mb-1">
                                            {dateObj.toLocaleDateString("vi-VN", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            })}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                            {item.notes || "Không có ghi chú."}
                                        </p>
                                        {item.image && (
                                            <div className="mt-3 rounded-lg overflow-hidden h-32 w-full bg-gray-100 relative group/img">
                                                <img
                                                    src={item.image}
                                                    alt="Process"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">
                                {currentEdit ? "Cập nhật hoạt động" : "Ghi nhận hoạt động mới"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại hoạt động</label>
                                <select
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    value={formData.process_date}
                                    onChange={(e) => setFormData({ ...formData, process_date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                <textarea
                                    rows="3"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="Chi tiết công việc..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh (URL)</label>
                                <div className="relative">
                                    <ImageIcon
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        size={16}
                                    />
                                    <input
                                        type="text"
                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="https://..."
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
                                >
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
