import { fmtTs } from ".";

export const notifyThreshold = async (last, rule) => {
    const notifications = [];

    const warn = {
        airTemp: false,
        airHumidity: false,
        soilHumidity: false,
        soilTemperature: false,
        ph: false,
        n: false,
        p: false,
        k: false
    };

    if (last && rule) {
        // Nhiệt độ không khí
        if (!inRange(last.airTemperature, rule.temperature)) {
            warn.airTemp = true;
            notifications.push({
                id: "airTemp",
                type: "warning",
                message: `Nhiệt độ không khí ${last.airTemperature?.toFixed?.(1)}°C vượt ngưỡng (${
                    rule.temperature[0]
                }–${rule.temperature[1]}°C) cho ${product?.name || cropType}.`,
                time: fmtTs(last.t)
            });
        }
        // RH
        if (!inRange(last.airHumidity, rule.rh)) {
            warn.airHumidity = true;
            notifications.push({
                id: "airHumidity",
                type: "warning",
                message: `Độ ẩm không khí ${last.airHumidity?.toFixed?.(1)}% vượt ngưỡng (${rule.rh[0]}–${
                    rule.rh[1]
                }%).`,
                time: fmtTs(last.t)
            });
        }
        // Soil moisture
        if (!inRange(last.soilHumidity, rule.soil)) {
            warn.soilHumidity = true;
            notifications.push({
                id: "soilHumidity",
                type: "warning",
                message: `Độ ẩm đất ${last.soilHumidity?.toFixed?.(1)}% vượt ngưỡng (${rule.soil[0]}–${
                    rule.soil[1]
                }%).`,
                time: fmtTs(last.t)
            });
        }
        // Soil Temperature
        if (!inRange(last.soilTemperature, rule.soilT)) {
            warn.soilTemperature = true;
            notifications.push({
                id: "soilTemperature",
                type: "warning",
                message: `Nhiệt độ đất ${last.soilTemperature?.toFixed?.(1)}°C vượt ngưỡng (${rule.soilT[0]}–${
                    rule.soilT[1]
                }°C).`,
                time: fmtTs(last.t)
            });
        }
        // pH
        if (!inRange(last.ph, rule.ph)) {
            warn.ph = true;
            notifications.push({
                id: "ph",
                type: "warning",
                message: `pH ${Number(last.ph).toFixed(2)} vượt ngưỡng (${rule.ph[0]}–${rule.ph[1]}).`,
                time: fmtTs(last.t)
            });
        }
        // NPK
        if (!inRange(last.nitrogen, rule.n)) {
            warn.n = true;
            notifications.push({
                id: "n",
                type: "warning",
                message: `N = ${Number(last.nitrogen).toFixed(2)} mg/kg vượt ngưỡng (${rule.n[0]}–${rule.n[1]}).`,
                time: fmtTs(last.t)
            });
        }
        if (!inRange(last.phosphorus, rule.p)) {
            warn.p = true;
            notifications.push({
                id: "p",
                type: "warning",
                message: `P = ${Number(last.phosphorus).toFixed(2)} mg/kg vượt ngưỡng (${rule.p[0]}–${rule.p[1]}).`,
                time: fmtTs(last.t)
            });
        }
        if (!inRange(last.potassium, rule.k)) {
            warn.k = true;
            notifications.push({
                id: "k",
                type: "warning",
                message: `K = ${Number(last.potassium).toFixed(2)} mg/kg vượt ngưỡng (${rule.k[0]}–${rule.k[1]}).`,
                time: fmtTs(last.t)
            });
        }
    }

    return notifications;
};
