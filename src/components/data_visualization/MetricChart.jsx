import React from "react";
import Card from "./Card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Generic chart component for time-series data
 * Props:
 * - title: card title
 * - type: "line" | "area"
 * - data: array of { time: string, ...series }
 * - series: [{ key: "temp", name: "Nhiệt độ (°C)" }] (supports multi-series)
 * - yUnit: string (e.g. "°C", "mm")
 * - height: number (px)
 */
export default function MetricChart({ title, type = "line", data, series = [], yUnit = "", height = 280 }) {
  const Chart = type === "area" ? AreaChart : LineChart;

  return (
    <Card title={title}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis unit={yUnit} tick={{ fontSize: 12 }} domain={[0, "auto"]} />
            <Tooltip formatter={(v, k) => [`${v} ${yUnit}`.trim(), k]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((s) =>
              type === "area" ? (
                <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} strokeWidth={2} fillOpacity={0.2} />
              ) : (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} dot={{ r: 3 }} strokeWidth={2} />
              )
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}