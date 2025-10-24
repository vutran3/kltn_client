import { Image as ImgIcon, Trash2 } from "lucide-react";
import React, { useRef } from "react";

export function ImagePicker({ label = "Chọn ảnh", file, setFile, preview, setPreview, accept = "image/*" }) {
    const inputRef = useRef(null);

    const onPick = (e) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            const url = URL.createObjectURL(f);
            setPreview(url);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const f = e.dataTransfer.files?.[0];
        if (f) {
            setFile(f);
            const url = URL.createObjectURL(f);
            setPreview(url);
        }
    };

    return (
        <div className="space-y-2">
            <div className="text-sm mb-4 font-medium text-slate-800">{label}</div>
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer p-4 flex items-center gap-3"
            >
                <div className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center">
                    <ImgIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-slate-800">Kéo thả ảnh vào đây hoặc bấm để chọn</div>
                    <div className="text-xs text-slate-500">Hỗ trợ: JPG/PNG</div>
                </div>
                <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onPick} />
            </div>

            {preview && (
                <div className="relative">
                    <img
                        src={preview}
                        alt="preview"
                        className="w-full max-h-72 object-contain rounded-xl border border-gray-300"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setFile(null);
                            setPreview("");
                        }}
                        className="cursor-pointer absolute text-red-500 top-2 right-2 flex justify-center items-center gap-1 text-xs bg-white/90 hover:bg-white border rounded-full h-6 w-6"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    );
}
