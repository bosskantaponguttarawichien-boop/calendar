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
      
      alert(`[Debug] User: ${userId}\nSettings: ${!!settings}\nAutoNotify: ${settings?.autoNotify}\nEvents: ${events.length}`);

      if (!settings || !settings.autoNotify || hasCheckedRef.current) return;
      
      alert(`[Debug] Passing checks. Today: ${todayStr}, Last: ${settings.lastNotifyDate}`);
      
      if (settings.lastNotifyDate === todayStr) {
        hasCheckedRef.current = true;
        return;
      }

      if (shifts.length === 0) return;

      const todayEvent = events.find(e => {
        const d = e.start instanceof Date ? e.start : (e.start as any).toDate();
        return format(d, "yyyy-MM-dd") === todayStr;
      });

      if (!todayEvent) return;

      const shift = shifts.find(s => s.id === todayEvent.shiftId);
      if (!shift) return;

      // Mocking for local development
      const isLocal = typeof window !== "undefined" && 
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

      const context = isLocal ? { type: 'group' } : liff.getContext();
      
      if (!context || context.type === 'none') {
        hasCheckedRef.current = true;
        return;
      }

      try {
        if (isLocal) {
          console.log("[AutoNotify] Mock Mode: Skipping real sendMessages.");
          alert(`[MOCK] ส่งข้อความแจ้งเตือนเวร:\n${shift.title}\nเวลา: ${shift.startTime || "00:00"} - ${shift.endTime || "00:00"}`);
        } else {
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
        }

        await updateUserSettings(userId, { lastNotifyDate: todayStr });
        hasCheckedRef.current = true;
      } catch (error) {
        console.error("Failed to send auto-notification", error);
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
