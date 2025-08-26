import React from "react";

export default function TabNav({ tabs, active, onChange }) {
    return (
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex gap-6" aria-label="Tabs">
                {tabs.map((t) => {
                    const isActive = active === t.value;
                    return (
                        <button
                            key={t.value}
                            onClick={() => onChange(t.value)}
                            className={
                                "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium " +
                                (isActive
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")
                            }
                        >
                            {t.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
