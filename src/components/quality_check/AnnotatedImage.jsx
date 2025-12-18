import React, { useEffect, useState } from "react";
import ImagePreview from "./ImagePreview";

export default function AnnotatedImage({
    src,
    boxes = [],
    originalSize,
    thumbHeight = 100,
    showLabels = true,
    color = "#0ea5e9",
    crossOrigin = "anonymous",
    fullView = false,
    onZoom = null
}) {
    const [dataUrl, setDataUrl] = useState(null);
    const [natSize, setNatSize] = useState(originalSize || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let canceled = false;
        const img = new Image();
        img.crossOrigin = crossOrigin;
        // img.decoding = "async"; // Tạm bỏ để đảm bảo load mượt hơn trên một số trình duyệt
        img.src = src;

        img.onload = () => {
            if (canceled) return;
            const W = originalSize?.width || img.naturalWidth;
            const H = originalSize?.height || img.naturalHeight;
            setNatSize({ width: W, height: H });

            const canvas = document.createElement("canvas");
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext("2d");

            // Vẽ ảnh gốc
            ctx.drawImage(img, 0, 0, W, H);

            // Vẽ boxes
            ctx.lineWidth = 3; // Tăng độ dày nét vẽ cho rõ
            ctx.strokeStyle = color;
            ctx.font = "bold 24px Arial"; // Font to hơn chút

            (boxes || []).forEach((b) => {
                // Xử lý linh hoạt nếu box là [x,y,w,h] hoặc object {x1,y1,x2,y2}
                // Giả sử logic cũ của bạn dùng object {x1, y1, x2, y2}
                const x = Math.round(b.x1);
                const y = Math.round(b.y1);
                const w = Math.round(b.x2 - b.x1);
                const h = Math.round(b.y2 - b.y1);

                // Vẽ nền mờ bên trong box để dễ nhìn hơn
                ctx.fillStyle = "rgba(14,165,233,0.1)";
                ctx.fillRect(x, y, w, h);

                ctx.strokeRect(x, y, w, h);

                if (showLabels) {
                    const label = `${b.cls ?? "obj"} ${(b.conf ?? 0).toFixed(2)}`;
                    const padX = 8;
                    const padY = 6;
                    const textMetrics = ctx.measureText(label);
                    const textW = textMetrics.width;
                    const textH = 24; // xấp xỉ font size

                    ctx.fillStyle = color;
                    ctx.fillRect(x, Math.max(0, y - textH - padY), textW + padX * 2, textH + padY);

                    ctx.fillStyle = "#fff";
                    ctx.fillText(label, x + padX, Math.max(textH, y - 6));
                }
            });

            try {
                const url = canvas.toDataURL("image/png");
                if (!canceled) setDataUrl(url);
            } catch (e) {
                console.error("toDataURL failed", e);
                if (!canceled) setDataUrl(null);
            } finally {
                if (!canceled) setLoading(false);
            }
        };

        img.onerror = (e) => {
            console.error("Image load error:", e);
            if (!canceled) {
                setDataUrl(null);
                setLoading(false);
            }
        };

        return () => {
            canceled = true;
        };
    }, [src, boxes, originalSize, color, showLabels, crossOrigin]);

    // Loading State
    if (loading || !natSize) {
        return (
            <div
                className={`${
                    fullView ? "w-full h-full" : "h-[100px] w-[140px]"
                } rounded-xl bg-slate-200 animate-pulse flex items-center justify-center text-slate-400`}
            >
                Loading...
            </div>
        );
    }

    if (fullView) {
        return (
            <img
                src={dataUrl || src}
                alt="annotated-full"
                className="w-full h-full object-contain cursor-zoom-in transition-transform duration-300 z-200"
                onClick={() => onZoom && onZoom(dataUrl || src)}
            />
        );
    }

    // --- TRƯỜNG HỢP THUMBNAIL (Dùng cho bảng) ---
    return <ImagePreview src={dataUrl || src} alt="annotated" thumbHeight={thumbHeight} />;
}
