"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildShiftCarouselMessage = exports.buildShiftBubble = exports.getIconEmoji = void 0;
const getIconEmoji = (iconName) => {
    switch (iconName) {
        case "morning": return "☀️";
        case "afternoon": return "🌤️";
        case "night": return "🌙";
        case "allday": return "🌞";
        case "nightafternoon": return "🌜";
        default: return "📅";
    }
};
exports.getIconEmoji = getIconEmoji;
const LIFF_URL = "https://liff.line.me/2009451557-lZpkB3ag";
const buildShiftBubble = (headerTitle, dateText, shift, headerColor, isOffDay = false) => {
    return {
        type: "bubble",
        size: "mega",
        header: {
            type: "box",
            layout: "vertical",
            paddingAll: "16px",
            backgroundColor: headerColor,
            contents: [
                {
                    type: "text",
                    text: headerTitle,
                    weight: "bold",
                    color: "#ffffff",
                    size: "sm"
                },
                {
                    type: "text",
                    text: dateText,
                    color: "#ffffffcc",
                    size: "xs",
                    margin: "xs"
                }
            ]
        },
        body: {
            type: "box",
            layout: "vertical",
            paddingAll: "20px",
            contents: [
                {
                    type: "text",
                    text: isOffDay ? "ไม่มีเวร 🎉" : `${(0, exports.getIconEmoji)(shift === null || shift === void 0 ? void 0 : shift.icon)} ${(shift === null || shift === void 0 ? void 0 : shift.title) || "ไม่ระบุ"}`,
                    weight: "bold",
                    size: "xl",
                    color: isOffDay ? "#10b981" : "#1f2937",
                    wrap: true
                },
                ...(isOffDay
                    ? []
                    : [
                        {
                            type: "box",
                            layout: "vertical",
                            margin: "xl",
                            spacing: "sm",
                            backgroundColor: "#f8fafc",
                            paddingAll: "12px",
                            cornerRadius: "8px",
                            contents: [
                                {
                                    type: "box",
                                    layout: "baseline",
                                    spacing: "sm",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "เวลา",
                                            color: "#64748b",
                                            size: "sm",
                                            flex: 1
                                        },
                                        {
                                            type: "text",
                                            text: `${(shift === null || shift === void 0 ? void 0 : shift.startTime) || "00:00"} - ${(shift === null || shift === void 0 ? void 0 : shift.endTime) || "00:00"}`,
                                            wrap: true,
                                            color: "#334155",
                                            size: "sm",
                                            weight: "bold",
                                            flex: 3
                                        }
                                    ]
                                }
                            ]
                        }
                    ])
            ]
        },
        footer: {
            type: "box",
            layout: "vertical",
            paddingAll: "12px",
            action: {
                type: "uri",
                label: "Open Calendar",
                uri: LIFF_URL
            },
            contents: [
                {
                    type: "text",
                    text: "เปิดแอป Calendar",
                    size: "xs",
                    color: "#cbd5e1",
                    align: "center"
                }
            ]
        }
    };
};
exports.buildShiftBubble = buildShiftBubble;
const buildShiftCarouselMessage = (todayShift, tomorrowShift, todayDateText, tomorrowDateText) => {
    const bubbles = [];
    // Today bubble (always primary if present, else fallback green)
    bubbles.push((0, exports.buildShiftBubble)("เวรวันนี้", todayDateText, todayShift, (todayShift === null || todayShift === void 0 ? void 0 : todayShift.color) || (todayShift ? "#3b82f6" : "#10b981"), !todayShift));
    // Tomorrow bubble (secondary, purple or green)
    bubbles.push((0, exports.buildShiftBubble)("เวรพรุ่งนี้", tomorrowDateText, tomorrowShift, (tomorrowShift === null || tomorrowShift === void 0 ? void 0 : tomorrowShift.color) || (tomorrowShift ? "#8b5cf6" : "#10b981"), !tomorrowShift));
    return {
        type: "flex",
        altText: `เวรวันนี้: ${todayShift ? todayShift.title : "หยุด"} | พรุ่งนี้: ${tomorrowShift ? tomorrowShift.title : "หยุด"}`,
        contents: {
            type: "carousel",
            contents: bubbles
        }
    };
};
exports.buildShiftCarouselMessage = buildShiftCarouselMessage;
//# sourceMappingURL=flexMessageBuilder.js.map