import { AlertTriangleIcon } from "lucide-react";

function MetricCard({ title, value, unit, warning, large = false, containerClassName = "" }) {
    return (
        <div
            className={`bg-white rounded-lg p-4 shadow-sm border-2 ${containerClassName} ${
                warning ? "border-yellow-400" : "border-gray-200"
            } ${large ? "col-span-2" : ""}`}
        >
            <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">{title}</h3>
                <div className="flex items-center justify-center space-x-2">
                    <span className={`text-2xl font-bold ${warning ? "text-red-600" : "text-gray-800"}`}>
                        {value} {unit}
                    </span>
                    {warning && <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />}
                </div>
            </div>
        </div>
    );
}

export default MetricCard;
