import React from "react";
import ImagePreview from "./ImagePreview";
import RowSkeleton from "./RowSkeleton";
import AnnotatedImage from "./AnnotatedImage";

function Pagination({ page, totalPages, onPage }) {
    const canPrev = page > 1; const canNext = page < totalPages;
    return (
        <div className="flex items-center justify-between gap-3 pt-3 mb-2">
            <div className="text-sm text-slate-600">Trang {page} / {totalPages}</div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => canPrev && onPage(page - 1)}
                    className={`h-9 rounded-lg px-3 text-sm border ${canPrev ? "bg-white hover:bg-slate-50" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                >Trước</button>
                <button
                    onClick={() => canNext && onPage(page + 1)}
                    className={`h-9 rounded-lg px-3 text-sm border ${canNext ? "bg-white hover:bg-slate-50" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                >Sau</button>
            </div>
        </div>
    );
}

export default function QualityTable({ data = [], loading = false, page = 1, totalPages = 1, onPage }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow">
            <div className="overflow-x-auto">
                <table className="min-w-[920px] w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 text-sm">
                        <tr>
                            <th className="px-3 py-3 font-semibold text-center">STT</th>
                            <th className="px-3 py-3 font-semibold text-center">Ảnh thực tế</th>
                            <th className="px-3 py-3 font-semibold text-center">Thời gian ghi nhận</th>
                            <th className="px-3 py-3 font-semibold text-center">Ảnh sau chuẩn đoán</th>
                            <th className="px-3 py-3 font-semibold text-center">Chuẩn đoán AI</th>
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
                                    <div className="text-center text-slate-600">Không có bản ghi nào trong khoảng thời gian đã chọn.</div>
                                </td>
                            </tr>
                        )}


                        {!loading && data.map((row, idx) => (
                            <tr key={row.id || idx} className="border-t border-slate-100 hover:bg-slate-50/60">
                                <td className="px-3 py-3">{row.no ?? idx + 1}</td>
                                <td className="px-3 py-3"><ImagePreview src={row.originalUrl} alt={`original-${idx}`} /></td>
                                <td className="px-3 py-3 whitespace-nowrap">{row.capturedAt}</td>
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
                                        <ImagePreview src= {row.originalUrl} alt={`detected-${idx}`} />
                                    )}

                                </td>
                                <td className="px-3 py-3">
                                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 leading-relaxed text-slate-700">
                                        {row.aiMessage}
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