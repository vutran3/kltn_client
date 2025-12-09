import React, { useEffect, useMemo, useState } from "react";
import { getDataApi } from "../utils/fetch";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useParams } from "react-router-dom";
import AiAnalysisCard from "../components/product/AiAnalysisCard";

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

function MetricCard({ title, value, unit }) {
    const isWarning = value === null || value === undefined || Number.isNaN(value);

    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col gap-1 flex-1 min-w-[140px]">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide">{title}</span>
            <span className="text-lg font-semibold">
                {isWarning ? (
                    <span className="text-slate-500 text-sm">Không có dữ liệu</span>
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
    const [data, setData] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState("air_temperature");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { productId } = useParams();
    const [selectedHealthCheck, setSelectedHealthCheck] = useState(null);
    const [selectedManualHealthCheck, setSelectedManualHealthCheck] = useState(null);
    const {
        product,
        field,
        healthCheck_history = [],
        manualChecks_history = [],
        readings,
        ai_quality_description
    } = data || {};

    const mainImage = product?.image || "https://placehold.co/600x400?text=No+Image";

    useEffect(() => {
        if (!productId) return;
        let isMounted = true;

        async function fetchDetails() {
            try {
                setLoading(true);
                setError(null);

                const res = await getDataApi(`/products/${productId}/details`);

                if (!isMounted) return;
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch product details:", err);
                if (!isMounted) return;
                setError(err?.response?.data?.message || err?.message || "Failed to fetch product details");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchDetails();

        return () => {
            isMounted = false;
        };
    }, [productId]);

    const chartData = useMemo(() => {
        if (!data || !data.readings || !data.readings.devices || !data.readings.devices.length) {
            return [];
        }

        const device = data.readings.devices[0];
        const rawReadings = device.rawReadings || [];

        return rawReadings.map((r) => ({
            time: new Date(r.t).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }),
            ...r
        }));
    }, [data]);

    const latestEnv = useMemo(() => {
        if (!data || !data.readings || !data.readings.devices || !data.readings.devices.length) {
            return null;
        }
        const device = data.readings.devices[0];
        return device.latest || null;
    }, [data]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-300">
                <p>Lỗi tải dữ liệu: {error || "Không có dữ liệu"}</p>
            </div>
        );
    }

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
                            Ruộng: <span className="font-medium text-slate-100">{field.name}</span> • Diện tích:{" "}
                            <span className="font-medium text-slate-100">
                                {field.total_area ? field.total_area + " m²" : "Chưa cập nhật"}
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
                                Gieo trồng:{" "}
                                <span className="text-slate-100">
                                    {product.planting_date
                                        ? new Date(product.planting_date).toLocaleDateString("vi-VN")
                                        : "Chưa cập nhật"}
                                </span>
                            </div>
                            <div>
                                Dự kiến thu hoạch:{" "}
                                <span className="text-slate-100">
                                    {product.expected_harvest_date
                                        ? new Date(product.expected_harvest_date).toLocaleDateString("vi-VN")
                                        : "Chưa cập nhật"}
                                </span>
                            </div>
                            <div>
                                Thực tế thu hoạch:{" "}
                                <span className="text-slate-100">
                                    {product.actual_harvest_date
                                        ? new Date(product.actual_harvest_date).toLocaleDateString("vi-VN")
                                        : "Chưa thu hoạch"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2 justify-between">
                        <MetricCard
                            title="Nhiệt độ không khí"
                            value={latestEnv && latestEnv.air_temperature}
                            unit="°C"
                        />
                        <MetricCard title="Độ ẩm không khí" value={latestEnv && latestEnv.air_humidity} unit="%" />
                        <MetricCard title="Nhiệt độ đất" value={latestEnv && latestEnv.soil_temperature} unit="°C" />
                        <MetricCard title="Độ ẩm đất" value={latestEnv && latestEnv.soil_humidity} unit="%" />
                        <MetricCard title="pH đất" value={latestEnv && latestEnv.ph} unit="" />
                        <MetricCard title="Ánh sáng" value={latestEnv && latestEnv.light_raw} unit="raw" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                        <div className="lg:col-span-1 flex flex-col gap-4 h-full">
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg h-full flex flex-col">
                                <div className="aspect-video bg-slate-800 shrink-0">
                                    <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-4 space-y-2 flex-1">
                                    <h2 className="font-semibold text-lg">Tổng quan lô rau</h2>
                                    <p className="text-sm text-slate-400">
                                        {field.description || "Chưa có mô tả cho ruộng này."}
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-400 pt-1">
                                        <span className="px-2 py-1 rounded-full bg-slate-800/80">
                                            Thiết bị: {field.devices ? field.devices.length : 0}
                                        </span>
                                        <span className="px-2 py-1 rounded-full bg-slate-800/80">
                                            Dữ liệu: {new Date(readings.range.from).toLocaleDateString("vi-VN")} -{" "}
                                            {new Date(readings.range.to).toLocaleDateString("vi-VN")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 h-full min-h-[400px]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-sm md:text-base">Biểu đồ môi trường</h2>
                                    <p className="text-xs text-slate-500">
                                        Thiết bị:{" "}
                                        {data.readings.devices &&
                                            data.readings.devices[0] &&
                                            data.readings.devices[0].deviceId}
                                    </p>
                                </div>
                                <select
                                    className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2 py-1"
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
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl w-full h-[400px] overflow-y-auto">
                            <h3 className="font-semibold mb-2 text-sm sticky top-0 bg-slate-900/90 p-4 backdrop-blur-sm z-10 border-b border-slate-800/50">
                                Lịch sử phát hiện bệnh ({healthCheck_history.length})
                            </h3>
                            {healthCheck_history.length === 0 ? (
                                <p className="text-xs text-slate-500 p-4 text-center">Chưa có dữ liệu.</p>
                            ) : (
                                <div className="space-y-3 p-4 pt-0">
                                    {healthCheck_history.map((hc) => (
                                        <button
                                            key={hc._id}
                                            type="button"
                                            onClick={() => setSelectedHealthCheck(hc)}
                                            className="w-full text-left flex gap-3 text-xs bg-slate-950/50 rounded-xl p-2 border border-slate-800/60 hover:border-emerald-400/70 hover:bg-slate-900 transition-colors cursor-pointer"
                                        >
                                            {hc.image_predetect && hc.image_predetect.image_url && (
                                                <img
                                                    src={hc.image_predetect.image_url}
                                                    alt="hc"
                                                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-slate-800"
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
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl w-full h-[400px] overflow-y-auto">
                            <h3 className="font-semibold mb-2 text-sm sticky top-0 bg-slate-900/90 p-4 backdrop-blur-sm z-10 border-b border-slate-800/50">
                                Lịch sử kiểm tra thủ công ({manualChecks_history.length})
                            </h3>
                            {manualChecks_history.length === 0 ? (
                                <p className="text-xs text-slate-500 p-4 text-center">Chưa có dữ liệu.</p>
                            ) : (
                                <div className="space-y-3 p-4 pt-0">
                                    {manualChecks_history.map((hc) => (
                                        <button
                                            key={hc._id}
                                            type="button"
                                            onClick={() => setSelectedManualHealthCheck(hc)}
                                            className="w-full text-left flex gap-3 text-xs bg-slate-950/50 rounded-xl p-2 border border-slate-800/60 hover:border-emerald-400/70 hover:bg-slate-900 transition-colors cursor-pointer"
                                        >
                                            {hc.image && (
                                                <img
                                                    src={`data:image/png;base64,${hc.image}`}
                                                    alt="manual-check"
                                                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-slate-800"
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
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {ai_quality_description && (
                        <div className="w-full">
                            <AiAnalysisCard description={ai_quality_description} />
                        </div>
                    )}
                </div>
            </div>

            {selectedHealthCheck && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
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
                                    {selectedManualHealthCheck.description}
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
