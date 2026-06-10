"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, Plus } from "lucide-react";
import { useAddEventController } from "@/hooks/useAddEventController";
import { useLiff } from "@/hooks/useLiff";
import { CATEGORIES } from "@/lib/constants";

// ─── Constants ────────────────────────────────────────────────────────────────

const AVAILABLE_COLORS = [
    "#86BBD8", "#F58220", "#D43B80", "#00AB84", "#8338EC", "#334155",
    "#EF4444", "#EAB308", "#FF9E2C", "#FF5F6D", "#94A3B8", "#60A5FA",
    "#FACC15", "#A855F7", "#F97316", "#06B6D4",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 rounded-xl px-2 py-2.5 focus-within:ring-2 focus-within:ring-slate-200 dark:focus-within:ring-slate-600 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-inner">
            <input
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
            />
        </div>
    );
}

function TimeRangePair({
    startTime, endTime,
    onStartChange, onEndChange,
}: {
    startTime: string; endTime: string;
    onStartChange: (v: string) => void;
    onEndChange: (v: string) => void;
}) {
    return (
        <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-tighter ml-1">เริ่ม</span>
                <TimeInput value={startTime} onChange={onStartChange} />
            </div>
            <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-tighter ml-1">สิ้นสุด</span>
                <TimeInput value={endTime} onChange={onEndChange} />
            </div>
        </div>
    );
}

// ─── Main form (reads search params) ─────────────────────────────────────────

function AddShiftForm() {
    const router = useRouter();
    const { userId, loading: liffLoading } = useLiff();
    const params = useSearchParams();

    const isMainShift = params.get("isMainShift") === "true";
    const editId      = params.get("editId");

    const ctrl = useAddEventController({
        dateStr:          params.get("date"),
        userId:           userId ?? "local-user",
        editUserShiftId:  isMainShift ? null  : editId,
        mainShiftId:      isMainShift ? editId : null,
        initialTitle:     params.get("title"),
        initialIcon:      params.get("icon"),
        initialColor:     params.get("color"),
        initialStartTime: params.get("startTime"),
        initialEndTime:   params.get("endTime"),
        initialStartTime2: params.get("startTime2"),
        initialEndTime2:   params.get("endTime2"),
    });

    const icons = CATEGORIES.filter((c) => c.id !== "custom");

    if (liffLoading) return <LoadingSpinner />;

    return (
        <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0f172a] flex flex-col p-5 animate-in fade-in duration-500 pb-10 transition-colors">
            <main className="flex-grow flex flex-col items-center max-w-md mx-auto w-full">

                {/* ── Card ── */}
                <div className="bg-white dark:bg-slate-800 rounded-[28px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-slate-50 dark:border-slate-700/50 w-full mb-6 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-slate-700 rounded-full -mr-12 -mt-12 opacity-50" />

                    <div className="space-y-5 relative z-10">

                        {/* Title */}
                        <Field label="ชื่อเวร / กิจกรรม">
                            <input
                                autoFocus
                                type="text"
                                value={ctrl.title}
                                onChange={(e) => ctrl.setTitle(e.target.value)}
                                placeholder="เช่น OT พิเศษ / ประชุมสำนักงาน..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
                            />
                        </Field>

                        {/* Icon */}
                        <Field label="เลือกไอคอน">
                            <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar -mx-1 px-1">
                                {icons.map(({ id, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => ctrl.setSelectedIcon(id)}
                                        className={[
                                            "shrink-0 w-10 h-10 rounded-[14px] flex items-center justify-center transition-all duration-300",
                                            ctrl.selectedIcon === id
                                                ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg translate-y-[-1px]"
                                                : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500",
                                        ].join(" ")}
                                    >
                                        <Icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </Field>

                        {/* Color */}
                        <Field label="เลือกสี">
                            <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar -mx-1 px-1">
                                {AVAILABLE_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => ctrl.setSelectedColor(color)}
                                        style={{ backgroundColor: color }}
                                        className={[
                                            "shrink-0 w-10 h-10 rounded-[14px] transition-all relative flex items-center justify-center",
                                            ctrl.selectedColor === color
                                                ? "ring-2 ring-slate-200 dark:ring-slate-600 ring-offset-2 dark:ring-offset-slate-800 scale-105 shadow-md"
                                                : "opacity-80 hover:opacity-100 border border-slate-100 dark:border-slate-700",
                                        ].join(" ")}
                                    >
                                        {ctrl.selectedColor === color && (
                                            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </Field>

                        {/* Time ranges */}
                        <div className="space-y-3">
                            {/* Toggle header */}
                            <div className="flex items-center justify-between ml-1">
                                <label
                                    className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer"
                                    onClick={() => ctrl.handleToggleTime(!ctrl.isTimeEnabled)}
                                >
                                    ช่วงเวลา (สำหรับตั้งนาฬิกาปลุก)
                                </label>
                                <Toggle
                                    enabled={ctrl.isTimeEnabled}
                                    onToggle={() => ctrl.handleToggleTime(!ctrl.isTimeEnabled)}
                                />
                            </div>

                            {ctrl.isTimeEnabled && (
                                <div className="space-y-3">
                                    {/* Period 1 */}
                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">ช่วงที่ 1</span>
                                        <TimeRangePair
                                            startTime={ctrl.startTime} endTime={ctrl.endTime}
                                            onStartChange={ctrl.setStartTime} onEndChange={ctrl.setEndTime}
                                        />
                                    </div>

                                    {/* Period 2 */}
                                    {!ctrl.isTime2Enabled ? (
                                        <button
                                            type="button"
                                            onClick={() => ctrl.handleToggleTime2(true)}
                                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-600 text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 hover:text-slate-500 transition-colors"
                                        >
                                            <Plus size={13} strokeWidth={2.5} />
                                            เพิ่มช่วงเวลาที่ 2 (เช่น เวรดึก/บ่าย)
                                        </button>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between ml-1">
                                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">ช่วงที่ 2</span>
                                                <button
                                                    type="button"
                                                    onClick={() => ctrl.handleToggleTime2(false)}
                                                    className="text-[9px] font-bold text-red-400 hover:text-red-500 transition-colors"
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                            <TimeRangePair
                                                startTime={ctrl.startTime2} endTime={ctrl.endTime2}
                                                onStartChange={ctrl.setStartTime2} onEndChange={ctrl.setEndTime2}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Action buttons ── */}
                <div className="w-full flex gap-3 mt-4">
                    <button
                        onClick={() => router.back()}
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-300 py-2.5 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all outline-none"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={ctrl.handleSave}
                        disabled={ctrl.loading || !ctrl.title.trim()}
                        className="flex-[2] bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2 outline-none group"
                    >
                        {ctrl.loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 dark:border-slate-800/30 border-t-white dark:border-t-slate-800 rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={14} className="group-hover:scale-110 transition-transform" />
                                บันทึกเวร
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}

// ─── Tiny shared primitives ───────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                {label}
            </label>
            {children}
        </div>
    );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`w-10 h-6 p-1 rounded-full transition-colors relative flex items-center shrink-0 cursor-pointer focus:outline-none ${enabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-600"}`}
        >
            <span className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? "translate-x-4" : "translate-x-0"}`} />
        </button>
    );
}

function LoadingSpinner() {
    return (
        <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-800 border-t-slate-800 dark:border-t-slate-200 rounded-full animate-spin" />
        </div>
    );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function AddShiftPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <AddShiftForm />
        </Suspense>
    );
}
