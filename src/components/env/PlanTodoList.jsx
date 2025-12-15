// src/components/soil/PlanTodoList.jsx
import React, { useState, useEffect } from "react";
import { parsePlanFromHTML } from "../../utils/adviceParser";
import { Check, RotateCcw, MailCheck } from "lucide-react"; // Hoặc dùng icon svg thường

export default function PlanTodoList({ adviceHtml, deviceId }) {
    const [phases, setPhases] = useState([]);
    const [progress, setProgress] = useState(0);

    const STORAGE_KEY = `agri_plan_${deviceId}`;

    useEffect(() => {
        if (!adviceHtml) return;

        const savedData = localStorage.getItem(STORAGE_KEY);

        if (savedData) setPhases(JSON.parse(savedData));
        else setPhases(parsePlanFromHTML(adviceHtml));
    }, [adviceHtml, deviceId]);

    useEffect(() => {
        if (!phases.length) return;

        let total = 0;
        let completed = 0;
        phases.forEach((p) => {
            total += p.tasks.length;
            completed += p.tasks.filter((t) => t.done).length;
        });

        setProgress(total === 0 ? 0 : Math.round((completed / total) * 100));

        localStorage.setItem(STORAGE_KEY, JSON.stringify(phases));
    }, [phases, STORAGE_KEY]);

    const toggleTask = (phaseIndex, taskId) => {
        const newPhases = [...phases];
        const phase = newPhases[phaseIndex];
        const task = phase.tasks.find((t) => t.id === taskId);
        if (task) {
            task.done = !task.done;
            setPhases(newPhases);
        }
    };

    const handleReset = () => {
        if (window.confirm("Bạn muốn đặt lại toàn bộ trạng thái công việc?")) {
            const freshData = parsePlanFromHTML(adviceHtml);
            setPhases(freshData);
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    if (!phases.length)
        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                Chưa có kế hoạch hành động. Vui lòng nhấn "Phân tích AI" ở tab Báo cáo trước.
            </div>
        );

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-gray-200 flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        📋 Hành Động Cụ Thể
                        <span className="text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <MailCheck size={12} /> Đã gửi mail
                        </span>
                    </h3>
                    <p className="text-sm text-slate-500">Tiến độ: {progress}%</p>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-200"
                >
                    <RotateCcw size={14} /> Làm lại từ đầu
                </button>
            </div>

            <div className="w-full bg-gray-100 h-1.5">
                <div
                    className="bg-green-500 h-1.5 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
                {phases.map((phase, pIndex) => (
                    <div key={phase.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h4 className="font-bold text-green-700 mb-3 uppercase text-sm tracking-wide border-l-4 border-green-500 pl-2">
                            {phase.title}
                        </h4>
                        <div className="space-y-2">
                            {phase.tasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => toggleTask(pIndex, task.id)}
                                    className={`
                                        group flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none
                                        ${
                                            task.done
                                                ? "bg-green-50 border-green-200 shadow-none"
                                                : "bg-white border-gray-100 hover:border-blue-300 hover:shadow-sm"
                                        }
                                    `}
                                >
                                    <div
                                        className={`
                                        flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors mt-0.5
                                        ${
                                            task.done
                                                ? "bg-green-500 border-green-500 text-white"
                                                : "bg-white border-gray-300 group-hover:border-blue-400"
                                        }
                                    `}
                                    >
                                        {task.done && <Check size={14} strokeWidth={3} />}
                                    </div>
                                    <div
                                        className={`text-sm leading-relaxed ${
                                            task.done
                                                ? "text-gray-400 line-through decoration-gray-300"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        <div dangerouslySetInnerHTML={{ __html: task.content }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
