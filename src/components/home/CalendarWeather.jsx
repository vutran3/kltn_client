import React, { useState } from "react";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Sun,
    Cloud,
    CloudRain,
    Droplets,
    Thermometer,
    Wind,
    Eye
} from "lucide-react";

const CalendarWeather = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getCurrentMonth = () => {
        const months = [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12"
        ];
        return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    const navigateMonth = (direction) => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const isToday = (day) => {
        if (!day) return false;
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const weatherForecast = [
        {
            date: "Hôm nay",
            day: "Thứ 5",
            temp: { high: 32, low: 24 },
            humidity: 72,
            rain: 15,
            wind: 12,
            condition: "sunny",
            description: "Nắng đẹp"
        },
        {
            date: "Mai",
            day: "Thứ 6",
            temp: { high: 29, low: 22 },
            humidity: 78,
            rain: 85,
            wind: 18,
            condition: "rainy",
            description: "Mưa rào"
        },
        {
            date: "14/8",
            day: "Thứ 7",
            temp: { high: 27, low: 21 },
            humidity: 82,
            rain: 95,
            wind: 22,
            condition: "cloudy_rain",
            description: "Mưa to"
        },
        {
            date: "15/8",
            day: "Chủ nhật",
            temp: { high: 30, low: 23 },
            humidity: 68,
            rain: 25,
            wind: 8,
            condition: "cloudy",
            description: "Nhiều mây"
        }
    ];

    const getWeatherIcon = (condition) => {
        switch (condition) {
            case "sunny":
                return <Sun className="w-8 h-8 text-yellow-500" />;
            case "cloudy":
                return <Cloud className="w-8 h-8 text-gray-500" />;
            case "rainy":
            case "cloudy_rain":
                return <CloudRain className="w-8 h-8 text-blue-500" />;
            default:
                return <Sun className="w-8 h-8 text-yellow-500" />;
        }
    };

    const getConditionColor = (condition) => {
        switch (condition) {
            case "sunny":
                return "from-yellow-400 to-orange-500";
            case "cloudy":
                return "from-gray-400 to-gray-600";
            case "rainy":
            case "cloudy_rain":
                return "from-blue-400 to-blue-600";
            default:
                return "from-yellow-400 to-orange-500";
        }
    };

    return (
        <div className="space-y-6">
            {/* Enhanced Calendar */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        LỊCH
                    </h3>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h4 className="font-semibold text-lg text-gray-800">{getCurrentMonth()}</h4>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, index) => (
                        <div
                            key={day}
                            className={`text-center p-2 text-xs font-semibold ${
                                index === 0 ? "text-red-500" : "text-gray-600"
                            }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth().map((day, index) => (
                        <div
                            key={index}
                            className={`
                                aspect-square flex items-center justify-center text-sm font-medium rounded-lg cursor-pointer transition-all duration-200
                                ${day ? "hover:bg-blue-50" : ""}
                                ${
                                    isToday(day)
                                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md transform scale-105"
                                        : day
                                        ? "text-gray-800 hover:text-blue-600"
                                        : "text-gray-300"
                                }
                            `}
                        >
                            {day || ""}
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Hôm nay: {new Date().toLocaleDateString("vi-VN")}</span>
                    </div>
                </div>
            </div>

            {/* Enhanced Weather Forecast */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <CloudRain className="w-6 h-6 text-blue-600" />
                        DỰ BÁO THỜI TIẾT
                    </h3>
                </div>

                <div className="space-y-4">
                    {weatherForecast.map((forecast, index) => (
                        <div
                            key={index}
                            className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-r ${getConditionColor(
                                forecast.condition
                            )} text-white shadow-lg transform transition-all duration-300 hover:scale-105`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-lg font-semibold">{forecast.date}</div>
                                        <div className="text-sm opacity-90">{forecast.day}</div>
                                    </div>
                                    <div className="text-sm opacity-90 mb-3">{forecast.description}</div>

                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Thermometer className="w-4 h-4" />
                                            <span>
                                                {forecast.temp.high}°/{forecast.temp.low}°
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Droplets className="w-4 h-4" />
                                            <span>{forecast.humidity}%</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Wind className="w-4 h-4" />
                                            <span>{forecast.wind}km/h</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    {getWeatherIcon(forecast.condition)}
                                    <div className="flex items-center gap-1 text-sm">
                                        <span>🌧️</span>
                                        <span>{forecast.rain}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="absolute bottom-0 left-0 w-20 h-20 bg-black opacity-10 rounded-full translate-y-10 -translate-x-10"></div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>Tầm nhìn: 10km</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Chỉ số UV: 8 (Cao)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarWeather;
