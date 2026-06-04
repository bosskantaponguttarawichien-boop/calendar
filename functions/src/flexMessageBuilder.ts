export const getIconEmoji = (iconName?: string) => {
    switch (iconName) {
      case "morning": return "☀️";
      case "afternoon": return "🌤️";
      case "night": return "🌙";
      case "allday": return "🌞";
      case "nightafternoon": return "🌜";
      default: return "📅";
    }
  };
  
  const LIFF_URL = "https://liff.line.me/2009451557-lZpkB3ag";
  
  export const buildShiftBubble = (
    headerTitle: string,
    dateText: string,
    shift: any | null,
    headerColor: string,
    isOffDay: boolean = false
  ) => {
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
            text: isOffDay ? "ไม่มีเวร 🎉" : `${getIconEmoji(shift?.icon)} ${shift?.title || "ไม่ระบุ"}`,
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
                          text: `${shift?.startTime || "00:00"} - ${shift?.endTime || "00:00"}`,
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
  
  export const buildShiftCarouselMessage = (
    todayShift: any | null,
    tomorrowShift: any | null,
    todayDateText: string,
    tomorrowDateText: string
  ) => {
    const bubbles = [];
  
    // Today bubble (always primary if present, else fallback green)
    bubbles.push(
      buildShiftBubble(
        "เวรวันนี้",
        todayDateText,
        todayShift,
        todayShift?.color || (todayShift ? "#3b82f6" : "#10b981"),
        !todayShift
      )
    );
  
    // Tomorrow bubble (secondary, purple or green)
    bubbles.push(
      buildShiftBubble(
        "เวรพรุ่งนี้",
        tomorrowDateText,
        tomorrowShift,
        tomorrowShift?.color || (tomorrowShift ? "#8b5cf6" : "#10b981"),
        !tomorrowShift
      )
    );
  
    return {
      type: "flex",
      altText: `เวรวันนี้: ${todayShift ? todayShift.title : "หยุด"} | พรุ่งนี้: ${tomorrowShift ? tomorrowShift.title : "หยุด"}`,
      contents: {
        type: "carousel",
        contents: bubbles
      }
    };
  };

export const buildGroupShiftBubble = (
  headerTitle: string,
  dateText: string,
  memberShifts: { memberName: string; shift: any | null; isOffDay: boolean }[],
  headerColor: string
) => {
  const contents: any[] = [];

  memberShifts.forEach((ms, index) => {
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
              text: ms.isOffDay ? "ไม่มีเวร 🎉" : `${getIconEmoji(ms.shift?.icon)} ${ms.shift?.title || "ไม่ระบุ"}`,
              weight: "bold",
              size: "sm",
              color: ms.isOffDay ? "#10b981" : (ms.shift?.color || "#3b82f6"),
              flex: 3,
              align: "end"
            }
          ]
        },
        ...(!ms.isOffDay && ms.shift?.startTime ? [
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

export const buildGroupShiftCarouselMessage = (
  todayGroupShifts: { memberName: string; shift: any | null; isOffDay: boolean }[],
  tomorrowGroupShifts: { memberName: string; shift: any | null; isOffDay: boolean }[],
  todayDateText: string,
  tomorrowDateText: string
) => {
  const bubbles = [];

  bubbles.push(
    buildGroupShiftBubble(
      "เวรรวมของกลุ่ม (วันนี้)",
      todayDateText,
      todayGroupShifts,
      "#3b82f6"
    )
  );

  bubbles.push(
    buildGroupShiftBubble(
      "เวรรวมของกลุ่ม (พรุ่งนี้)",
      tomorrowDateText,
      tomorrowGroupShifts,
      "#8b5cf6"
    )
  );

  const todaySummary = todayGroupShifts.map(s => `${s.memberName}: ${s.isOffDay ? "หยุด" : (s.shift?.title || "ไม่ระบุ")}`).join(", ");
  const tomorrowSummary = tomorrowGroupShifts.map(s => `${s.memberName}: ${s.isOffDay ? "หยุด" : (s.shift?.title || "ไม่ระบุ")}`).join(", ");

  return {
    type: "flex",
    altText: `เวรกลุ่มวันนี้: ${todaySummary} | พรุ่งนี้: ${tomorrowSummary}`,
    contents: {
      type: "carousel",
      contents: bubbles
    }
  };
};
