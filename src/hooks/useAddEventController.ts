"use client";

import { useState } from "react";
import { useShiftService } from "@/hooks/useShiftService";
import { useRouter } from "next/navigation";

export interface AddEventControllerProps {
    dateStr: string | null;
    userId: string;
    /** ID of the user-owned shift being edited (null when editing a main shift) */
    editUserShiftId?: string | null;
    /** ID of the main shift this edit creates an override for */
    mainShiftId?: string | null;
    initialTitle?: string | null;
    initialIcon?: string | null;
    initialColor?: string | null;
    initialStartTime?: string | null;
    initialEndTime?: string | null;
    initialStartTime2?: string | null;
    initialEndTime2?: string | null;
}

export function useAddEventController({
    dateStr, userId,
    editUserShiftId, mainShiftId,
    initialTitle, initialIcon, initialColor,
    initialStartTime, initialEndTime,
    initialStartTime2, initialEndTime2,
}: AddEventControllerProps) {
    const router = useRouter();
    const { addShift, updateShift } = useShiftService();

    // ── form state ───────────────────────────────────────────────────────────
    const [title,         setTitle]         = useState(initialTitle  ?? "");
    const [selectedIcon,  setSelectedIcon]  = useState(initialIcon   ?? "Sun");
    const [selectedColor, setSelectedColor] = useState(initialColor  ?? "#334155");

    const [isTimeEnabled, setIsTimeEnabled] = useState(!!initialStartTime || !!initialEndTime);
    const [startTime,     setStartTime]     = useState(initialStartTime  ?? "");
    const [endTime,       setEndTime]       = useState(initialEndTime    ?? "");

    const [isTime2Enabled, setIsTime2Enabled] = useState(!!initialStartTime2 || !!initialEndTime2);
    const [startTime2,     setStartTime2]     = useState(initialStartTime2 ?? "");
    const [endTime2,       setEndTime2]       = useState(initialEndTime2   ?? "");

    const [loading, setLoading] = useState(false);

    // ── handlers ─────────────────────────────────────────────────────────────

    /** Toggle the primary time range. Disabling it also clears the second range. */
    const handleToggleTime = (enabled: boolean) => {
        setIsTimeEnabled(enabled);
        if (!enabled) {
            setStartTime("");
            setEndTime("");
            setIsTime2Enabled(false);
            setStartTime2("");
            setEndTime2("");
        }
    };

    /** Toggle the secondary time range. */
    const handleToggleTime2 = (enabled: boolean) => {
        setIsTime2Enabled(enabled);
        if (!enabled) {
            setStartTime2("");
            setEndTime2("");
        }
    };

    const handleSave = async () => {
        if (!title.trim()) return;
        setLoading(true);

        try {
            const shiftData = {
                title: title.trim(),
                icon:  selectedIcon,
                color: selectedColor,
                startTime:  startTime  || null,
                endTime:    endTime    || null,
                startTime2: isTime2Enabled ? (startTime2 || null) : null,
                endTime2:   isTime2Enabled ? (endTime2   || null) : null,
                mainShiftId: mainShiftId || null,
            };

            if (editUserShiftId) {
                await updateShift(editUserShiftId, shiftData);
            } else {
                await addShift(userId, shiftData);
            }

            dateStr ? router.push(`/?date=${dateStr}&open=true`) : router.back();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        title, setTitle,
        selectedIcon, setSelectedIcon,
        selectedColor, setSelectedColor,
        isTimeEnabled,
        startTime, setStartTime,
        endTime, setEndTime,
        isTime2Enabled,
        startTime2, setStartTime2,
        endTime2, setEndTime2,
        handleToggleTime,
        handleToggleTime2,
        loading,
        handleSave,
    };
}
