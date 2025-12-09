import { useMemo, useState } from "react";
import { postDataApi } from "../../utils/fetch";
import { fmtTs } from "../../utils";

export default function AIAdvisor({ deviceId, rows, bands, npkTargets, loadingSource, selectedCrop, selectedNotes }) {
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState("");

    const [userDescription, setUserDescription] = useState("");

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
        try {
            const res = await postDataApi("/soil-advisor", payload, { "Content-Type": "application/json" });
            const html = res?.data?.data?.advice || "Không nhận được phản hồi.";
            setAnswer(html);
        } catch (e) {
            setAnswer(`Lỗi khi gọi AI: ${e?.message || "Unknown"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-300 p-4 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="font-semibold text-slate-800">AI tư vấn canh tác cho cây họ cải</div>
                    <div className="text-sm text-slate-500 flex flex-col">
                        <span>
                            <span className="font-semibold inline-block mr-1">Tối ưu theo: </span>
                            <span>{selectedCrop}</span>
                        </span>

                        <span>
                            <span className="font-semibold inline-block mr-1">Bối cảnh:</span>
                            {selectedNotes?.length ? <span>{selectedNotes.join(" | ")}</span> : "Không có"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả bổ sung (Tùy chọn):</label>
                <textarea
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y"
                    rows={3}
                    placeholder="Ví dụ: Cây đang có dấu hiệu vàng lá, tôi vừa bón phân hôm qua..."
                    value={userDescription}
                    onChange={(e) => setUserDescription(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="flex w-full justify-end">
                <button
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-60 text-nowrap"
                    onClick={askAI}
                    disabled={loading || loadingSource || !deviceId}
                >
                    {loading ? "Đang phân tích..." : "Phân tích & Tư vấn"}
                </button>
            </div>

            <details className="mb-3 mt-2">
                <summary className="text-sm text-slate-600 cursor-pointer">Xem tóm tắt dữ liệu gửi AI</summary>
                <pre className="text-[12px] whitespace-pre-wrap leading-5 bg-slate-50 p-2 rounded mt-2 overflow-auto border border-slate-100">
                    {JSON.stringify(
                        {
                            deviceId: payload.deviceId,
                            cropType: payload.cropType,
                            userDescription: payload.userDescription,
                            contextNotes: payload.contextNotes,
                            latest: payload.latest
                        },
                        null,
                        2
                    )}
                </pre>
            </details>

            <div className="ai-advice border border-gray-300 rounded-lg p-3 bg-white overflow-auto min-h-24">
                {answer ? (
                    <div dangerouslySetInnerHTML={{ __html: answer }} />
                ) : (
                    <div className="min-h-24">
                        {loading ? (
                            <div className="w-full min-h-24 flex justify-center items-center ">
                                <div role="status">
                                    <svg
                                        aria-hidden="true"
                                        className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-emerald-600"
                                        viewBox="0 0 100 101"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"
                                        />
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-400 text-sm">Chưa có kết quả. Nhấn “Phân tích & Tư vấn”.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
