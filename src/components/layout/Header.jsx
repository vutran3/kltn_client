import { Bell, User } from "lucide-react";
import { useEffect, useState } from "react";

function Header() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="bg-blue-800 text-white p-4 fixed top-0 left-0 w-full h-16 z-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold">HỆ THỐNG GIÁM SÁT CHẤT LƯỢNG NÔNG SẢN</h1>
                </div>

                <div className="flex items-center space-x-4">
                    <span className="text-lg font-mono">{currentTime.toLocaleTimeString("vi-VN")}</span>
                    <div className="relative">
                        <Bell className="w-6 h-6" />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            8
                        </span>
                    </div>
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium">
                        Đăng xuất
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
