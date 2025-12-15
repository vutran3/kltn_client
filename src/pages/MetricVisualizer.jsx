"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";
import TimeFilter from "../components/data_visualization/TimeFilter";
import MetricChart from "../components/data_visualization/MetricChart";
import { getDataApi } from "../utils/fetch";
import { averagePerDay, calculateDewPoint, calculateHeatIndex, calculateVPD, mapApiRowsToSeries } from "../utils";
import { useSelector } from "react-redux";
import { selectDevice } from "../redux/selector";

const ChartCard = ({ children, title, className = "" }) => (
    <div
        className={`flex flex-col rounded-xl border border-white/60 bg-white/40 p-4 shadow-sm backdrop-blur-md transition-all hover:shadow-md ${className}`}
    >
        {title && <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">{title}</h4>}
        <div className="flex-1">{children}</div>
    </div>
);

const KPICard = ({ title, value, unit, status, colorClass, icon, subText }) => (
    <div
        className={`relative overflow-hidden rounded-xl border p-4 shadow-sm backdrop-blur-md transition-all hover:scale-[1.02] ${colorClass}`}
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</p>
                <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold">{value}</span>
                    <span className="text-xs font-semibold opacity-80">{unit}</span>
                </div>
            </div>
            <div className="rounded-full bg-white/30 p-2 text-xl">{icon}</div>
        </div>
        <div className="mt-2 flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-current"></span>
            <p className="text-xs font-medium">{status}</p>
        </div>
        {subText && <p className="mt-1 text-[10px] opacity-60 italic">{subText}</p>}
    </div>
);

export default function MetricVisualizer() {
    const { selectedId } = useSelector(selectDevice);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        setLoading(true);
        if (selectedId)
            getDataApi(`/readings?deviceId=${selectedId}&limit=${100}&sort=${-1}`)
                .then((res) => {
                    const minuteRows = averagePerDay(res.data.data.rows, { tzOffsetMinutes: 420 });
                    setData(mapApiRowsToSeries(minuteRows));
                })
                .catch((e) => setErr(e.message))
                .finally(() => setLoading(false));
    }, [selectedId]);

    const handleFilter = async (input) => {
        try {
            setLoading(true);
            setErr(null);

            let from, to;

            if (input instanceof Date || typeof input === "number" || typeof input === "string") {
                from = new Date(input);
                to = new Date();
            } else if (input && (input.from || input.to)) {
                from = input.from ? new Date(input.from) : undefined;
                to = input.to ? new Date(input.to) : new Date();
            }

            if (from) {
                getDataApi("/readings", {
                    deviceId: selectedId,
                    from: String(from.getTime()),
                    to: String(to.getTime()),
                    sort: "1"
                }).then((res) => {
                    const minuteRows = averagePerDay(res.data.data.rows, { tzOffsetMinutes: 420 });
                    setData(mapApiRowsToSeries(minuteRows));
                });
            } else {
                getDataApi(`/readings?deviceId=${selectedId}&limit=${100}&sort=${-1}`).then((res) => {
                    const minuteRows = averagePerDay(res.data.data.rows, { tzOffsetMinutes: 420 });
                    setData(mapApiRowsToSeries(minuteRows));
                });
            }
        } catch (e) {
            setErr(e?.message || "Lọc dữ liệu thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setLoading(true);
        setErr(null);

        getDataApi(`/readings?deviceId=${selectedId}&limit=${100}&sort=${-1}`)
            .then((res) => {
                const minuteRows = averagePerDay(res.data.data.rows, { tzOffsetMinutes: 420 });
                setData(mapApiRowsToSeries(minuteRows));
            })
            .catch((err) => {
                setErr(err?.message || "Lọc dữ liệu thất bại");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const latestData = useMemo(() => (data.length > 0 ? data[data.length - 1] : {}), [data]);

    const nutrientsData = useMemo(() => {
        if (!latestData) return [];
        return [
            { subject: "Nito", A: latestData.nitro || 0, fullMark: 200 },
            { subject: "Photpho", A: latestData.photpho || 0, fullMark: 200 },
            { subject: "Kali", A: latestData.kali || 0, fullMark: 200 },
            { subject: "pH (*10)", A: (latestData.ph || 0) * 10, fullMark: 140 },
            { subject: "Độ ẩm đất", A: latestData.soilHum || 0, fullMark: 100 }
        ];
    }, [latestData]);

    const metrics = useMemo(() => {
        const temp = latestData.temp || 0;
        const hum = latestData.air || 0;

        const vpd = calculateVPD(temp, hum);
        const dew = calculateDewPoint(temp, hum);
        const heat = calculateHeatIndex(temp, hum);

        return { vpd, dew, heat, temp, hum };
    }, [latestData]);

    return (
        <div className="min-h-screen w-full bg-slate-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="sticky top-4 z-20 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur-xl">
                    <TimeFilter onFilter={handleFilter} onReset={handleReset} />
                    {loading && (
                        <span className="text-xs font-medium text-blue-600 animate-pulse">Đang cập nhật...</span>
                    )}
                </div>

                <section className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="mb-4 text-lg font-bold text-slate-700">PHÂN TÍCH CHUYÊN SÂU</h3>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
                        <ChartCard title="Cân bằng Dinh dưỡng" className="min-h-[380px] lg:col-span-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={nutrientsData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, "auto"]} tick={false} />
                                    <Radar
                                        name="Hàm lượng"
                                        dataKey="A"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.5}
                                    />
                                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none" }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard
                            title="Môi trường Tổng hợp (Nhiệt độ vs Độ ẩm)"
                            className="min-h-[300px] lg:col-span-2"
                        >
                            <ResponsiveContainer width="100%" height={250}>
                                <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="createdAt" hide /> {/* Ẩn hoặc format ngày tháng */}
                                    <YAxis yAxisId="left" unit="°C" stroke="#ef4444" fontSize={12} />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        unit="%"
                                        stroke="#3b82f6"
                                        fontSize={12}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                        }}
                                    />
                                    <Legend />
                                    <Area
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="air"
                                        name="Độ ẩm KK"
                                        fill="url(#colorHum)"
                                        stroke="#3b82f6"
                                        fillOpacity={0.1}
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="temp"
                                        name="Nhiệt độ"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <defs>
                                        <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </ComposedChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <div className="flex flex-col gap-3 lg:col-span-1 min-h-[380px]">
                            <KPICard
                                title="Chỉ số VPD"
                                value={metrics.vpd}
                                unit="kPa"
                                icon="🍃"
                                status={
                                    metrics.vpd < 0.4
                                        ? "Thấp (Nguy cơ mốc)"
                                        : metrics.vpd > 1.6
                                        ? "Cao (Mất nước)"
                                        : "Lý tưởng"
                                }
                                colorClass="bg-gradient-to-r from-orange-50 to-amber-100 border-orange-200 text-orange-900"
                                subText="Sức khỏe khí khổng & hô hấp"
                            />

                            <KPICard
                                title="Cảm nhận nhiệt"
                                value={metrics.heat}
                                unit="°C"
                                icon="🔥"
                                status={
                                    metrics.heat > 35
                                        ? "Nguy hiểm (Stress nhiệt)"
                                        : metrics.heat > 29
                                        ? "Cảnh báo nóng"
                                        : "An toàn"
                                }
                                colorClass="bg-gradient-to-r from-red-50 to-rose-100 border-red-200 text-red-900"
                                subText="Ảnh hưởng sinh trưởng & con người"
                            />

                            <KPICard
                                title="Điểm Sương"
                                value={metrics.dew}
                                unit="°C"
                                icon="💧"
                                status={metrics.temp - metrics.dew < 2 ? "Cảnh báo nấm mốc cao" : "An toàn"}
                                colorClass="bg-gradient-to-r from-cyan-50 to-sky-100 border-cyan-200 text-cyan-900"
                                subText="Nếu gần nhiệt độ thực -> Nấm bệnh"
                            />
                        </div>
                    </div>
                </section>

                <div className="h-px w-full bg-slate-200 my-8"></div>

                <section className="bg-white p-6 rounded-xl">
                    <h3 className="mb-4 text-lg font-bold text-slate-700">CHI TIẾT LỊCH SỬ DỮ LIỆU</h3>
                    <div className="space-y-8">
                        <section>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-700">
                                <span className="block h-6 w-1 rounded-full bg-blue-500"></span>
                                Môi trường & Đất
                            </h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <MetricChart
                                    title="NHIỆT ĐỘ"
                                    type="line"
                                    data={data}
                                    series={[{ key: "temp", name: "Nhiệt độ (°C)", color: "#ef4444" }]} // Gợi ý thêm color nếu Chart hỗ trợ
                                    yUnit="°C"
                                    height={250}
                                />

                                <MetricChart
                                    title="ĐỘ ẨM KHÔNG KHÍ"
                                    type="air"
                                    data={data}
                                    series={[{ key: "air", name: "Độ ẩm (%)", color: "#3b82f6" }]}
                                    yUnit="%"
                                    height={250}
                                />

                                <MetricChart
                                    title="ĐỘ ẨM ĐẤT"
                                    type="soilHum"
                                    data={data}
                                    series={[{ key: "soilHum", name: "Độ ẩm đất (%)", color: "#8b5cf6" }]}
                                    yUnit="%"
                                    height={250}
                                />
                            </div>
                        </section>

                        <section>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-700">
                                <span className="block h-6 w-1 rounded-full bg-emerald-500"></span>
                                Dinh dưỡng & Hóa tính
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <ChartCard>
                                    <MetricChart
                                        title="ĐỘ PH"
                                        type="ph"
                                        data={data}
                                        series={[{ key: "ph", name: "Độ pH" }]}
                                        yUnit=""
                                        height={250}
                                    />
                                </ChartCard>

                                <ChartCard>
                                    <MetricChart
                                        title="LƯỢNG NITO (N)"
                                        type="nitro"
                                        data={data}
                                        series={[{ key: "nitro", name: "Nito (mg/kg)" }]}
                                        yUnit="mg/kg"
                                        height={250}
                                    />
                                </ChartCard>

                                <ChartCard>
                                    <MetricChart
                                        title="LƯỢNG PHOTPHO (P)"
                                        type="photpho"
                                        data={data}
                                        series={[{ key: "photpho", name: "Photpho (mg/kg)" }]}
                                        yUnit="mg/kg"
                                        height={250}
                                    />
                                </ChartCard>

                                <ChartCard>
                                    <MetricChart
                                        title="LƯỢNG KALI (K)"
                                        type="kali"
                                        data={data}
                                        series={[{ key: "kali", name: "Kali (mg/kg)" }]}
                                        yUnit="mg/kg"
                                        height={250}
                                    />
                                </ChartCard>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </div>
    );
}
