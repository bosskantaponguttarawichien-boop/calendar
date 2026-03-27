"use client";

import { useState, useEffect } from "react";
import liff from "@/lib/liff";
import { useUserSettingsService } from "./useUserSettingsService";

const LIFF_ID = "2009451557-lZpkB3ag";

export function useLiff() {
    const [userId, setUserId] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [pictureUrl, setPictureUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { ensureUserSettings } = useUserSettingsService();

    useEffect(() => {
        const init = async () => {
            const isLocal = typeof window !== "undefined" && 
                (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

            if (isLocal) {
                console.warn("[LIFF] Mock Mode: Localhost detected. Using mock user.");
                const mockUserId = "mock-user-123";
                setUserId(mockUserId);
                setDisplayName("Mock User (Local)");
                setPictureUrl("https://www.w3schools.com/howto/img_avatar.png");
                
                // Also ensure mock settings
                ensureUserSettings(mockUserId, { targetId: mockUserId, targetType: "utou" });
                
                setLoading(false);
                return;
            }

            try {
                if (!liff.id) {
                    await liff.init({ liffId: LIFF_ID });
                }
                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    setUserId(profile.userId);
                    setDisplayName(profile.displayName);
                    setPictureUrl(profile.pictureUrl || null);

                    // Capture context for targeting notifications
                    const context = liff.getContext();
                    const targetId = context?.groupId || context?.roomId || profile.userId;
                    const targetType = context?.type || "utou";

                    if (profile.userId) {
                        ensureUserSettings(profile.userId, { targetId, targetType });
                    }
                } else {
                    liff.login();
                }
            } catch (error) {
                console.error("LIFF Initialization failed", error);
            } finally {
                setLoading(false);
            }
        };

        if (typeof window !== "undefined") {
            init();
        }
    }, [ensureUserSettings]);

    return { 
        userId, 
        displayName, 
        pictureUrl, 
        loading, 
        isMock: typeof window !== "undefined" && 
            (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") 
    };
}
