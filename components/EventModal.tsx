"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { parseISO } from "date-fns";
import { EventData } from "@/types/event.types";
import { CATEGORIES } from "@/lib/constants";
import { useEventModalController } from "@/hooks/useEventModalController";

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string | null;
    userId: string | undefined;
    setSelectedDate: (date: string | null) => void;
    events: EventData[];
    pendingEvents: Record<string, string | number>;
    setPendingEvents: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
}

const EventModal = ({ isOpen, onClose, selectedDate, userId, setSelectedDate, events, pendingEvents, setPendingEvents }: EventModalProps) => {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [showModal, setShowModal] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const {
        loading,
        selectedCategory,
        handleSave,
        handleDelete,
        handleCancel,
        handleIconClick,
    } = useEventModalController({ selectedDate, userId, events, pendingEvents, setPendingEvents, setSelectedDate, onClose });

    // Extract unique custom shifts (numeric IDs or custom string IDs)
    const customShifts = useMemo(() => {
        return events
            .filter(e => {
                const isNumericId = typeof e.shiftId === "number";
                const isManualCustom = typeof e.shiftId === "string" && !isNaN(Number(e.shiftId));
                return isNumericId || isManualCustom;
            })
            .reduce((acc, curr) => {
                const key = `${curr.title}-${curr.icon}-${curr.color}`;
                if (!acc.find(item => `${item.title}-${item.icon}-${item.color}` === key)) {
                    acc.push(curr);
                }
                return acc;
            }, [] as EventData[]);
    }, [events]);

    const ALL_ITEMS = useMemo(() => {
        const standardCats = CATEGORIES.filter(c => c.id !== "custom");
        const plusCat = CATEGORIES.find(c => c.id === "custom");

        return [
            ...standardCats.map(c => ({ id: c.id, label: c.label, icon: c.icon, color: c.color })),
            ...customShifts.map(s => ({
                id: s.shiftId,
                label: s.title || "เวรพิเศษ",
                icon: CATEGORIES.find(c => c.id === s.icon)?.icon || CATEGORIES[0].icon,
                color: s.color || "#334155"
            })),
            ...(plusCat ? [{ id: plusCat.id, label: plusCat.label, icon: plusCat.icon, color: plusCat.color }] : [])
        ];
    }, [customShifts]);

    useEffect(() => {
        console.log("Current UserID in Modal:", userId);
        console.log("Total Events received:", events.length);
        console.log("Custom Shifts detected:", customShifts.length);
    }, [userId, events, customShifts]);

    const showArrows = ALL_ITEMS.length > 5;

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setShowModal(true), 10);
            return () => clearTimeout(timer);
        } else {
            setShowModal(false);
            const timer = setTimeout(() => setShouldRender(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    const getThaiHeader = () => {
        if (!selectedDate) return "";
        const date = parseISO(selectedDate);
        const thaiDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
        return `วัน${thaiDays[date.getDay()]}ที่ ${date.getDate()}`;
    };

    const scroll = (direction: "left" | "right") => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const itemWidth = container.offsetWidth / 5;
        container.scrollBy({ left: direction === "left" ? -itemWidth : itemWidth, behavior: "smooth" });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            <div className={`bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)] p-4 pt-5 pb-5 transition-transform duration-500 ease-out pointer-events-auto transform z-10 ${showModal ? "translate-y-0" : "translate-y-full"}`}>
                <div className="relative flex flex-col items-center">
                    <button
                        onClick={handleCancel}
                        className="absolute right-0 top-0 text-slate-800 dark:text-slate-200 hover:text-slate-400 p-2 transition-colors"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>

                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">
                        {getThaiHeader()}
                    </h2>

                    <div className={`relative w-full mb-8 ${showArrows ? "px-8" : "px-4"}`}>
                        {showArrows && (
                            <button
                                onClick={() => scroll("left")}
                                className="absolute left-0.5 top-[32%] -translate-y-1/2 z-20 text-slate-400 hover:text-slate-600 w-7 h-7 flex items-center justify-center shadow-sm border border-slate-50 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full transition-all active:scale-90"
                            >
                                <ChevronLeft size={14} strokeWidth={3} />
                            </button>
                        )}

                        <div
                            ref={scrollContainerRef}
                            className={`grid grid-flow-col ${showArrows ? "auto-cols-[20%]" : "grid-cols-5"} overflow-x-auto no-scrollbar w-full snap-x snap-mandatory scroll-smooth pb-1`}
                        >
                            {ALL_ITEMS.map((cat) => (
                                <div key={cat.id} className="flex flex-col items-center gap-3 flex-shrink-0 snap-center">
                                    <button
                                        onClick={() => handleIconClick(cat.id)}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg active:scale-95
                                            ${selectedCategory === cat.id ? "scale-110 ring-4 ring-slate-100 dark:ring-slate-700" : "scale-100 hover:scale-105"}`}
                                        style={{ backgroundColor: typeof cat.color === 'string' ? cat.color : undefined }}
                                    >
                                        <cat.icon size={22} className="text-white" strokeWidth={2.5} />
                                    </button>
                                    <div className="h-4 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight whitespace-nowrap leading-none">
                                            {cat.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {showArrows && (
                            <button
                                onClick={() => scroll("right")}
                                className="absolute right-0.5 top-[32%] -translate-y-1/2 z-20 text-slate-400 hover:text-slate-600 w-7 h-7 flex items-center justify-center shadow-sm border border-slate-50 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full transition-all active:scale-90"
                            >
                                <ChevronRight size={14} strokeWidth={3} />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-4 w-full px-4">
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 py-2 rounded-full font-bold text-base text-slate-800 dark:text-slate-100 shadow-sm active:scale-95 transition-all disabled:opacity-30"
                        >
                            ลบ
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || Object.keys(pendingEvents).length === 0}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 py-2 rounded-full font-bold text-base text-slate-800 dark:text-slate-100 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? "..." : "ตกลง"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
