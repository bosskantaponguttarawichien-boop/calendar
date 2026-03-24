"use client";

import { useState, useEffect } from "react";
import liff from "@/lib/liff";

const LIFF_ID = "2009451557-lZpkB3ag"; // Keep local if not exported, or import

export function useLiff() {
    const [userId, setUserId] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [pictureUrl, setPictureUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const isLocal = typeof window !== "undefined" && 
                (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

            if (isLocal) {
                console.warn("[LIFF] Mock Mode: Localhost detected. Using mock user.");
                setUserId("mock-user-123");
                setDisplayName("Mock User (Local)");
                setPictureUrl("https://www.w3schools.com/howto/img_avatar.png");
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
    }, []);

    return { 
        userId, 
        displayName, 
        pictureUrl, 
        loading, 
        isMock: typeof window !== "undefined" && 
            (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") 
    };
}
