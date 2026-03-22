"use client";

import React, { useState, useEffect } from "react";
import { parseISO, format } from "date-fns";

import {
    Sun, CloudSun, Moon, SunMoon, MoonStar, HelpCircle
} from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/constants";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
    morning: Sun,
    afternoon: CloudSun,
    night: Moon,
    allday: SunMoon,
    nightafternoon: MoonStar,
};

interface EventSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string | null;
    events: any[];
    onEdit: () => void;
}

const EventSummaryModal = ({ isOpen, onClose, selectedDate, events, onEdit }: EventSummaryModalProps) => {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        let mounted = true;
        if (isOpen) {
            const timer1 = setTimeout(() => {
                if (mounted) setShouldRender(true);
            }, 0);
            const timer2 = setTimeout(() => {
                if (mounted) setShowModal(true);
            }, 10);
            return () => {
                mounted = false;
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        } else {
            const timer1 = setTimeout(() => {
                if (mounted) setShowModal(false);
            }, 0);
            const timer2 = setTimeout(() => {
                if (mounted) setShouldRender(false);
            }, 500);
            return () => {
                mounted = false;
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    const getThaiDate = () => {
        if (!selectedDate) return "";
        const date = parseISO(selectedDate);
        const day = date.getDate();
        const month = date.toLocaleString("th-TH", { month: "long" });
        const year = date.getFullYear() + 543;
        return `${day} ${month} ${year}`;
    };

    const dateEvents = events.filter(e => {
        const eventDate = e.start instanceof Date ? e.start : e.start.toDate();
        return format(eventDate, "yyyy-MM-dd") === selectedDate;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/10 backdrop-blur-[4px] transition-opacity duration-500 pointer-events-auto ${showModal ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Modal Sheet */}
            <div className={`bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)] p-4 pt-4 pb-4 transition-transform duration-500 ease-out pointer-events-auto transform z-10 ${showModal ? "translate-y-0" : "translate-y-full"}`}>
                <div className="relative flex flex-col items-center">
                    {/* Close button - matches EventModal */}


                    {/* Centered Header - refined size as requested */}
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                        {getThaiDate()}
                    </h2>

                    <div className="flex flex-col gap-1 w-full">
                        {dateEvents.length > 0 ? (
                            dateEvents.map((event, idx) => {
                                const IconComponent = (event.icon && ICON_MAP[event.icon]) || (event.category && ICON_MAP[event.category]) || HelpCircle;
                                const eventColor = event.color || CATEGORY_COLORS[event.category] || "#334155";
                                
                                return (
                                    <div key={event.id || idx} className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" 
                                                style={{ backgroundColor: eventColor }}
                                            >
                                                <IconComponent size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                                    {event.title}
                                                </span>
                                                {(event.startTime || event.endTime) && (
                                                    <span className="text-xs font-medium text-slate-400 mt-0.5">
                                                        {event.startTime || "??"} - {event.endTime || "??"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={onEdit}
                                            className="bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-300 p-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 hover:text-slate-600 dark:hover:text-white transition-all active:scale-95"
                                        >
                                            <span className="text-[10px] font-bold px-1.5">แก้ไข</span>
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-1 text-slate-300 dark:text-slate-600 gap-1">
                                <HelpCircle size={32} strokeWidth={1.5} />
                                <span className="text-[11px] font-bold">ไม่มีกิจกรรม</span>
                            </div>
                        )}
                    </div>

                    {dateEvents.length === 0 && (
                        <button
                            onClick={onEdit}
                            className="w-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-slate-700 dark:hover:bg-slate-100 transition-all active:scale-95 mt-1"
                        >
                            เพิ่มกิจกรรม
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventSummaryModal;
