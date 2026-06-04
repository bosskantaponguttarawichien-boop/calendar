"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGroupShiftCarouselMessage = exports.buildGroupShiftBubble = exports.buildShiftCarouselMessage = exports.buildShiftBubble = exports.getIconEmoji = void 0;
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
const buildGroupShiftBubble = (headerTitle, dateText, memberShifts, headerColor) => {
    const contents = [];
    memberShifts.forEach((ms, index) => {
        var _a, _b, _c, _d;
        if (index > 0) {
            contents.push({
                type: "separator",
                margin: "md",
                color: "#f1f5f9"
            });
        }
        contents.push({
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "xs",
            contents: [
                {
                    type: "box",
                    layout: "baseline",
                    spacing: "sm",
                    contents: [
                        {
                            type: "text",
                            text: ms.memberName,
                            weight: "bold",
                            size: "sm",
                            color: "#334155",
                            flex: 2
                        },
                        {
                            type: "text",
                            text: ms.isOffDay ? "ไม่มีเวร 🎉" : `${(0, exports.getIconEmoji)((_a = ms.shift) === null || _a === void 0 ? void 0 : _a.icon)} ${((_b = ms.shift) === null || _b === void 0 ? void 0 : _b.title) || "ไม่ระบุ"}`,
                            weight: "bold",
                            size: "sm",
                            color: ms.isOffDay ? "#10b981" : (((_c = ms.shift) === null || _c === void 0 ? void 0 : _c.color) || "#3b82f6"),
                            flex: 3,
                            align: "end"
                        }
                    ]
                },
                ...(!ms.isOffDay && ((_d = ms.shift) === null || _d === void 0 ? void 0 : _d.startTime) ? [
                    {
                        type: "box",
                        layout: "baseline",
                        contents: [
                            {
                                type: "text",
                                text: `เวลา: ${ms.shift.startTime} - ${ms.shift.endTime || "00:00"}`,
                                size: "xs",
                                color: "#64748b",
                                align: "end"
                            }
                        ]
                    }
                ] : [])
            ]
        });
    });
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
            contents: contents.length > 0 ? contents : [
                {
                    type: "text",
                    text: "ไม่มีสมาชิกในกลุ่ม 👥",
                    color: "#94a3b8",
                    size: "sm",
                    align: "center"
                }
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
exports.buildGroupShiftBubble = buildGroupShiftBubble;
const buildGroupShiftCarouselMessage = (todayGroupShifts, tomorrowGroupShifts, todayDateText, tomorrowDateText) => {
    const bubbles = [];
    bubbles.push((0, exports.buildGroupShiftBubble)("เวรรวมของกลุ่ม (วันนี้)", todayDateText, todayGroupShifts, "#3b82f6"));
    bubbles.push((0, exports.buildGroupShiftBubble)("เวรรวมของกลุ่ม (พรุ่งนี้)", tomorrowDateText, tomorrowGroupShifts, "#8b5cf6"));
    const todaySummary = todayGroupShifts.map(s => { var _a; return `${s.memberName}: ${s.isOffDay ? "หยุด" : (((_a = s.shift) === null || _a === void 0 ? void 0 : _a.title) || "ไม่ระบุ")}`; }).join(", ");
    const tomorrowSummary = tomorrowGroupShifts.map(s => { var _a; return `${s.memberName}: ${s.isOffDay ? "หยุด" : (((_a = s.shift) === null || _a === void 0 ? void 0 : _a.title) || "ไม่ระบุ")}`; }).join(", ");
    return {
        type: "flex",
        altText: `เวรกลุ่มวันนี้: ${todaySummary} | พรุ่งนี้: ${tomorrowSummary}`,
        contents: {
            type: "carousel",
            contents: bubbles
        }
    };
};
exports.buildGroupShiftCarouselMessage = buildGroupShiftCarouselMessage;
//# sourceMappingURL=flexMessageBuilder.js.map