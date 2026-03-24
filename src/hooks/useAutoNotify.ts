import { useState, useEffect, useRef, useCallback } from "react";
import liff from "@/lib/liff";
import { useUserSettingsService, UserSettings } from "./useUserSettingsService";
import { useEventService } from "./useEventService";
import { useShiftController } from "./useShiftController";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { EventData, Shift } from "@/types/event.types";

export function useAutoNotify(userId: string | null) {
  const { subscribeToUserSettings, updateUserSettings } = useUserSettingsService();
  const { subscribeToEvents } = useEventService();
  const { shifts, loading: shiftsLoading } = useShiftController(userId || undefined);
  
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
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

  // Subscribe to settings and events
  useEffect(() => {
    if (!userId) return;

    const unsubSettings = subscribeToUserSettings(userId, setSettings);
    
    const now = getGregorianDate();
    const unsubEvents = subscribeToEvents(userId, (e) => {
        setEvents(e);
    }, startOfMonth(now), endOfMonth(now));

    return () => {
      unsubSettings();
      unsubEvents();
    };
  }, [userId, subscribeToUserSettings, subscribeToEvents, getGregorianDate]);

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
        
        if (!settings || !settings.autoNotify) return;

        alert(`[MOCK] ตรวจพบเวรวันนี้ (จำลอง):\nเวรเช้า (Mock)\nเวลา: 08:00 - 16:00`);
        
        await updateUserSettings(userId, { lastNotifyDate: todayStr });
        hasCheckedRef.current = true;
        return;
    }

    // 2. Real Logic (Wait for data)
    if (!settings || shiftsLoading || shifts.length === 0 || events.length === 0) {
        return;
    }

    const now = getGregorianDate();
    const todayStr = format(now, "yyyy-MM-dd");

    if (!settings.autoNotify) return;

    /* 
    if (settings.lastNotifyDate === todayStr) {
      hasCheckedRef.current = true;
      return;
    }
    */

    const todayEvent = events.find(e => {
      const d = e.start instanceof Date ? e.start : (e.start as any).toDate();
      const eventDateStr = format(getGregorianDate(d), "yyyy-MM-dd");
      return eventDateStr === todayStr;
    });

    if (!todayEvent) {
      hasCheckedRef.current = true;
      console.log("[AutoNotify] Match missed for today:", todayStr);
      return;
    }

    const shift = shifts.find(s => s.id === todayEvent.shiftId);
    if (!shift) {
      hasCheckedRef.current = true;
      console.log("[AutoNotify] Found event but no matching shift object for ID:", todayEvent.shiftId);
      return;
    }

    const context = liff.getContext();
    if (!context || context.type === 'none') {
      hasCheckedRef.current = true;
      console.log("[AutoNotify] No context, context.type:", context?.type);
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
  }, [userId, settings, events, shifts, shiftsLoading, getGregorianDate, updateUserSettings]);

  useEffect(() => {
    checkAndNotify();
  }, [checkAndNotify]);
}
