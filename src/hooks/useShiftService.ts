"use client";

import { useCallback } from "react";
import { db } from "@/lib/firebase";
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    updateDoc, 
    doc,
    onSnapshot,
    deleteDoc,
    Timestamp 
} from "firebase/firestore";
import { Shift } from "@/types/event.types";

export function useShiftService() {
    const subscribeToShifts = useCallback((
        userId: string, 
        onUpdate: (shifts: Shift[]) => void
    ) => {
        if (!userId) return () => {};

        const q = query(
            collection(db, "shifts"), 
            where("userId", "==", userId)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const shiftsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
                    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
                };
            }) as Shift[];
            onUpdate(shiftsData);
        });

        return unsub;
    }, []);

    const cleanData = (data: any) => {
        return Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== undefined)
        ) as any;
    };
    
    const addShift = useCallback(async (userId: string, shiftData: Omit<Shift, "id" | "userId">) => {
        try {
            const docRef = await addDoc(collection(db, "shifts"), cleanData({
                ...shiftData,
                userId,
                createdAt: new Date(),
                updatedAt: new Date()
            }));
            return docRef.id;
        } catch (error) {
            console.error("Error adding shift:", error);
            throw error;
        }
    }, []);
    
    const updateShift = useCallback(async (shiftId: string, shiftData: Partial<Omit<Shift, "id" | "userId">>) => {
        try {
            const shiftRef = doc(db, "shifts", shiftId);
            await updateDoc(shiftRef, cleanData({
                ...shiftData,
                updatedAt: new Date()
            }));
        } catch (error) {
            console.error("Error updating shift:", error);
            throw error;
        }
    }, []);

    const deleteShift = useCallback(async (shiftId: string) => {
        try {
            await deleteDoc(doc(db, "shifts", shiftId));
        } catch (error) {
            console.error("Error deleting shift:", error);
            throw error;
        }
    }, []);

    return {
        subscribeToShifts,
        addShift,
        updateShift,
        deleteShift
    };
}
