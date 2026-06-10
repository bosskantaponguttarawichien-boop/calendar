import { useState, useEffect, useMemo, useCallback } from "react";
import { useShiftService } from "./useShiftService";
import { useMainShifts } from "@/context/MainShiftContext";
import { useUserSettingsService } from "./useUserSettingsService";
import { Shift, MainShift } from "@/types/event.types";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Convert a MainShift document into a system-owned Shift */
function toSystemShift(ms: MainShift): Shift {
    return {
        id: ms.id,
        userId: "system",
        title: ms.title,
        color: ms.color,
        icon: ms.icon,
        startTime: ms.startTime || null,
        endTime: ms.endTime || null,
        startTime2: ms.startTime2 || null,
        endTime2: ms.endTime2 || null,
    };
}

/**
 * Build a map of mainShiftId → user override shift.
 * A user shift is treated as an override when it has an explicit mainShiftId,
 * or when its title matches a system shift.
 */
function buildOverrideMap(
    userShifts: Shift[],
    systemShifts: Shift[]
): Map<string, Shift> {
    const overrides = new Map<string, Shift>();

    for (const userShift of userShifts) {
        const mainId =
            userShift.mainShiftId ||
            systemShifts.find((s) => s.title === userShift.title)?.id;

        if (mainId) {
            // Expose the mainShift's id externally; keep realId for writes
            overrides.set(mainId, { ...userShift, id: mainId, realId: userShift.id });
        }
    }

    return overrides;
}

/** Sort combined shifts according to a saved order array */
function sortByOrder(shifts: Shift[], order: string[]): Shift[] {
    if (order.length === 0) return shifts;

    return [...shifts].sort((a, b) => {
        const ai = order.indexOf(a.id);
        const bi = order.indexOf(b.id);
        if (ai !== -1 && bi !== -1) return ai - bi;
        return ai !== -1 ? -1 : bi !== -1 ? 1 : 0;
    });
}

// ─── hook ────────────────────────────────────────────────────────────────────

export function useShiftController(userId: string | undefined) {
    const { subscribeToShifts, addShift, updateShift, deleteShift } = useShiftService();
    const { subscribeToUserSettings, updateUserSettings } = useUserSettingsService();
    const { mainShifts, loading: mainLoading } = useMainShifts();

    const [userShifts, setUserShifts]     = useState<Shift[]>([]);
    const [shiftsOrder, setShiftsOrder]   = useState<string[]>([]);
    const [userLoading, setUserLoading]   = useState(!!userId);
    const [orderLoading, setOrderLoading] = useState(!!userId);

    useEffect(() => {
        if (!userId) return;
        setUserLoading(true);
        const unsub = subscribeToShifts(userId, (shifts) => {
            setUserShifts(shifts);
            setUserLoading(false);
        });
        return () => { unsub(); setUserLoading(true); };
    }, [userId, subscribeToShifts]);

    useEffect(() => {
        if (!userId) return;
        setOrderLoading(true);
        const unsub = subscribeToUserSettings(userId, (settings) => {
            setShiftsOrder(settings.shiftsOrder || []);
            setOrderLoading(false);
        });
        return () => { unsub(); setOrderLoading(true); };
    }, [userId, subscribeToUserSettings]);

    const shifts = useMemo(() => {
        const systemShifts = mainShifts.map(toSystemShift);
        const overrides     = buildOverrideMap(userShifts, systemShifts);

        // User shifts that don't override anything
        const uniqueUserShifts = userShifts.filter(
            (us) => !us.mainShiftId && !systemShifts.find((s) => s.title === us.title)
        );

        const merged = [
            ...systemShifts.map((s) => overrides.get(s.id) ?? s),
            ...uniqueUserShifts,
        ];

        return sortByOrder(merged, shiftsOrder);
    }, [mainShifts, userShifts, shiftsOrder]);

    const updateShiftsOrder = useCallback(
        async (newOrder: string[]) => {
            if (!userId) return;
            await updateUserSettings(userId, { shiftsOrder: newOrder });
        },
        [userId, updateUserSettings]
    );

    return {
        shifts,
        userShifts,
        loading: mainLoading || userLoading || orderLoading,
        addShift:  (data: Omit<Shift, "id" | "userId">) =>
            userId ? addShift(userId, data) : Promise.reject("No userId"),
        updateShift,
        deleteShift,
        updateShiftsOrder,
        shiftsOrder,
    };
}
