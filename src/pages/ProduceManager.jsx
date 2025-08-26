// src/pages/AgriManager.jsx
import React, { useState } from "react";
import TabNav from "../components/tab/TabNav";
import ProductsTab from "../components/tab/ProductsTab";
import FieldsTab from "../components/tab/FieldsTab";
import DevicesTab from "../components/tab/DevicesTab";

const TABS = [
    { label: "Nông sản", value: "products" },
    { label: "Nơi trồng", value: "fields" },
    { label: "Thiết bị", value: "devices" }
];

export default function ProduceManager() {
    const [active, setActive] = useState("products");
    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Quản lý Nông nghiệp</h1>
            <TabNav tabs={TABS} active={active} onChange={setActive} />
            {active === "products" && <ProductsTab />}
            {active === "fields" && <FieldsTab />}
            {active === "devices" && <DevicesTab />}
        </div>
    );
}
