import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function NpkCard({ rows, targets }) {
    const last = rows?.length ? rows[rows.length - 1] : null;
    const data = [
        { name: "N", value: last?.nitrogen ?? null, low: targets?.n?.low, high: targets?.n?.high },
        { name: "P", value: last?.phosphorus ?? null, low: targets?.p?.low, high: targets?.p?.high },
        { name: "K", value: last?.potassium ?? null, low: targets?.k?.low, high: targets?.k?.high }
    ];

    return (
        <div className="rounded-2xl border p-4 shadow-sm bg-white">
            <div className="font-semibold text-slate-800 mb-3">Dinh dưỡng N-P-K (ppm tương đối)</div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(v) => (v == null ? "—" : Number(v).toFixed(0))} />
                        <Bar dataKey="value" fill="#3b82f6" />
                        {data.map((d, i) => (
                            <ReferenceLine key={i + "low"} y={d.low} stroke="#f59e0b" strokeDasharray="4 4" />
                        ))}
                        {data.map((d, i) => (
                            <ReferenceLine key={i + "high"} y={d.high} stroke="#ef4444" strokeDasharray="4 4" />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="text-xs text-slate-500 mt-2">
                Đường vàng: ngưỡng thấp ~ cần bổ sung; Đường đỏ: ngưỡng cao ~ tránh bón quá mức.
            </div>
        </div>
    );
}
