import { MapPin, Phone, Mail, Clock, Wifi, Database } from "lucide-react";

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-white mt-auto">
            {/* Main Footer Content */}
            <div className="px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* System Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-blue-300">Thông tin hệ thống</h3>
                        <div className="space-y-2 text-gray-300">
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4" />
                                <span className="text-sm">Phiên bản: v2.1.0</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Wifi className="w-4 h-4" />
                                <span className="text-sm">Trạng thái: Hoạt động</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">Cập nhật: Thời gian thực</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-blue-300">Liên hệ hỗ trợ</h3>
                        <div className="space-y-2 text-gray-300">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm">+84 943 608 225</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm">tranducvu234@gmail.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">Hồ Chí Minh, Việt Nam</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-blue-300">Liên kết nhanh</h3>
                        <div className="space-y-2">
                            <a href="#" className="block text-gray-300 hover:text-blue-300 text-sm transition-colors">
                                Hướng dẫn sử dụng
                            </a>
                            <a href="#" className="block text-gray-300 hover:text-blue-300 text-sm transition-colors">
                                Cài đặt thiết bị
                            </a>
                            <a href="#" className="block text-gray-300 hover:text-blue-300 text-sm transition-colors">
                                Báo cáo sự cố
                            </a>
                            <a href="#" className="block text-gray-300 hover:text-blue-300 text-sm transition-colors">
                                Tải dữ liệu
                            </a>
                        </div>
                    </div>

                    {/* System Status */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-blue-300">Trạng thái hệ thống</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">Cảm biến</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-xs text-green-400">Online</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">Kết nối mạng</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-xs text-green-400">Ổn định</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">Cơ sở dữ liệu</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-xs text-green-400">Hoạt động</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 px-6 py-4">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                    <div className="text-sm text-gray-400">
                        © {currentYear} Hệ thống Giám sát Chất lượng Nông sản. Tất cả quyền được bảo lưu.
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-blue-300 transition-colors">
                            Chính sách bảo mật
                        </a>
                        <a href="#" className="hover:text-blue-300 transition-colors">
                            Điều khoản sử dụng
                        </a>
                        <a href="#" className="hover:text-blue-300 transition-colors">
                            Về chúng tôi
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
