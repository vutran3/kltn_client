export function MetricCard({ title, value, unit }) {
    const isWarning = value === null || value === undefined || Number.isNaN(value);

    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col gap-1">
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
