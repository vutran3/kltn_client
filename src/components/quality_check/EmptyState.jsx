import React from "react";
import { Bot, Image as ImageIcon } from "lucide-react";


export default function EmptyState({ title = "Chưa có dữ liệu", subtitle = "Kết quả kiểm tra sẽ hiển thị tại đây." }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-10 text-center bg-white/60">
            <div className="mb-3 flex items-center justify-center gap-2 text-slate-500">
                <ImageIcon className="h-6 w-6" />
                <Bot className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
    );
}