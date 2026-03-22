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
import { CATEGORIES } from "@/lib/constants";

export function useEventService() {
    const upsertByDate = useCallback(async (collectionName: "events" | "shifts", userId: string, dateStr: string, data: any) => {
        try {
            const q = query(collection(db, collectionName), where("userId", "==", userId));
            const snapshot = await getDocs(q);
            
            const existingDoc = snapshot.docs.find(doc => {
                const docData = doc.data();
                const start = docData.start instanceof Timestamp ? docData.start.toDate() : docData.start;
                return format(start, "yyyy-MM-dd") === dateStr;
            });

            if (existingDoc) {
                await updateDoc(doc(db, collectionName, existingDoc.id), {
                    ...data,
                    updatedAt: new Date()
                });
                return { id: existingDoc.id, type: 'update' };
            } else {
                const docRef = await addDoc(collection(db, collectionName), {
                    ...data,
                    userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                return { id: docRef.id, type: 'create' };
            }
        } catch (error) {
            console.error(`Error in upsertByDate (${collectionName}):`, error);
            throw error;
        }
    }, []);

    const addOrUpdateEventByDate = useCallback((userId: string, dateStr: string, data: any) => 
        upsertByDate("events", userId, dateStr, data), [upsertByDate]);

    const addOrUpdateShiftByDate = useCallback((userId: string, dateStr: string, data: any) => 
        upsertByDate("shifts", userId, dateStr, data), [upsertByDate]);

    const subscribeToEvents = useCallback((userId: string, onUpdate: (events: EventData[]) => void) => {
        const qEvents = query(collection(db, "events"), where("userId", "==", userId));
        const qShifts = query(collection(db, "shifts"), where("userId", "==", userId));
        
        let eventsData: EventData[] = [];
        let shiftsData: EventData[] = [];

        const combineAndNotify = () => {
            onUpdate([...eventsData, ...shiftsData]);
        };

        const mapDoc = (doc: any, collectionName: "events" | "shifts") => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                collectionName,
                shiftId: data.shiftId || data.category,
                start: data.start instanceof Timestamp ? data.start.toDate() : data.start,
                end: data.end instanceof Timestamp ? data.end.toDate() : data.end,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
            };
        };

        const unsubEvents = onSnapshot(qEvents, (snapshot) => {
            console.log(`[Service] Received ${snapshot.size} events for user: ${userId}`);
            eventsData = snapshot.docs.map(doc => mapDoc(doc, "events")) as EventData[];
            combineAndNotify();
        });

        const unsubShifts = onSnapshot(qShifts, (snapshot) => {
            console.log(`[Service] Received ${snapshot.size} shifts for user: ${userId}`);
            shiftsData = snapshot.docs.map(doc => mapDoc(doc, "shifts")) as EventData[];
            combineAndNotify();
        });

        return () => {
            unsubEvents();
            unsubShifts();
        };
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
                    batch.delete(doc(db, existingEvent.collectionName || "events", existingEvent.id));
                }
                continue;
            }

            const isCustomNumeric = typeof categoryId === "number";
            const targetCollection = isCustomNumeric ? "shifts" : "events";
            
            let eventPayload: any = {
                userId,
                updatedAt: new Date(),
                start: parseISO(date),
                end: parseISO(date),
            };

            if (isCustomNumeric) {
                const template = currentEvents.find(e => e.shiftId === categoryId);
                eventPayload = {
                    ...eventPayload,
                    title: template?.title || "เวรพิเศษ",
                    shiftId: categoryId,
                    category: categoryId,
                    icon: template?.icon || "morning",
                    color: template?.color || "#334155",
                };
            } else {
                const category = CATEGORIES.find(c => c.id === categoryId);
                eventPayload = {
                    ...eventPayload,
                    title: category?.label || "กิจกรรม",
                    shiftId: categoryId as string,
                    category: categoryId as string,
                    icon: category?.id || "morning",
                    color: category?.color || "#334155",
                };
            }

            if (existingEvent) {
                if (existingEvent.collectionName !== targetCollection) {
                    // Switch collection
                    batch.delete(doc(db, existingEvent.collectionName || "events", existingEvent.id));
                    const newDocRef = doc(collection(db, targetCollection));
                    batch.set(newDocRef, { ...eventPayload, createdAt: new Date() });
                } else {
                    batch.update(doc(db, targetCollection, existingEvent.id), eventPayload);
                }
            } else {
                const newDocRef = doc(collection(db, targetCollection));
                batch.set(newDocRef, { ...eventPayload, createdAt: new Date() });
            }
        }

        await batch.commit();
    }, []);

    return { 
        subscribeToEvents, 
        addOrUpdateEventByDate, 
        addOrUpdateShiftByDate,
        saveBatchEvents 
    };
}
