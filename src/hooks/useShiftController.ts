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
        // 1. Convert MainShifts to Shift format (System shifts)
        const systemShifts: Shift[] = mainShifts.map(ms => ({
            id: ms.id,
            userId: "system",
            title: ms.title,
            color: ms.color,
            icon: ms.icon,
            startTime: ms.startTime,
            endTime: ms.endTime,
        }));

        // 2. Identify which user shifts are "overrides" of main shifts
        const overrideMap = new Map<string, Shift>();
        const uniqueUserShifts: Shift[] = [];

        userShifts.forEach(us => {
            if (us.mainShiftId) {
                overrideMap.set(us.mainShiftId, us);
            } else {
                const matchingMain = systemShifts.find(ss => ss.title === us.title);
                if (matchingMain) {
                    overrideMap.set(matchingMain.id, us);
                } else {
                    uniqueUserShifts.push(us);
                }
            }
        });

        // 3. Build the merged list
        const merged = systemShifts.map(ss => {
            const override = overrideMap.get(ss.id);
            return override ? { ...override, id: ss.id, realId: override.id } : ss;
        });

        const combined = [...merged, ...uniqueUserShifts];

        // 4. Sort by shiftsOrder
        if (shiftsOrder.length > 0) {
            return [...combined].sort((a, b) => {
                const aIndex = shiftsOrder.indexOf(a.id);
                const bIndex = shiftsOrder.indexOf(b.id);
                
                // If both are in the order array, sort by it
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                
                // If only one is in the array, put it first
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                
                // If none are in the array, keep original relative order
                return 0;
            });
        }

        return combined;
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
