import { Link } from "react-router-dom";
import { IoBarChartOutline } from "react-icons/io5";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { TbAutomation } from "react-icons/tb";
import { TbHeartSearch } from "react-icons/tb";
import { LiaWarehouseSolid } from "react-icons/lia";

const menu = [
    {
        Icon: HiOutlineSquares2X2,
        name: "Tổng quan",
        link: "/"
    },
    {
        Icon: IoBarChartOutline,
        name: "Trực quan dữ liệu",
        link: "/metric-visualizer"
    },
    {
        Icon: TbAutomation,
        name: "Điều khiển thiết bị",
        link: "/"
    },
    {
        Icon: TbHeartSearch,
        name: "Kiểm tra nông sản",
        link: "/"
    },
    {
        Icon: LiaWarehouseSolid,
        name: "Quản lý nông sản",
        link: "/"
    }
];

function Sidebar() {
    return (
        <aside className="w-56 bg-white shadow-sm fixed top-16 left-0 h-full">
            <nav className="space-y-4">
                {menu.map(({ Icon, name, link }) => (
                    <button
                        key={name}
                        className="text-gray-700 hover:text-blue-600 text-base font-semibold px-2 py-3 hover:bg-gray-50 w-full"
                    >
                        <Link to={link} className="flex gap-2 items-center">
                            <Icon size={20} />
                            <span>{name}</span>
                        </Link>
                    </button>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
