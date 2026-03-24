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
      // 🚨 HARDCODE TEST MODE 🚨
      const isConfirm = window.confirm("ต้องการทดสอบส่งข้อความ 'Hello' ลงแชทตอนนี้เลยไหม?");
      if (!isConfirm) return;

      const context = liff.getContext();
      try {
        await liff.sendMessages([
          {
            type: "text",
            text: "สวัสดีครับ! นี่คือข้อความทดสอบจากระบบอัตโนมัติ 📅"
          }
        ]);
        alert(`✅ ส่งสำเร็จ! (Context: ${context?.type || 'unknown'})`);
      } catch (error) {
        console.error("Test send failed", error);
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
