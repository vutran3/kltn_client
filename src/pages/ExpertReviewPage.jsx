import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
    Loader2,
    CheckCircle,
    AlertCircle,
    Sprout,
    BrainCircuit,
    Send,
    Image as ImageIcon,
    X,
    ZoomIn
} from "lucide-react";
import { getDataApi, putDataApi } from "../utils/fetch";
import { arrayBufferToBase64 } from "../utils/file";

const ImageModal = ({ src, onClose }) => {
    if (!src) return null;
    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
            <img
                src={src}
                alt="Zoomed Preview"
                className="max-w-full max-h-screen object-contain rounded shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

const AIDescriptionViewer = ({ content }) => {
    if (!content) return <p className="text-gray-400 italic">Không có dữ liệu mô tả.</p>;

    const rows = content.split("\n").filter((line) => line.trim() !== "" && !line.includes("---"));

    return (
        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden text-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <tbody>
                        {rows.map((row, index) => {
                            const cells = row.split("|").filter((cell) => cell.trim() !== "");
                            if (cells.length === 0) return null;

                            const isHeader = index === 0;
                            return (
                                <tr
                                    key={index}
                                    className={
                                        isHeader
                                            ? "bg-slate-100 font-semibold text-slate-700"
                                            : "border-t border-slate-200 hover:bg-slate-50"
                                    }
                                >
                                    {cells.map((cell, idx) => (
                                        <td
                                            key={idx}
                                            className={`p-3 align-top text-slate-600 ${
                                                isHeader ? "whitespace-nowrap" : "min-w-[250px]"
                                            }`}
                                        >
                                            {cell.replace(/\*\*(.*?)\*\*/g, "$1").trim()}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {rows.length === 0 && <div className="p-4 whitespace-pre-wrap">{content}</div>}
        </div>
    );
};

const ExpertReviewPage = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [zoomImage, setZoomImage] = useState(null);
    const isMounted = useRef(true);

    const fetchData = async () => {
        try {
            const res = await getDataApi(`/rag/${id}`);
            if (isMounted.current) {
                setData(res.data.data);
                if (res.data.data.expert_feedback) {
                    setFeedback(res.data.data.expert_feedback);
                    setIsSuccess(true);
                }
            }
        } catch (error) {
            alert("Không tìm thấy dữ liệu hoặc lỗi kết nối.");
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        return () => {
            isMounted.current = false;
        };
    }, [id]);

    const handleSubmit = async () => {
        if (!feedback.trim()) return alert("Vui lòng nhập nội dung đánh giá.");

        try {
            setSubmitting(true);
            await putDataApi(`/rag/${id}/feedback`, {
                feedback: feedback
            });
            setIsSuccess(true);
        } catch (error) {
            console.error(error);
            alert("Lỗi khi lưu đánh giá. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="text-slate-500 font-medium">Đang tải dữ liệu...</span>
                </div>
            </div>
        );

    if (!data)
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
                <AlertCircle className="w-12 h-12 text-red-400 mb-2" />
                <div className="text-lg text-slate-600 font-medium">Không tìm thấy dữ liệu báo cáo.</div>
            </div>
        );

    const imageSrc = data.image?.data ? `data:image/jpeg;base64,${arrayBufferToBase64(data.image.data)}` : null;
    const relatedImageSrc = data.relative_image?.data
        ? `data:image/jpeg;base64,${arrayBufferToBase64(data.relative_image.data)}`
        : null;

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-sm rounded-t-2xl border-b border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 sm:p-8 text-white flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 opacity-90 mb-2 text-sm font-medium tracking-wide uppercase">
                                <Sprout className="w-4 h-4" /> Hệ thống giám sát nông nghiệp
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Đánh Giá Chuyên Gia</h1>
                            <p className="mt-2 text-blue-100 flex items-center gap-2 text-sm">
                                <span>
                                    Mã thiết bị:
                                    <span className="font-mono bg-blue-800/30 px-2 py-0.5 rounded">
                                        {data.device_id}
                                    </span>
                                </span>
                                <span>•</span>
                                <span>Ngày phát hiện: {new Date(data.detect_date).toLocaleString("vi-VN")}</span>
                            </p>
                        </div>
                        <div
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                                isSuccess ? "bg-green-500 text-white" : "bg-yellow-400 text-yellow-900"
                            }`}
                        >
                            {isSuccess ? "Đã hoàn thành" : "Chờ xử lý"}
                        </div>
                    </div>
                </div>
                <div className="bg-white shadow-xl rounded-b-2xl overflow-hidden grid lg:grid-cols-12 items-start">
                    <div className="lg:col-span-7 p-6 sm:p-8 border-r border-slate-100 space-y-8">
                        <div>
                            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg mb-4">
                                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                    1
                                </span>
                                Hình ảnh phân tích
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Ảnh thực tế</p>
                                    <div
                                        className="group relative w-full aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner cursor-zoom-in"
                                        onClick={() => imageSrc && setZoomImage(imageSrc)}
                                    >
                                        {imageSrc ? (
                                            <>
                                                <img
                                                    src={imageSrc}
                                                    alt="Real Plant"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <ZoomIn className="text-white w-8 h-8 drop-shadow-lg" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400">
                                                Không có ảnh
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Ảnh liên quan */}
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Ảnh bệnh tương tự</p>
                                    <div
                                        className="group relative w-full aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner cursor-zoom-in"
                                        onClick={() => relatedImageSrc && setZoomImage(relatedImageSrc)}
                                    >
                                        {relatedImageSrc ? (
                                            <>
                                                <img
                                                    src={relatedImageSrc}
                                                    alt="Related"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <ZoomIn className="text-white w-8 h-8 drop-shadow-lg" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                                <ImageIcon className="w-8 h-8 opacity-20" />
                                                <span className="text-xs">Chưa có dữ liệu</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: AI Diagnosis */}
                        <div>
                            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg mb-4">
                                <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                    2
                                </span>
                                <BrainCircuit className="w-5 h-5 text-purple-600" />
                                Phân tích từ AI
                            </h3>
                            <AIDescriptionViewer content={data.description} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Expert Feedback Form */}
                    {/* SỬA ĐỔI: Bỏ flex-col và flex-1. Bỏ height 100%. */}
                    <div className="lg:col-span-5 bg-slate-50/50 p-6 sm:p-8">
                        {/* SỬA ĐỔI QUAN TRỌNG: Sticky giúp form trượt theo khi cuộn bảng dài */}
                        <div className="sticky top-6">
                            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg mb-2">
                                <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                    3
                                </span>
                                Kết luận chuyên gia
                            </h3>
                            <p className="text-slate-500 text-sm mb-6">
                                Vui lòng cung cấp nhận định chính xác về bệnh và các biện pháp xử lý cụ thể cho nông
                                dân.
                            </p>

                            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-200">
                                <textarea
                                    // Giảm số dòng mặc định xuống một chút để gọn hơn
                                    rows={10}
                                    className="w-full p-4 rounded-lg outline-none text-slate-700 placeholder:text-slate-400 text-sm leading-relaxed resize-none"
                                    placeholder="- Tên bệnh chính xác: ...&#10;- Nguyên nhân: ...&#10;- Biện pháp hóa học: ...&#10;- Biện pháp canh tác: ..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    disabled={isSuccess}
                                ></textarea>
                            </div>

                            {/* Nút gửi nằm ngay dưới textarea, không bị đẩy xuống đáy nữa */}
                            <div className="mt-4">
                                {isSuccess ? (
                                    <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        </div>
                                        <h4 className="font-bold text-green-800">Đã gửi đánh giá</h4>
                                        <p className="text-green-600 text-sm mt-1">
                                            Cảm ơn đóng góp của bạn cho hệ thống.
                                        </p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || !feedback.trim()}
                                        className="w-full group bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                                Gửi kết quả xác nhận
                                            </>
                                        )}
                                    </button>
                                )}
                                <p className="text-xs text-slate-400 text-center mt-4">
                                    * Xác nhận của bạn sẽ được gửi trực tiếp đến ứng dụng của người dùng.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ImageModal src={zoomImage} onClose={() => setZoomImage(null)} />
        </div>
    );
};

export default ExpertReviewPage;
