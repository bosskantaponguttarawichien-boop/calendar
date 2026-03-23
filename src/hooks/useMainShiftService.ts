"use client";

import { useCallback } from "react";
import { db } from "@/lib/firebase";
import { 
    collection, 
    getDocs,
    Timestamp 
} from "firebase/firestore";
import { MainShift } from "@/types/event.types";

export function useMainShiftService() {
    const getMainShifts = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "main-shifts"));
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
                    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
                } as MainShift;
            });
        } catch (error) {
            console.error("Error fetching main shifts:", error);
            throw error;
        }
    }, []);

    return {
        getMainShifts
    };
}
