"use client";

import { useState, useEffect } from "react";
import { useMainShiftService } from "./useMainShiftService";
import { MainShift } from "@/types/event.types";

export function useMainShiftController() {
    const { getMainShifts } = useMainShiftService();
    const [mainShifts, setMainShifts] = useState<MainShift[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchMainShifts = async () => {
            try {
                setLoading(true);
                const shifts = await getMainShifts();
                if (isMounted) {
                    setMainShifts(shifts);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error("Failed to fetch main shifts"));
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchMainShifts();

        return () => {
            isMounted = false;
        };
    }, [getMainShifts]);

    return {
        mainShifts,
        loading,
        error,
        refresh: getMainShifts
    };
}
