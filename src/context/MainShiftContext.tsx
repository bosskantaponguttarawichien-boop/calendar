"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useMainShiftController } from "@/hooks/useMainShiftController";
import { MainShift } from "@/types/event.types";

interface MainShiftContextType {
    mainShifts: MainShift[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<MainShift[]>;
}

const MainShiftContext = createContext<MainShiftContextType | undefined>(undefined);

export function MainShiftProvider({ children }: { children: ReactNode }) {
    const { mainShifts, loading, error, refresh } = useMainShiftController();

    return (
        <MainShiftContext.Provider value={{ mainShifts, loading, error, refresh }}>
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
