import { useMemo, useState } from "react";

export default function NotePicker({ groups, value = [], onChange, groupModes = {}, groupExclusivePairs = {} }) {
    const sections = useMemo(() => groups || {}, [groups]);
    const [notice, setNotice] = useState("");

    const getGroupOfNote = (note) => {
        for (const [g, items] of Object.entries(sections)) {
            if (items.includes(note)) return g;
        }
        return null;
    };

    const clearGroup = (group) => {
        const next = value.filter((v) => !sections[group].includes(v));
        onChange?.(next);
        setNotice("");
    };

    const applyRules = (nextSelected, changedNote, checked) => {
        const group = getGroupOfNote(changedNote);
        if (!group) return nextSelected;

        // 1) single-choice: giữ đúng 1 option trong group (cho trường hợp "chọn")
        if (groupModes[group] === "single" && checked) {
            const others = sections[group].filter((n) => n !== changedNote);
            nextSelected = nextSelected.filter((n) => !others.includes(n));
        }

        // 2) exclusive pairs
        const pairs = groupExclusivePairs[group] || [];
        for (const [a, b] of pairs) {
            if (checked && changedNote === a && nextSelected.includes(b)) {
                nextSelected = nextSelected.filter((n) => n !== b);
                setNotice(`Đã bỏ “${b}” vì mâu thuẫn với “${a}”.`);
            }
            if (checked && changedNote === b && nextSelected.includes(a)) {
                nextSelected = nextSelected.filter((n) => n !== a);
                setNotice(`Đã bỏ “${a}” vì mâu thuẫn với “${b}”.`);
            }
        }
        return nextSelected;
    };

    const toggleCheckbox = (note, checked) => {
        let next = checked ? [...new Set([...value, note])] : value.filter((v) => v !== note);
        next = applyRules(next, note, checked);
        onChange?.(next);
        if (!checked) setNotice("");
    };

    // chọn đúng 1 mục (radio kiểu chuẩn)
    const setSingle = (group, note) => {
        let next = value.filter((v) => !sections[group].includes(v));
        next = applyRules([...next, note], note, true);
        onChange?.(next);
    };

    // --- NEW: radio có thể bỏ chọn ---
    // Khi click vào radio đang được chọn, ta chặn hành vi default và clear group
    const handleRadioClick = (e, group, note) => {
        const isChecked = value.includes(note);
        if (isChecked) {
            e.preventDefault(); // ngăn browser giữ trạng thái checked
            clearGroup(group); // hủy chọn radio (về trạng thái none)
        } else {
            setSingle(group, note); // chọn mục mới
        }
    };

    return (
        <div className="border rounded-lg p-3 bg-white max-w-full">
            <div className="text-[13px] text-slate-500 mb-2">Gợi ý nhanh</div>

            {notice && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded mb-2">
                    {notice}
                </div>
            )}

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(sections).map(([section, items]) => {
                    const mode = groupModes[section] || "multi";
                    const hasSelectionInGroup = value.some((v) => items.includes(v));

                    return (
                        <div key={section} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-slate-700">{section}</div>
                                <span className="text-[11px] text-slate-400">
                                    {mode === "single" ? "(chọn 1)" : "(chọn nhiều)"}
                                </span>
                                {mode === "single" && hasSelectionInGroup && (
                                    <button
                                        type="button"
                                        className="ml-auto text-xs px-2 py-[2px] rounded border border-gray-300 hover:bg-gray-50"
                                        onClick={() => clearGroup(section)}
                                        title="Xóa chọn nhóm"
                                    >
                                        Xóa chọn
                                    </button>
                                )}
                            </div>

                            {mode === "single" ? (
                                <div className="flex flex-col gap-1">
                                    {items.map((it) => {
                                        const checked = value.includes(it);
                                        return (
                                            <label
                                                key={it}
                                                className="inline-flex items-center gap-2 cursor-pointer select-none"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`radio-${section}`}
                                                    className="accent-blue-600"
                                                    checked={checked}
                                                    onClick={(e) => handleRadioClick(e, section, it)}
                                                    readOnly
                                                />
                                                <span className="text-sm">{it}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    {items.map((it) => {
                                        const checked = value.includes(it);
                                        return (
                                            <label
                                                key={it}
                                                className="inline-flex items-center gap-2 cursor-pointer select-none"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="accent-blue-600"
                                                    checked={checked}
                                                    onChange={(e) => toggleCheckbox(it, e.target.checked)}
                                                />
                                                <span className="text-sm">{it}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
