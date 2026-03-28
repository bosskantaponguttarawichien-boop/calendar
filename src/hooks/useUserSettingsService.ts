"use client";

import { useCallback } from "react";
import { db } from "@/lib/firebase";
import { 
    doc, 
    setDoc, 
    onSnapshot,
    getDoc
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
            const docSnap = await getDoc(docRef);
            
            const updates: Partial<UserSettings> = {
                targetId: context.targetId,
                targetType: context.targetType,
            };

            // Only set autoNotify to true if it's a new document or autoNotify is currently undefined
            if (!docSnap.exists() || docSnap.data().autoNotify === undefined) {
                // Default to true for groups/rooms to help with testing/onboarding
                if (context.targetType === "group" || context.targetType === "room") {
                    updates.autoNotify = true;
                }
            }

            await setDoc(docRef, updates, { merge: true });
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
