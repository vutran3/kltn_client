import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Loader2,
    CheckCircle,
    Sprout,
    BrainCircuit,
    Send,
    ShieldCheck,
    ShieldAlert,
    ZoomIn,
    X,
    Image as ImageIcon
} from "lucide-react";
import { getDataApi, putDataApi } from "../utils/fetch";
import AnnotatedImage from "../components/quality_check/AnnotatedImage";

// --- ImageModal giữ nguyên ---
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
                alt="Zoomed"
                className="max-w-full max-h-screen object-contain rounded shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

const ExpertAutoReviewPage = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [zoomImage, setZoomImage] = useState(null);

    // Xác định trạng thái đã xác thực
    const isVerified = data?.expert_feedback && data?.expert_feedback.trim() !== "";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getDataApi(`/health-check/get/${id}`);
                const record = res?.data?.metadata || res?.data;

                setData(record);
                if (record?.expert_feedback) {
                    setFeedback(record.expert_feedback);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async () => {
        // Chặn submit nếu đã xác thực
        if (isVerified) return;

        if (!feedback.trim()) return alert("Vui lòng nhập nội dung đánh giá.");
        try {
            setSubmitting(true);
            await putDataApi(`/health-check/feedback/${id}`, { feedback });
            setData((prev) => ({ ...prev, expert_feedback: feedback }));
        } catch (error) {
            alert("Lỗi khi lưu đánh giá. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    if (!data)
        return <div className="flex h-screen items-center justify-center text-red-500">Không tìm thấy dữ liệu.</div>;

    const imageUrl = data.image_predetect?.image_url;
    const aiDesc = data.ai_description || data.predicting_description;
    const aiBoxes = data?.ai_prediction?.boxes || [];
    const imgWidth = data?.ai_prediction?.image_width;
    const imgHeight = data?.ai_prediction?.image_height;

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white shadow-sm rounded-t-2xl border-b border-slate-100 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-red-700 to-red-600 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 opacity-90 mb-1 text-sm font-medium tracking-wide uppercase">
                                <Sprout className="w-4 h-4" /> Hệ thống giám sát tự động
                            </div>
                            <h1 className="text-2xl font-bold">Thẩm Định Tự Động</h1>
                        </div>
                        <div
                            className={`px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/20 ${
                                isVerified ? "bg-green-500 text-white" : "bg-white text-red-600"
                            }`}
                        >
                            {isVerified ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                            <span className="font-bold uppercase tracking-wider text-sm">
                                {isVerified ? "Đã xác thực" : "Chưa xác thực"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-8">
                    {/* Phần 1: Hình ảnh (Giữ nguyên) */}
                    <div>
                        <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg mb-4 pb-2 border-b border-slate-100">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                1
                            </span>
                            Hình ảnh phân tích
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-slate-500 uppercase ml-1">
                                    Ảnh gốc từ Camera
                                </span>
                                <div
                                    className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group cursor-zoom-in shadow-sm hover:shadow-md transition-shadow"
                                    onClick={() => imageUrl && setZoomImage(imageUrl)}
                                >
                                    {imageUrl ? (
                                        <>
                                            <img
                                                src={imageUrl}
                                                alt="Original"
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <ZoomIn className="text-white w-8 h-8 drop-shadow-lg" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                            <ImageIcon className="w-8 h-8 opacity-20" />
                                            <span className="text-sm">Không có ảnh</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-orange-600 uppercase ml-1 flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" /> Vùng phát hiện
                                </span>
                                <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    {imageUrl && aiBoxes.length > 0 ? (
                                        <>
                                            <AnnotatedImage
                                                src={imageUrl}
                                                boxes={aiBoxes}
                                                originalSize={
                                                    imgWidth && imgHeight
                                                        ? { width: imgWidth, height: imgHeight }
                                                        : null
                                                }
                                                fullView={true}
                                                onZoom={(src) => setZoomImage(src)}
                                                color="#f97316"
                                            />
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                                                {aiBoxes.length} vùng
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                                            <span className="text-sm">AI không phát hiện bất thường</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Phần 2: AI Detect (Giữ nguyên) */}
                    <div>
                        <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg mb-3 pb-2 border-b border-slate-100">
                            <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                2
                            </span>
                            <BrainCircuit className="w-4 h-4 text-purple-600" />
                            Kết quả AI Detect
                        </h3>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {aiDesc || "Không có mô tả chi tiết từ AI."}
                        </div>
                    </div>

                    {/* Phần 3: Form đánh giá - Đã cập nhật logic Disabled */}
                    <div
                        className={`bg-slate-50/80 p-6 rounded-2xl border border-slate-200 transition-all duration-300 ${
                            isVerified ? "opacity-75 grayscale-[0.5]" : ""
                        }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-lg">
                                <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                    3
                                </span>
                                Kết luận chuyên gia
                            </h3>
                            {isVerified && (
                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Đã hoàn tất
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="lg:col-span-2">
                                <div
                                    className={`bg-white p-1 rounded-xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all ${
                                        isVerified ? "bg-slate-100 cursor-not-allowed" : ""
                                    }`}
                                >
                                    <textarea
                                        rows={6}
                                        className={`w-full p-4 rounded-lg outline-none text-slate-700 text-sm leading-relaxed resize-none ${
                                            isVerified ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""
                                        }`}
                                        placeholder={
                                            isVerified
                                                ? "Đã có đánh giá"
                                                : "Nhập đánh giá chi tiết: Tên bệnh, nguyên nhân, biện pháp xử lý..."
                                        }
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        disabled={isVerified} // Disable input
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex flex-col justify-end">
                                {!isVerified && (
                                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                                        * Hành động này sẽ gửi email thông báo đến người dùng và cập nhật trạng thái bản
                                        ghi thành <strong className="text-green-600">ĐÃ XÁC THỰC</strong>.
                                    </p>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !feedback.trim() || isVerified} // Disable button
                                    className={`w-full group py-3 px-6 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                                        isVerified
                                            ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                                            : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 active:scale-[0.98]"
                                    } disabled:opacity-70 disabled:cursor-not-allowed`}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> Đang lưu...
                                        </>
                                    ) : isVerified ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" /> Đã gửi xác nhận
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" /> Xác nhận & Gửi
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ImageModal src={zoomImage} onClose={() => setZoomImage(null)} />
        </div>
    );
};

export default ExpertAutoReviewPage;
