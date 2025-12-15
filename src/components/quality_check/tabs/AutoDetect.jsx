import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { RefreshCcw } from "lucide-react";
import instance from "../../../config/axios.config";
import TimeFilter from "../../../components/quality_check/TimeFilter";
import QualityTable from "../../../components/quality_check/QualityTable";
import { mapResults } from "../../../utils";
import { useSelector } from "react-redux";
import { selectDevice } from "../../../redux/selector";
import Card from "../Card";

export default function AutoDetectTab() {
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
                className="inline-flex items-center h-10 px-3 rounded-xl border border-gray-300 bg-white text-slate-700 hover:bg-slate-50"
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
