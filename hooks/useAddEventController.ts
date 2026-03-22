"use client";

import { useState } from "react";
import { useEventService } from "@/hooks/useEventService";
import { format, parseISO, addDays } from "date-fns";
import { useRouter } from "next/navigation";

interface UseAddEventControllerProps {
    dateStr: string | null;
    userId: string;
    editId?: string | null;
    initialTitle?: string | null;
    initialIcon?: string | null;
    initialColor?: string | null;
    initialStartTime?: string | null;
    initialEndTime?: string | null;
}

export function useAddEventController({ 
    dateStr, userId, editId, 
    initialTitle, initialIcon, initialColor, 
    initialStartTime, initialEndTime 
}: UseAddEventControllerProps) {
    const router = useRouter();
    const { addOrUpdateShiftByDate, updateCustomShiftGlobal, createCustomShiftTemplate } = useEventService();
    const [title, setTitle] = useState(initialTitle || "");
    const [selectedIcon, setSelectedIcon] = useState(initialIcon || "Sun");
    const [selectedColor, setSelectedColor] = useState(initialColor || "#334155");
    const [isTimeEnabled, setIsTimeEnabled] = useState(!!initialStartTime || !!initialEndTime);
    const [startTime, setStartTime] = useState(initialStartTime || "");
    const [endTime, setEndTime] = useState(initialEndTime || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) return;
        setLoading(true);

        try {
            const eventData: any = {
                userId,
                title: title.trim(),
                icon: selectedIcon,
                color: selectedColor,
                startTime: startTime || null,
                endTime: endTime || null,
            };
            

            if (editId) {
                await updateCustomShiftGlobal(userId, { shiftId: editId }, eventData);
                router.back();
            } else if (dateStr) {
                const date = parseISO(dateStr);
                eventData.start = date;
                eventData.end = date;
                await addOrUpdateShiftByDate(userId, dateStr, eventData);

                const nextDate = addDays(date, 1);
                router.push(`/?date=${format(nextDate, "yyyy-MM-dd")}&open=true`);
            } else {
                // Standalone template creation
                await createCustomShiftTemplate(userId, eventData);
                router.back();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        title, setTitle,
        selectedIcon, setSelectedIcon,
        selectedColor, setSelectedColor,
        isTimeEnabled, setIsTimeEnabled,
        startTime, setStartTime,
        endTime, setEndTime,
        loading,
        handleSave,
    };
}
