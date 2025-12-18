import React, { useEffect, useRef, useState } from "react";
import { TiMediaRecord, TiMediaRecordOutline } from "react-icons/ti";

const NO_FRAME_TIMEOUT = 3000;

const LiveStream = ({ title = "Camera" }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [streamActive, setStreamActive] = useState(false);

    const wsRef = useRef(null);
    const frameTimeoutRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const WS_URL = import.meta.env.VITE_WS_URL || "ws://192.168.0.103:8000/ws/camera-stream";

    const clearFrameTimeout = () => {
        if (frameTimeoutRef.current) {
            clearTimeout(frameTimeoutRef.current);
            frameTimeoutRef.current = null;
        }
    };

    const resetFrameTimeout = () => {
        clearFrameTimeout();
        frameTimeoutRef.current = setTimeout(() => {
            console.warn("No frame received → stream inactive");
            setStreamActive(false);
            setImageSrc(null);
        }, NO_FRAME_TIMEOUT);
    };

    const cleanupImage = () => {
        setImageSrc((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
    };

    const connectWebSocket = () => {
        if (wsRef.current) return;

        const ws = new WebSocket(WS_URL);
        ws.binaryType = "blob";
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WS connected");
            setWsConnected(true);
        };

        ws.onmessage = (event) => {
            const blob = event.data;
            const url = URL.createObjectURL(blob);

            setWsConnected(true);
            setStreamActive(true);
            resetFrameTimeout();

            setImageSrc((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return url;
            });
        };

        ws.onerror = (err) => {
            console.error("WS error:", err);
            ws.close();
        };

        ws.onclose = () => {
            console.log("WS disconnected");
            setWsConnected(false);
            setStreamActive(false);
            cleanupImage();
            clearFrameTimeout();
            wsRef.current = null;

            reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            clearFrameTimeout();

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            cleanupImage();
        };
    }, []);

    const isLive = wsConnected && streamActive;

    return (
        <div className="flex flex-col p-4 bg-white rounded-xl shadow-md w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>

                <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-1
                    ${
                        isLive
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-red-100 text-red-700 border border-red-300"
                    }`}
                >
                    {isLive ? (
                        <>
                            <TiMediaRecord size={18} />
                            Live
                        </>
                    ) : (
                        <>
                            <TiMediaRecordOutline size={18} />
                            Offline
                        </>
                    )}
                </span>
            </div>

            {/* Video */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                {isLive && imageSrc ? (
                    <img src={imageSrc} alt="Live Stream" className="w-full h-full object-contain" />
                ) : (
                    <div className="text-gray-500 flex flex-col items-center animate-pulse">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                        </svg>
                        <p>Đang chờ tín hiệu...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveStream;
