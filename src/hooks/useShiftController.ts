import { useState, useEffect, useMemo, useCallback } from "react";
import { useShiftService } from "./useShiftService";
import { useMainShifts } from "@/context/MainShiftContext";
import { useUserSettingsService } from "./useUserSettingsService";
import { Shift } from "@/types/event.types";

export function useShiftController(userId: string | undefined) {
    const { subscribeToShifts, addShift, updateShift, deleteShift } = useShiftService();
    const { subscribeToUserSettings, updateUserSettings } = useUserSettingsService();
    const { mainShifts, loading: mainLoading } = useMainShifts();
    
    const [userShifts, setUserShifts] = useState<Shift[]>([]);
    const [userLoading, setUserLoading] = useState(!!userId);
    const [shiftsOrder, setShiftsOrder] = useState<string[]>([]);
    const [settingsLoading, setSettingsLoading] = useState(!!userId);

    // Subscribe to Shifts
    useEffect(() => {
        if (!userId) return;

        const unsub = subscribeToShifts(userId, (shifts) => {
            setUserShifts(shifts);
            setUserLoading(false);
        });

        return () => {
            unsub();
            setUserLoading(true);
        };
    }, [userId, subscribeToShifts]);

    // Subscribe to User Settings (for shiftsOrder)
    useEffect(() => {
        if (!userId) return;

        const unsub = subscribeToUserSettings(userId, (settings) => {
            setShiftsOrder(settings.shiftsOrder || []);
            setSettingsLoading(false);
        });

        return () => {
            unsub();
            setSettingsLoading(true);
        };
    }, [userId, subscribeToUserSettings]);

    const allShifts = useMemo(() => {
        // Create system shifts from main shifts
        const systemShifts: Shift[] = mainShifts.map(ms => ({
            id: ms.id,
            userId: "system",
            title: ms.title,
            color: ms.color,
            icon: ms.icon,
            startTime: ms.startTime,
            endTime: ms.endTime,
        }));

        // Separate user shifts into overrides and unique shifts
        const overrides = new Map<string, Shift>();
        const uniqueUserShifts: Shift[] = [];

        userShifts.forEach(us => {
            const mainId = us.mainShiftId || systemShifts.find(ss => ss.title === us.title)?.id;
            if (mainId) {
                overrides.set(mainId, { ...us, id: mainId, realId: us.id });
            } else {
                uniqueUserShifts.push(us);
            }
        });

        // Merge and sort
        const combined = [
            ...systemShifts.map(ss => overrides.get(ss.id) || ss),
            ...uniqueUserShifts
        ];

        if (shiftsOrder.length === 0) return combined;

        return [...combined].sort((a, b) => {
            const aIdx = shiftsOrder.indexOf(a.id);
            const bIdx = shiftsOrder.indexOf(b.id);
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            return aIdx !== -1 ? -1 : (bIdx !== -1 ? 1 : 0);
        });
    }, [mainShifts, userShifts, shiftsOrder]);

    const updateShiftsOrder = useCallback(async (newOrder: string[]) => {
        if (!userId) return;
        try {
            await updateUserSettings(userId, { shiftsOrder: newOrder });
        } catch (error) {
            console.error("Failed to update shifts order:", error);
            throw error;
        }
    }, [userId, updateUserSettings]);

    return {
        shifts: allShifts,
        userShifts,
        loading: mainLoading || userLoading || settingsLoading,
        addShift: (data: Omit<Shift, "id" | "userId">) => userId ? addShift(userId, data) : Promise.reject("No User ID"),
        updateShift,
        deleteShift,
        updateShiftsOrder,
        shiftsOrder
    };
}
