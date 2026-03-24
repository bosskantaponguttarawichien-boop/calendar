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
      const isLocal = typeof window !== "undefined" && 
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

      // Wait for all data to be ready
      if (!userId || !settings || events.length === 0 || shifts.length === 0) {
        console.log("[AutoNotify] Data not ready:", { userId: !!userId, settings: !!settings, events: events.length, shifts: shifts.length });
        return;
      }

      if (!settings.autoNotify || hasCheckedRef.current) return;

      const todayStr = format(new Date(), "yyyy-MM-dd");
      
      if (settings.lastNotifyDate === todayStr) {
        console.log("[AutoNotify] Already notified today.");
        hasCheckedRef.current = true;
        return;
      }

      // 1. Handle Mock Mode (Localhost)
      if (isLocal) {
          console.log("[AutoNotify] Mock Mode Executing...");
          const mockShift = { title: "เวรเช้า (Mock)", startTime: "08:00", endTime: "16:00" };
          alert(`[MOCK] ตรวจพบเวรวันนี้ (จำลอง):\n${mockShift.title}\nเวลา: ${mockShift.startTime} - ${mockShift.endTime}`);
          
          await updateUserSettings(userId, { lastNotifyDate: todayStr });
          hasCheckedRef.current = true;
          return;
      }

      // 2. Real Logic (LINE)
      const todayEvent = events.find(e => {
        const d = e.start instanceof Date ? e.start : (e.start as any).toDate();
        return format(d, "yyyy-MM-dd") === todayStr;
      });

      if (!todayEvent) {
        console.log("[AutoNotify] No event found for today:", todayStr);
        // Only mark as checked if we actually had events to check against
        hasCheckedRef.current = true; 
        return;
      }

      const shift = shifts.find(s => s.id === todayEvent.shiftId);
      if (!shift) {
        console.log("[AutoNotify] Shift not found for id:", todayEvent.shiftId);
        hasCheckedRef.current = true;
        return;
      }

      const context = liff.getContext();
      if (!context || context.type === 'none') {
        console.log("[AutoNotify] Context is none. Skipping.");
        hasCheckedRef.current = true;
        return;
      }

      try {
        const messageText = `📅 แจ้งเตือนเวรวันนี้: ${shift.title}\n⏰ เวลา: ${shift.startTime || "00:00"} - ${shift.endTime || "00:00"}`;
        
        await liff.sendMessages([
          {
            type: "text",
            text: messageText
          }
        ]);

        await updateUserSettings(userId, { lastNotifyDate: todayStr });
        hasCheckedRef.current = true;
        console.log("[AutoNotify] Success!");
      } catch (error) {
        console.error("[AutoNotify] Failed to send", error);
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
