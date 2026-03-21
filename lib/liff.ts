import liff from "@line/liff";

const LIFF_ID = "2009451557-lZpkB3ag";

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

export default liff;
