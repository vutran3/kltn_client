import React, { useState } from "react";
import { Filter, RotateCcw } from "lucide-react";

export default function TimeFilter({ onFilter, onReset }) {
    const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 16));
    const [to, setTo] = useState("");

    return (
        <div className="w-full rounded-2xl bg-white/90 shadow p-4 md:p-6 border border-slate-200">
            <h2 className="text-center text-xl md:text-2xl font-semibold tracking-wide text-slate-800">
                BỘ LỌC THỜI GIAN
            </h2>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-end">

                <div className="lg:col-span-5">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Từ ngày</label>
                    <input
                        type="datetime-local"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-sky-400"
                    />
                </div>

                <div className="lg:col-span-5">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Đến ngày</label>
                    <input
                        type="datetime-local"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        placeholder="dd/mm/yyyy --:-- --"
                        className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-sky-400"
                    />
                </div>

                <div className="lg:col-span-2">
                    <div className="flex flex-col md:flex-row gap-2">
                        <button
                            onClick={() => onFilter(from, to)}
                            className="flex-1 min-w-0 inline-flex items-center justify-center h-11 px-4 rounded-xl bg-sky-600 text-white font-medium shadow-sm hover:bg-sky-700 active:bg-sky-800 transition-colors"
                        >
                            <Filter className="w-5 h-5 mr-2" />
                            Lọc
                        </button>

                        <button
                            onClick={() => {
                                setTo("");
                                const f = new Date().toISOString().slice(0, 16);
                                setFrom(f);
                                onReset && onReset();
                            }}
                            className="flex-1 min-w-0 inline-flex items-center justify-center h-10 md:h-11 px-3 md:px-4 rounded-xl bg-white text-slate-700 border border-slate-300 font-medium text-sm md:text-base hover:bg-slate-50 active:bg-slate-100 transition-colors gap-2"
                        >
                            <RotateCcw size={20}
                                absoluteStrokeWidth
                                className="block shrink-0" />
                            <span className="">Reset</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}