import { Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "/images/logo.png";
import NotificationBell from "../notification/NotificationBell";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";

function Header() {
    const dispatch = useDispatch();
    const [currentTime, setCurrentTime] = useState(new Date());

    const onLogout = () => {
        dispatch(logout());
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="bg-blue-800 text-white fixed top-0 left-0 w-full h-16 z-50">
            <div className="flex items-center justify-between h-full px-2">
                <div className="flex items-center h-full">
                    <img src={logo} alt="logo" className="h-10/12 object-contain relative top-[2px]" />
                    <h1 className="text-xl font-bold">HỆ THỐNG GIÁM SÁT CHẤT LƯỢNG NÔNG SẢN</h1>
                </div>

                <div className="flex items-center space-x-4">
                    <span className="text-lg font-mono">{currentTime.toLocaleTimeString("vi-VN")}</span>
                    <div className="relative">
                        <NotificationBell />
                    </div>
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                    <button
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium"
                        onClick={onLogout}
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
