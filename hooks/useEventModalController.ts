"use client";

import { useState } from "react";
import { useEventService } from "@/hooks/useEventService";
import { format, parseISO, addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { EventData } from "@/types/event.types";
import { CATEGORIES } from "@/lib/constants";

interface UseEventModalControllerProps {
    selectedDate: string | null;
    userId: string | undefined;
    events: EventData[];
    pendingEvents: Record<string, string | number>;
    setPendingEvents: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
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
    const { saveBatchEvents } = useEventService();
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);

    const advanceToNextDay = () => {
        if (!selectedDate) return;
        const nextDate = addDays(parseISO(selectedDate), 1);
        setSelectedDate(format(nextDate, "yyyy-MM-dd"));
        setSelectedCategory(null);
    };

    const handleIconClick = (categoryId: string | number) => {
        if (!selectedDate) return;

        if (categoryId === "custom") {
            const url = `/add?date=${selectedDate}`;
            console.log("[Modal] Navigating to:", url);
            router.push(url);
            // Delay closing slightly to ensure push is registered
            setTimeout(() => {
                onClose();
            }, 100);
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
            await saveBatchEvents(userId, pendingEvents, events);
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
