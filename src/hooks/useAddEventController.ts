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
    const { addOrUpdateEventByDate } = useEventService();
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
                // For now, if editing a custom event, we'll just update it in place as a regular event
                if (dateStr) {
                    await addOrUpdateEventByDate(userId, dateStr, eventData);
                }
                router.back();
            } else {
                if (dateStr) {
                    const date = parseISO(dateStr);
                    eventData.start = date;
                    eventData.end = date;
                    await addOrUpdateEventByDate(userId, dateStr, eventData);
                    router.push(`/?date=${dateStr}&open=true`);
                } else {
                    router.back();
                }
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
