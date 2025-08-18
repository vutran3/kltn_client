import React from "react";

export default function Card({ title, children }) {
  return (
    <div className="rounded-2xl bg-white/90 shadow p-4 md:p-6 border border-slate-200">
      <h3 className="text-center text-lg md:text-xl font-semibold text-slate-800 mb-2">
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}