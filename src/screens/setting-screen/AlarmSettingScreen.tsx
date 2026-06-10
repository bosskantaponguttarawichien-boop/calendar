"use client";

import React, { useEffect, useState } from "react";
import { AlarmClock, Check, ExternalLink } from "lucide-react";
import { useLiff } from "@/hooks/useLiff";
import { useUserSettingsService, UserSettings } from "@/hooks/useUserSettingsService";

const OFFSET_OPTIONS = [
    { value: 15,  label: "15 นาที" },
    { value: 30,  label: "30 นาที" },
    { value: 45,  label: "45 นาที" },
    { value: 60,  label: "1 ชั่วโมง" },
    { value: 90,  label: "1 ชั่วโมง 30 นาที" },
    { value: 120, label: "2 ชั่วโมง" },
];

const SHORTCUT_ICLOUD_LINK = "https://www.icloud.com/shortcuts/YOUR_SHORTCUT_ID_HERE";

export default function AlarmSettingScreen() {
    const { userId } = useLiff();
    const { subscribeToUserSettings, updateUserSettings } = useUserSettingsService();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!userId) return;
        return subscribeToUserSettings(userId, setSettings);
    }, [userId, subscribeToUserSettings]);

    const alarmEnabled = settings?.alarmEnabled ?? false;
    const offsetMinutes = settings?.alarmOffsetMinutes ?? 60;

    const toggleAlarm = async () => {
        if (!userId || !settings || isUpdating) return;
        try {
            setIsUpdating(true);
            await updateUserSettings(userId, { alarmEnabled: !alarmEnabled });
        } finally {
            setIsUpdating(false);
        }
    };

    const setOffset = async (value: number) => {
        if (!userId || isUpdating) return;
        try {
            setIsUpdating(true);
            await updateUserSettings(userId, { alarmOffsetMinutes: value });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex-grow overflow-y-auto px-4 py-6 space-y-4 bg-[#f8fafc] dark:bg-[#0f172a]">

            {/* Main Toggle */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            <AlarmClock size={18} className="text-slate-700 dark:text-slate-300" />
                        </div>
                        <div>
                            <p className="text-slate-800 dark:text-slate-100 font-medium text-sm">นาฬิกาปลุก iPhone</p>
                            <p className="text-slate-400 dark:text-slate-500 text-xs">ตั้งปลุกอัตโนมัติตามเวรพรุ่งนี้</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleAlarm}
                        disabled={isUpdating}
                        className={`w-10 h-6 p-1 rounded-full transition-colors relative flex items-center shrink-0 ${
                            alarmEnabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-600"
                        } ${isUpdating ? "opacity-50" : ""}`}
                    >
                        <span className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                            alarmEnabled ? "translate-x-4" : "translate-x-0"
                        }`} />
                    </button>
                </div>
                <div className="px-5 pb-4 border-t border-slate-50 dark:border-slate-700/50">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-3 leading-relaxed">
                        ใช้ iOS Shortcuts รันทุกคืนเพื่อดึงเวรพรุ่งนี้และตั้งนาฬิกาปลุกให้อัตโนมัติ
                        — เวรที่ไม่มีเวลาบันทึกไว้จะไม่มีการปลุก
                    </p>
                </div>
            </div>

            {alarmEnabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">

                    {/* Offset Picker */}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
                            ปลุกก่อนเวรกี่นาที
                        </p>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm">
                            {OFFSET_OPTIONS.map((opt, i) => {
                                const isSelected = offsetMinutes === opt.value;
                                const isLast = i === OFFSET_OPTIONS.length - 1;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => setOffset(opt.value)}
                                        disabled={isUpdating}
                                        className={`w-full flex items-center justify-between px-5 py-4 transition-colors active:bg-slate-50 dark:active:bg-slate-700/50 ${
                                            !isLast ? "border-b border-slate-100 dark:border-slate-700" : ""
                                        }`}
                                    >
                                        <span className={`text-sm font-medium ${
                                            isSelected
                                                ? "text-slate-800 dark:text-slate-100"
                                                : "text-slate-500 dark:text-slate-400"
                                        }`}>
                                            {opt.label}
                                        </span>
                                        {isSelected && (
                                            <Check size={16} strokeWidth={2.5} className="text-slate-800 dark:text-slate-100" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Shortcut Setup */}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
                            การตั้งค่าครั้งแรก
                        </p>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm px-5 py-4 space-y-4">
                            <div className="space-y-3">
                                {[
                                    'กด "ติดตั้ง Shortcut" ด้านล่าง',
                                    'กด "Add Shortcut" ใน iOS',
                                    'เปิด Shortcuts → เลือก Automation ที่ได้รับ → ปิด "Ask Before Running"',
                                ].map((text, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                            {i + 1}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {text}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => { window.location.href = SHORTCUT_ICLOUD_LINK; }}
                                className="w-full flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 py-3 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all"
                            >
                                <ExternalLink size={15} />
                                ติดตั้ง Shortcut
                            </button>

                            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                                ตั้งค่าครั้งเดียว — ระบบตั้งปลุกให้ทุกคืนอัตโนมัติ
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
