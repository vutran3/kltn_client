import React from "react";
import ImagePreview from "./ImagePreview";
import RowSkeleton from "./RowSkeleton";
import AnnotatedImage from "./AnnotatedImage";

function Pagination({ page, totalPages, onPage }) {
    const canPrev = page > 1;
    const canNext = page < totalPages;
    return (
        <div className="flex items-center justify-between gap-3 pt-3 mb-2">
            <div className="text-sm text-slate-600">
                Trang {page} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => canPrev && onPage(page - 1)}
                    className={`h-9 rounded-lg px-3 text-sm border ${
                        canPrev ? "bg-white hover:bg-slate-50" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                >
                    Trước
                </button>
                <button
                    onClick={() => canNext && onPage(page + 1)}
                    className={`h-9 rounded-lg px-3 text-sm border ${
                        canNext ? "bg-white hover:bg-slate-50" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                >
                    Sau
                </button>
            </div>
        </div>
    );
}

export default function QualityTable({ data = [], loading = false, page = 1, totalPages = 1, onPage }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow">
            <div
                role="alert"
                className="mx-3 mt-3 mb-2 flex items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-900 shadow-sm"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-0.5 h-5 w-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 9v3m0 3h.01M10.29 3.86l-7.5 12.99A1.5 1.5 0 004.08 19h15.84a1.5 1.5 0 001.29-2.15l-7.5-12.99a1.5 1.5 0 00-2.58 0z"
                    />
                </svg>
                <div className="text-sm leading-relaxed">
                    <div className="font-semibold text-base"> Thông tin từ mục “Hỗ trợ cảnh báo sớm”</div>
                    <div className="mt-0.5">
                        Các gợi ý trong mục này được tạo tự động bởi hệ thống AI để giúp bạn tham khảo nhanh. Tuy nhiên,{" "}
                        <span className="font-semibold">AI có thể chưa hiểu hết tình huống thực tế</span>, vì vậy bạn{" "}
                        <span className="font-semibold">nên kiểm tra lại và trao đổi với chuyên gia</span> trước khi áp
                        dụng.
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-[920px] w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 text-sm">
                        <tr>
                            <th className="px-3 py-3 font-semibold text-center">STT</th>
                            <th className="px-3 py-3 font-semibold text-center">Ảnh thực tế</th>
                            <th className="px-3 py-3 font-semibold text-center">Thời gian ghi nhận</th>
                            <th className="px-3 py-3 font-semibold text-center">Ảnh sau chuẩn đoán</th>

                            {/* Header cột AI + nhãn/tooltip thân thiện */}
                            <th className="px-3 py-3 font-semibold text-center">
                                <div className="inline-flex items-center justify-center gap-2">
                                    <span>Hỗ trợ cảnh báo sớm</span>
                                    <span
                                        className="rounded-md bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-800"
                                        title="Nội dung do AI gợi ý để tham khảo nhanh. Vui lòng kiểm tra thực tế và hỏi ý kiến chuyên gia trước khi áp dụng."
                                        aria-label="Lưu ý về nội dung AI"
                                    >
                                        AI
                                    </span>
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody className="align-top text-sm text-slate-800">
                        {loading && (
                            <>
                                <RowSkeleton />
                                <RowSkeleton />
                                <RowSkeleton />
                            </>
                        )}

                        {!loading && data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-3 py-6">
                                    <div className="text-center text-slate-600">
                                        Không có bản ghi nào trong khoảng thời gian đã chọn.
                                    </div>
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            data.map((row, idx) => (
                                <tr key={row.id || idx} className="border-t border-slate-100 hover:bg-slate-50/60">
                                    <td className="px-3 py-3 text-center">{row.no ?? idx + 1}</td>
                                    <td className="px-3 py-3">
                                        <ImagePreview src={row.originalUrl} alt={`original-${idx}`} />
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap text-center">{row.capturedAt}</td>
                                    <td className="px-3 py-3">
                                        {row.boxes && row.originalSize ? (
                                            <AnnotatedImage
                                                src={row.originalUrl}
                                                boxes={row.boxes}
                                                originalSize={row.originalSize}
                                                thumbHeight={100}
                                                showLabels={true}
                                                color="#0ea5e9"
                                            />
                                        ) : (
                                            <ImagePreview src={row.originalUrl} alt={`detected-${idx}`} />
                                        )}
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 leading-relaxed text-slate-700">
                                            {row.aiMessage}
                                            <div className="mt-2 text-xs text-yellow-700/90">
                                                ⚠️ Gợi ý tham khảo. Hãy kiểm tra thực tế & hỏi chuyên gia trước khi áp
                                                dụng.
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            <div className="px-3 md:px-4">
                <Pagination page={page} totalPages={totalPages} onPage={onPage} />
            </div>
        </div>
    );
}
