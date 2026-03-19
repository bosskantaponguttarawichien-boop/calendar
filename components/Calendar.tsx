"use client";

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import EventModal from "./EventModal";
import { initLiff, getProfile, getContext } from "@/lib/liff";
import { format, setMonth, setYear } from "date-fns";

const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const Calendar = () => {
    const calendarRef = useRef<FullCalendar>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [pickerDate, setPickerDate] = useState(new Date());
    const lastScrollTime = useRef(0);
    const touchStartY = useRef(0);

    useEffect(() => {
        const startup = async () => {
            await initLiff();
            const profile = await getProfile();
            setUser(profile);
        };
        startup();
    }, []);

    useEffect(() => {
        const userId = user?.userId || "local-user";
        const q = query(collection(db, "events"), where("userId", "==", userId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                start: doc.data().start.toDate ? doc.data().start.toDate() : doc.data().start,
                end: doc.data().end.toDate ? doc.data().end.toDate() : doc.data().end,
            }));
            setEvents(eventData);
        });

        return () => unsubscribe();
    }, [user]);

    const handleDateClick = (arg: any) => {
        setSelectedDate(arg.dateStr);
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    const handleEventClick = (arg: any) => {
        const event = events.find(e => e.id === arg.event.id);
        if (event) {
            const start = event.start instanceof Date ? event.start : event.start.toDate();
            setSelectedDate(format(start, "yyyy-MM-dd"));
            setSelectedEvent(event);
            setIsModalOpen(true);
        }
    };

    const handleToday = () => {
        calendarRef.current?.getApi().today();
        updateTitle();
    };

    const updateTitle = () => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            const date = api.getDate();
            const month = date.toLocaleString("th-TH", { month: "long" });
            const year = date.getFullYear() + 543;
            setTitle(`${month} ${year}`);
            setPickerDate(date);
        }
    };

    const handleMonthSelect = (monthIndex: number) => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            const newDate = setMonth(pickerDate, monthIndex);
            api.gotoDate(newDate);
            setIsMonthPickerOpen(false);
            updateTitle();
        }
    };

    const handleYearChange = (offset: number) => {
        setPickerDate(prev => setYear(prev, prev.getFullYear() + offset));
    };

    const handlePickerToday = () => {
        if (calendarRef.current) {
            calendarRef.current.getApi().today();
            setIsMonthPickerOpen(false);
            updateTitle();
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        const now = Date.now();
        if (now - lastScrollTime.current < 400) return; // Debounce 400ms for stability

        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            if (e.deltaY > 0) {
                api.next();
            } else if (e.deltaY < 0) {
                api.prev();
            }
            lastScrollTime.current = now;
            updateTitle();
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const now = Date.now();
        if (now - lastScrollTime.current < 400) return;

        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY;

        if (Math.abs(diff) > 50) { // 50px threshold
            if (calendarRef.current) {
                const api = calendarRef.current.getApi();
                if (diff > 0) {
                    api.next(); // Swipe Up -> Next
                } else {
                    api.prev(); // Swipe Down -> Prev
                }
                lastScrollTime.current = now;
                updateTitle();
            }
        }
    };

    useEffect(() => {
        const timer = setTimeout(updateTitle, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="pt-6 px-4 pb-6 max-w-lg mx-auto min-h-screen flex flex-col">
            {/* Header / Month Selector */}
            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={() => setIsMonthPickerOpen(true)}
                    className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm flex items-center gap-2 text-slate-800 font-bold text-lg active:scale-95 transition-transform"
                >
                    {title}
                    <ChevronDown size={22} className="text-slate-400" />
                </button>
                <div className="w-20 h-12 bg-white/40 backdrop-blur-sm rounded-full shadow-sm"></div>
            </div>

            {/* Calendar Grid Container */}
            <div
                className="flex-grow scroll-container touch-none"
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={false}
                    locale="th"
                    events={events}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    height="auto"
                    fixedWeekCount={false}
                    dayHeaderFormat={{ weekday: 'short' }}
                    dayHeaderContent={(arg) => {
                        const days: { [key: string]: string } = {
                            'อา.': 'อา',
                            'จ.': 'จ',
                            'อ.': 'อ',
                            'พ.': 'พ',
                            'พฤ.': 'พฤ',
                            'ศ.': 'ศ',
                            'ส.': 'ส'
                        };
                        const dayName = days[arg.text] || arg.text;
                        const today = new Date();
                        const isTodayMonth = pickerDate.getMonth() === today.getMonth() &&
                            pickerDate.getFullYear() === today.getFullYear();
                        const isTodayDay = isTodayMonth && arg.date.getDay() === today.getDay();

                        return (
                            <div className="flex flex-col items-center gap-1">
                                <span className={isTodayDay ? "font-bold" : ""}>{dayName}</span>
                                {isTodayDay && (
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-slate-800" />
                                )}
                            </div>
                        );
                    }}
                />
            </div>

            {/* Bottom Bar */}
            <div className="flex justify-between items-center mt-8 pb-10">
                <button
                    onClick={handleToday}
                    className="bg-white px-8 py-3 rounded-full shadow-sm text-slate-800 font-bold text-lg active:scale-95 transition-transform"
                >
                    วันนี้
                </button>
                <div className="w-40 h-12 bg-white rounded-full shadow-sm"></div>
            </div>

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={selectedDate}
                userId={user?.userId}
                initialEvent={selectedEvent}
            />

            {/* Month Picker Modal */}
            {isMonthPickerOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 pb-20"
                    onClick={() => setIsMonthPickerOpen(false)}
                >
                    <div
                        className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl p-8 flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between w-full mb-8 px-4">
                            <button onClick={() => handleYearChange(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <ChevronLeft size={24} className="text-slate-800" />
                            </button>
                            <span className="text-2xl font-bold text-slate-800">
                                {pickerDate.getFullYear() + 543}
                            </span>
                            <button onClick={() => handleYearChange(1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <ChevronRight size={24} className="text-slate-800" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-y-6 gap-x-2 w-full mb-10">
                            {THAI_MONTHS.map((month, index) => {
                                const isSelected = pickerDate.getMonth() === index;
                                return (
                                    <button
                                        key={month}
                                        onClick={() => handleMonthSelect(index)}
                                        className={`py-2 px-1 rounded-full text-center font-medium transition-all text-sm
                                            ${isSelected
                                                ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                                                : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {month}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={handlePickerToday}
                            className="bg-white px-10 py-3 rounded-full shadow-lg border border-slate-100 text-slate-800 font-bold text-lg active:scale-95 transition-transform"
                        >
                            เลือกวันนี้
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;

