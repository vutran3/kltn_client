"use client";
import React, { useEffect, useState } from "react";
import TimeFilter from "../components/data_visualization/TimeFilter";
import MetricChart from "../components/data_visualization/MetricChart";
import { getDataApi } from "../utils/fetch";
import { averagePerDay, mapApiRowsToSeries } from "../utils";
import { useSelector } from "react-redux";
import { selectDevice } from "../redux/selector";

export default function MetricVisualizer() {
    const { selectedId } = useSelector(selectDevice);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        setLoading(true);
        setErr(null);
        if (selectedId)
            getDataApi(`/readings?deviceId=${selectedId}&limit=${100}&sort=${-1}`)
                .then((res) => {
                    console.log(res);
                    const minuteRows = averagePerDay(res.data.data.rows, { tzOffsetMinutes: 420 });
                    setData(mapApiRowsToSeries(minuteRows));
                })
                .catch((err) => {
                    setErr(err?.message || "Lọc dữ liệu thất bại");
                })
                .finally(() => {
                    setLoading(false);
                });
    }, [selectedId]);

    const handleFilter = async (input) => {
        try {
            setLoading(true);
            setErr(null);

            let from, to;

            if (input instanceof Date || typeof input === "number" || typeof input === "string") {
                from = new Date(input);
                to = new Date();
            } else if (input && (input.from || input.to)) {
                from = input.from ? new Date(input.from) : undefined;
                to = input.to ? new Date(input.to) : new Date();
            }

            if (from) {
                getDataApi("/readings", {
                    deviceId: selectedId,
                    from: String(from.getTime()),
                    to: String(to.getTime()),
                    sort: "1"
                }).then((res) => {
                    console.log(res);
                    const minuteRows = averagePerDay(res.data.data.rows, { tzOffsetMinutes: 420 });
                    setData(mapApiRowsToSeries(minuteRows));
                });
            } else {
                getDataApi(`/readings?deviceId=${selectedId}&limit=${100}&sort=${-1}`).then((res) => {
                    const minuteRows = averagePerDay(res.data.data.rows, { tzOffsetMinutes: 420 });
                    setData(mapApiRowsToSeries(minuteRows));
                });
            }
        } catch (e) {
            setErr(e?.message || "Lọc dữ liệu thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setLoading(true);
        setErr(null);

        getDataApi(`/readings?deviceId=${selectedId}&limit=${100}&sort=${-1}`)
            .then((res) => {
                const minuteRows = averagePerDay(res.data.data.rows, { tzOffsetMinutes: 420 });
                setData(mapApiRowsToSeries(minuteRows));
            })
            .catch((err) => {
                setErr(err?.message || "Lọc dữ liệu thất bại");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-lime-200/60 to-lime-100/60 p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="mb-4 md:mb-6">
                    <TimeFilter onFilter={handleFilter} onReset={handleReset} />
                </div>

                {err && (
                    <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                        Lỗi: {err}
                    </div>
                )}
                {loading && <div className="animate-pulse text-sm text-gray-600">Đang tải dữ liệu…</div>}

                <MetricChart
                    title="BIỂU ĐỒ NHIỆT ĐỘ"
                    type="line"
                    data={data}
                    series={[{ key: "temp", name: "Nhiệt độ (°C)" }]}
                    yUnit="°C"
                    height={288}
                />

                <MetricChart
                    title="BIỂU ĐỒ ĐỘ ẨM KHÔNG KHÍ"
                    type="air"
                    data={data}
                    series={[{ key: "air", name: "Độ ẩm (%)" }]}
                    yUnit="%"
                    height={288}
                />

                <MetricChart
                    title="BIỂU ĐỒ ĐỘ PH"
                    type="ph"
                    data={data}
                    series={[{ key: "ph", name: "Độ pH" }]}
                    yUnit=""
                    height={288}
                />

                <MetricChart
                    title="BIỂU ĐỒ LƯỢNG PHOTPHO"
                    type="photpho"
                    data={data}
                    series={[{ key: "photpho", name: "Lượng Photpho (mg/kg)" }]}
                    yUnit="mg/kg"
                    height={288}
                />

                <MetricChart
                    title="BIỂU ĐỒ LƯỢNG NITO"
                    type="nitro"
                    data={data}
                    series={[{ key: "nitro", name: "Lượng Nito (mg/kg)" }]}
                    yUnit="mg/kg"
                    height={288}
                />

                <MetricChart
                    title="BIỂU ĐỒ LƯỢNG KALI"
                    type="kali"
                    data={data}
                    series={[{ key: "kali", name: "Lượng Kali (mg/kg)" }]}
                    yUnit="mg/kg"
                    height={288}
                />

                <MetricChart
                    title="BIỂU ĐỒ ĐỘ ẨM ĐẤT"
                    type="soilHum"
                    data={data}
                    series={[{ key: "soilHum", name: "Độ ẩm đất (%)" }]}
                    yUnit="%"
                    height={288}
                />
            </div>
        </div>
    );
}
