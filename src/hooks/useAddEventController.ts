"use client";

import { useState } from "react";
import { useShiftService } from "@/hooks/useShiftService";
import { useRouter } from "next/navigation";

interface UseAddEventControllerProps {
    dateStr: string | null;
    userId: string;
    editUserShiftId?: string | null; // ID of an existing custom shift to update
    mainShiftId?: string | null;      // ID of a main shift we are overriding
    initialTitle?: string | null;
    initialIcon?: string | null;
    initialColor?: string | null;
    initialStartTime?: string | null;
    initialEndTime?: string | null;
}

export function useAddEventController({ 
    dateStr, userId,
    editUserShiftId, mainShiftId,
    initialTitle, initialIcon, initialColor, 
    initialStartTime, initialEndTime 
}: UseAddEventControllerProps) {
    const router = useRouter();
    const { addShift, updateShift } = useShiftService();
    // ... basic state ...
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
            const shiftData = {
                title: title.trim(),
                icon: selectedIcon,
                color: selectedColor,
                startTime: startTime || null,
                endTime: endTime || null,
                mainShiftId: mainShiftId || null,
            };

            if (editUserShiftId) {
                await updateShift(editUserShiftId, shiftData);
            } else {
                await addShift(userId, shiftData);
            }

            if (dateStr) {
                router.push(`/?date=${dateStr}&open=true`);
            } else {
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
