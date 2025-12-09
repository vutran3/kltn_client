import React from "react";
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter } from "recharts";

const COLUMN_WIDTH = 120;

const TargetMarker = (props) => {
    const { cx, cy, stroke, width } = props;
    if (!cx || !cy) return null;
    return (
        <line
            x1={cx - width / 2}
            x2={cx + width / 2}
            y1={cy}
            y2={cy}
            stroke={stroke}
            strokeWidth={3}
            strokeDasharray="4 4"
        />
    );
};

// 1. Tạo Custom Tooltip để kiểm soát dữ liệu hiển thị
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg opacity-95">
                <p className="mb-2 font-bold text-slate-700">{label}</p>
                {payload.map((entry, index) => {
                    // Lọc bỏ các giá trị không hợp lệ (NaN hoặc không phải số)
                    const val = entry.value;
                    if (val === null || val === undefined || isNaN(Number(val))) return null;

                    // Xác định nhãn và màu sắc dựa trên dataKey/name
                    let displayLabel = "Hiện tại";
                    let colorClass = "bg-blue-500";
                    let isDashed = false;

                    if (entry.name === "low") {
                        displayLabel = "Ngưỡng thấp";
                        colorClass = "border-amber-500";
                        isDashed = true;
                    } else if (entry.name === "high") {
                        displayLabel = "Ngưỡng cao";
                        colorClass = "border-red-500";
                        isDashed = true;
                    }

                    return (
                        <div key={index} className="flex items-center gap-2 mb-1 last:mb-0 text-sm">
                            {/* Icon chỉ dẫn màu */}
                            {isDashed ? (
                                <span className={`w-4 h-0 border-t-2 border-dashed ${colorClass}`}></span>
                            ) : (
                                <span className={`w-3 h-3 rounded-sm ${colorClass}`}></span>
                            )}

                            <span className="text-slate-600 min-w-[80px]">{displayLabel}:</span>
                            <span className="font-semibold text-slate-800">{Number(val).toFixed(0)}</span>
                        </div>
                    );
                })}
            </div>
        );
    }
    return null;
};

export default function NpkCard({ rows, targets }) {
    const last = rows?.length ? rows[rows.length - 1] : null;

    const data = [
        { name: "N", value: last?.nitrogen ?? null, low: targets?.n?.low, high: targets?.n?.high },
        { name: "P", value: last?.phosphorus ?? null, low: targets?.p?.low, high: targets?.p?.high },
        { name: "K", value: last?.potassium ?? null, low: targets?.k?.low, high: targets?.k?.high }
    ];

    return (
        <div className="rounded-2xl border border-gray-300 p-4 shadow-sm bg-white">
            <div className="font-semibold text-slate-800 mb-3">Dinh dưỡng N-P-K (ppm tương đối)</div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.5} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 500 }} />
                        <YAxis />

                        {/* 2. Sử dụng Custom Tooltip thay cho Tooltip mặc định */}
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />

                        <Bar
                            dataKey="value"
                            name="Hiện tại"
                            fill="#3b82f6"
                            barSize={COLUMN_WIDTH}
                            radius={[4, 4, 0, 0]}
                        />

                        <Scatter
                            name="low"
                            dataKey="low"
                            shape={<TargetMarker stroke="#f59e0b" width={COLUMN_WIDTH} />}
                            legendType="none"
                        />

                        <Scatter
                            name="high"
                            dataKey="high"
                            shape={<TargetMarker stroke="#ef4444" width={COLUMN_WIDTH} />}
                            legendType="none"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Legend bên dưới giữ nguyên */}
            <div className="text-xs text-slate-500 mt-2 flex gap-4 justify-center">
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-blue-500 rounded-sm"></span> Hiện tại
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-500"></span> Ngưỡng thấp
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-4 h-0.5 border-t-2 border-dashed border-red-500"></span> Ngưỡng cao
                </div>
            </div>
        </div>
    );
}
