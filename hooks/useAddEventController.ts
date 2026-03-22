"use client";

import { useState } from "react";
import { useEventService } from "@/hooks/useEventService";
import { format, parseISO, addDays } from "date-fns";
import { useRouter } from "next/navigation";

interface UseAddEventControllerProps {
    dateStr: string | null;
    userId: string;
}

export function useAddEventController({ dateStr, userId }: UseAddEventControllerProps) {
    const router = useRouter();
    const { addOrUpdateShiftByDate } = useEventService();
    const [title, setTitle] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("Sun");
    const [selectedColor, setSelectedColor] = useState("#334155");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!dateStr || !title.trim()) return;
        setLoading(true);

        try {
            const date = parseISO(dateStr);

            const eventData = {
                userId,
                title: title.trim(),
                icon: selectedIcon,
                color: selectedColor,
                startTime: startTime || null,
                endTime: endTime || null,
                start: date,
                end: date,
            };

            await addOrUpdateShiftByDate(userId, dateStr, eventData);

            const nextDate = addDays(date, 1);
            router.push(`/?date=${format(nextDate, "yyyy-MM-dd")}&open=true`);
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
        startTime, setStartTime,
        endTime, setEndTime,
        loading,
        handleSave,
    };
}
