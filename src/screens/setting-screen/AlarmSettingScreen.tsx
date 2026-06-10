"use client";

import React, { useEffect, useState } from "react";
import { AlarmClock, Check, Copy, CheckCheck } from "lucide-react";
import { useLiff } from "@/hooks/useLiff";
import { useUserSettingsService, UserSettings } from "@/hooks/useUserSettingsService";

const SHORTCUT_STEPS: { step: number; title: string; detail?: string }[] = [
    {
        step: 2,
        title: "เปิดแอป Shortcuts → แถบ Automation (ล่างสุด)",
        detail: "แตะ + มุมขวาบน → เลือก Time of Day",
    },
    {
        step: 3,
        title: "ตั้งเวลา เช่น 23:00 ทุกวัน → กด Next",
        detail: 'เลือก Repeat: Daily แล้วกด "New Blank Automation" (ไม่ใช่ Run Immediately)',
    },
    {
        step: 4,
        title: 'กด Add Action → ค้นหา "URL" → เลือก URL',
        detail: "วาง URL ที่ copy ไว้จาก Step 1 ลงในช่อง",
    },
    {
        step: 5,
        title: 'กด + → ค้นหา "Get Contents of URL" → เลือก',
        detail: "action นี้จะดึงข้อมูลเวรจากเซิร์ฟเวอร์",
    },
    {
        step: 6,
        title: 'กด + → ค้นหา "Get Dictionary from Input" → เลือก',
        detail: "แปลง JSON ที่ได้รับให้เป็น Dictionary",
    },
    {
        step: 7,
        title: 'กด + → ค้นหา "Repeat with Each" → เลือก',
        detail: 'แตะที่ช่อง Items → เลือก Dictionary Value → Key: พิมพ์ alarms',
    },
    {
        step: 8,
        title: 'ในลูป: กด + → ค้นหา "Set Alarm" → เลือก',
        detail: "แตะเวลา → เลือก Repeat Item → Dictionary Value → Key: alarmTime\nแตะ Label → เลือก Repeat Item → Dictionary Value → Key: label",
    },
    {
        step: 9,
        title: 'กด Done → แตะ Automation ที่สร้าง → ปิด "Ask Before Running"',
        detail: "สำคัญมาก! ถ้าไม่ปิดตัวเลือกนี้ Shortcut จะไม่รันอัตโนมัติ",
    },
];

const OFFSET_OPTIONS = [
    { value: 15,  label: "15 นาที" },
    { value: 30,  label: "30 นาที" },
    { value: 45,  label: "45 นาที" },
    { value: 60,  label: "1 ชั่วโมง" },
    { value: 90,  label: "1 ชั่วโมง 30 นาที" },
    { value: 120, label: "2 ชั่วโมง" },
];

export default function AlarmSettingScreen() {
    const { userId } = useLiff();
    const { subscribeToUserSettings, updateUserSettings } = useUserSettingsService();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [copied, setCopied] = useState(false);

    const apiUrl = typeof window !== "undefined" && userId
        ? `${window.location.origin}/api/alarm?userId=${userId}`
        : null;

    const copyUrl = async () => {
        if (!apiUrl) return;
        await navigator.clipboard.writeText(apiUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                            ขั้นตอนสร้าง Shortcut (ทำครั้งเดียว)
                        </p>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm px-5 py-5 space-y-5">

                            {/* API URL copy box */}
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    Step 1 — Copy URL นี้ก่อน
                                </p>
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2.5 border border-slate-100 dark:border-slate-700">
                                    <p className="flex-1 text-[10px] font-mono text-slate-600 dark:text-slate-300 break-all leading-relaxed select-all">
                                        {apiUrl ?? "กรุณาเข้าสู่ระบบก่อน"}
                                    </p>
                                    <button
                                        onClick={copyUrl}
                                        disabled={!apiUrl}
                                        className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
                                    >
                                        {copied
                                            ? <CheckCheck size={14} className="text-emerald-500" />
                                            : <Copy size={14} />
                                        }
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-700" />

                            {/* Detailed steps */}
                            <div className="space-y-4">
                                {SHORTCUT_STEPS.map(({ step, title, detail }) => (
                                    <div key={step} className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                            {step}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">{title}</p>
                                            {detail && (
                                                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed mt-0.5">{detail}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-1">
                                ตั้งค่าครั้งเดียว — ระบบตั้งปลุกให้ทุกคืนอัตโนมัติ
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
