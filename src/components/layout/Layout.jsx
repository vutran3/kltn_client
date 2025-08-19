import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

function Layout() {
    return (
        <div className="bg-gray-100 relative pt-16 pl-56 overflow-y-hidden">
            <Header />
            <Sidebar />
            <main className="flex-1 p-1.5">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default Layout;
