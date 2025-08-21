import React, { useEffect, useState } from "react";
import ImagePreview from "./ImagePreview";

export default function AnnotatedImage({
  src,
  boxes = [],
  originalSize,                 // { width, height } từ API; nếu thiếu, sẽ detect từ ảnh
  thumbHeight = 100,            // chiều cao thumbnail trong bảng
  showLabels = true,
  color = "#0ea5e9",
  crossOrigin = "anonymous",
}) {
  const [dataUrl, setDataUrl] = useState(null);
  const [natSize, setNatSize] = useState(originalSize || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    const img = new Image();
    img.crossOrigin = crossOrigin;
    img.decoding = "async";
    img.src = src;

    img.onload = () => {
      if (canceled) return;
      const W = (originalSize?.width)  || img.naturalWidth;
      const H = (originalSize?.height) || img.naturalHeight;
      setNatSize({ width: W, height: H });

      // VẼ CANVAS FULL-RES
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      // vẽ ảnh gốc full-res
      ctx.drawImage(img, 0, 0, W, H);

      // vẽ boxes theo toạ độ gốc (không cần scale!)
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.font = "20px ui-sans-serif, system-ui, -apple-system, 'Segoe UI'";
      ctx.fillStyle = "rgba(14,165,233,0.18)";

      (boxes || []).forEach(b => {
        const x = Math.round(b.x1);
        const y = Math.round(b.y1);
        const w = Math.round(b.x2 - b.x1);
        const h = Math.round(b.y2 - b.y1);
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);

        if (showLabels) {
          const label = `${b.cls ?? "obj"} ${(b.conf ?? 0).toFixed(2)}`;
          const padX = 6;
          const textW = ctx.measureText(label).width;
          ctx.fillStyle = color;
          ctx.fillRect(x, Math.max(0, y - 22), textW + padX * 2, 22);
          ctx.fillStyle = "#fff";
          ctx.fillText(label, x + padX, Math.max(16, y - 6));
          ctx.fillStyle = "rgba(14,165,233,0.18)";
        }
      });

      try {
        const url = canvas.toDataURL("image/png"); // FULL-RES
        if (!canceled) setDataUrl(url);
      } catch (e) {
        console.error("toDataURL failed (CORS?)", e);
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

    return () => { canceled = true; };
  }, [src, boxes, originalSize, color, showLabels, crossOrigin]);

  if (loading || !natSize) {
    return <div className="h-[100px] w-[140px] rounded-xl bg-slate-200 animate-pulse" />;
  }

  // Trả ImagePreview với ảnh annotated FULL-RES, nhưng hiển thị thumbnail theo thumbHeight
  return (
    <ImagePreview
      src={dataUrl || src}
      alt="annotated"
      thumbHeight={thumbHeight}
    />
  );
}
