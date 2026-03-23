"use client";

import { useCallback } from "react";
import { db } from "@/lib/firebase";
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    updateDoc, 
    doc,
    onSnapshot,
    writeBatch,
    Timestamp 
} from "firebase/firestore";
import { format, parseISO } from "date-fns";
import { EventData } from "@/types/event.types";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/constants";

export function useEventService() {
    const upsertByDate = useCallback(async (userId: string, dateStr: string, data: any) => {
        try {
            const q = query(collection(db, "events"), where("userId", "==", userId));
            const snapshot = await getDocs(q);
            
            const existingDoc = snapshot.docs.find(doc => {
                const docData = doc.data();
                const start = docData.start instanceof Timestamp ? docData.start.toDate() : docData.start;
                return format(start, "yyyy-MM-dd") === dateStr;
            });

            if (existingDoc) {
                await updateDoc(doc(db, "events", existingDoc.id), {
                    ...data,
                    updatedAt: new Date()
                });
                return { id: existingDoc.id, type: 'update' };
            } else {
                const docRef = await addDoc(collection(db, "events"), {
                    ...data,
                    userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                return { id: docRef.id, type: 'create' };
            }
        } catch (error) {
            console.error(`Error in upsertByDate:`, error);
            throw error;
        }
    }, []);

    const addOrUpdateEventByDate = useCallback((userId: string, dateStr: string, data: any) => 
        upsertByDate(userId, dateStr, data), [upsertByDate]);

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
                shiftId: data.shiftId ?? data.category ?? id,
                category: data.category ?? data.shiftId ?? id,
                start: data.start instanceof Timestamp ? data.start.toDate() : data.start,
                end: data.end instanceof Timestamp ? data.end.toDate() : data.end,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
                icon: data.icon || "HelpCircle",
                color: data.color || (data.category ? CATEGORY_COLORS[data.category] : "#334155")
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
        currentEvents: EventData[]
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

            const category = CATEGORIES.find(c => c.id === categoryId);
            const eventPayload: any = {
                userId,
                updatedAt: new Date(),
                start: parseISO(date),
                end: parseISO(date),
                title: category?.label || "กิจกรรม",
                shiftId: categoryId as string,
                category: categoryId as string,
                icon: category?.id || "morning",
                color: category?.color || "#334155",
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
        addOrUpdateEventByDate, 
        saveBatchEvents
    };
}
