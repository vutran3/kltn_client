import * as XLSX from "xlsx";

export const handleExportExcel = (history, selectedId) => {
    if (!history?.length) {
        alert("Không có dữ liệu để xuất.");
        return;
    }

    const rows = history.map((r) => ({
        "Thời gian": r?.t ? new Date(r.t) : "",
        "Nhiệt độ (°C)": r?.airTemperature != null ? Number(r.airTemperature) : null,
        "Độ ẩm (%)": r?.airHumidity != null ? Number(r.airHumidity) : null,
        "Ánh sáng": r?.lightRaw != null ? Number(r.lightRaw) : null,
        "Nhiệt độ đất (°C)": r?.soilTemperature != null ? Number(r.soilTemperature) : null,
        "Độ ẩm đất (%)": r?.soilHumidity != null ? Number(r.soilHumidity) : null,
        "Nito (mg/kg)": r?.nitrogen != null ? Number(r.nitrogen) : null,
        "Photpho (mg/kg)": r?.phosphorus != null ? Number(r.phosphorus) : null,
        "Kali (mg/kg)": r?.potassium != null ? Number(r.potassium) : null,
        pH: r?.ph != null ? Number(r.ph) : null
    }));

    const wb = XLSX.utils.book_new();

    // Header thông tin filter & device
    const metaRows = [["BÁO CÁO LỊCH SỬ THU THẬP"], [`Thiết bị: ${selectedId || "-"}`], []];
    const wsMeta = XLSX.utils.aoa_to_sheet(metaRows);

    // Thêm dữ liệu bảng ở dưới meta
    XLSX.utils.sheet_add_json(wsMeta, rows, {
        origin: "A4", // bắt đầu từ dòng 4
        header: Object.keys(rows[0] || {})
    });

    // Định dạng cột & ngày giờ
    const colWidths = [
        { wch: 22 },
        { wch: 14 },
        { wch: 12 },
        { wch: 10 },
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
        { wch: 16 },
        { wch: 12 },
        { wch: 8 }
    ];
    wsMeta["!cols"] = colWidths;

    // Merge tiêu đề dòng 1
    wsMeta["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: colWidths.length - 1 } }];

    // Gán numFmt cho cột thời gian (Excel sẽ hiển thị đúng kiểu ngày giờ)
    const headerKeys = Object.keys(rows[0] || {});
    const startRowIndex = 4; // A5 => index 4 (0-based)
    for (let i = 0; i < rows.length; i++) {
        // cột 0 là "Thời gian"
        const cellRef = XLSX.utils.encode_cell({ r: startRowIndex + i, c: 0 });
        const cell = wsMeta[cellRef];
        if (cell && cell.t === "d") cell.z = "dd/mm/yyyy hh:mm";
    }

    XLSX.utils.book_append_sheet(wb, wsMeta, "LichSuThuThap");

    const fileName = `Lich_su_thu_thap_${selectedId || "device"}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);
};
