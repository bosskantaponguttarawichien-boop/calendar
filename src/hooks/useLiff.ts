"use client";

import { useState, useEffect, useCallback } from "react";
import liff, { LIFF_ID } from "@/lib/liff";
import { useUserSettingsService } from "./useUserSettingsService";
import { useGroupService } from "./useGroupService";

export function useLiff() {
    const [userId, setUserId] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [pictureUrl, setPictureUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { ensureUserSettings } = useUserSettingsService();
    const { joinGroup } = useGroupService();

    const handleJoinGroup = useCallback(async (uid: string, name: string, pic: string | null) => {
        if (typeof window === "undefined") return;
        
        const params = new URLSearchParams(window.location.search);
        const groupId = params.get("groupId");
        
        if (groupId) {
            console.log("[LIFF] Detected groupId in URL, attempting to join:", groupId);
            try {
                await joinGroup(groupId, uid, name, pic);
                alert(`ยินดีด้วย! คุณได้เข้าร่วมกลุ่มเรียบร้อยแล้ว ✨`);
                
                // Clear the groupId from URL to prevent re-joining on refresh
                const newUrl = window.location.pathname + window.location.search.replace(/[?&]groupId=[^&]+/, "");
                window.history.replaceState({}, "", newUrl);
            } catch (err) {
                console.error("[LIFF] Failed to join group:", err);
            }
        }
    }, [joinGroup]);

    useEffect(() => {
        const init = async () => {
            const isLocal = typeof window !== "undefined" &&
                (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

            if (isLocal) {
                console.warn("[LIFF] Mock Mode: Localhost detected. Using mock user.");
                const mockUserId = "mock-user-123";
                const mockName = "Mock User (Local)";
                const mockPic = "https://www.w3schools.com/howto/img_avatar.png";
                
                setUserId(mockUserId);
                setDisplayName(mockName);
                setPictureUrl(mockPic);

                ensureUserSettings(mockUserId, { targetId: mockUserId, targetType: "utou" });
                await handleJoinGroup(mockUserId, mockName, mockPic);

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

                    const context = liff.getContext();
                    const targetId = context?.groupId || context?.roomId || profile.userId;
                    const targetType = context?.type || "utou";

                    if (profile.userId) {
                        ensureUserSettings(profile.userId, { targetId, targetType });
                        await handleJoinGroup(profile.userId, profile.displayName, profile.pictureUrl || null);
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
    }, [ensureUserSettings, handleJoinGroup]);

    return {
        userId,
        displayName,
        pictureUrl,
        loading,
        isMock: typeof window !== "undefined" &&
            (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"),
        getFriendshipFlag: async (): Promise<boolean> => {
            const isLocal = typeof window !== "undefined" &&
                (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

            if (isLocal) {
                // In local mock mode, we can simulate different states if needed.
                // For now, let's return true by default so developers aren't blocked, 
                // but SettingScreen will handle the check.
                return false;
            }

            try {
                const friendship = await liff.getFriendship();
                return friendship.friendFlag;
            } catch (err) {
                console.error("Failed to get friendship status", err);
                return false;
            }
        }
    };
}
