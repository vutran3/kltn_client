
export default function Card({ title, children, actions }) {
    return (
        <div className="rounded-2xl bg-white/90 shadow p-4 md:p-6 border border-slate-200">
            {(title || actions) && (
                <div className="mb-3 flex items-center justify-between gap-3">
                    {title ? (
                        <h3 className="text-lg md:text-xl font-semibold text-slate-800">{title}</h3>
                    ) : <div />}
                    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
                </div>
            )}
            {children}
        </div>
    );
}