import { useState, useEffect, useRef, useCallback } from "react";
import liff from "@/lib/liff";
import { useUserSettingsService, UserSettings } from "./useUserSettingsService";
import { useEventService } from "./useEventService";
import { useShiftController } from "./useShiftController";
import { format, startOfMonth, endOfMonth, addDays } from "date-fns";
import { EventData } from "@/types/event.types";
import { buildShiftCarouselMessage } from "@/lib/flexMessageBuilder";

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
        const now = getGregorianDate();
        const todayStr = format(now, "yyyy-MM-dd");
        
        if (!settings || !settings.autoNotify) return;
        /* 
    if (settings.lastNotifyDate === todayStr) {
      hasCheckedRef.current = true;
      return;
    }
    */

        console.log("[AutoNotify] Mock mode: Match found! (Sending would happen here)");
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

    const tomorrow = addDays(now, 1);
    const tomorrowStr = format(tomorrow, "yyyy-MM-dd");
    const tomorrowEvent = events.find(e => {
      const d = e.start instanceof Date ? e.start : (e.start as any).toDate();
      const eventDateStr = format(getGregorianDate(d), "yyyy-MM-dd");
      return eventDateStr === tomorrowStr;
    });

    if (!todayEvent && !tomorrowEvent) {
      hasCheckedRef.current = true;
      console.log("[AutoNotify] Match missed for today and tomorrow:", todayStr);
      return;
    }

    const todayShift = todayEvent ? shifts.find(s => s.id === todayEvent.shiftId) : null;
    const tomorrowShift = tomorrowEvent ? shifts.find(s => s.id === tomorrowEvent.shiftId) : null;

    const context = liff.getContext();
    if (!context || context.type === 'none') {
      hasCheckedRef.current = true;
      console.log("[AutoNotify] No context, context.type:", context?.type);
      return;
    }

    try {
      const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
      const todayDateText = thaiDateFormatter.format(now);
      const tomorrowDateText = thaiDateFormatter.format(tomorrow);
      
      const flexMessage = buildShiftCarouselMessage(todayShift, tomorrowShift, todayDateText, tomorrowDateText);
      await liff.sendMessages([flexMessage as any]);

      await updateUserSettings(userId, { lastNotifyDate: todayStr });
      hasCheckedRef.current = true;
    } catch (error) {
      console.error("[AutoNotify] Error", error);
    }
  }, [userId, settings, events, shifts, shiftsLoading, getGregorianDate, updateUserSettings]);

  useEffect(() => {
    checkAndNotify();
  }, [checkAndNotify]);
}
