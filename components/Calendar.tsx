"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import SettingPage from "./SettingPage";
import ResultPage from "./ResultPage";
import GroupPage from "./GroupPage";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { ChevronDown, Plus } from "lucide-react";
import EventModal from "./EventModal";
import MonthPickerModal from "./MonthPickerModal";
import { format, setMonth, setYear } from "date-fns";
import NavBar from "./NavBar";
import { initLiff, getProfile } from "@/lib/liff";

// --- ปรับความเร็ว Animation ตรงนี้ ---
const SCROLL_DEBOUNCE = 200;
const TRANSITION_DELAY = 150;
// ---------------------------------

const THAI_DAY_NAMES = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const CALENDAR_PLUGINS = [dayGridPlugin, interactionPlugin];

const _today = new Date();
const FALLBACK_EVENTS = [
    { title: 'Meeting', date: format(_today, "yyyy-MM-dd") },
    { title: 'Appointment', date: format(new Date(_today.getFullYear(), _today.getMonth(), _today.getDate() + 2), "yyyy-MM-dd") },
    { title: 'Deadline', date: format(new Date(_today.getFullYear(), _today.getMonth(), _today.getDate() - 3), "yyyy-MM-dd") },
];

const MODAL_APPROX_HEIGHT = 200;

const Calendar = () => {
    const calendarRef = useRef<FullCalendar>(null);
    const calendarWrapperRef = useRef<HTMLDivElement>(null);
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
    const [activeTab, setActiveTab] = useState("home");
    const lastScrollTime = useRef(0);
    const touchStartRef = useRef({ x: 0, y: 0 });



    // Initialize LINE LIFF and set user profile
    useEffect(() => {
        const setupLiff = async () => {
            await initLiff();
            const profile = await getProfile();
            if (profile) setUser(profile);
        };
        // setupLiff();
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

    const handleDateClick = useCallback((arg: any) => {
        setSelectedDate(arg.dateStr);
        setSelectedEvent(null);
        setIsModalOpen(true);
    }, []);

    const handleEventClick = useCallback((arg: any) => {
        const event = events.find(e => e.id === arg.event.id);
        if (event) {
            const start = event.start instanceof Date ? event.start : event.start.toDate();
            setSelectedDate(format(start, "yyyy-MM-dd"));
            setSelectedEvent(event);
            setIsModalOpen(true);
        }
    }, [events]);

    const updateTitle = useCallback(() => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            const date = api.getDate();
            const month = date.toLocaleString("th-TH", { month: "long" });
            const year = date.getFullYear() + 543;
            setTitle(`${month} ${year}`);
            setPickerDate(prev => prev.getTime() !== date.getTime() ? date : prev);
        }
    }, []);

    const handleMonthSelect = useCallback((monthIndex: number) => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            const newDate = setMonth(pickerDate, monthIndex);
            api.gotoDate(newDate);
            setIsMonthPickerOpen(false);
            updateTitle();
        }
    }, [pickerDate, updateTitle]);

    const handleYearChange = useCallback((offset: number) => {
        setPickerDate(prev => setYear(prev, prev.getFullYear() + offset));
    }, []);

    const handlePickerToday = useCallback(() => {
        if (calendarRef.current) {
            calendarRef.current.getApi().today();
            setIsMonthPickerOpen(false);
            updateTitle();
        }
    }, [updateTitle]);

    const paginate = useCallback((isNext: boolean) => {
        if (!calendarRef.current) return;
        const api = calendarRef.current.getApi();
        setIsPaginating(true);
        setAnimationClass(isNext ? "animate-slide-out-left" : "animate-slide-out-right");
        setTimeout(() => {
            if (isNext) api.next(); else api.prev();
            updateTitle();
            setAnimationClass(isNext ? "animate-slide-in-right" : "animate-slide-in-left");
            lastScrollTime.current = Date.now();
            setTimeout(() => {
                setIsPaginating(false);
                setAnimationClass("");
            }, TRANSITION_DELAY);
        }, TRANSITION_DELAY);
    }, [updateTitle]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (Date.now() - lastScrollTime.current < SCROLL_DEBOUNCE || isPaginating) return;
        if (Math.abs(e.deltaX) > 20) paginate(e.deltaX > 0);
    }, [isPaginating, paginate]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (isModalOpen) return;
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (isModalOpen || Date.now() - lastScrollTime.current < SCROLL_DEBOUNCE || isPaginating) return;
        const diffX = touchStartRef.current.x - e.changedTouches[0].clientX;
        if (Math.abs(diffX) > 50) paginate(diffX > 0);
    }, [isModalOpen, isPaginating, paginate]);

    useEffect(() => {
        const timer = setTimeout(updateTitle, 100);
        return () => clearTimeout(timer);
    }, [activeTab, updateTitle]);



    const renderPageContent = () => {
        switch (activeTab) {
            case "setting":
                return <SettingPage user={user} />;
            case "result":
                return <ResultPage />;
            case "group":
                return <GroupPage />;
            case "home":
            default:
                return (
                    <div className={`flex-grow relative min-h-0 ${animationClass}`}>
                        <div
                            ref={calendarWrapperRef}
                            className={isModalOpen ? "absolute inset-x-0 top-0 overflow-hidden" : "h-full w-full overflow-hidden"}
                            style={{
                                bottom: isModalOpen ? MODAL_APPROX_HEIGHT : 0
                            }}
                            onWheel={handleWheel}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <FullCalendar
                                ref={calendarRef}
                                plugins={CALENDAR_PLUGINS}
                                initialView="dayGridMonth"
                                headerToolbar={false}
                                locale="th"
                                events={events.length > 0 ? events : FALLBACK_EVENTS}
                                dateClick={handleDateClick}
                                eventClick={handleEventClick}
                                height="100%"
                                expandRows={true}
                                fixedWeekCount={true}
                                dayHeaderFormat={{ weekday: 'short' }}
                                 dayHeaderContent={(arg) => {
                                    const dayName = THAI_DAY_NAMES[arg.date.getDay()];
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
                                dayCellClassNames={(arg) => {
                                    const dateStr = format(arg.date, "yyyy-MM-dd");
                                    return dateStr === selectedDate ? "selected-day" : "";
                                }}
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`px-3 pb-2 max-w-lg mx-auto h-[100dvh] flex flex-col overflow-hidden bg-[#f8fafc] transition-all duration-500 ${isModalOpen ? "pt-0" : "pt-2"}`}>
            {/* Header — only show on home tab */}
            {activeTab === "home" && (
                <div className={`flex justify-between items-center shrink-0 transition-all duration-500 ease-in-out ${isModalOpen ? "h-0 mb-0 pointer-events-none opacity-0 overflow-hidden" : "h-12 mb-2 opacity-100"}`}>
                    <button
                        onClick={() => setIsMonthPickerOpen(true)}
                        className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2 text-slate-800 font-bold text-base active:scale-95 transition-transform"
                    >
                        {title}
                        <ChevronDown size={18} className="text-slate-400" />
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-slate-700 font-bold text-sm active:scale-95 transition-transform">
                            ปฏิทินของฉัน
                        </button>
                        <button
                            onClick={() => {
                                setSelectedDate(format(new Date(), "yyyy-MM-dd"));
                                setSelectedEvent(null);
                                setIsModalOpen(true);
                            }}
                            className="bg-[#C2185B] text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all hover:bg-[#AD1457] shrink-0"
                        >
                            <Plus size={28} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            {renderPageContent()}

            {/* Always visible Navigation */}
            <div className={`mt-auto pt-2 pb-1 transition-all duration-500 ease-in-out ${isModalOpen ? "translate-y-24 opacity-0 h-0 overflow-hidden" : "translate-y-0 opacity-100"}`}>
                <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
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
                <MonthPickerModal
                    pickerDate={pickerDate}
                    onClose={() => setIsMonthPickerOpen(false)}
                    onYearChange={handleYearChange}
                    onMonthSelect={handleMonthSelect}
                    onToday={handlePickerToday}
                />
            )}
        </div>
    );
};

export default Calendar;
