import React, { useState, useEffect, useCallback } from "react";
import { RefreshCcw, Camera, Bot } from "lucide-react";
import Card from "../components/quality_check/Card";
import TimeFilter from "../components/quality_check/TimeFilter";
import QualityTable from "../components/quality_check/QualityTable";
import EmptyState from "../components/quality_check/EmptyState";
import instance from '../config/axios.config'
import { useDispatch, useSelector } from "react-redux";
import { fetchHealthResults } from "../redux/thunks/healthCheckThunk";
import {selectHealthRows, selectHealthLoading, selectHealthPagination, selectHealthError} from '../redux/selector'

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
    const dispatch = useDispatch();
    const rowsRaw = useSelector(selectHealthRows);
    const loading = useSelector(selectHealthLoading);
    const {page, limit, totalPages} = useSelector(selectHealthPagination)
    const [range, setRange] = useState({ from: null, to: null });
    const [curPage, setCurPage] = useState(1)
    const deviceId = "esp32s3-01"

    useEffect(() => {
        dispatch(fetchHealthResults({page: 1, deviceId}))
    }, [dispatch]);

    const handleFilter = async (from, to) => {
        setRange({ from, to });
        setCurPage(1);
        dispatch(fetchHealthResults({page: 1, from, to, deviceId}))
    };

    const handlePage = async (p) => {
        setCurPage(p)
        dispatch(fetchHealthResults({page: p, from: range.from, to: range.to, deviceId}))
    };
    const rows = mapResults(rowsRaw, curPage, limit)

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50/60 to-gray-50/100 p-4 md:p-8 space-y-6">
            <TimeFilter
                onFilter={handleFilter}
                onReset={() => {
                    setRange({ from: null, to: null });
                    handleFilter(null, null);
                }}
            />

            <Card title="Kiểm tra chất lượng nông sản" >
                {!loading && rows.length === 0 ? (
                    <EmptyState
                        title="Chưa có dữ liệu"
                        subtitle="Khi thiết bị IoT gửi ảnh về, bản ghi sẽ hiển thị tại đây."
                    />
                ) : (
                    <QualityTable
                        data={rows}
                        loading={loading}
                        page={curPage}
                        totalPages={totalPages || 1}
                        onPage={handlePage}
                    />
                )}
            </Card>
        </div>
    );
}