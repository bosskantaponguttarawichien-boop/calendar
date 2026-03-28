import liff from "@line/liff";

import { buildGroupInviteMessage } from "./flexMessageBuilder";

export const LIFF_ID = "2009451557-lZpkB3ag";

export const initLiff = async () => {
    try {
        await liff.init({ liffId: LIFF_ID });
        if (!liff.isLoggedIn()) {
            liff.login();
        }
    } catch (error) {
        console.error("LIFF initialization failed", error);
    }
};

export const getProfile = async () => {
    if (liff.isLoggedIn()) {
        return await liff.getProfile();
    }
    return null;
};

export const shareEvent = async (eventData: {
    userId: string;
    title: string;
    start: Date;
    end: Date;
    location?: string;
}) => {
    const context = liff.getContext();
    const type = context?.type;

    const startTimeStr = eventData.start.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const endTimeStr = eventData.end.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const dateStr = eventData.start.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });

    const messageContent = {
        type: "text" as const,
        text: `📅 ${eventData.title}\n⏰ ${startTimeStr} - ${endTimeStr}\n🗓️ ${dateStr}${eventData.location ? `\n📍 ${eventData.location}` : ""}\n\nเปิดดูในแอปปฏิทินของฉัน`,
    };

    // Method 1: liff.sendMessages (If opened from a chat)
    if (type && type !== "none" && liff.isApiAvailable("sendMessages")) {
        try {
            await liff.sendMessages([messageContent]);
            return { success: true, method: "sendMessages" };
        } catch (error) {
            console.error("sendMessages failed", error);
            throw error;
        }
    }

    // Method 3: Push Message (If type is none or sendMessages unavailable)
    try {
        const response = await fetch("/api/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: eventData.userId,
                messages: [messageContent],
            }),
        });

        if (!response.ok) {
            throw new Error("Push message failed");
        }

        return { success: true, method: "push" };
    } catch (error) {
        console.error("Method 3 failed", error);
        throw error;
    }
};

export const shareGroupInvitation = async (groupId: string, groupName: string) => {
    console.log("[LIFF] shareGroupInvitation called for group:", groupId);
    
    if (!liff.isLoggedIn()) {
        console.warn("[LIFF] Not logged in, attempting login...");
        liff.login();
        return { success: false, reason: "needs_login" };
    }

    const isPickerAvailable = liff.isApiAvailable("shareTargetPicker");
    console.log("[LIFF] shareTargetPicker available:", isPickerAvailable);

    if (isPickerAvailable) {
        try {
            // Add a timeout of 8 seconds to prevent hanging silently
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("ShareTargetPicker timeout")), 8000)
            );

            const flexMessage = buildGroupInviteMessage(groupName, groupId);
            
            const results = await Promise.race([
                liff.shareTargetPicker([flexMessage as any]),
                timeoutPromise
            ]) as { status: string } | null;
            
            if (results) {
                console.log("[LIFF] shareTargetPicker sent successfully");
                return { success: true };
            } else {
                console.log("[LIFF] shareTargetPicker cancelled by user");
                return { success: false, reason: "cancelled" };
            }
        } catch (error) {
            console.error("[LIFF] shareTargetPicker failed:", error);
            return { success: false, reason: "error", error };
        }
    } else {
        console.warn("[LIFF] shareTargetPicker is NOT available in this context");
        return { success: false, reason: "api_unavailable" };
    }
};

export default liff;
