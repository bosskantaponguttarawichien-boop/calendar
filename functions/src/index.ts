import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { messagingApi } from "@line/bot-sdk";
import { format } from "date-fns";
import { buildShiftCarouselMessage, buildGroupShiftCarouselMessage } from "./flexMessageBuilder";

admin.initializeApp();
const db = admin.firestore();

// Set the token via: firebase functions:secrets:set LINE_CHANNEL_ACCESS_TOKEN
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "PLACEHOLDER_TOKEN";

const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
});

export const sendDailyShiftNotifications = onSchedule(
  {
    schedule: "50 12 * * *",
    timeZone: "Asia/Bangkok",
    secrets: ["LINE_CHANNEL_ACCESS_TOKEN"],
  },
  async (_event) => {
    const now = new Date();
    // Thailand time offset
    const timeOffset = 7 * 60 * 60000;
    const localNow = new Date(now.getTime() + timeOffset);
    const localTomorrow = new Date(localNow.getTime() + 24 * 60 * 60000);

    const todayStr = format(localNow, "yyyy-MM-dd");
    const tomorrowStr = format(localTomorrow, "yyyy-MM-dd");

    logger.debug(`[CloudFunction] Running for today: ${todayStr}, tomorrow: ${tomorrowStr}`);

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
      const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
      const todayDateText = thaiDateFormatter.format(localNow);
      const tomorrowDateText = thaiDateFormatter.format(localTomorrow);

      const getShiftsForUser = async (uId: string) => {
        // Fetch events for this user (only need current month)
        const eventsSnapshot = await db.collection("events").where("userId", "==", uId).get();
        const events = eventsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                shiftId: data.shiftId || data.category || doc.id,
                start: data.start?.toDate ? data.start.toDate() : new Date(data.start)
            };
        });

        // Match events for today and tomorrow
        const todayEvent = events.find(e => {
            const eventDateStr = format(new Date(e.start.getTime() + timeOffset), "yyyy-MM-dd");
            return eventDateStr === todayStr;
        });
        const tomorrowEvent = events.find(e => {
            const eventDateStr = format(new Date(e.start.getTime() + timeOffset), "yyyy-MM-dd");
            return eventDateStr === tomorrowStr;
        });

        // Fetch user specific shifts
        const userShiftsSnapshot = await db.collection("shifts").where("userId", "==", uId).get();
        const userShifts = userShiftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Merge shifts logic (System + Overrides + Unique)
        const systemShifts = mainShifts.map(ms => ({ ...ms, userId: "system" }));
        const overrides = new Map();
        const uniqueShifts: any[] = [];
        
        userShifts.forEach((shift: any) => {
            if (shift.overrideId) {
                overrides.set(shift.overrideId, shift);
            } else if (shift.mainShiftId) {
                overrides.set(shift.mainShiftId, shift);
            } else {
                uniqueShifts.push(shift);
            }
        });

        const mergedSystemShifts = systemShifts.map((ss: any) => {
            if (overrides.has(ss.id)) {
                return { ...ss, ...overrides.get(ss.id), id: ss.id }; // Keep system ID for lookup
            }
            return ss;
        });

        const allMergedShifts = [...mergedSystemShifts, ...uniqueShifts];

        // Find today and tomorrow shift details
        const todayShift = todayEvent ? allMergedShifts.find(s => s.id === todayEvent.shiftId) : null;
        const tomorrowShift = tomorrowEvent ? allMergedShifts.find(s => s.id === tomorrowEvent.shiftId) : null;

        return { todayShift, tomorrowShift, hasEvents: !!(todayEvent || tomorrowEvent) };
      };

      for (const userDoc of settingsSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const targetId = userData.targetId || userId;
        const notifyDataType = userData.notifyDataType || "user";

        let flexMessage: any;

        if (notifyDataType === "group") {
          // Find the group to notify (either target by notifyGroupId or fallback to first group containing user)
          let groupDoc: any = null;
          if (userData.notifyGroupId) {
            const groupRef = await db.collection("groups").doc(userData.notifyGroupId).get();
            if (groupRef.exists) {
              groupDoc = groupRef;
            }
          }

          if (!groupDoc) {
            const groupsSnapshot = await db.collection("groups").where("memberIds", "array-contains", userId).get();
            if (!groupsSnapshot.empty) {
              groupDoc = groupsSnapshot.docs[0];
            }
          }

          if (!groupDoc) {
            logger.warn(`User ${userId} requested group notification, but belongs to no groups. Falling back to individual.`);
            const { todayShift, tomorrowShift, hasEvents } = await getShiftsForUser(userId);
            if (!hasEvents) {
              logger.debug(`Skipping user ${userId}: No events for today or tomorrow.`);
              continue; 
            }
            flexMessage = buildShiftCarouselMessage(todayShift, tomorrowShift, todayDateText, tomorrowDateText);
          } else {
            const groupData = groupDoc.data();
            const members = groupData.members || []; // Array of { id, displayName, pictureUrl }
            
            const todayGroupShifts: any[] = [];
            const tomorrowGroupShifts: any[] = [];

            for (const member of members) {
              const memberId = member.id;
              const { todayShift, tomorrowShift } = await getShiftsForUser(memberId);
              
              todayGroupShifts.push({
                memberName: member.displayName,
                shift: todayShift,
                isOffDay: !todayShift
              });

              tomorrowGroupShifts.push({
                memberName: member.displayName,
                shift: tomorrowShift,
                isOffDay: !tomorrowShift
              });
            }

            flexMessage = buildGroupShiftCarouselMessage(
              todayGroupShifts,
              tomorrowGroupShifts,
              todayDateText,
              tomorrowDateText
            );
          }
        } else {
          // Individual User Notification
          const { todayShift, tomorrowShift, hasEvents } = await getShiftsForUser(userId);
          if (!hasEvents) {
            logger.debug(`Skipping user ${userId}: No events for today or tomorrow.`);
            continue; 
          }
          flexMessage = buildShiftCarouselMessage(todayShift, tomorrowShift, todayDateText, tomorrowDateText);
        }

        try {
          await lineClient.pushMessage({
            to: targetId,
            messages: [flexMessage as any]
          });
          logger.info(`Successfully pushed notification to ${targetId} (${userData.targetType || "utou"}) for user: ${userId}`);
        } catch (pushErr) {
          logger.error(`Failed to push to target ${targetId} for user ${userId}:`, pushErr);
        }
      }
    } catch (err) {
      logger.error("Error running Daily Shift Notification:", err);
    }
  }
);
