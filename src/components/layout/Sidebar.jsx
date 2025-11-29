import { Link, useLocation } from "react-router-dom";
import { IoBarChartOutline } from "react-icons/io5";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { TbAutomation, TbHeartSearch } from "react-icons/tb";
import { LiaWarehouseSolid } from "react-icons/lia";
import { MdGrass } from "react-icons/md";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";


const menu = [
    { Icon: HiOutlineSquares2X2, name: "Tổng quan", link: "/" },
    { Icon: IoBarChartOutline, name: "Trực quan dữ liệu", link: "/metric-visualizer" },
    { Icon: TbAutomation, name: "Điều khiển thiết bị", link: "/device-controller" },
    { Icon: TbHeartSearch, name: "Kiểm tra nông sản", link: "/quality-check" },
    { Icon: MdGrass, name: "Kiểm tra môi trường", link: "/env-quality-check" },
    { Icon: LiaWarehouseSolid, name: "Quản lý nông sản", link: "/produce-manager" }
];


export default function Sidebar({ collapsed = false, onToggle }) {
    const { pathname } = useLocation();

    return (
        <aside
            className={`${collapsed ? "w-16" : "w-60"} bg-white shadow-sm fixed top-16 left-0 h-full transition-[width] duration-200`}
            aria-label="Thanh điều hướng"
        >
            <div className={`flex items-center ${collapsed ? "justify-center" : "justify-end"} px-2 py-2 border-b border-gray-100`}>
                <button
                    onClick={onToggle}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-50 text-gray-700"
                    aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
                    title={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
                >
                    {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
            </div>


            <nav className="space-y-1 py-2">
                {menu.map(({ Icon, name, link }) => {
                    const active = pathname === link;
                    return (
                        <Link key={name} to={link} className="block">
                            <div
                                className={`mx-2 my-1 flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors
                                ${active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}
                                title={collapsed ? name : undefined}
                            >
                                <Icon size={24} className="self-center" />
                                <span className={`${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"} overflow-hidden transition-all duration-150`}>
                                    {name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}