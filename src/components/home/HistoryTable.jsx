import { useEffect, useState } from "react";
import { getDataApi } from "../../utils/fetch";
import { fmtTs, toMs } from "../../utils";

const DEFAULT_DEVICE_ID = "esp32s3-01";
const POLL_MS = Number(import.meta.env?.POLL_API_MS || 10000);
const HISTORY_LIMIT = 100;

const fetchHistory = async ({ deviceId, limit, fromMs, toMs, sort = -1 }) => {
    let params = null;
    if (fromMs && toMs) {
        params = {
            from: String(fromMs),
            to: String(toMs),
            sort: "1"
        };
    } else {
        params = {
            limit: String(limit ?? HISTORY_LIMIT),
            sort: String(sort)
        };
    }

    const res = await getDataApi(`/readings?deviceId=${deviceId}`, params, {
        cache: "no-store"
    });

    return res?.data?.data?.rows ?? [];
};

function HistoryTable() {
    const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");
    const [history, setHistory] = useState([]);
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadData = async (did, { useFilter = false } = {}) => {
        setErr(null);
        setLoading(true);
        let rows = [];
        console.log({
            filterFrom,
            filterTo,
            useFilter
        });
        try {
            if (filterFrom && filterTo && useFilter) {
                rows = await fetchHistory({
                    deviceId: did,
                    fromMs: toMs(filterFrom) ?? Date.now() - 24 * 3600 * 1000,
                    toMs: toMs(filterTo) ?? Date.now(),
                    sort: 1
                });
            } else if (!filterFrom && !filterTo) {
                rows = await fetchHistory({ deviceId: did, limit: HISTORY_LIMIT, sort: -1 });
            }

            setHistory(rows);
        } catch (e) {
            setErr(e?.message || "Fetch error");
        } finally {
            setLoading(false);
        }
    };

    const resetFilter = () => {
        setFilterFrom("");
        setFilterTo("");
        loadData(deviceId);
    };

    useEffect(() => {
        loadData(deviceId);
        const id = setInterval(() => loadData(deviceId), POLL_MS);
        return () => clearInterval(id);
    }, [deviceId, filterFrom, filterTo]);

    return (
        <div className="bg-white rounded-lg w-full">
            <h2 className="text-xl font-bold text-blue-800 mb-4 text-center">LỊCH SỬ THU THẬP</h2>

            <div className="flex gap-2 items-center border-l border-gray-200 px-2 flex-wrap mb-4">
                <div className="flex gap-2 items-center">
                    <input
                        type="date"
                        value={filterFrom}
                        onChange={(e) => setFilterFrom(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />

                    <input
                        type="date"
                        value={filterTo}
                        onChange={(e) => setFilterTo(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-nowrap"
                    onClick={() => loadData(deviceId, { useFilter: true })}
                >
                    LỌC DỮ LIỆU
                </button>

                <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-nowrap"
                    onClick={() => window.print()}
                >
                    IN BÁO CÁO
                </button>

                <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={resetFilter}>
                    RESET
                </button>
            </div>

            {/* Data Table */}
            <div className="overflow-auto max-h-[600px] w-full border border-gray-300">
                <table className="w-full text-sm min-h-52">
                    <thead className="bg-blue-600 text-white sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-left">Thời gian</th>
                            <th className="px-3 py-2 text-left">Nhiệt độ</th>
                            <th className="px-3 py-2 text-left">Độ ẩm</th>
                            <th className="px-3 py-2 text-left">Ánh sáng</th>
                            <th className="px-3 py-2 text-left">Nhiệt độ đất</th>
                            <th className="px-3 py-2 text-left">Độ ẩm đất</th>
                            <th className="px-3 py-2 text-left">Nito</th>
                            <th className="px-3 py-2 text-left">Photpho</th>
                            <th className="px-3 py-2 text-left">Kali</th>
                            <th className="px-3 py-2 text-left">PH</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white text-center">
                        {history.map((row, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-2">{fmtTs(row.t)}</td>
                                <td className="px-3 py-2">
                                    {row.airTemperature != null ? Number(row.airTemperature).toFixed(1) : "—"}
                                </td>
                                <td className="px-3 py-2">
                                    {row.airHumidity != null ? Number(row.airHumidity).toFixed(1) : "—"}
                                </td>
                                <td className="px-3 py-2">{row.lightRaw ?? "—"}</td>
                                <td className="px-3 py-2">
                                    {row.soilTemperature != null ? Number(row.soilTemperature).toFixed(1) : "—"}
                                </td>
                                <td className="px-3 py-2">
                                    {row.soilHumidity != null ? Number(row.soilHumidity).toFixed(1) : "—"}
                                </td>
                                <td className="px-3 py-2">
                                    {row.nitrogen != null ? Number(row.nitrogen).toFixed(2) : "—"}
                                </td>
                                <td className="px-3 py-2">
                                    {row.phosphorus != null ? Number(row.phosphorus).toFixed(2) : "—"}
                                </td>
                                <td className="px-3 py-2">
                                    {row.potassium != null ? Number(row.potassium).toFixed(2) : "—"}
                                </td>
                                <td className="px-3 py-2">{row.ph != null ? Number(row.ph).toFixed(2) : "—"}</td>
                            </tr>
                        ))}
                        {history.length === 0 && (
                            <tr>
                                <td colSpan={11} className="px-3 py-6 text-center text-gray-500">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default HistoryTable;
