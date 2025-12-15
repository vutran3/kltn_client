export default function KpiCard({ title, value, unit, band }) {
    const inBand = value != null && band && value >= band.min && value <= band.max;
    return (
        <div className={`rounded-2xl border p-4 shadow-sm ${inBand ? "border-emerald-300" : "border-rose-300"}`}>
            <div className="text-sm text-slate-500">{title}</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
                {value == null ? "—" : `${Number(value).toFixed(value % 1 ? 1 : 0)}${unit || ""}`}
            </div>
            {band && (
                <div className="text-xs mt-1 text-slate-500">
                    Ngưỡng tốt: {band.min}
                    {unit || ""} – {band.max}
                    {unit || ""}
                </div>
            )}
            <div
                className={`mt-2 inline-block text-xs px-2 py-1 rounded-full ${
                    inBand ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
            >
                {inBand ? "Ổn định" : "Cảnh báo"}
            </div>
        </div>
    );
}
