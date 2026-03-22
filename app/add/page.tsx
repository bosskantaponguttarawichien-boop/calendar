"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save } from "lucide-react";
import { useAddEventController } from "@/hooks/useAddEventController";
import { CATEGORIES } from "@/lib/constants";

const AVAILABLE_COLORS = [
    "#86BBD8", "#F58220", "#D43B80", "#00AB84", "#8338EC", "#334155", "#EF4444", "#EAB308",
    "#FF9E2C", "#FF5F6D", "#94A3B8", "#60A5FA", "#FACC15", "#A855F7", "#F97316", "#06B6D4"
];

function AddCustomContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateStr = searchParams.get("date");

    const {
        title, setTitle,
        selectedIcon, setSelectedIcon,
        selectedColor, setSelectedColor,
        startTime, setStartTime,
        endTime, setEndTime,
        loading,
        handleSave,
    } = useAddEventController({ dateStr, userId: "local-user" });

    const AVAILABLE_ICONS = CATEGORIES.filter((c) => c.id !== "custom").map((c) => ({ id: c.id, icon: c.icon }));

    return (
        <div className="min-h-[100dvh] bg-slate-50 flex flex-col p-5 animate-in fade-in duration-500 pb-10">


            <main className="flex-grow flex flex-col items-center max-w-md mx-auto w-full">
                <div className="bg-white rounded-[28px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 w-full mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 opacity-50 transition-all" />

                    <div className="space-y-5 relative z-10">
                        {/* Title Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อเวร / กิจกรรม</label>
                            <input
                                autoFocus
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="เช่น OT พิเศษ / ประชุมสำนักงาน..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all placeholder:text-slate-300 shadow-inner"
                            />
                        </div>

                        {/* Icon Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เลือกไอคอน</label>
                            <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar -mx-1 px-1">
                                {AVAILABLE_ICONS.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedIcon(item.id)}
                                        className={`shrink-0 w-10 h-10 rounded-[14px] flex items-center justify-center transition-all duration-300 ${selectedIcon === item.id
                                                ? "bg-slate-800 text-white shadow-lg translate-y-[-1px]"
                                                : "bg-white text-slate-400 border border-slate-100 hover:border-slate-300"
                                            }`}
                                    >
                                        <item.icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เลือกสี</label>
                            <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar -mx-1 px-1">
                                {AVAILABLE_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`shrink-0 w-10 h-10 rounded-[14px] transition-all relative flex items-center justify-center ${selectedColor === color
                                                ? "ring-2 ring-slate-200 ring-offset-2 scale-105 shadow-md"
                                                : "opacity-80 hover:opacity-100 border border-slate-100"
                                            }`}
                                        style={{ backgroundColor: color }}
                                    >
                                        {selectedColor === color && (
                                            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Range */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ช่วงเวลา (ระบุหรือไม่ก็ได้)</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter ml-1">เริ่ม</span>
                                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-2 py-2.5 focus-within:ring-2 focus-within:ring-slate-100 focus-within:bg-white transition-all shadow-inner">
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter ml-1">สิ้นสุด</span>
                                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-2 py-2.5 focus-within:ring-2 focus-within:ring-slate-100 focus-within:bg-white transition-all shadow-inner">
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full flex gap-3 mt-4">
                    <button
                        onClick={() => router.back()}
                        className="flex-1 bg-white border border-slate-100 text-slate-400 py-3 rounded-[18px] font-black text-[15px] hover:bg-slate-50 active:scale-95 transition-all outline-none"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !title.trim()}
                        className="flex-[2] bg-slate-800 text-white py-3 rounded-[18px] font-black text-[15px] shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2 outline-none group"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={16} className="group-hover:scale-110 transition-transform" />
                                บันทึกเวร
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}

export default function AddCustomPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
            </div>
        }>
            <AddCustomContent />
        </Suspense>
    );
}
