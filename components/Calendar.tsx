"use client";

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import EventModal from "./EventModal";
import { initLiff, getProfile, getContext } from "@/lib/liff";
import { format } from "date-fns";

const Calendar = () => {
    const calendarRef = useRef<FullCalendar>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [title, setTitle] = useState("");

    useEffect(() => {
        const startup = async () => {
            await initLiff();
            const profile = await getProfile();
            const context = getContext();

            setUser(profile);

            // Deep Linking - Check for 'date' param
            const params = new URLSearchParams(window.location.search);
            const dateParam = params.get("date");
            if (dateParam && calendarRef.current) {
                calendarRef.current.getApi().gotoDate(dateParam);
                setTimeout(updateTitle, 100);
            }

            if (context?.type !== "utou") {
                console.warn("This app is designed for Personal Chat (utou) only. Current context:", context?.type);
            }
        };
        startup();
    }, []);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "events"), where("userId", "==", user.userId));
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

    const handlePrev = () => {
        calendarRef.current?.getApi().prev();
        updateTitle();
    };

    const handleNext = () => {
        calendarRef.current?.getApi().next();
        updateTitle();
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
        }
    };

    useEffect(() => {
        const timer = setTimeout(updateTitle, 100);
        return () => clearTimeout(timer);
    }, []);


    return (
        <div className="p-4 max-w-lg mx-auto bg-slate-100 min-h-screen">
            {/* Main Header */}
            <div className="flex justify-between items-center mb-6 pt-4 px-2">
                <h1 className="text-2xl font-bold text-[#1e293b]">ปฏิทินของฉัน</h1>
                <button
                    onClick={() => {
                        setSelectedDate(new Date().toISOString().split("T")[0]);
                        setIsModalOpen(true);
                    }}
                    className="bg-[#00b900] text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all transform active:scale-95 flex items-center justify-center"
                >
                    <Plus size={28} strokeWidth={3} />
                </button>
            </div>

            {/* Calendar Card */}
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden mb-4 p-4">
                {/* Secondary Header / Toolbar */}
                <div className="flex justify-between items-start mb-6 pt-2">
                    {/* Navigation on the Left */}
                    <div className="flex flex-col gap-2">
                        <div className="flex bg-[#00b900] rounded-lg overflow-hidden shadow-sm">
                            <button onClick={handlePrev} className="p-2 text-white hover:bg-green-700 border-r border-green-500/50 transition-colors">
                                <ChevronLeft size={20} strokeWidth={3} />
                            </button>
                            <button onClick={handleNext} className="p-2 text-white hover:bg-green-700 transition-colors">
                                <ChevronRight size={20} strokeWidth={3} />
                            </button>
                        </div>
                        <button
                            onClick={handleToday}
                            className="bg-[#66cc66] text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-500 shadow-sm transition-colors text-center"
                        >
                            today
                        </button>
                    </div>

                    {/* Month/Year centered */}
                    <div className="text-center">
                        <div className="text-[#1e293b] font-bold text-2xl leading-none mb-1">{title.split(' ')[0]}</div>
                        <div className="text-[#1e293b] font-bold text-2xl leading-none">{title.split(' ')[1]}</div>
                    </div>

                    {/* View Switcher on the Right - Removed */}
                    <div className="w-[80px]"></div>
                </div>

                {/* Grid Container */}
                <div className="custom-calendar-container">
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
                        dayHeaderFormat={{ weekday: 'short' }}
                        dayHeaderContent={(arg) => {
                            const days: { [key: string]: string } = {
                                'อา.': 'อา.',
                                'จ.': 'จ.',
                                'อ.': 'อ.',
                                'พ.': 'พ.',
                                'พฤ.': 'พฤ.',
                                'ศ.': 'ศ.',
                                'ส.': 'ส.'
                            };
                            return days[arg.text] || arg.text;
                        }}
                    />
                </div>
            </div>

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={selectedDate}
                userId={user?.userId}
                initialEvent={selectedEvent}
            />
        </div>
    );
};

export default Calendar;
