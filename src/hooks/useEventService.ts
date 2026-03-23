"use client";

import { useCallback } from "react";
import { db } from "@/lib/firebase";
import { 
    collection, 
    query, 
    where, 
    doc,
    onSnapshot,
    writeBatch,
    Timestamp 
} from "firebase/firestore";
import { format, parseISO } from "date-fns";
import { EventData } from "@/types/event.types";

export function useEventService() {

    const subscribeToEvents = useCallback((
        userId: string, 
        onUpdate: (events: EventData[]) => void,
        startDate?: Date,
        endDate?: Date
    ) => {
        let qEvents = query(collection(db, "events"), where("userId", "==", userId));
        
        if (startDate) {
            qEvents = query(qEvents, where("start", ">=", Timestamp.fromDate(startDate)));
        }
        if (endDate) {
            qEvents = query(qEvents, where("start", "<=", Timestamp.fromDate(endDate)));
        }
        
        const mapDoc = (doc: any) => {
            const data = doc.data();
            const id = doc.id;
            return {
                id,
                ...data,
                collectionName: "events",
                shiftId: data.shiftId || data.category || id,
                start: data.start instanceof Timestamp ? data.start.toDate() : data.start,
                end: data.end instanceof Timestamp ? data.end.toDate() : data.end,
                startTime: data.startTime || null,
                endTime: data.endTime || null,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
            };
        };

        const unsubEvents = onSnapshot(qEvents, (snapshot) => {
            console.log(`[Service] Received ${snapshot.size} events for user: ${userId}`);
            const eventsData = snapshot.docs.map(doc => mapDoc(doc)) as EventData[];
            onUpdate(eventsData);
        });

        return unsubEvents;
    }, []);

    const saveBatchEvents = useCallback(async (
        userId: string, 
        pendingEvents: Record<string, string | number>, 
        currentEvents: EventData[],
        shifts: any[]
    ) => {
        const batch = writeBatch(db);
        const datesToSave = Object.keys(pendingEvents);
        
        for (const date of datesToSave) {
            const categoryId = pendingEvents[date];
            const existingEvent = currentEvents.find((e) => {
                const eventDate = e.start instanceof Date ? e.start : (e.start as any).toDate();
                return format(eventDate, "yyyy-MM-dd") === date;
            });

            if (categoryId === "delete") {
                if (existingEvent) {
                    batch.delete(doc(db, "events", existingEvent.id));
                }
                continue;
            }

            const shift = shifts.find(s => s.id === categoryId);
            const startTime = shift?.startTime || null;
            const endTime = shift?.endTime || null;

            const eventPayload: any = {
                userId,
                updatedAt: new Date(),
                start: parseISO(date),
                end: parseISO(date),
                startTime,
                endTime,
                shiftId: categoryId as string,
                title: "กิจกรรม",
            };

            if (existingEvent) {
                batch.update(doc(db, "events", existingEvent.id), eventPayload);
            } else {
                const newDocRef = doc(collection(db, "events"));
                batch.set(newDocRef, { ...eventPayload, createdAt: new Date() });
            }
        }

        await batch.commit();
    }, []);

    return { 
        subscribeToEvents, 
        saveBatchEvents
    };
}
