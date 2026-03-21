"use client";

import React, { useState, useEffect } from "react";
import { parseISO, format } from "date-fns";

interface EventSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string | null;
    events: any[];
    onEdit: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    morning: "#86BBD8",
    afternoon: "#F58220",
    night: "#D43B80",
    allday: "#00AB84",
    custom: "#334155",
};

const EventSummaryModal = ({ isOpen, onClose, selectedDate, events, onEdit }: EventSummaryModalProps) => {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        } else {
            setShowModal(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (shouldRender && isOpen) {
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 10);
            return () => clearTimeout(timer);
        }
    }, [shouldRender, isOpen]);

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
                className={`absolute inset-0 bg-white/5 backdrop-blur-[2px] transition-opacity duration-500 pointer-events-auto ${showModal ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Modal Sheet */}
            <div className={`bg-white w-full max-w-lg rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 pt-5 pb-6 transition-transform duration-500 ease-out pointer-events-auto transform z-10 ${showModal ? "translate-y-0" : "translate-y-full"}`}>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                                {getThaiDate()}
                            </span>
                            {dateEvents.length > 0 ? (
                                dateEvents.map((event, idx) => (
                                    <div key={event.id || idx} className="flex items-center gap-2">
                                        <div 
                                            className="w-2.5 h-2.5 rounded-full" 
                                            style={{ backgroundColor: CATEGORY_COLORS[event.category] || "#334155" }}
                                        />
                                        <span className="text-lg font-black text-[#1e293b]">
                                            {event.title}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                    <span className="text-lg font-black text-slate-300">ไม่มีกิจกรรม</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={onEdit}
                            className="bg-[#f8fafc] text-slate-800 px-5 py-2 rounded-[20px] font-bold text-base shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                        >
                            แก้ไข
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventSummaryModal;
