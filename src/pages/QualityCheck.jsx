import { useState, useEffect, useCallback } from "react";
import { RefreshCcw } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Card from "../components/quality_check/Card";
import TimeFilter from "../components/quality_check/TimeFilter";
import QualityTable from "../components/quality_check/QualityTable";
import EmptyState from "../components/quality_check/EmptyState";
import instance from '../config/axios.config'

const fmtVN = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

function mapResults(results, page, limit) {
    return results.map((item, idx) => {
        const ai = item?.ai_prediction || {};
        const originalUrl = item?.image_predetect?.image_url || "";
        const annotatedB64 = item?.ai_prediction?.annotated_image_base64;
        const detectedUrl = annotatedB64
            ? `data:image/png;base64,${annotatedB64}`
            : originalUrl;

        const aiMessage =
            item?.predicting_description ||
            item?.ai_prediction?.prediction_text ||
            "";

        return {
            id: item?._id || `${page}-${idx}`,
            no: (page - 1) * (limit || 0) + idx + 1,
            originalUrl,
            detectedUrl,
            capturedAt: fmtVN(item?.inspection_date),
            aiMessage,
            boxes: ai?.boxes || [],
            originalSize: {
                width: ai?.image_width || item?.image_predetect?.width || 0,
                height: ai?.image_height || item?.image_predetect?.height || 0,
            },
        };
    });
}




export default function QualityCheck() {
    const [range, setRange] = useState({ from: null, to: null });
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const hcid = searchParams.get("hcid") || null;
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPage = useCallback(
        async (p = 1, from = null, to = null) => {
            setLoading(true);
            const controller = new AbortController();
            const deviceId = "esp32-01";
            try {
                const params = { page: p };
                // nếu backend có hỗ trợ lọc thời gian, truyền kèm ISO
                if (from) params.from = new Date(from).toISOString();
                if (to) params.to = new Date(to).toISOString();
                if (deviceId) params.deviceId = deviceId;
                const { data } = await instance.get("/health-check/results", {
                    params,
                    signal: controller.signal,
                    timeout: 30000,
                    headers: { Accept: "application/json" },
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
                // if (instance.isCancel(err)) {
                // } else {
                //     console.error("Fetch results failed:", err?.message || err);
                //     setRows([]);
                //     setTotalPages(1);
                // }
            } finally {
                setLoading(false);
            }

            // return cleanup để hủy nếu component unmount
            return () => controller.abort();
        },
        [limit]
    );

    const fetchById = useCallback(async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const { data } = await instance.get(`/health-check/get/${id}`, {
                headers: { Accept: "application/json" },
                timeout: 25000,
            });
            console.log("Fetch by ID result:", data);
            const mapped = mapResults([data?.metadata || {}], 1, 1);
            setRows(mapped);
            setPage(1);
            setLimit(1);
            setTotalPages(1);
        } catch (err) {
            console.error(err);
            setRows([]);
            setPage(1);
            setLimit(1);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        let cleanup;
        if (hcid) {
            cleanup = fetchById(hcid);
        } else {
            cleanup = fetchPage(1);
        }
        return () => {
            if (typeof cleanup === "function") cleanup();
        };
    }, [hcid, fetchById, fetchPage]);

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
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50/60 to-gray-50/100 p-4 md:p-8 space-y-6">
            <TimeFilter
                onFilter={(f, t) => handleFilter(f, t)}
                onReset={() => {
                    setRange({ from: null, to: null });
                    fetchPage(1);
                }}
            />

            <Card title="Kiểm tra chất lượng nông sản" actions={actions}>
                {!loading && rows.length === 0 ? (
                    <EmptyState
                        title="Chưa có dữ liệu"
                        subtitle="Khi thiết bị IoT gửi ảnh về, bản ghi sẽ hiển thị tại đây."
                    />
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