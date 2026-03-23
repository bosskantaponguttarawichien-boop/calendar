"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { MainShift } from "@/types/event.types";

interface MainShiftContextType {
    mainShifts: MainShift[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<MainShift[]>;
}

const MainShiftContext = createContext<MainShiftContextType | undefined>(undefined);

export function MainShiftProvider({ children }: { children: ReactNode }) {
    const [mainShifts, setMainShifts] = useState<MainShift[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMainShifts = useCallback(async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "main-shifts"));
            const shifts = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
                    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
                } as MainShift;
            });
            setMainShifts(shifts);
            setError(null);
            setLoading(false);
            return shifts;
        } catch (err) {
            const errorInstance = err instanceof Error ? err : new Error("Failed to fetch main shifts");
            setError(errorInstance);
            setLoading(false);
            throw errorInstance;
        }
    }, []);

    useEffect(() => {
        fetchMainShifts().catch(() => {});
    }, [fetchMainShifts]);

    return (
        <MainShiftContext.Provider value={{ mainShifts, loading, error, refresh: fetchMainShifts }}>
            {children}
        </MainShiftContext.Provider>
    );
}

export function useMainShifts() {
    const context = useContext(MainShiftContext);
    if (context === undefined) {
        throw new Error("useMainShifts must be used within a MainShiftProvider");
    }
    return context;
}
