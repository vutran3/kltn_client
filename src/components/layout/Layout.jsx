import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";


export default function Layout() {
    const [collapsed, setCollapsed] = useState(() => {
        try { return JSON.parse(localStorage.getItem("sb_collapsed") || "false"); } catch { return false; }
    });


    useEffect(() => {
        localStorage.setItem("sb_collapsed", JSON.stringify(collapsed));
    }, [collapsed]);


    return (
        <div className={`bg-gray-100 relative pt-16 transition-[padding] duration-200 ${collapsed ? "pl-16" : "pl-60"}`}>
            <Header />
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
            <main className="flex-1 p-1.5">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}