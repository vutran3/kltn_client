import { Link, useLocation } from "react-router-dom";
import { IoBarChartOutline } from "react-icons/io5";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { TbAutomation, TbHeartSearch } from "react-icons/tb";
import { MdHistoryEdu } from "react-icons/md";
import { LiaWarehouseSolid } from "react-icons/lia";
import { MdGrass } from "react-icons/md";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { selectDevice } from "../../redux/selector";
import { setSelectedDeviceId } from "../../redux/slices/deviceSlice";

const menu = [
    { Icon: HiOutlineSquares2X2, name: "Tổng quan", link: "/" },
    { Icon: IoBarChartOutline, name: "Trực quan dữ liệu", link: "/metric-visualizer" },
    { Icon: TbAutomation, name: "Điều khiển thiết bị", link: "/device-controller" },
    { Icon: TbHeartSearch, name: "Kiểm tra nông sản", link: "/quality-check" },
    { Icon: MdGrass, name: "Kiểm tra môi trường", link: "/env-quality-check" },
    { Icon: LiaWarehouseSolid, name: "Quản lý nông sản", link: "/produce-manager" },
    { Icon: MdHistoryEdu, name: "Lịch sử chăm sóc", link: "/product-history" }
];

export default function Sidebar({ collapsed = false, onToggle }) {
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const { items: myDevices, selectedId, isLoading: loadingDevices } = useSelector(selectDevice);

    return (
        <aside
            className={`${
                collapsed ? "w-16" : "w-60"
            } bg-white shadow-sm fixed top-16 left-0 h-full transition-[width] duration-200`}
            aria-label="Thanh điều hướng"
        >
            <div className={`flex items-center justify-center p-2 gap-2 border-b border-gray-100`}>
                {!collapsed && (
                    <select
                        disabled={loadingDevices}
                        value={selectedId}
                        onChange={(e) => dispatch(setSelectedDeviceId(e.target.value))}
                        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white truncate w-[280px]"
                    >
                        {loadingDevices && <option value="">Đang tải...</option>}
                        {!loadingDevices && myDevices?.length === 0 && <option value="">— Không có thiết bị —</option>}
                        {!loadingDevices &&
                            myDevices?.map((d) => (
                                <option key={d._id} value={d.device_id}>
                                    {d.device_name}
                                </option>
                            ))}
                    </select>
                )}

                <button
                    onClick={onToggle}
                    className="flex p-2 items-center justify-center rounded-lg hover:bg-gray-50 text-gray-700"
                    aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
                    title={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
                >
                    {collapsed ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}
                </button>
            </div>

            <nav className="space-y-1 py-2">
                {menu.map(({ Icon, name, link }) => {
                    const active = pathname === link;
                    return (
                        <Link key={name} to={link} className="block">
                            <div
                                className={`my-2 flex items-center gap-3 rounded-lg px-2 py-3 text-base font-medium transition-colors
                                ${
                                    active
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                }

                                ${collapsed && "justify-center"}
                                `}
                                title={collapsed ? name : ""}
                            >
                                <Icon size={24} className="self-center" />
                                <span
                                    className={`${
                                        collapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
                                    } overflow-hidden transition-all duration-150`}
                                >
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
