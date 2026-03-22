"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { format, parseISO, addDays } from "date-fns";
import { useRouter } from "next/navigation";

interface UseAddEventControllerProps {
    dateStr: string | null;
    userId: string;
}

export function useAddEventController({ dateStr, userId }: UseAddEventControllerProps) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("Sun");
    const [selectedColor, setSelectedColor] = useState("#334155");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!dateStr || !title.trim()) return;
        setLoading(true);

        try {
            const date = parseISO(dateStr);

            const q = query(collection(db, "events"), where("userId", "==", userId));
            const snapshot = await getDocs(q);
            const existing = snapshot.docs.find((d) => {
                const s = d.data().start.toDate ? d.data().start.toDate() : d.data().start;
                return format(s, "yyyy-MM-dd") === dateStr;
            });

            const eventData = {
                userId,
                title: title.trim(),
                category: "custom",
                icon: selectedIcon,
                color: selectedColor,
                startTime: startTime || null,
                endTime: endTime || null,
                start: date,
                end: date,
                updatedAt: new Date(),
            };

            if (existing) {
                await updateDoc(doc(db, "events", existing.id), eventData);
            } else {
                await addDoc(collection(db, "events"), { ...eventData, createdAt: new Date() });
            }

            const nextDate = addDays(date, 1);
            router.push(`/?date=${format(nextDate, "yyyy-MM-dd")}&open=true`);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        title, setTitle,
        selectedIcon, setSelectedIcon,
        selectedColor, setSelectedColor,
        startTime, setStartTime,
        endTime, setEndTime,
        loading,
        handleSave,
    };
}
