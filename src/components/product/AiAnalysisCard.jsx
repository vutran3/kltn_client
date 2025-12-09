import React from "react";
import ReactMarkdown from "react-markdown";

function AiAnalysisCard({ description }) {
    if (!description) return null;

    return (
        <div className="relative overflow-hidden bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-900/10">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-start gap-4 relative z-10">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400 shrink-0 mt-1">
                    {/* Sparkles Icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-emerald-100 flex items-center gap-2">
                        Đánh giá & Phân tích từ AI
                    </h3>

                    {/* Render Markdown */}
                    <div className="text-slate-300 text-sm leading-relaxed">
                        <ReactMarkdown
                            components={{
                                strong: ({ node, ...props }) => (
                                    <span className="font-bold text-emerald-200" {...props} />
                                ),
                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                                ol: ({ node, ...props }) => (
                                    <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />
                                ),
                                li: ({ node, ...props }) => (
                                    <li className="marker:text-emerald-500/70 pl-1" {...props} />
                                ),
                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                h1: ({ node, ...props }) => (
                                    <h1 className="text-lg font-bold text-white mt-4 mb-2" {...props} />
                                ),
                                h2: ({ node, ...props }) => (
                                    <h2 className="text-base font-bold text-white mt-3 mb-2" {...props} />
                                ),
                                h3: ({ node, ...props }) => (
                                    <h3 className="text-sm font-bold text-white mt-2 mb-1" {...props} />
                                )
                            }}
                        >
                            {description}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AiAnalysisCard;
