"use client";

import { useCallback } from "react";
import { db } from "@/lib/firebase";
import { 
    doc, 
    setDoc, 
    onSnapshot 
} from "firebase/firestore";

export interface UserSettings {
    shiftsOrder: string[];
    autoNotify?: boolean;
    lastNotifyDate?: string;
}

export function useUserSettingsService() {
    const subscribeToUserSettings = useCallback((
        userId: string, 
        onUpdate: (settings: UserSettings) => void
    ) => {
        if (!userId) return () => {};

        const docRef = doc(db, "user-settings", userId);
        const unsub = onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                onUpdate(snapshot.data() as UserSettings);
            } else {
                onUpdate({ shiftsOrder: [], autoNotify: false, lastNotifyDate: "" });
            }
        });

        return unsub;
    }, []);

    const updateUserSettings = useCallback(async (userId: string, settings: Partial<UserSettings>) => {
        try {
            const docRef = doc(db, "user-settings", userId);
            await setDoc(docRef, settings, { merge: true });
        } catch (error) {
            console.error("Error updating user settings:", error);
            throw error;
        }
    }, []);

    return {
        subscribeToUserSettings,
        updateUserSettings
    };
}
