"use client";

import { useState, useEffect } from "react";
import liff from "@/lib/liff";

const LIFF_ID = "2009451557-lZpkB3ag"; // Keep local if not exported, or import

export function useLiff() {
    const [userId, setUserId] = useState<string | null>("default-user");
    const [displayName, setDisplayName] = useState<string | null>("default-user");
    const [pictureUrl, setPictureUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
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
                    // liff.login();
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

    return { userId, displayName, pictureUrl, loading };
}
