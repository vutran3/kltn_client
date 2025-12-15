import { useMemo, useState } from "react";
import { postDataApi } from "../../utils/fetch";
import { fmtTs } from "../../utils";
import PlanTodoList from "./PlanTodoList";

export default function AIAdvisor({ deviceId, rows, bands, npkTargets, loadingSource, selectedCrop, selectedNotes }) {
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState("");
    const [userDescription, setUserDescription] = useState("");

    const [activeTab, setActiveTab] = useState("report");
    console.log(deviceId);
    const payload = useMemo(() => {
        const last = rows?.length ? rows[rows.length - 1] : null;
        const timeRange = rows?.length ? `${fmtTs(rows[0].t)} → ${fmtTs(rows[rows.length - 1].t)}` : "N/A";
        const avg = (key) => {
            const arr = rows?.map((r) => r?.[key]).filter((v) => v != null) || [];
            if (!arr.length) return null;
            return arr.reduce((a, b) => a + b, 0) / arr.length;
        };

        return {
            deviceId,
            cropType: selectedCrop,
            contextNotes: selectedNotes,
            userDescription: userDescription,
            timeRange,
            latest: last
                ? {
                      at: last.t,
                      ph: last.ph,
                      soilHumidity: last.soilHumidity,
                      soilTemperature: last.soilTemperature,
                      airTemperature: last.airTemperature,
                      airHumidity: last.airHumidity,
                      lightRaw: last.lightRaw,
                      nitrogen: last.nitrogen,
                      phosphorus: last.phosphorus,
                      potassium: last.potassium
                  }
                : null,
            average: {
                ph: avg("ph"),
                soilHumidity: avg("soilHumidity"),
                soilTemperature: avg("soilTemperature"),
                airTemperature: avg("airTemperature"),
                airHumidity: avg("airHumidity"),
                lightRaw: avg("lightRaw"),
                nitrogen: avg("nitrogen"),
                phosphorus: avg("phosphorus"),
                potassium: avg("potassium")
            },
            bands,
            npkTargets
        };
    }, [rows, deviceId, bands, npkTargets, selectedCrop, selectedNotes, userDescription]);

    const askAI = async () => {
        setLoading(true);
        setAnswer("");
        setActiveTab("report");

        if (deviceId) localStorage.removeItem(`agri_plan_${deviceId}`);

        try {
            const res = await postDataApi("/env-advisor", payload, { "Content-Type": "application/json" });
            const html = res?.data?.data?.advice || "Không nhận được phản hồi.";
            setAnswer(html);
        } catch (e) {
            setAnswer(`Lỗi khi gọi AI: ${e?.message || "Unknown"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-300 p-5 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        AI Trợ lý nông nghiệp
                    </div>
                    <div className="text-sm text-slate-500 mt-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">
                                {selectedCrop}
                            </span>
                            <span>{selectedNotes?.length ? selectedNotes.join(", ") : "Chưa có ghi chú ngữ cảnh"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả bổ sung của bạn:</label>
                <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y transition-all"
                    rows={2}
                    placeholder="VD: Cây đang vàng lá, tôi vừa tưới hôm qua..."
                    value={userDescription}
                    onChange={(e) => setUserDescription(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="flex w-full justify-between items-center mb-4">
                <details className="text-xs text-slate-400 cursor-pointer">
                    <summary>Debug Data</summary>
                    <pre className="fixed left-0 top-0 bg-black text-white p-4 z-50 max-h-[50vh] overflow-auto hidden">
                        {JSON.stringify({ deviceId, latest: payload.latest }, null, 2)}
                    </pre>
                </details>

                <button
                    className={`
                        bg-emerald-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-emerald-700 
                        disabled:opacity-60 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2
                        ${loading ? "pl-4" : ""}
                    `}
                    onClick={askAI}
                    disabled={loading || loadingSource || !deviceId}
                >
                    {loading && (
                        <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    )}
                    {loading ? "Đang phân tích & Gửi mail..." : "Phân tích & Lập kế hoạch"}
                </button>
            </div>

            <div className="mt-2 border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden min-h-[150px]">
                {answer ? (
                    <div className="bg-white">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab("report")}
                                className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                                    activeTab === "report"
                                        ? "text-emerald-700 border-emerald-600 bg-emerald-50/30"
                                        : "text-gray-500 border-transparent hover:bg-gray-50"
                                }`}
                            >
                                📄 Báo cáo chi tiết
                            </button>
                            <button
                                onClick={() => setActiveTab("todo")}
                                className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                                    activeTab === "todo"
                                        ? "text-emerald-700 border-emerald-600 bg-emerald-50/30"
                                        : "text-gray-500 border-transparent hover:bg-gray-50"
                                }`}
                            >
                                ✅ Checklist hành động
                            </button>
                        </div>

                        <div className="p-4">
                            {activeTab === "report" ? (
                                <div className="prose prose-sm max-w-none prose-headings:text-emerald-800 prose-a:text-blue-600">
                                    <div dangerouslySetInnerHTML={{ __html: answer }} />
                                </div>
                            ) : (
                                <PlanTodoList adviceHtml={answer} deviceId={deviceId} />
                            )}
                        </div>

                        <div className="bg-blue-50 p-2 text-center border-t border-blue-100 flex justify-center items-center gap-2">
                            <svg
                                className="w-4 h-4 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            <span className="text-xs text-blue-600 font-medium">
                                Hệ thống đã tự động gửi báo cáo chi tiết về email của bạn.
                            </span>
                        </div>
                    </div>
                ) : (
                    /* Loading / Empty State */
                    <div className="h-full min-h-[200px] flex flex-col justify-center items-center p-6 text-center">
                        {loading ? (
                            <div className="space-y-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
                                <p className="text-sm text-gray-500 animate-pulse">
                                    Đang phân tích dữ liệu đất & soạn thảo email...
                                </p>
                            </div>
                        ) : (
                            <div className="max-w-xs mx-auto">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">🌱</span>
                                </div>
                                <p className="text-slate-500 text-sm">
                                    Nhấn nút <b>"Phân tích"</b> để AI đánh giá sức khỏe đất trồng và tạo Checklist công
                                    việc cụ thể cho 7-14 ngày tới.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
