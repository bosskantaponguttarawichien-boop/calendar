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

      // Wait for essential data
      if (!userId || !settings || shifts.length === 0) {
        console.log("[AutoNotify] Waiting for data...", { userId: !!userId, settings: !!settings, shifts: shifts.length });
        return;
      }

      if (!settings.autoNotify || hasCheckedRef.current) return;

      const todayStr = format(new Date(), "yyyy-MM-dd");
      
      /* 
      if (settings.lastNotifyDate === todayStr) {
        hasCheckedRef.current = true;
        return;
      }
      */

      // 1. Handle Mock Mode (Localhost)
      if (isLocal) {
          console.log("[AutoNotify] Mock Mode...");
          const mockShift = { title: "เวรเช้า (Mock)", startTime: "08:00", endTime: "16:00" };
          alert(`[MOCK] ตรวจพบเวรวันนี้ (จำลอง):\n${mockShift.title}\nเวลา: ${mockShift.startTime} - ${mockShift.endTime}`);
          
          await updateUserSettings(userId, { lastNotifyDate: todayStr });
          hasCheckedRef.current = true;
          return;
      }

      // 2. Real Logic (LINE)
      // Find event for today
      console.log("[AutoNotify] Checking events for:", todayStr, "out of", events.length, "events.");
      const todayEvent = events.find(e => {
        const d = e.start instanceof Date ? e.start : (e.start as any).toDate();
        const eventDateStr = format(d, "yyyy-MM-dd");
        return eventDateStr === todayStr;
      });

      if (!todayEvent) {
        // If we have some events but none match today, we can stop for now.
        // But if events.length is 0, we should probably keep waiting.
        if (events.length > 0) {
           console.log("[AutoNotify] No match found today.");
           hasCheckedRef.current = true; 
        }
        return;
      }

      const shift = shifts.find(s => s.id === todayEvent.shiftId);
      if (!shift) {
        console.log("[AutoNotify] Shift not found.");
        hasCheckedRef.current = true;
        return;
      }

      const context = liff.getContext();
      if (!context || context.type === 'none') {
        console.log("[AutoNotify] No Context (type: none). Cannot send message.");
        hasCheckedRef.current = true;
        return;
      }

      // 🚨 UI CONFIRMATION 🚨
      const msg = `วันนี้คุณมีเวร "${shift.title}" (${shift.startTime || '00:00'} - ${shift.endTime || '00:00'})\nต้องการส่งแจ้งเตือนลงแชทตอนนี้เลยไหมครับ?`;
      const isConfirm = window.confirm(msg);
      
      if (!isConfirm) {
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
        alert("✅ ส่งข้อความเรียบร้อย!");
      } catch (error) {
        console.error("[AutoNotify] Send Error:", error);
        alert("❌ ส่งไม่สำเร็จ: " + (error instanceof Error ? error.message : "โปรดตรวจสอบ Scopes"));
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
