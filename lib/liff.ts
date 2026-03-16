import liff from "@line/liff";

export const initLiff = async () => {
    // Add your LIFF ID here
    const liffId = "";
    if (!liffId) {
        console.warn("LIFF ID is not defined. Running in local development mode.");
        return;
    }

    try {
        await liff.init({ liffId });
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

export const getContext = () => {
    return liff.getContext();
};

export const shareEvent = async (eventData: {
    title: string;
    start: Date;
    end: Date;
    location?: string;
}) => {
    if (!liff.isApiAvailable("shareTargetPicker")) {
        console.error("shareTargetPicker is not available");
        return;
    }

    const startTimeStr = eventData.start.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const endTimeStr = eventData.end.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const dateStr = eventData.start.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });

    try {
        const result = await liff.shareTargetPicker([
            {
                type: "text",
                text: `📅 ${eventData.title}\n⏰ ${startTimeStr} - ${endTimeStr}\n🗓️ ${dateStr}${eventData.location ? `\n📍 ${eventData.location}` : ""}\n\nเปิดดูในแอปปฏิทินของฉัน`,
            },
        ]);
        return result;
    } catch (error) {
        console.error("Share failed", error);
        throw error;
    }
};

export default liff;
