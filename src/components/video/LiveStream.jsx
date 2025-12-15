import React, { useEffect, useState, useRef } from "react";
import { TiMediaRecord, TiMediaRecordOutline } from "react-icons/ti";

const LiveStream = ({ title }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        const WS_URL = import.meta.env.VITE_WS_URL || "ws://192.168.0.103:8000/ws/camera-stream";

        const connectWebSocket = () => {
            wsRef.current = new WebSocket(WS_URL);
            wsRef.current.binaryType = "blob";

            wsRef.current.onopen = () => {
                console.log("Connected to Stream");
                setIsConnected(true);
            };

            wsRef.current.onclose = () => {
                console.log("Disconnected from Stream");
                setIsConnected(false);
                setTimeout(connectWebSocket, 3000);
            };

            wsRef.current.onerror = (error) => {
                console.error("WebSocket Error:", error);
                wsRef.current.close();
            };

            wsRef.current.onmessage = (event) => {
                const blob = event.data;
                const newUrl = URL.createObjectURL(blob);

                setImageSrc((prevUrl) => {
                    if (prevUrl) URL.revokeObjectURL(prevUrl);
                    return newUrl;
                });
            };
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-md w-full  mx-auto">
            {/* Header & Trạng thái */}

            <div className="flex justify-between items-center w-full mb-4 flex-wrap">
                <h2 className="text-xl font-bold text-gray-800">{title || "Camera"}</h2>
                <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        isConnected
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-red-100 text-red-700 border border-red-300"
                    }`}
                >
                    {isConnected ? (
                        <span className="flex gap-[2px] items-center">
                            <TiMediaRecord size={20} />
                            <span>Live</span>
                        </span>
                    ) : (
                        <span className="flex gap-[2px] items-center">
                            <TiMediaRecordOutline size={20} />
                            <span>Offline</span>
                        </span>
                    )}
                </span>
            </div>

            {/* Khung hiển thị Video */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
                {isConnected && imageSrc ? (
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
