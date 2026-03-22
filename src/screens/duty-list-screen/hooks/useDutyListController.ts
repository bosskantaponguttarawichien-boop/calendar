"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/hooks/useLiff";
import { useEventService } from "@/hooks/useEventService";
import { EventData } from "@/types/event.types";
import { HelpCircle } from "lucide-react";
import { CATEGORIES, CATEGORY_COLORS, DEFAULT_SHIFT_IDS } from "@/lib/constants";

export function useDutyListController() {
    const router = useRouter();
    const { userId, loading: liffLoading } = useLiff();
    const { subscribeToEvents } = useEventService();
    const [events, setEvents] = useState<EventData[]>([]);

    useEffect(() => {
        if (!userId) return;
        const unsubscribe = subscribeToEvents(userId, (fetchedEvents) => {
            setEvents(fetchedEvents);
        });
        return () => unsubscribe();
    }, [userId, subscribeToEvents]);

    const customShifts = useMemo(() => {
        const shifts = events.filter((e) => !DEFAULT_SHIFT_IDS.includes(e.shiftId as string));
        const unique = new Map<string, any>();
        
        shifts.forEach((s) => {
            const key = `${s.shiftId || s.title}-${s.icon}-${s.color}`;
            if (!unique.has(key)) {
                let sTime = s.startTime || "";
                let eTime = s.endTime || "";
                
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
        const shiftsOverrides = events.filter((e) => e.isTemplateOverride);
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
                alert("การลบแบบ Global ถูกยกเลิกชั่วคราวเนื่องจากการปรับปรุงระบบ");
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

    return {
        events,
        liffLoading,
        customShifts,
        ALL_ITEMS,
        handleDelete,
        handleEditClick,
        router,
        userId
    };
}
