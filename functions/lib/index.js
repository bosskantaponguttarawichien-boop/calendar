"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDailyShiftNotifications = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
const bot_sdk_1 = require("@line/bot-sdk");
const date_fns_1 = require("date-fns");
const flexMessageBuilder_1 = require("./flexMessageBuilder");
admin.initializeApp();
const db = admin.firestore();
// Set the token via: firebase functions:secrets:set LINE_CHANNEL_ACCESS_TOKEN
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "PLACEHOLDER_TOKEN";
const lineClient = new bot_sdk_1.messagingApi.MessagingApiClient({
    channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
});
exports.sendDailyShiftNotifications = (0, scheduler_1.onSchedule)({
    schedule: "0 6 * * *",
    timeZone: "Asia/Bangkok",
}, async (_event) => {
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
        const mainShifts = mainShiftsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
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
        const todayStr = (0, date_fns_1.format)(localNow, "yyyy-MM-dd");
        const tomorrowStr = (0, date_fns_1.format)(localTomorrow, "yyyy-MM-dd");
        const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
        const todayDateText = thaiDateFormatter.format(localNow);
        const tomorrowDateText = thaiDateFormatter.format(localTomorrow);
        for (const userDoc of settingsSnapshot.docs) {
            const userId = userDoc.id;
            // Fetch events for this user
            const eventsSnapshot = await db.collection("events").where("userId", "==", userId).get();
            const events = eventsSnapshot.docs.map(doc => {
                var _a;
                const data = doc.data();
                return {
                    id: doc.id,
                    shiftId: data.shiftId || data.category || doc.id,
                    start: ((_a = data.start) === null || _a === void 0 ? void 0 : _a.toDate) ? data.start.toDate() : new Date(data.start)
                };
            });
            // Match events for today and tomorrow
            const todayEvent = events.find(e => (0, date_fns_1.format)(new Date(e.start.getTime() + timeOffset), "yyyy-MM-dd") === todayStr);
            const tomorrowEvent = events.find(e => (0, date_fns_1.format)(new Date(e.start.getTime() + timeOffset), "yyyy-MM-dd") === tomorrowStr);
            if (!todayEvent && !tomorrowEvent) {
                continue; // Nothing to notify
            }
            // Fetch user specific shifts
            const userShiftsSnapshot = await db.collection("shifts").where("userId", "==", userId).get();
            const userShifts = userShiftsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            // Merge shifts logic
            const systemShifts = mainShifts.map(ms => (Object.assign(Object.assign({}, ms), { userId: "system" })));
            const overrides = new Map();
            const uniqueShifts = [];
            userShifts.forEach((shift) => {
                if (shift.overrideId) {
                    overrides.set(shift.overrideId, shift);
                }
                else {
                    uniqueShifts.push(shift);
                }
            });
            const mergedSystemShifts = systemShifts.map((ss) => {
                if (overrides.has(ss.id)) {
                    return Object.assign(Object.assign(Object.assign({}, ss), overrides.get(ss.id)), { id: overrides.get(ss.id).id, overrideId: overrides.get(ss.id).overrideId });
                }
                return ss;
            });
            const allMergedShifts = [...mergedSystemShifts, ...uniqueShifts];
            // Find today and tomorrow shift details
            const todayShift = todayEvent ? allMergedShifts.find(s => s.id === todayEvent.shiftId) : null;
            const tomorrowShift = tomorrowEvent ? allMergedShifts.find(s => s.id === tomorrowEvent.shiftId) : null;
            // Build the physical flex message using the builder
            const flexMessage = (0, flexMessageBuilder_1.buildShiftCarouselMessage)(todayShift, tomorrowShift, todayDateText, tomorrowDateText);
            try {
                await lineClient.pushMessage({
                    to: userId,
                    messages: [flexMessage]
                });
                logger.info(`Successfully pushed notification to user: ${userId}`);
            }
            catch (pushErr) {
                logger.error(`Failed to push to user ${userId}:`, pushErr);
            }
        }
    }
    catch (err) {
        logger.error("Error running Daily Shift Notification:", err);
    }
});
//# sourceMappingURL=index.js.map