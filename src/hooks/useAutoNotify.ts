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
      // Basic checks
      if (!settings || !settings.autoNotify || hasCheckedRef.current) return;
      
      const todayStr = format(new Date(), "yyyy-MM-dd");
      if (settings.lastNotifyDate === todayStr) {
        hasCheckedRef.current = true;
        return;
      }

      // Check if we have events and shifts yet
      if (events.length === 0 || shifts.length === 0) return;

      const todayEvent = events.find(e => {
        const d = e.start instanceof Date ? e.start : (e.start as any).toDate();
        return format(d, "yyyy-MM-dd") === todayStr;
      });

      if (!todayEvent) {
          // No event today, just mark as checked for this session
          hasCheckedRef.current = true;
          return;
      }

      const shift = shifts.find(s => s.id === todayEvent.shiftId);
      if (!shift) return;

      // Check if opened from a chat
      const context = liff.getContext();
      if (!context || context.type === 'none') {
        hasCheckedRef.current = true;
        return;
      }

      try {
        console.log("[AutoNotify] Sending message to LINE...");
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

        // Update lastNotifyDate so we don't notify again today
        await updateUserSettings(userId, { lastNotifyDate: todayStr });
        hasCheckedRef.current = true;
        console.log("[AutoNotify] Notification sent and state updated.");
      } catch (error) {
        console.error("Failed to send auto-notification", error);
        // Don't mark as checked so it might retry on next mount or state change
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
