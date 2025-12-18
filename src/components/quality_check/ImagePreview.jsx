import React, { useState } from "react";
import { ZoomIn, X } from "lucide-react";

export default function ImagePreview({ src, alt, thumbHeight = 100 }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="group relative block overflow-hidden rounded-xl border border-slate-200 hover:shadow"
                title="Xem lớn"
                style={{ height: thumbHeight }}
            >
                <img
                    src={src}
                    alt={alt}
                    className="h-full w-auto object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                />
                <span className="absolute bottom-1 right-1 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] text-white">
                    <ZoomIn className="h-3.5 w-3.5" />
                    Zoom
                </span>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setOpen(false)}
                >
                    <div className="relative max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute -top-3 -right-3 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow hover:bg-slate-50"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <img src={src} alt={alt} className="max-h-[90vh] w-auto rounded-xl shadow-2xl" />
                    </div>
                </div>
            )}
        </>
    );
}
