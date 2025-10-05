import { useEffect } from "react";
import io from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { pushRealTime } from "../redux/slices/notificationSlice";
import ToastNotification from "../components/notification/ToastNotification";
import toast from "react-hot-toast";

export default function useNotificationSocket() {
    const dispatch = useDispatch();

    useEffect(() => {
        const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';
        const socket = io(url, { transports: ['websocket'] });
        const userId = localStorage.getItem('uid') || "user001";
        if (userId) socket.emit('auth:join', userId)
        socket.on('notification:new', (payload) => {
            dispatch(pushRealTime(payload));
            const tId = toast.custom((t) => (
                <ToastNotification
                    notif={payload}
                    onClose={() => toast.dismiss(t.id)}
                />
            ), {duration: 4000});
        });

        return () => socket.disconnect();
    }, [dispatch])
}