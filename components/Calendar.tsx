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

// --- ปรับความเร็ว Animation ตรงนี้ ---
const SCROLL_DEBOUNCE = 800; // เวลาหน่วงระหว่างการสไลด์ (ms)
const TRANSITION_DELAY = 300; // ความเร็วของตัวแอนิเมชั่น (ms) - ควรแก้ให้สัมพันธ์กับ --slide-duration ใน CSS
// ---------------------------------

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
    const [isPaginating, setIsPaginating] = useState(false);
    const [animationClass, setAnimationClass] = useState("");
    const lastScrollTime = useRef(0);
    const touchStartRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const startup = async () => {
            await initLiff();
            const profile = await getProfile();
            setUser(profile);
        };
        // startup();
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
        if (now - lastScrollTime.current < SCROLL_DEBOUNCE || isPaginating) return; 

        if (calendarRef.current && Math.abs(e.deltaX) > 20) {
            const api = calendarRef.current.getApi();
            setIsPaginating(true);
            const isNext = e.deltaX > 0;
            
            setAnimationClass(isNext ? "animate-slide-out-left" : "animate-slide-out-right");
            
            setTimeout(() => {
                if (isNext) api.next(); else api.prev();
                updateTitle();
                setAnimationClass(isNext ? "animate-slide-in-right" : "animate-slide-in-left");
                lastScrollTime.current = now;
                setTimeout(() => {
                    setIsPaginating(false);
                    setAnimationClass("");
                }, TRANSITION_DELAY);
            }, TRANSITION_DELAY);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const now = Date.now();
        if (now - lastScrollTime.current < SCROLL_DEBOUNCE || isPaginating) return;

        const touchEndX = e.changedTouches[0].clientX;
        const diffX = touchStartRef.current.x - touchEndX;
        
        if (Math.abs(diffX) > 50) { 
            if (calendarRef.current) {
                const api = calendarRef.current.getApi();
                setIsPaginating(true);
                const isNext = diffX > 0;
                
                setAnimationClass(isNext ? "animate-slide-out-left" : "animate-slide-out-right");

                setTimeout(() => {
                    if (isNext) api.next(); else api.prev();
                    updateTitle();
                    setAnimationClass(isNext ? "animate-slide-in-right" : "animate-slide-in-left");
                    lastScrollTime.current = now;
                    setTimeout(() => {
                        setIsPaginating(false);
                        setAnimationClass("");
                    }, TRANSITION_DELAY);
                }, TRANSITION_DELAY);
            }
        }
    };

    useEffect(() => {
        const timer = setTimeout(updateTitle, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="pt-2 px-3 pb-2 max-w-lg mx-auto h-[100dvh] flex flex-col overflow-hidden">
            {/* Header / Month Selector */}
            <div className="flex justify-between items-center mb-2 shrink-0">
                <button
                    onClick={() => setIsMonthPickerOpen(true)}
                    className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2 text-slate-800 font-bold text-base active:scale-95 transition-transform"
                >
                    {title}
                    <ChevronDown size={18} className="text-slate-400" />
                </button>
                <div className="w-20 h-12 bg-white/40 backdrop-blur-sm rounded-full shadow-sm"></div>
            </div>

            {/* Calendar Grid Container */}
            <div 
                className={`flex-grow scroll-container touch-none overflow-hidden ${animationClass}`} 
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
                    events={[
                        { title: 'Meeting', date: new Date().toISOString().split('T')[0] },
                        { title: 'Appointment', date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0] },
                        { title: 'Deadline', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0] }
                    ]}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    height="100%"
                    aspectRatio={1.1}
                    fixedWeekCount={true}
                    dayHeaderFormat={{ weekday: 'short' }}
                    dayHeaderContent={(arg) => {
                        const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
                        const dayName = days[arg.date.getDay()];
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
            <div className="flex justify-between items-center mt-auto pb-2 shrink-0">
                <button
                    onClick={handleToday}
                    className="bg-white px-5 py-2 rounded-full shadow-sm text-slate-800 font-bold text-base active:scale-95 transition-transform"
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
                            className="bg-white px-6 py-2 rounded-full shadow-lg border border-slate-100 text-slate-800 font-bold text-base active:scale-95 transition-transform"
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

