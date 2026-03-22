"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/hooks/useLiff";
import { useEventService } from "@/hooks/useEventService";
import { EventData } from "@/types/event.types";
import { HelpCircle, Pencil, Trash2, Plus } from "lucide-react";
import { CATEGORIES, CATEGORY_COLORS, DEFAULT_SHIFT_IDS } from "@/lib/constants";

export default function DutyListScreen() {
    const router = useRouter();
    const { userId, loading: liffLoading } = useLiff();
    const { subscribeToEvents, deleteCustomShiftGlobal } = useEventService();
    const [events, setEvents] = useState<EventData[]>([]);

    useEffect(() => {
        if (!userId) return;
        const unsubscribe = subscribeToEvents(userId, (fetchedEvents) => {
            setEvents(fetchedEvents);
        });
        return () => unsubscribe();
    }, [userId, subscribeToEvents]);

    const customShifts = useMemo(() => {
        const shifts = events.filter((e) => e.collectionName === "shifts" && !e.isTemplateOverride && !DEFAULT_SHIFT_IDS.includes(e.shiftId as string));
        const unique = new Map<string, any>();
        
        shifts.forEach((s) => {
            const key = `${s.shiftId || s.title}-${s.icon}-${s.color}`;
            if (!unique.has(key)) {
                let sTime = "";
                let eTime = "";
                if (s.startTime) sTime = s.startTime;
                if (s.endTime) eTime = s.endTime;
                
                if (!sTime && s.start instanceof Date) {
                    sTime = s.start.toTimeString().substring(0, 5);
                }
                if (!eTime && s.end instanceof Date) {
                    eTime = s.end.toTimeString().substring(0, 5);
                }

                unique.set(key, {
                    id: s.shiftId || s.createdAt?.getTime() || `custom-${s.title}-${s.icon}`,
                    label: s.title || "เวรพิเศษ",
                    color: s.color,
                    icon: CATEGORIES.find(c => c.id === s.icon)?.icon || HelpCircle,
                    rawIconId: s.icon,
                    startTime: sTime,
                    endTime: eTime,
                    isCustom: true,
                    fullShiftData: s
                });
            }
        });

        return Array.from(unique.values()).sort((a, b) => b.id - a.id);
    }, [events]);

    const ALL_ITEMS = useMemo(() => {
        const shiftsOverrides = events.filter((e) => e.collectionName === "shifts" && e.isTemplateOverride);
        const defaultItems = CATEGORIES.filter(c => c.id !== "custom").map(c => {
            const override = shiftsOverrides.find(o => o.shiftId === c.id);
            if (override && override.isDeleted) return null;
            
            const finalTitle = override?.title || c.label;
            const finalColor = override?.color || CATEGORY_COLORS[c.id] || c.color;
            const finalIconId = override?.icon || c.id;
            const finalIcon = CATEGORIES.find(cat => cat.id === finalIconId)?.icon || c.icon;
            const finalStartTime = override?.startTime || "";
            const finalEndTime = override?.endTime || "";

            return {
                ...c,
                id: c.id,
                label: finalTitle,
                color: finalColor,
                icon: finalIcon,
                rawIconId: finalIconId,
                startTime: finalStartTime,
                endTime: finalEndTime,
                isCustom: true,
                isDefaultBase: true,
                fullShiftData: {
                    shiftId: c.id,
                    title: finalTitle,
                    color: finalColor,
                    icon: finalIconId,
                    startTime: finalStartTime,
                    endTime: finalEndTime
                }
            };
        }).filter(Boolean) as any[];

        return [...defaultItems, ...customShifts];
    }, [customShifts, events]);

    const handleDelete = async (item: any) => {
        if (!userId) return;
        if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเวร "${item.label}"?\nการลบจะทำให้เวรนี้หายไปจากทุกวันที่เคยถูกจัดไว้ด้วย`)) {
            try {
                await deleteCustomShiftGlobal(userId, item.fullShiftData);
            } catch (error) {
                console.error(error);
                alert("เกิดข้อผิดพลาดในการลบเวร");
            }
        }
    };

    const handleEditClick = (item: any) => {
        const id = item.fullShiftData?.shiftId || item.id;
        const params = new URLSearchParams({
            editId: String(id),
            title: item.label || "",
            icon: item.rawIconId || "Sun",
            color: item.color || "#334155",
            startTime: item.startTime || "",
            endTime: item.endTime || ""
        });
        router.push(`/add?${params.toString()}`);
    };

    if (liffLoading) {
        return (
            <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-800 border-t-slate-800 dark:border-t-slate-200 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0f172a] flex flex-col animate-in fade-in duration-500 transition-colors">
            <main className="flex-grow overflow-y-auto px-4 pt-6 pb-2">
                <div className="flex items-end justify-between px-2 mb-2">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        รายการเวรทั้งหมด
                    </p>
                    <p className="text-[11px] font-medium text-slate-400/80 dark:text-slate-500/80">
                        {ALL_ITEMS.length} รายการ
                    </p>
                </div>
                
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden mb-4">
                    {ALL_ITEMS.map((item, idx) => {
                        const IconComponent = item.icon || HelpCircle;
                        const itemColor = typeof item.color === 'string' ? item.color : CATEGORY_COLORS[item.id] || "#334155";
                        const isLast = idx === ALL_ITEMS.length - 1;

                        return (
                            <div 
                                key={`${item.id}-${idx}`} 
                                className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${!isLast ? "border-b border-slate-100 dark:border-slate-700" : ""}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0" 
                                        style={{ backgroundColor: itemColor }}
                                    >
                                        <IconComponent size={20} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-tight block mb-0.5">
                                            {item.label}
                                        </span>
                                        {(item.startTime || item.endTime) && (
                                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                เวลา: {item.startTime || "??"} - {item.endTime || "??"}
                                            </div>
                                        )}
                                        {(!item.startTime && !item.endTime && !item.isCustom) && (
                                            <div className="text-xs text-slate-400 dark:text-slate-500">
                                                หมวดหมู่เวรเริ่มต้น
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {item.isCustom && (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleEditClick(item)}
                                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item)}
                                            className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <button
                    onClick={() => router.push("/add")}
                    className="w-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 py-3 rounded-2xl font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
                    เพิ่มเวรใหม่
                </button>
            </main>
        </div>
    );
}
