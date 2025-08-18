import React, { useState } from "react";
import TimeFilter from "../components/data_visualization/TimeFilter";
import MetricChart from "../components/data_visualization/MetricChart";

function makeDemoData(label = "10:30") {
  const points = 10;
  const series = [];
  let t = 29.2; let r = 5.6;
  for (let i = 0; i < points; i++) {
    t += (Math.random() - 0.5) * 0.2;
    r += (Math.random() - 0.5) * 0.1;
    const time = `${label} ${(i + 1).toString().padStart(2, "0")}(30/06)`;
    series.push({ time, temp: Number(t.toFixed(1)), rain: Number(r.toFixed(2)) });
  }
  return series;
}

export default function MetricVisualizer() {
  const [data, setData] = useState(makeDemoData());

  const handleFilter = (from) => {
    const label = new Date(from || Date.now()).toLocaleTimeString("vi-VN", {
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
    setData(makeDemoData(label));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-lime-200/60 to-lime-100/60 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <TimeFilter onFilter={handleFilter} onReset={() => setData(makeDemoData())} />

        <MetricChart
          title="BIỂU ĐỒ NHIỆT ĐỘ"
          type="line"
          data={data}
          series={[{ key: "temp", name: "Nhiệt độ (°C)" }]}
          yUnit="°C"
          height={288}
        />

        <MetricChart
          title="BIỂU ĐỒ LƯỢNG MƯA"
          type="line"
          data={data}
          series={[{ key: "rain", name: "Lượng mưa (mm)" }]}
          yUnit="mm"
          height={288}
        />
      </div>
    </div>
  );
}