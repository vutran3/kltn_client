import React from "react";


export default function RowSkeleton() {
    return (
        <tr className="animate-pulse">
            <td className="px-3 py-3"><div className="h-4 w-8 rounded bg-slate-200" /></td>
            <td className="px-3 py-3"><div className="h-20 w-28 rounded-xl bg-slate-200" /></td>
            <td className="px-3 py-3"><div className="h-4 w-36 rounded bg-slate-200" /></td>
            <td className="px-3 py-3"><div className="h-20 w-28 rounded-xl bg-slate-200" /></td>
            <td className="px-3 py-3"><div className="h-10 w-full rounded bg-slate-200" /></td>
        </tr>
    );
}