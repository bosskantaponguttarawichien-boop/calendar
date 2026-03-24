import { useState, useEffect, useRef, useCallback } from "react";
import liff from "@/lib/liff";
import { useUserSettingsService, UserSettings } from "./useUserSettingsService";
import { useEventService } from "./useEventService";
import { useShiftService } from "./useShiftService";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { EventData, Shift } from "@/types/event.types";

export function useAutoNotify(userId: string | null) {
  const { subscribeToUserSettings, updateUserSettings } = useUserSettingsService();
  const { subscribeToEvents } = useEventService();
  const { subscribeToShifts } = useShiftService();
  
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const hasCheckedRef = useRef(false);

  // Helper: Force Gregorian year
  const getGregorianDate = useCallback((d: Date = new Date()) => {
    const year = d.getFullYear();
    if (year > 2400) {
      const newDate = new Date(d);
      newDate.setFullYear(year - 543);
      return newDate;
    }
    return d;
  }, []);

  // Subscribe to all data
  useEffect(() => {
    if (!userId) return;

    const unsubSettings = subscribeToUserSettings(userId, setSettings);
    
    const now = getGregorianDate();
    const unsubEvents = subscribeToEvents(userId, setEvents, startOfMonth(now), endOfMonth(now));
    const unsubShifts = subscribeToShifts(userId, setShifts);

    return () => {
      unsubSettings();
      unsubEvents();
      unsubShifts();
    };
  }, [userId, subscribeToUserSettings, subscribeToEvents, subscribeToShifts, getGregorianDate]);

  // Main Logic
  const checkAndNotify = useCallback(async () => {
    const isLocal = typeof window !== "undefined" && 
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    if (!userId || hasCheckedRef.current) return;

    // 1. Mock Mode (Immediate)
    if (isLocal) {
        console.log("[AutoNotify] Mock Mode Executing...");
        const now = getGregorianDate();
        const todayStr = format(now, "yyyy-MM-dd");
        
        // Only run if settings are loaded to check if it's even enabled
        if (!settings || !settings.autoNotify) return;

        alert(`[MOCK] ตรวจพบเวรวันนี้ (จำลอง):\nเวรเช้า (Mock)\nเวลา: 08:00 - 16:00`);
        
        await updateUserSettings(userId, { lastNotifyDate: todayStr });
        hasCheckedRef.current = true;
        return;
    }

    // 2. Real Logic (Wait for data)
    if (!settings || shifts.length === 0 || events.length === 0) {
        // Data not ready yet, will be called again on next state update
        return;
    }

    if (!settings.autoNotify) return;

    const now = getGregorianDate();
    const todayStr = format(now, "yyyy-MM-dd");

    /* 
    if (settings.lastNotifyDate === todayStr) {
      hasCheckedRef.current = true;
      return;
    }
    */

    const todayEvent = events.find(e => {
      const d = e.start instanceof Date ? e.start : (e.start as any).toDate();
      return format(getGregorianDate(d), "yyyy-MM-dd") === todayStr;
    });

    if (!todayEvent) {
      // Data is ready but no match found
      hasCheckedRef.current = true;
      console.log("[AutoNotify] Data ready, but no event found for today:", todayStr);
      return;
    }

    const shift = shifts.find(s => s.id === todayEvent.shiftId);
    if (!shift) {
      hasCheckedRef.current = true;
      console.log("[AutoNotify] Event found, but shift config is missing.");
      return;
    }

    const context = liff.getContext();
    if (!context || context.type === 'none') {
      hasCheckedRef.current = true;
      console.log("[AutoNotify] Not in a chat context. Context type:", context?.type);
      return;
    }

    // Manual Confirmation
    const msg = `วันนี้คุณมีเวร "${shift.title}" (${shift.startTime || '00:00'} - ${shift.endTime || '00:00'})\nต้องการส่งแจ้งเตือนลงแชทตอนนี้เลยไหมครับ?`;
    if (!window.confirm(msg)) {
      hasCheckedRef.current = true;
      return;
    }

    try {
      await liff.sendMessages([{
        type: "text",
        text: `📅 แจ้งเตือนเวรวันนี้: ${shift.title}\n⏰ เวลา: ${shift.startTime || "00:00"} - ${shift.endTime || "00:00"}`
      }]);

      await updateUserSettings(userId, { lastNotifyDate: todayStr });
      hasCheckedRef.current = true;
      alert("✅ ส่งข้อความเรียบร้อย!");
    } catch (error) {
      console.error("[AutoNotify] Error", error);
      alert("❌ ส่งไม่สำเร็จ");
    }
  }, [userId, settings, events, shifts, getGregorianDate, updateUserSettings]);

  useEffect(() => {
    checkAndNotify();
  }, [checkAndNotify]);
}
