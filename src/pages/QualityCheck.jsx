import React, { useEffect, useState, useCallback } from "react";
import { RefreshCcw, Upload, FileText, Loader2 } from "lucide-react";
import { IoSearch } from "react-icons/io5";
import {
    loadKnowledgeHistory,
    saveKnowledgeHistoryItem,
    clearKnowledgeHistory,
    removeKnowledgeHistoryItem
} from "../utils/knowledgeHistory";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import instance from "../config/axios.config";
import { selectDevice } from "../redux/selector";
import { postDataApi } from "../utils/fetch";

import Card from "../components/quality_check/Card";
import TimeFilter from "../components/quality_check/TimeFilter";
import QualityTable from "../components/quality_check/QualityTable";
import { ImagePicker } from "../components/quality_check/ImagePicker";
import { mapResults } from "../utils";
import MarkdownTable from "../components/common/MarkdownTable";
import { clearManualHistory, loadManualHistory, saveManualHistoryItem } from "../utils/manualHistory";

// Auto Detect Tab
function AutoDetectTab() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { selectedId } = useSelector(selectDevice);
    const hcid = searchParams.get("hcid") || null;
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [range, setRange] = useState({ from: null, to: null });

    const fetchPage = useCallback(
        async (p = 1, from = null, to = null) => {
            setLoading(true);
            const controller = new AbortController();
            const deviceId = selectedId;
            try {
                const params = { page: p };
                if (from) params.from = new Date(from).toISOString();
                if (to) params.to = new Date(to).toISOString();
                if (deviceId) params.deviceId = deviceId;
                const { data } = await instance.get("/health-check/results", {
                    params,
                    signal: controller.signal,
                    timeout: 30000,
                    headers: { Accept: "application/json" }
                });

                const meta = data?.metadata || {};
                const results = meta?.results || [];
                const pag = meta?.pagination || {};
                const mapped = mapResults(results, pag.page || p, pag.limit || limit);
                setRows(mapped);
                setPage(pag.page || p);
                setLimit(pag.limit || limit);
                setTotalPages(pag.totalPages || 1);
            } catch (err) {
                setRows([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }

            return () => controller.abort();
        },
        [limit, selectedId]
    );

    const fetchById = useCallback(async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const { data } = await instance.get(`/health-check/get/${id}`, {
                headers: { Accept: "application/json" },
                timeout: 25000
            });
            const mapped = mapResults([data?.metadata || {}], 1, 1);
            setRows(mapped);
            setPage(1);
            setLimit(1);
            setTotalPages(1);
        } catch (err) {
            setRows([]);
            setPage(1);
            setLimit(1);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedId) {
            let cleanup;
            if (hcid) cleanup = fetchById(hcid);
            else cleanup = fetchPage(1);
            return () => {
                if (typeof cleanup === "function") cleanup();
            };
        }
    }, [hcid, fetchById, fetchPage, selectedId]);

    const handleFilter = async (from, to) => {
        setRange({ from, to });
        if (hcid) {
            navigate("/quality-check", { replace: true });
        }
        await fetchPage(1, from, to);
    };

    const handlePage = async (p) => {
        if (hcid) return;
        setPage(p);
        await fetchPage(p, range.from, range.to);
    };

    const actions = (
        <div className="flex items-center gap-2">
            <button
                className="inline-flex items-center h-10 px-3 rounded-xl border bg-white text-slate-700 hover:bg-slate-50"
                onClick={() => fetchPage(page, range.from, range.to)}
            >
                <RefreshCcw className="h-4 w-4 mr-1.5" /> Làm mới
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <TimeFilter
                onFilter={(f, t) => handleFilter(f, t)}
                onReset={() => {
                    setRange({ from: null, to: null });
                    fetchPage(1);
                }}
            />

            <Card title="Kiểm tra chất lượng nông sản (Tự động)" actions={actions}>
                {!loading && rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-lg font-semibold text-slate-700">Chưa có dữ liệu</p>
                        <p className="text-slate-500">Khi thiết bị IoT gửi ảnh về, bản ghi sẽ hiển thị tại đây.</p>
                    </div>
                ) : (
                    <QualityTable
                        data={rows}
                        loading={loading}
                        page={page}
                        totalPages={totalPages}
                        onPage={handlePage}
                    />
                )}
            </Card>
        </div>
    );
}

// Manual Detect
function ManualDetectPanel() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [resultImg, setResultImg] = useState("");
    const [resultText, setResultText] = useState("");
    const [history, setHistory] = useState([]);

    useEffect(() => {
        setHistory(loadManualHistory());
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        try {
            setLoading(true);
            const fd = new FormData();
            fd.append("file", file);

            const { data } = await postDataApi("/rag/manual-detect", fd, {
                "Content-Type": "multipart/form-data",
                Accept: "application/json"
            });

            const advice = data.data.advice ?? "Không có kết quả.";
            const image = data.data.image;

            if (image) setResultImg(`data:image/png;base64,${image}`);
            else setResultImg(preview);
            setResultText(advice);

            const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const item = {
                id,
                ts: Date.now(),
                img: image ? `data:image/png;base64,${image}` : preview,
                advice
            };
            const newList = saveManualHistoryItem(item);
            if (newList) setHistory(newList);
        } catch (err) {
            setResultText("Lỗi khi detect thủ công. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Kiểm tra thủ công" actions={null}>
            <form className="space-y-6" onSubmit={onSubmit}>
                <ImagePicker
                    label="Ảnh rau cải cần detect"
                    file={file}
                    setFile={setFile}
                    preview={preview}
                    setPreview={setPreview}
                />
                <div className="w-full flex justify-end">
                    <button
                        type="submit"
                        disabled={!file || loading}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 h-10 disabled:opacity-80"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <IoSearch className="w-4 h-4" />}
                        <span>Kiểm tra</span>
                    </button>
                </div>
            </form>

            {(resultImg || resultText) && (
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                    {resultImg && (
                        <div>
                            <div className="text-sm font-medium text-slate-800 mb-2">Ảnh kết quả</div>
                            <img
                                src={resultImg}
                                alt="annotated"
                                className="w-full max-h-96 object-contain rounded-xl border border-gray-300"
                            />
                        </div>
                    )}
                    {resultText && (
                        <div>
                            <div className="text-sm font-medium text-slate-800 mb-2">Mô tả / Nhận định</div>
                            <MarkdownTable>{resultText}</MarkdownTable>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-slate-800">Lịch sử kiểm tra (gần nhất)</div>
                    <button
                        type="button"
                        onClick={() => {
                            clearManualHistory();
                            setHistory([]);
                        }}
                        className="text-xs px-3 py-1 rounded-lg border hover:bg-slate-50"
                    >
                        Xoá tất cả
                    </button>
                </div>

                {history.length === 0 ? (
                    <div className="text-sm text-slate-500">Chưa có lịch sử.</div>
                ) : (
                    <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                        {history.map((h) => (
                            <li key={h.id} className="border rounded-xl p-3 bg-white">
                                <div className="flex items-center gap-3">
                                    <img src={h.img} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                                    <div className="flex-1">
                                        <div className="text-xs text-slate-500">{new Date(h.ts).toLocaleString()}</div>
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setResultImg(h.img);
                                                    setResultText(h.advice);
                                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                                }}
                                                className="text-xs px-3 py-1 rounded-lg border hover:bg-slate-50 cursor-pointer text-blue-600 font-semibold"
                                            >
                                                Xem lại
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setHistory(removeManualHistoryItem(h.id));
                                                }}
                                                className="text-xs px-3 py-1 rounded-lg border hover:bg-slate-50 cursor-pointer text-red-500 font-semibold"
                                            >
                                                Xoá
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Card>
    );
}

// Upload Knowledge
function UploadKnowledgePanel() {
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

export default function QualityDetect() {
    const [tab, setTab] = useState("auto");

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50/60 to-gray-50/100 p-4 md:p-8 space-y-6">
            {/* Tabs */}
            <div className="w-full">
                <div className="inline-flex rounded-2xl bg-white border p-1 shadow-sm">
                    <button
                        onClick={() => setTab("auto")}
                        className={`px-4 h-10 rounded-xl text-sm font-medium ${
                            tab === "auto" ? "bg-indigo-600 text-white shadow" : "text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                        Kiểm tra tự động
                    </button>

                    <button
                        onClick={() => setTab("manual")}
                        className={`px-4 h-10 rounded-xl text-sm font-medium ${
                            tab === "manual" ? "bg-indigo-600 text-white shadow" : "text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                        Kiểm tra thủ công
                    </button>

                    <button
                        onClick={() => setTab("data")}
                        className={`px-4 h-10 rounded-xl text-sm font-medium ${
                            tab === "data" ? "bg-indigo-600 text-white shadow" : "text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                        Thêm dữ liệu bệnh cây trồng
                    </button>
                </div>
            </div>

            {tab === "auto" && <AutoDetectTab />}
            {tab === "manual" && <ManualDetectPanel />}

            {tab === "data" && <UploadKnowledgePanel />}
        </div>
    );
}
