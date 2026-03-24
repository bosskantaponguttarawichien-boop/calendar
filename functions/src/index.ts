import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { messagingApi } from "@line/bot-sdk";
import { format } from "date-fns";
import { buildShiftCarouselMessage } from "./flexMessageBuilder";

admin.initializeApp();
const db = admin.firestore();

// Set the token via: firebase functions:secrets:set LINE_CHANNEL_ACCESS_TOKEN
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "PLACEHOLDER_TOKEN";

const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
});

export const sendDailyShiftNotifications = onSchedule(
  {
    schedule: "0 6 * * *",
    timeZone: "Asia/Bangkok",
  },
  async (_event) => {
    logger.info("Starting Daily Shift Notification Cron Job.");

    try {
      // 1. Get users with autoNotify: true
      const settingsSnapshot = await db.collection("user-settings").where("autoNotify", "==", true).get();
      if (settingsSnapshot.empty) {
        logger.info("No users have autoNotify enabled.");
        return;
      }

      // 2. Load main-shifts globally
      const mainShiftsSnapshot = await db.collection("main-shifts").get();
      const mainShifts = mainShiftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 3. Process each user
      // Adjust to start of day in local time roughly
      // The frontend uses getGregorianDate and formats to "yyyy-MM-dd".
      // We'll calculate todayStr and tomorrowStr
      const today = new Date();
      // Ensure we are working with correct local time (Thailand GMT+7)
      // Since Cloud Functions use UTC natively, offset it:
      const timeOffset = 7 * 60 * 60000; 
      const localNow = new Date(today.getTime() + timeOffset);
      const localTomorrow = new Date(localNow.getTime() + 24 * 60 * 60000);

      const todayStr = format(localNow, "yyyy-MM-dd");
      const tomorrowStr = format(localTomorrow, "yyyy-MM-dd");

      const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
      const todayDateText = thaiDateFormatter.format(localNow);
      const tomorrowDateText = thaiDateFormatter.format(localTomorrow);

      for (const userDoc of settingsSnapshot.docs) {
        const userId = userDoc.id;

        // Fetch events for this user
        const eventsSnapshot = await db.collection("events").where("userId", "==", userId).get();
        const events = eventsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                shiftId: data.shiftId || data.category || doc.id,
                start: data.start?.toDate ? data.start.toDate() : new Date(data.start)
            };
        });

        // Match events for today and tomorrow
        const todayEvent = events.find(e => format(new Date(e.start.getTime() + timeOffset), "yyyy-MM-dd") === todayStr);
        const tomorrowEvent = events.find(e => format(new Date(e.start.getTime() + timeOffset), "yyyy-MM-dd") === tomorrowStr);

        if (!todayEvent && !tomorrowEvent) {
          continue; // Nothing to notify
        }

        // Fetch user specific shifts
        const userShiftsSnapshot = await db.collection("shifts").where("userId", "==", userId).get();
        const userShifts = userShiftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Merge shifts logic
        const systemShifts = mainShifts.map(ms => ({ ...ms, userId: "system" }));
        const overrides = new Map();
        const uniqueShifts: any[] = [];
        
        userShifts.forEach((shift: any) => {
            if (shift.overrideId) {
                overrides.set(shift.overrideId, shift);
            } else {
                uniqueShifts.push(shift);
            }
        });

        const mergedSystemShifts = systemShifts.map((ss: any) => {
            if (overrides.has(ss.id)) {
                return { ...ss, ...overrides.get(ss.id), id: overrides.get(ss.id).id, overrideId: overrides.get(ss.id).overrideId };
            }
            return ss;
        });

        const allMergedShifts = [...mergedSystemShifts, ...uniqueShifts];

        // Find today and tomorrow shift details
        const todayShift = todayEvent ? allMergedShifts.find(s => s.id === todayEvent.shiftId) : null;
        const tomorrowShift = tomorrowEvent ? allMergedShifts.find(s => s.id === tomorrowEvent.shiftId) : null;

        // Build the physical flex message using the builder
        const flexMessage = buildShiftCarouselMessage(todayShift, tomorrowShift, todayDateText, tomorrowDateText);

        try {
          await lineClient.pushMessage({
            to: userId,
            messages: [flexMessage as any]
          });
          logger.info(`Successfully pushed notification to user: ${userId}`);
        } catch (pushErr) {
          logger.error(`Failed to push to user ${userId}:`, pushErr);
        }
      }
    } catch (err) {
      logger.error("Error running Daily Shift Notification:", err);
    }
  }
);
