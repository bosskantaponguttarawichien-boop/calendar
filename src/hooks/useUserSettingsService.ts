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
    targetId?: string;
    targetType?: "utou" | "group" | "room" | "none";
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

    const ensureUserSettings = useCallback(async (userId: string, context: { targetId: string; targetType: any }) => {
        try {
            const docRef = doc(db, "user-settings", userId);
            await setDoc(docRef, {
                targetId: context.targetId,
                targetType: context.targetType,
                // Only set autoNotify to true if it's a new document or not already set
                // We'll use merge: true but we can't easily check existence without a getDoc
                // So we'll just merge the targetId and targetType.
            }, { merge: true });
            
            // If we want to default autoNotify to true for new users, we might need a getDoc first
            // but for simplicity, let's just make sure targetId is up to date.
        } catch (error) {
            console.error("Error ensuring user settings:", error);
        }
    }, []);

    return {
        subscribeToUserSettings,
        updateUserSettings,
        ensureUserSettings
    };
}
