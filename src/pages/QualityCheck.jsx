import React, { useState } from "react";
import AutoDetect from "../components/quality_check/tabs/AutoDetect";
import ManualDetect from "../components/quality_check/tabs/ManualDetect";
import UploadKnowledgePanel from "../components/quality_check/tabs/UploadKnowledgePanel";

export default function QualityDetect() {
    const [tab, setTab] = useState("auto");

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50/60 to-gray-50/100 p-4 md:p-8 space-y-6">
            <div className="w-full">
                <div className="inline-flex gap-1 rounded-2xl bg-white border border-gray-300 p-1 shadow-sm">
                    <button
                        onClick={() => setTab("auto")}
                        className={`px-4 h-10 rounded-xl text-sm font-medium ${
                            tab === "auto" ? "bg-indigo-600 text-white shadow" : "text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                        Kiểm tra tự động
                    </button>

                    <button
                        onClick={() => setTab("manual")}
                        className={`px-4 h-10 rounded-xl text-sm font-medium ${
                            tab === "manual" ? "bg-indigo-600 text-white shadow" : "text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                        Kiểm tra thủ công
                    </button>

                    <button
                        onClick={() => setTab("data")}
                        className={`px-4 h-10 rounded-xl text-sm font-medium ${
                            tab === "data" ? "bg-indigo-600 text-white shadow" : "text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                        Thêm dữ liệu bệnh cây trồng
                    </button>
                </div>
            </div>

            {tab === "auto" && <AutoDetect />}
            {tab === "manual" && <ManualDetect />}
            {tab === "data" && <UploadKnowledgePanel />}
        </div>
    );
}
