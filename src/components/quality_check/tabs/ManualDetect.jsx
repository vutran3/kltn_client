import React, { useEffect, useState } from "react";
import MarkdownTable from "../../../components/common/MarkdownTable";
import { convertBufferToUrl } from "../../../utils/file";
import { useSelector } from "react-redux";
import { selectDevice } from "../../../redux/selector";
import { deleteDataApi, getDataApi, postDataApi } from "../../../utils/fetch";
import { IoSearch, IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import Card from "../Card";
import { ImagePicker } from "../ImagePicker";
import { Loader2 } from "lucide-react";

export default function ManualDetectPanel() {
    const { selectedId } = useSelector(selectDevice);

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);

    const [resultImg, setResultImg] = useState("");
    const [resultText, setResultText] = useState("");

    const [history, setHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [sendingMailId, setSendingMailId] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [currentFeedback, setCurrentFeedback] = useState("");

    const handleSendExpert = async (id) => {
        try {
            setSendingMailId(id);

            await postDataApi("/rag/request-expert", { id });

            alert("Đã gửi email yêu cầu chuyên gia xác nhận!");

            fetchHistory(currentPage);
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Lỗi khi gửi yêu cầu.");
        } finally {
            setSendingMailId(null);
        }
    };

    const fetchHistory = async (page) => {
        if (!selectedId) return;
        try {
            setIsLoadingHistory(true);
            const res = await getDataApi(`/rag/history?device_id=${selectedId}&page=${page}&limit=6`);
            if (res && res.data) {
                setHistory(res.data.data);
                setTotalPages(res.data.meta.totalPages);
                setCurrentPage(res.data.meta.page);
            }
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchHistory(1);
        setResultImg("");
        setResultText("");
    }, [selectedId]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchHistory(newPage);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!file || !selectedId) return;

        try {
            setLoading(true);
            const fd = new FormData();
            fd.append("file", file);
            fd.append("device_id", selectedId);

            const { data } = await postDataApi("/rag/manual-detect", fd, {
                "Content-Type": "multipart/form-data",
                Accept: "application/json"
            });

            const advice = data.data.advice ?? "Không có kết quả.";
            const displayUrl = convertBufferToUrl(data.data.image);

            setResultImg(displayUrl || preview);
            setResultText(advice);

            fetchHistory(1);
        } catch (err) {
            setResultText("Lỗi khi detect thủ công. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!confirm("Bạn có chắc muốn xoá kết quả này?")) return;
        try {
            await deleteDataApi(`/rag/history/${id}`);

            if (history.length === 1 && currentPage > 1) fetchHistory(currentPage - 1);
            else fetchHistory(currentPage);
        } catch (err) {
            alert("Lỗi khi xoá.");
        }
    };

    const handleClearAll = async () => {
        if (!confirm("Xoá toàn bộ lịch sử?")) return;
        try {
            await deleteDataApi(`/rag/history`, { data: { device_id: selectedId } });
            setHistory([]);
            setTotalPages(1);
            setCurrentPage(1);
        } catch (err) {
            alert("Lỗi khi xoá tất cả.");
        }
    };

    const getDisplayImage = (item) => {
        if (!item) return preview;
        return convertBufferToUrl(item);
    };

    return (
        <Card title="Kiểm tra thủ công" actions={null}>
            <form className="space-y-6" onSubmit={onSubmit}>
                <ImagePicker
                    label="Ảnh rau cải cần detect"
                    file={file}
                    setFile={setFile}
                    preview={preview}
                    setPreview={(data) => {
                        setPreview(data);
                        setResultImg("");
                        setResultText("");
                    }}
                />
                <div className="w-full flex justify-end">
                    <button
                        type="submit"
                        disabled={!file || loading || !selectedId}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 h-10 disabled:opacity-80"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <IoSearch className="w-4 h-4" />}
                        <span>Kiểm tra</span>
                    </button>
                </div>
            </form>

            {(resultImg || resultText) && (
                <div className="flex gap-4 mt-6">
                    {resultImg && (
                        <div className="flex-1">
                            <div>
                                <div className="text-sm font-medium text-slate-800 mb-2">Ảnh liên quan</div>
                                <img
                                    src={preview}
                                    alt="annotated"
                                    className="w-full max-h-96 object-contain rounded-xl border border-gray-300"
                                />
                            </div>

                            <div className="mt-2">
                                <div className="text-sm font-medium text-slate-800 mb-2">Ảnh được chụp</div>
                                <img
                                    src={resultImg}
                                    alt="annotated"
                                    className="w-full max-h-96 object-contain rounded-xl border border-gray-300"
                                />
                            </div>
                        </div>
                    )}
                    {resultText && (
                        <div className="flex-2">
                            <div className="text-sm font-medium text-slate-800 mb-2">Mô tả / Nhận định</div>
                            <MarkdownTable>{resultText}</MarkdownTable>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-slate-800">Lịch sử kiểm tra</div>
                    {history.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-slate-50 hover:text-red-500 cursor-pointer"
                        >
                            Xoá tất cả
                        </button>
                    )}
                </div>

                {isLoadingHistory ? (
                    <div className="py-8 flex justify-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-sm text-slate-500 py-4">Chưa có lịch sử.</div>
                ) : (
                    <>
                        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {history.map((h) => {
                                const imgSrc = getDisplayImage(h.image);
                                const relativeSrc = getDisplayImage(h.relative_image);
                                const hasFeedback = h.expert_feedback && h.expert_feedback.trim() !== "";
                                const isSent = h.isSend;

                                return (
                                    <li key={h._id} className="border border-gray-300 rounded-xl p-3 bg-white">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={imgSrc}
                                                alt=""
                                                className="w-20 h-20 object-cover rounded-lg border bg-gray-100"
                                            />

                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-slate-500 truncate">
                                                    {new Date(h.detect_date).toLocaleString()}
                                                </div>

                                                <div className="text-xs font-semibold my-1">
                                                    {hasFeedback ? (
                                                        <span className="text-green-600">
                                                            Đã có phản hồi từ chuyên gia
                                                        </span>
                                                    ) : isSent ? (
                                                        <span className="text-yellow-600">
                                                            Đang chờ chuyên gia xác thực
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-400">Chưa xác thực</span>
                                                    )}
                                                </div>

                                                <div className="mt-2 flex gap-2 flex-wrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setResultImg(relativeSrc);
                                                            setPreview(imgSrc);
                                                            let content = h.description;
                                                            if (hasFeedback) {
                                                                content += `\n\n**Ý kiến chuyên gia:**\n${h.expert_feedback}`;
                                                            }
                                                            setResultText(content);
                                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                                        }}
                                                        className="w-12 text-xs px-2 py-1 rounded border hover:bg-slate-50 text-blue-600 font-medium"
                                                    >
                                                        Xem
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteItem(h._id)}
                                                        className="w-12 text-xs px-2 py-1 rounded border hover:bg-slate-50 text-red-500 font-medium"
                                                    >
                                                        Xoá
                                                    </button>

                                                    {!hasFeedback ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSendExpert(h._id)}
                                                            disabled={isSent || sendingMailId === h._id}
                                                            className={`min-w-[100px] flex justify-center items-center gap-1 text-xs px-2 py-1 rounded border font-medium transition-colors ${
                                                                isSent
                                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                                                    : "hover:bg-slate-50 text-purple-600 border-purple-600"
                                                            }`}
                                                        >
                                                            {sendingMailId === h._id ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : isSent ? (
                                                                <span className="text-[10px]">Đã gửi chuyên gia</span>
                                                            ) : (
                                                                <span>Gửi chuyên gia</span>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setCurrentFeedback(h.expert_feedback);
                                                                setShowModal(true);
                                                            }}
                                                            className="min-w-[100px] flex justify-center items-center gap-1 text-xs  py-1 rounded border border-green-600 text-green-600 hover:bg-green-50 font-medium"
                                                        >
                                                            Xem kết quả
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <IoChevronBack className="w-4 h-4" />
                                </button>

                                <span className="text-sm text-slate-600 font-medium px-2">
                                    Trang {currentPage} / {totalPages}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <IoChevronForward className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {showModal && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-[200]">
                                <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 bg-gray-50">
                                        <h3 className="font-semibold text-gray-800 uppercase">Ý kiến chuyên gia</h3>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                                        >
                                            <IoClose size={20} />
                                        </button>
                                    </div>

                                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                                        {currentFeedback ? (
                                            <span>{currentFeedback}</span>
                                        ) : (
                                            <p className="text-gray-400 italic">Nội dung trống.</p>
                                        )}
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="px-4 py-2 border-t border-gray-300 bg-gray-50 flex justify-end">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
}
