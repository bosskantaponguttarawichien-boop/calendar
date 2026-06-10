import { NextRequest, NextResponse } from "next/server";
import type { Firestore } from "firebase-admin/firestore";

// ─── Firebase Admin (lazy singleton) ─────────────────────────────────────────

let _db: Firestore | null = null;

async function getDb(): Promise<Firestore> {
    if (_db) return _db;

    const { initializeApp, getApps, getApp, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");

    if (!getApps().length) {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (serviceAccountJson) {
            initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
        } else {
            // Auto-detects Application Default Credentials (Firebase Hosting / Cloud Run)
            initializeApp({ projectId: "kantapongfirebase" });
        }
    }

    _db = getFirestore(getApp());
    return _db;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Subtract `minutes` from a "HH:mm" string, wrapping around midnight. */
function subtractMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(":").map(Number);
    const adjusted = ((h * 60 + m - minutes) % 1440 + 1440) % 1440;
    const hh = String(Math.floor(adjusted / 60)).padStart(2, "0");
    const mm = String(adjusted % 60).padStart(2, "0");
    return `${hh}:${mm}`;
}

/** Return tomorrow's date string (YYYY-MM-DD) in Bangkok time (UTC+7). */
function getTomorrowBangkok(): string {
    const nowBkk = new Date(Date.now() + 7 * 3_600_000);
    const tomorrow = new Date(nowBkk);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const y = tomorrow.getUTCFullYear();
    const mo = String(tomorrow.getUTCMonth() + 1).padStart(2, "0");
    const d = String(tomorrow.getUTCDate()).padStart(2, "0");
    return `${y}-${mo}-${d}`;
}

type AlarmEntry = { time: string; alarmTime: string; label: string };

/** Add an alarm entry if that alarmTime hasn't been seen yet. */
function pushAlarm(
    list: AlarmEntry[],
    seen: Set<string>,
    { time, label, offsetMinutes }: { time: string; label: string; offsetMinutes: number }
) {
    const alarmTime = subtractMinutes(time, offsetMinutes);
    if (seen.has(alarmTime)) return;
    seen.add(alarmTime);
    list.push({ time, alarmTime, label });
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
        const { Timestamp } = await import("firebase-admin/firestore");
        const db = await getDb();

        // 1. Alarm offset from user settings
        const settingsDoc = await db.collection("user-settings").doc(userId).get();
        const offsetMinutes: number =
            (settingsDoc.data()?.alarmOffsetMinutes as number | undefined) ?? 60;

        // 2. Date range for "tomorrow" in Bangkok time
        const dateStr    = getTomorrowBangkok();
        const startOfDay = new Date(`${dateStr}T00:00:00+07:00`);
        const endOfDay   = new Date(`${dateStr}T23:59:59+07:00`);

        // 3. Events scheduled for tomorrow
        const eventsSnap = await db
            .collection("events")
            .where("userId", "==", userId)
            .where("start", ">=", Timestamp.fromDate(startOfDay))
            .where("start", "<=", Timestamp.fromDate(endOfDay))
            .get();

        if (eventsSnap.empty) {
            return NextResponse.json({ date: dateStr, offsetMinutes, alarms: [] });
        }

        // 4. Shift definitions — user shifts override main shifts by id
        const [userShiftsSnap, mainShiftsSnap] = await Promise.all([
            db.collection("shifts").where("userId", "==", userId).get(),
            db.collection("main-shifts").get(),
        ]);

        const shiftDefs = new Map<string, FirebaseFirestore.DocumentData>();
        mainShiftsSnap.docs.forEach((d) => shiftDefs.set(d.id, d.data()));
        userShiftsSnap.docs.forEach((d) => shiftDefs.set(d.id, d.data()));

        // 5. Build deduplicated alarm list
        const seen: Set<string>  = new Set();
        const alarms: AlarmEntry[] = [];

        for (const eventDoc of eventsSnap.docs) {
            const ev = eventDoc.data();
            if (ev.isDeleted) continue;

            const shift = shiftDefs.get(ev.shiftId);
            const label = ev.title ?? shift?.title ?? ev.shiftId;

            // Event-level startTime takes priority over shift default
            const time1: string | null = ev.startTime  ?? shift?.startTime  ?? null;
            const time2: string | null = ev.startTime2 ?? shift?.startTime2 ?? null;

            if (time1) pushAlarm(alarms, seen, { time: time1, label, offsetMinutes });
            if (time2) pushAlarm(alarms, seen, { time: time2, label: `${label} (ช่วงที่ 2)`, offsetMinutes });
        }

        alarms.sort((a, b) => a.alarmTime.localeCompare(b.alarmTime));

        return NextResponse.json({ date: dateStr, offsetMinutes, alarms });
    } catch (err) {
        console.error("[/api/alarm]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
