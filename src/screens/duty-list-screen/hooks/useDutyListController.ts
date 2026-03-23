"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/hooks/useLiff";
import { useShiftController } from "@/hooks/useShiftController";
import { HelpCircle } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export function useDutyListController() {
    const router = useRouter();
    const { userId, loading: liffLoading } = useLiff();
    const { 
        shifts, 
        loading: shiftsLoading, 
        deleteShift, 
        updateShiftsOrder 
    } = useShiftController(userId || undefined);

    const settingsLoading = false; // We can integrate this if needed, but shiftsLoading already covers it in the controller

    const ALL_ITEMS = useMemo(() => {
        return shifts.map(s => ({
            id: s.id,
            label: s.title,
            color: s.color,
            icon: CATEGORIES.find(c => c.id === s.icon)?.icon || HelpCircle,
            rawIconId: s.icon,
            startTime: s.startTime,
            endTime: s.endTime,
            isCustom: true, // we want to show edit/delete for all in this screen
            isMainShift: s.userId === "system",
            realId: (s as any).realId || s.id
        }));
    }, [shifts]);

    const handleDelete = async (item: any) => {
        if (!userId || item.isMainShift) {
            if (item.isMainShift) alert("ไม่สามารถลบเวรมาตรฐานของระบบได้");
            return;
        }
        if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเวร "${item.label}"?`)) {
            try {
                await deleteShift(item.realId);
            } catch (error) {
                console.error(error);
                alert("เกิดข้อผิดพลาดในการลบเวร");
            }
        }
    };

    const handleEditClick = (item: any) => {
        const params = new URLSearchParams({
            editId: String(item.isMainShift ? item.id : item.realId),
            isMainShift: String(item.isMainShift),
            title: item.label || "",
            icon: item.rawIconId || "Sun",
            color: item.color || "#334155",
            startTime: item.startTime || "",
            endTime: item.endTime || ""
        });
        router.push(`/add?${params.toString()}`);
    };

    const handleReorder = async (newItems: any[]) => {
        const newOrder = newItems.map(item => item.id);
        try {
            await updateShiftsOrder(newOrder);
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการบันทึกลำดับ");
        }
    };

    return {
        events: [], // for compatibility if needed elsewhere
        liffLoading: liffLoading || shiftsLoading || settingsLoading,
        customShifts: shifts.filter(s => s.userId !== "system"),
        ALL_ITEMS,
        handleDelete,
        handleEditClick,
        handleReorder,
        router,
        userId
    };
}
