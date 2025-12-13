import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { getDataApi } from "../utils/fetch";
import AiAnalysisCard from "../components/product/AiAnalysisCard";
import MarkdownTable from "../components/common/MarkdownTable";

const METRIC_OPTIONS = [
    { key: "air_temperature", label: "Nhiệt độ không khí (°C)" },
    { key: "air_humidity", label: "Độ ẩm không khí (%)" },
    { key: "soil_temperature", label: "Nhiệt độ đất (°C)" },
    { key: "soil_humidity", label: "Độ ẩm đất (%)" },
    { key: "ph", label: "pH đất" },
    { key: "light_raw", label: "Ánh sáng (raw)" }
];

const statusColor = {
    growing: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40",
    harvesting: "bg-amber-500/10 text-amber-300 border border-amber-500/40",
    selling: "bg-sky-500/10 text-sky-300 border border-sky-500/40"
};

const statusLabel = {
    growing: "Đang sinh trưởng",
    harvesting: "Đang thu hoạch",
    selling: "Đang bán"
};

const careHistoryLabel = {
    watering: "Tưới nước",
    fertilizing: "Bón phân",
    pesticide: "Phun thuốc",
    pruning: "Cắt tỉa",
    harvest: "Thu hoạch",
    default: "Hoạt động khác"
};

const Skeleton = ({ className }) => <div className={`animate-pulse bg-slate-800/50 rounded-xl ${className}`}></div>;

function MetricCard({ title, value, unit, loading }) {
    if (loading) return <Skeleton className="h-[74px] flex-1 min-w-[140px]" />;

    const isWarning = value === null || value === undefined || Number.isNaN(value);

    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col gap-1 flex-1 min-w-[140px]">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide">{title}</span>
            <span className="text-lg font-semibold">
                {isWarning ? (
                    <span className="text-slate-500 text-sm">--</span>
                ) : (
                    <>
                        {Number(value).toFixed(1)} <span className="text-xs text-slate-400">{unit}</span>
                    </>
                )}
            </span>
        </div>
    );
}

function ProductDetailsDashboard() {
    const { productId } = useParams();

    const [infoData, setInfoData] = useState(null); // API 1: Info (Product + Field)
    const [readingsData, setReadingsData] = useState(null); // API 2: Readings (Chart + Metrics)
    const [logsData, setLogsData] = useState(null); // API 3: Logs (Health + Manual)
    const [aiData, setAiData] = useState(null); // API 4: AI Analysis
    const [careLogsData, setCareLogsData] = useState(null); // API 5: Care History

    const [loadingInfo, setLoadingInfo] = useState(true);
    const [loadingReadings, setLoadingReadings] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [loadingAi, setLoadingAi] = useState(true);
    const [loadingCareLogs, setLoadingCareLogs] = useState(true);

    const [selectedMetric, setSelectedMetric] = useState("air_temperature");
    const [selectedHealthCheck, setSelectedHealthCheck] = useState(null);
    const [selectedManualHealthCheck, setSelectedManualHealthCheck] = useState(null);
    const [selectedCareLog, setSelectedCareLog] = useState(null);

    useEffect(() => {
        if (!productId) return;
        let isMounted = true;

        const fetchData = async () => {
            getDataApi(`/products/${productId}/info`)
                .then((res) => isMounted && setInfoData(res.data))
                .catch((err) => console.error("Info Error:", err))
                .finally(() => isMounted && setLoadingInfo(false));

            getDataApi(`/products/${productId}/readings`)
                .then((res) => isMounted && setReadingsData(res.data))
                .catch((err) => console.error("Readings Error:", err))
                .finally(() => isMounted && setLoadingReadings(false));

            getDataApi(`/products/${productId}/logs`)
                .then((res) => isMounted && setLogsData(res.data))
                .catch((err) => console.error("Logs Error:", err))
                .finally(() => isMounted && setLoadingLogs(false));

            getDataApi(`/products/${productId}/ai`)
                .then((res) => isMounted && setAiData(res.data))
                .catch((err) => console.error("AI Error:", err))
                .finally(() => isMounted && setLoadingAi(false));

            getDataApi(`/products/${productId}/care-logs`)
                .then((res) => isMounted && setCareLogsData(res.data))
                .catch((err) => console.error("Care Logs Error:", err))
                .finally(() => isMounted && setLoadingCareLogs(false));
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [productId]);

    const { product, field } = infoData || {};

    const chartData = useMemo(() => {
        if (!readingsData || !readingsData.devices || !readingsData.devices.length) return [];
        const raw = readingsData.devices[0].rawReadings || [];
        return raw.map((r) => ({
            time: new Date(r.t).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }),
            ...r
        }));
    }, [readingsData]);

    const latestEnv = useMemo(() => {
        if (!readingsData || !readingsData.summary || !readingsData.summary.length) return {};
        return readingsData.summary[0].latest || {};
    }, [readingsData]);

    if (loadingInfo) {
        return (
            <div className="min-h-screen bg-slate-950 p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="w-64 h-8" />
                        <Skeleton className="w-40 h-4" />
                    </div>
                    <Skeleton className="w-24 h-8 rounded-full" />
                </div>
                <div className="flex gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-20 flex-1" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-96">
                    <Skeleton className="col-span-1 h-full" />
                    <Skeleton className="col-span-2 h-full" />
                </div>
            </div>
        );
    }

    if (!product)
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">
                Không tìm thấy sản phẩm
            </div>
        );

    const mainImage = product.image || "https://placehold.co/600x400?text=No+Image";

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
                            {product.name}
                            {product.type && (
                                <span className="text-sm font-normal text-slate-400">({product.type})</span>
                            )}
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Ruộng: <span className="font-medium text-slate-100">{field?.name}</span> • Diện tích:{" "}
                            <span className="font-medium text-slate-100">
                                {field?.total_area ? field.total_area + " m²" : "--"}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {product.status && (
                            <span className={"px-3 py-1 rounded-full text-sm " + (statusColor[product.status] || "")}>
                                {statusLabel[product.status] || product.status}
                            </span>
                        )}
                        <div className="text-xs md:text-sm text-slate-400 text-right">
                            <div>
                                <span>Gieo:</span>
                                <span className="text-slate-100">
                                    {product.planting_date
                                        ? new Date(product.planting_date).toLocaleDateString("vi-VN")
                                        : "--"}
                                </span>
                            </div>
                            <div>
                                Thu hoạch (TT):{" "}
                                <span className="text-slate-100">
                                    {product.actual_harvest_date
                                        ? new Date(product.actual_harvest_date).toLocaleDateString("vi-VN")
                                        : "--"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2 justify-between">
                        <MetricCard
                            loading={loadingReadings}
                            title="Nhiệt độ KK"
                            value={latestEnv.air_temperature}
                            unit="°C"
                        />
                        <MetricCard
                            loading={loadingReadings}
                            title="Độ ẩm KK"
                            value={latestEnv.air_humidity}
                            unit="%"
                        />
                        <MetricCard
                            loading={loadingReadings}
                            title="Nhiệt độ đất"
                            value={latestEnv.soil_temperature}
                            unit="°C"
                        />
                        <MetricCard
                            loading={loadingReadings}
                            title="Độ ẩm đất"
                            value={latestEnv.soil_humidity}
                            unit="%"
                        />
                        <MetricCard loading={loadingReadings} title="pH đất" value={latestEnv.ph} unit="" />
                        <MetricCard loading={loadingReadings} title="Ánh sáng" value={latestEnv.light_raw} unit="raw" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                        <div className="lg:col-span-1 flex flex-col gap-4 h-full">
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg h-full flex flex-col">
                                <div className="aspect-video bg-slate-800 shrink-0">
                                    <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-4 space-y-2 flex-1">
                                    <h2 className="font-semibold text-lg">Tổng quan</h2>
                                    <p className="text-sm text-slate-400">{field?.description || "Chưa có mô tả."}</p>
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-400 pt-1">
                                        <span className="px-2 py-1 rounded-full bg-slate-800/80">
                                            Thiết bị: {field?.devices?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 h-full min-h-[400px]">
                            {loadingReadings ? (
                                <div className="h-full flex flex-col gap-4">
                                    <div className="flex justify-between">
                                        <Skeleton className="w-32 h-6" />
                                        <Skeleton className="w-20 h-6" />
                                    </div>
                                    <Skeleton className="flex-1 w-full rounded-xl" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="font-semibold text-sm md:text-base">Biểu đồ môi trường</h2>
                                        </div>
                                        <select
                                            className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2 py-1 outline-none focus:border-emerald-500"
                                            value={selectedMetric}
                                            onChange={(e) => setSelectedMetric(e.target.value)}
                                        >
                                            {METRIC_OPTIONS.map((m) => (
                                                <option key={m.key} value={m.key}>
                                                    {m.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-full h-[320px]">
                                        {chartData.length === 0 ? (
                                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                                Chưa có dữ liệu cảm biến.
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                                    <XAxis
                                                        dataKey="time"
                                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                                        minTickGap={20}
                                                    />
                                                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: "#020617",
                                                            borderRadius: "0.75rem",
                                                            border: "1px solid #1f2937",
                                                            fontSize: "12px"
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey={selectedMetric}
                                                        stroke="#22c55e"
                                                        dot={false}
                                                        strokeWidth={2}
                                                        name={
                                                            (METRIC_OPTIONS.find((m) => m.key === selectedMetric) || {})
                                                                .label || selectedMetric
                                                        }
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl w-full h-[400px] flex flex-col">
                                <h3 className="font-semibold text-sm p-4 border-b border-slate-800/50 flex justify-between items-center">
                                    Lịch sử phát hiện bệnh tự động
                                    <span className="text-xs font-medium text-slate-700 bg-slate-100 flex justify-center items-center h-6 w-6 rounded-full">
                                        {logsData?.healthCheck_history?.length || 0}
                                    </span>
                                </h3>
                                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                                    {loadingLogs ? (
                                        [1, 2, 3].map((i) => <Skeleton key={i} className="w-full h-16" />)
                                    ) : logsData?.healthCheck_history?.length > 0 ? (
                                        logsData.healthCheck_history.map((hc) => (
                                            <button
                                                key={hc._id}
                                                onClick={() => setSelectedHealthCheck(hc)}
                                                className="w-full text-left flex gap-3 text-xs bg-slate-950/50 rounded-xl p-2 border border-slate-800/60 hover:border-emerald-400/70 hover:bg-slate-900 transition-colors"
                                            >
                                                {hc.image_predetect?.image_url && (
                                                    <img
                                                        src={hc.image_predetect.image_url}
                                                        alt="hc"
                                                        className="w-14 h-14 rounded-lg object-cover bg-slate-800"
                                                    />
                                                )}
                                                <div className="space-y-1 min-w-0">
                                                    <div className="text-slate-300 font-medium">
                                                        {new Date(hc.inspection_date).toLocaleString("vi-VN")}
                                                    </div>
                                                    <div className="text-slate-400 line-clamp-2">
                                                        {hc.predicting_description || "Không có mô tả."}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-500 text-center pt-10">Chưa có dữ liệu.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl w-full h-[400px] flex flex-col">
                                <h3 className="font-semibold text-sm p-4 border-b border-slate-800/50 flex justify-between items-center">
                                    Lịch sử kiểm tra thủ công
                                    <span className="text-xs font-medium text-slate-700 bg-slate-100 flex justify-center items-center h-6 w-6 rounded-full">
                                        {logsData?.manualChecks_history?.length || 0}
                                    </span>
                                </h3>
                                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                                    {loadingLogs ? (
                                        [1, 2, 3].map((i) => <Skeleton key={i} className="w-full h-16" />)
                                    ) : logsData?.manualChecks_history?.length > 0 ? (
                                        logsData.manualChecks_history.map((hc) => (
                                            <button
                                                key={hc._id}
                                                onClick={() => setSelectedManualHealthCheck(hc)}
                                                className="w-full text-left flex gap-3 text-xs bg-slate-950/50 rounded-xl p-2 border border-slate-800/60 hover:border-emerald-400/70 hover:bg-slate-900 transition-colors"
                                            >
                                                {hc.image && (
                                                    <img
                                                        src={`data:image/png;base64,${hc.image}`}
                                                        alt="manual"
                                                        className="w-14 h-14 rounded-lg object-cover bg-slate-800"
                                                    />
                                                )}
                                                <div className="space-y-1 min-w-0">
                                                    <div className="text-slate-300 font-medium">
                                                        {new Date(hc.detect_date).toLocaleString("vi-VN")}
                                                    </div>
                                                    <div className="text-slate-400 line-clamp-2">
                                                        {hc.description || "Không có mô tả."}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-500 text-center pt-10">Chưa có dữ liệu.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl w-full h-[400px] flex flex-col">
                            <h3 className="font-semibold text-sm p-4 border-b border-slate-800/50 flex justify-between items-center">
                                Nhật ký chăm sóc
                                <span className="text-xs font-medium text-slate-700 bg-slate-100 flex justify-center items-center h-6 w-6 rounded-full">
                                    {careLogsData?.care_history?.length || 0}
                                </span>
                            </h3>
                            <div className="overflow-y-auto flex-1 p-4 space-y-3">
                                {loadingCareLogs ? (
                                    [1, 2, 3].map((i) => <Skeleton key={i} className="w-full h-16" />)
                                ) : careLogsData?.care_history?.length > 0 ? (
                                    careLogsData.care_history.map((log) => (
                                        <button
                                            key={log._id}
                                            onClick={() => setSelectedCareLog(log)}
                                            className="w-full text-left flex gap-3 text-xs bg-slate-950/50 rounded-xl p-2 border border-slate-800/60 hover:border-emerald-400/70 hover:bg-slate-900 transition-colors"
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-xl ${
                                                    log.image ? "" : "bg-emerald-100 text-emerald-600"
                                                }`}
                                            >
                                                {log.image ? (
                                                    <img
                                                        src={log.image}
                                                        alt="log"
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : log.processType.toLowerCase() === "watering" ? (
                                                    "💧"
                                                ) : log.processType.toLowerCase() === "fertilizing" ? (
                                                    "🧪"
                                                ) : (
                                                    "🌿"
                                                )}
                                            </div>
                                            <div className="space-y-1 min-w-0 flex-1">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-300 font-medium">
                                                        {careHistoryLabel[log.processType.toLowerCase()] || "Chăm sóc"}
                                                    </span>
                                                    <span className="text-slate-300 font-medium">
                                                        {new Date(log.process_date).toLocaleDateString("vi-VN")}
                                                    </span>
                                                </div>
                                                <div className="text-slate-500 line-clamp-2">
                                                    {log.notes || "Không có ghi chú."}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 text-center pt-10">Chưa có dữ liệu.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        {loadingAi ? (
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <Skeleton className="w-48 h-6" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="w-full h-4" />
                                    <Skeleton className="w-full h-4" />
                                    <Skeleton className="w-3/4 h-4" />
                                </div>
                            </div>
                        ) : (
                            aiData?.ai_quality_description && (
                                <AiAnalysisCard description={aiData.ai_quality_description} />
                            )
                        )}
                    </div>
                </div>
            </div>

            {selectedHealthCheck && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setSelectedHealthCheck(null)}
                >
                    <div
                        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-100">Chi tiết kiểm tra (AI)</h3>
                                <p className="text-[11px] text-slate-400">
                                    {new Date(selectedHealthCheck.inspection_date).toLocaleString("vi-VN")}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedHealthCheck(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 space-y-4 overflow-y-auto">
                            {selectedHealthCheck.image_predetect?.image_url && (
                                <div className="rounded-xl overflow-hidden border border-slate-800 bg-black">
                                    <img
                                        src={selectedHealthCheck.image_predetect.image_url}
                                        alt="detail"
                                        className="w-full h-auto max-h-[400px] object-contain mx-auto"
                                    />
                                </div>
                            )}
                            <div>
                                <h4 className="text-sm font-semibold text-emerald-400 mb-1">Nhận định:</h4>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {selectedHealthCheck.predicting_description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedManualHealthCheck && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setSelectedManualHealthCheck(null)}
                >
                    <div
                        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-100">Chi tiết kiểm tra (Thủ công)</h3>
                                <p className="text-[11px] text-slate-400">
                                    {new Date(selectedManualHealthCheck.detect_date).toLocaleString("vi-VN")}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedManualHealthCheck(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 space-y-4 overflow-y-auto">
                            <div className="flex flex-col sm:flex-row gap-2">
                                {selectedManualHealthCheck.image && (
                                    <div className="flex-1">
                                        <span className="text-xs text-slate-400 block mb-1">Ảnh tải lên:</span>
                                        <img
                                            src={`data:image/png;base64,${selectedManualHealthCheck.image}`}
                                            alt="uploaded"
                                            className="rounded-lg border border-slate-800 w-full object-cover"
                                        />
                                    </div>
                                )}
                                {selectedManualHealthCheck.relative_image && (
                                    <div className="flex-1">
                                        <span className="text-xs text-slate-400 block mb-1">Ảnh tham chiếu:</span>
                                        <img
                                            src={`data:image/png;base64,${selectedManualHealthCheck.relative_image}`}
                                            alt="relative"
                                            className="rounded-lg border border-slate-800 w-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-emerald-400 mb-1">Mô tả:</h4>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    <MarkdownTable>{selectedManualHealthCheck.description}</MarkdownTable>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetailsDashboard;
