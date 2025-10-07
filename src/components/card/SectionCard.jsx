import React from "react";

export default function SectionCard({ title, subtitle, actions, children, className = "" }) {
    return (
        <section className={"bg-white rounded-2xl border border-gray-200/70 shadow-sm " + className}>
            {(title || actions || subtitle) && (
                <header className="flex items-start justify-between gap-4 px-5 pt-4">
                    <div>
                        {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </header>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}
