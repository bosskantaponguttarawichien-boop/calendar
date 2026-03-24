"use client";

import { useEffect, useRef } from "react";
import liff from "@/lib/liff";
import { useUserSettingsService, UserSettings } from "./useUserSettingsService";
import { useEventService } from "./useEventService";
import { useShiftService } from "./useShiftService";
import { format } from "date-fns";
import { EventData, Shift } from "@/types/event.types";

export function useAutoNotify(userId: string | null) {
  const { subscribeToUserSettings, updateUserSettings } = useUserSettingsService();
  const { subscribeToEvents } = useEventService();
  const { subscribeToShifts } = useShiftService();
  
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!userId || hasCheckedRef.current) return;

    let settings: UserSettings | null = null;
    let events: EventData[] = [];
    let shifts: Shift[] = [];

    const checkAndNotify = async () => {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const isLocal = typeof window !== "undefined" && 
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

      if (!settings || !settings.autoNotify || hasCheckedRef.current) return;
      
      if (settings.lastNotifyDate === todayStr) {
        hasCheckedRef.current = true;
        return;
      }

      // 1. Handle Mock Mode (Localhost)
      if (isLocal) {
          console.log("[AutoNotify] Mock Mode: Bypassing real data for localhost.");
          const mockShift = { title: "เวรเช้า (Mock)", startTime: "08:00", endTime: "16:00" };
          alert(`[MOCK] ตรวจพบเวรวันนี้ (จำลอง):\n${mockShift.title}\nเวลา: ${mockShift.startTime} - ${mockShift.endTime}`);
          
          await updateUserSettings(userId, { lastNotifyDate: todayStr });
          hasCheckedRef.current = true;
          return;
      }

      // 2. Handle Real Mode (LINE LIFF)
      if (shifts.length === 0) return;

      const todayEvent = events.find(e => {
        const d = e.start instanceof Date ? e.start : (e.start as any).toDate();
        return format(d, "yyyy-MM-dd") === todayStr;
      });

      if (!todayEvent) return;

      const shift = shifts.find(s => s.id === todayEvent.shiftId);
      if (!shift) return;

      const context = liff.getContext();
      if (!context || context.type === 'none') {
        hasCheckedRef.current = true;
        return;
      }

      try {
        await liff.sendMessages([
          {
            type: "flex",
            altText: `วันนี้มีเวร: ${shift.title}`,
            contents: {
              type: "bubble",
              size: "mega",
              header: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "แจ้งเตือนเวรวันนี้",
                    weight: "bold",
                    color: "#ffffff",
                    size: "sm"
                  }
                ],
                backgroundColor: shift.color || "#334155"
              },
              body: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: shift.title,
                    weight: "bold",
                    size: "xxl",
                    margin: "md"
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    margin: "lg",
                    spacing: "sm",
                    contents: [
                      {
                        type: "box",
                        layout: "baseline",
                        spacing: "sm",
                        contents: [
                          {
                            type: "text",
                            text: "เวลา",
                            color: "#aaaaaa",
                            size: "sm",
                            flex: 1
                          },
                          {
                            type: "text",
                            text: `${shift.startTime || "00:00"} - ${shift.endTime || "00:00"}`,
                            wrap: true,
                            color: "#666666",
                            size: "sm",
                            flex: 5
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              footer: {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "ส่งโดย Calendar App",
                    size: "xs",
                    color: "#aaaaaa",
                    align: "center"
                  }
                ]
              }
            }
          }
        ]);

        await updateUserSettings(userId, { lastNotifyDate: todayStr });
        hasCheckedRef.current = true;
        alert("✅ ส่งข้อความแจ้งเตือนเวรเรียบร้อยแล้ว!");
      } catch (error) {
        console.error("Failed to send auto-notification", error);
        alert("❌ ไม่สามารถส่งข้อความได้: " + (error instanceof Error ? error.message : "โปรดตรวจสอบ Scopes chat_message.write"));
      }
    };

    const unsubSettings = subscribeToUserSettings(userId, (s) => {
      settings = s;
      checkAndNotify();
    });

    const unsubEvents = subscribeToEvents(userId, (e) => {
      events = e;
      checkAndNotify();
    });

    const unsubShifts = subscribeToShifts(userId, (sh) => {
      shifts = sh;
      checkAndNotify();
    });

    return () => {
      unsubSettings();
      unsubEvents();
      unsubShifts();
    };
  }, [userId, subscribeToUserSettings, subscribeToEvents, subscribeToShifts, updateUserSettings]);
}
