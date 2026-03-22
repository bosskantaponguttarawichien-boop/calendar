"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import { format, parseISO, addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { EventData } from "@/types/event.types";
import { CATEGORIES } from "@/lib/constants";

interface UseEventModalControllerProps {
    selectedDate: string | null;
    userId: string | undefined;
    events: EventData[];
    pendingEvents: Record<string, string>;
    setPendingEvents: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setSelectedDate: (date: string | null) => void;
    onClose: () => void;
}

export function useEventModalController({
    selectedDate,
    userId,
    events,
    pendingEvents,
    setPendingEvents,
    setSelectedDate,
    onClose,
}: UseEventModalControllerProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const advanceToNextDay = () => {
        if (!selectedDate) return;
        const nextDate = addDays(parseISO(selectedDate), 1);
        setSelectedDate(format(nextDate, "yyyy-MM-dd"));
        setSelectedCategory(null);
    };

    const handleIconClick = (categoryId: string) => {
        if (!selectedDate) return;

        if (categoryId === "custom") {
            router.push(`/add?date=${selectedDate}`);
            return;
        }

        setPendingEvents((prev) => ({ ...prev, [selectedDate]: categoryId }));
        advanceToNextDay();
    };

    const handleSave = async () => {
        const datesToSave = Object.keys(pendingEvents);
        if (!userId || datesToSave.length === 0) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            const batch = writeBatch(db);
            
            for (const date of datesToSave) {
                const categoryId = pendingEvents[date];
                const existingEvent = events.find((e) => {
                    const eventDate = e.start instanceof Date ? e.start : (e.start as any).toDate();
                    return format(eventDate, "yyyy-MM-dd") === date && e.userId === userId;
                });

                if (categoryId === "delete") {
                    if (existingEvent) {
                        batch.delete(doc(db, "events", existingEvent.id));
                    }
                    continue;
                }

                const category = CATEGORIES.find((c) => c.id === categoryId);
                const eventData = {
                    userId,
                    title: category?.label || "กิจกรรม",
                    category: categoryId,
                    start: parseISO(date),
                    end: parseISO(date),
                    updatedAt: new Date(),
                };

                if (existingEvent) {
                    batch.update(doc(db, "events", existingEvent.id), eventData);
                } else {
                    const newDocRef = doc(collection(db, "events"));
                    batch.set(newDocRef, { ...eventData, createdAt: new Date() });
                }
            }

            await batch.commit();
            setPendingEvents({});
            onClose();
        } catch (error) {
            console.error("Error saving events with batch:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!selectedDate) return;
        setPendingEvents((prev) => ({ ...prev, [selectedDate]: "delete" }));
        const prevDate = addDays(parseISO(selectedDate), -1);
        setSelectedDate(format(prevDate, "yyyy-MM-dd"));
        setSelectedCategory(null);
    };

    const handleCancel = () => {
        setPendingEvents({});
        onClose();
    };

    return {
        loading,
        selectedCategory,
        setSelectedCategory,
        handleSave,
        handleDelete,
        handleCancel,
        handleIconClick,
    };
}
