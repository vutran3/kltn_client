import { Upload, FileText, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

import {
    loadKnowledgeHistory,
    saveKnowledgeHistoryItem,
    clearKnowledgeHistory,
    removeKnowledgeHistoryItem
} from "../../../utils/knowledgeHistory";
import { postDataApi } from "../../../utils/fetch";
import Card from "../../../components/quality_check/Card";
import { ImagePicker } from "../../../components/quality_check/ImagePicker";

export default function UploadKnowledgePanel() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [content, setContent] = useState(() => ``);
    const [loading, setLoading] = useState(false);
    const [serverMsg, setServerMsg] = useState("");
    const [history, setHistory] = useState([]);
    useEffect(() => {
        setHistory(loadKnowledgeHistory());
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setServerMsg("");
        if (!file) {
            setServerMsg("Vui lòng chọn ảnh.");
            return;
        }
        if (!content.trim()) {
            setServerMsg("Vui lòng nhập nội dung tri thức.");
            return;
        }
        try {
            setLoading(true);
            const fd = new FormData();
            fd.append("file", file);
            fd.append("content", content);

            const { data } = await postDataApi("/rag/image", fd, {
                "Content-Type": "multipart/form-data",
                Accept: "application/json"
            });

            setServerMsg(data?.message || "Tải lên tri thức thành công.");

            const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const item = {
                id,
                ts: Date.now(),
                preview,
                content
            };
            const newList = saveKnowledgeHistoryItem(item);
            if (newList) setHistory(newList);

            setFile(null);
            setContent("");
            setPreview("");
        } catch (err) {
            setServerMsg("Lỗi khi upload tri thức. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Thêm dữ liệu bệnh về cây" actions={null}>
            <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                    <ImagePicker
                        label="Ảnh minh họa / mẫu bệnh"
                        file={file}
                        setFile={setFile}
                        preview={preview}
                        setPreview={setPreview}
                    />
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-800">Nội dung tri thức</div>
                        <div className="rounded-2xl border border-gray-300 bg-white overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-300 bg-slate-50">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm text-slate-700">
                                    Theo cấu trúc mẫu (có thể dán từ tài liệu của bạn)
                                </span>
                            </div>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={14}
                                className="w-full p-3 outline-none resize-y text-sm"
                                placeholder={`Tên bệnh: Sâu hại trên rau cải\nDấu hiệu: ...\nTác nhân: ...\nNguy cơ tiềm ẩn: ...\nBiện pháp: ...`}
                            />
                        </div>
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-slate-800">
                                    Lịch sử nội dung tri thức đã thêm
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearKnowledgeHistory();
                                        setHistory([]);
                                    }}
                                    className="text-xs px-3 py-1 rounded-lg border hover:bg-slate-50 text-red-500 font-semibold"
                                >
                                    Xoá tất cả
                                </button>
                            </div>

                            {history.length === 0 ? (
                                <div className="text-sm text-slate-500">Chưa có lịch sử nào.</div>
                            ) : (
                                <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                                    {history.map((h) => (
                                        <li
                                            key={h.id}
                                            className="flex flex-col justify-between border rounded-xl p-3 bg-white"
                                        >
                                            <div className="text-xs text-slate-500 mb-1">
                                                {new Date(h.ts).toLocaleString()}
                                            </div>
                                            {h.preview && (
                                                <img
                                                    src={h.preview}
                                                    alt="preview"
                                                    className="w-full h-28 object-cover rounded-lg border mb-2"
                                                />
                                            )}
                                            <div className="text-xs text-slate-700 line-clamp-4 whitespace-pre-wrap flex-1">
                                                {h.content.slice(0, 200)}
                                                {h.content.length > 200 ? "..." : ""}
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setContent(h.content)}
                                                    className="text-xs px-3 py-1 rounded-lg border hover:bg-slate-50 text-blue-600 font-semibold"
                                                >
                                                    Dán lại
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setHistory(removeKnowledgeHistoryItem(h.id))}
                                                    className="text-xs px-3 py-1 rounded-lg border hover:bg-slate-50 text-red-500 font-semibold"
                                                >
                                                    Xoá
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 h-10 disabled:opacity-60"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>Tải lên tri thức</span>
                    </button>
                    {serverMsg && <div className="text-sm text-slate-600">{serverMsg}</div>}
                </div>
            </form>
        </Card>
    );
}
