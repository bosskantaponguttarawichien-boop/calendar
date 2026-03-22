"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { format, setMonth, setYear } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import { EventData } from "@/types/event.types";

const SCROLL_DEBOUNCE = 200;
const TRANSITION_DELAY = 150;

export function useCalendarController() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const calendarRef = useRef<FullCalendar>(null);
    const calendarWrapperRef = useRef<HTMLDivElement>(null);
    const lastScrollTime = useRef(0);
    const touchStartRef = useRef({ x: 0, y: 0 });

    const [events, setEvents] = useState<EventData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [pickerDate, setPickerDate] = useState(new Date());
    const [isPaginating, setIsPaginating] = useState(false);
    const [animationClass, setAnimationClass] = useState("");
    const [activeTab, setActiveTab] = useState("home");
    const [pendingEvents, setPendingEvents] = useState<Record<string, string>>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("pendingEvents");
            return saved ? JSON.parse(saved) : {};
        }
        return {};
    });

    // Persist pending events
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("pendingEvents", JSON.stringify(pendingEvents));
        }
    }, [pendingEvents]);

    // Handle URL params (return from /add page)
    useEffect(() => {
        const dateParam = searchParams.get("date");
        const openParam = searchParams.get("open");
        if (dateParam && openParam === "true") {
            setSelectedDate(dateParam);
            setIsModalOpen(true);
            router.replace("/", { scroll: false });
        }
    }, [searchParams, router]);

    // Firestore real-time listener
    useEffect(() => {
        const userId = "local-user";
        const q = query(collection(db, "events"), where("userId", "==", userId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                start: doc.data().start.toDate ? doc.data().start.toDate() : doc.data().start,
                end: doc.data().end.toDate ? doc.data().end.toDate() : doc.data().end,
            })) as EventData[];
            setEvents(eventData);
        });
        return () => unsubscribe();
    }, []);

    const updateTitle = useCallback(() => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            const date = api.getDate();
            const month = date.toLocaleString("th-TH", { month: "long" });
            const year = date.getFullYear() + 543;
            setTitle(`${month} ${year}`);
            setPickerDate((prev) => (prev.getTime() !== date.getTime() ? date : prev));
        }
    }, []);

    // Sync title when switching back to home tab
    useEffect(() => {
        const timer = setTimeout(updateTitle, 100);
        return () => clearTimeout(timer);
    }, [activeTab, updateTitle]);

    const handleDateClick = useCallback(
        (arg: { dateStr: string }) => {
            setSelectedDate(arg.dateStr);
            if (!isModalOpen) {
                setIsSummaryModalOpen(true);
            }
        },
        [isModalOpen]
    );

    const handleEventClick = useCallback(
        (arg: { event: { id: string } }) => {
            const event = events.find((e) => e.id === arg.event.id);
            if (event) {
                const start = event.start instanceof Date ? event.start : (event.start as any).toDate();
                setSelectedDate(format(start, "yyyy-MM-dd"));
                setIsSummaryModalOpen(true);
            }
        },
        [events]
    );

    const paginate = useCallback(
        (isNext: boolean) => {
            if (!calendarRef.current) return;
            const api = calendarRef.current.getApi();
            setIsPaginating(true);
            setAnimationClass(isNext ? "animate-slide-out-left" : "animate-slide-out-right");
            setTimeout(() => {
                if (isNext) api.next();
                else api.prev();
                updateTitle();
                setAnimationClass(isNext ? "animate-slide-in-right" : "animate-slide-in-left");
                lastScrollTime.current = Date.now();
                setTimeout(() => {
                    setIsPaginating(false);
                    setAnimationClass("");
                }, TRANSITION_DELAY);
            }, TRANSITION_DELAY);
        },
        [updateTitle]
    );

    const handleWheel = useCallback(
        (e: React.WheelEvent) => {
            if (Date.now() - lastScrollTime.current < SCROLL_DEBOUNCE || isPaginating) return;
            if (Math.abs(e.deltaX) > 20) paginate(e.deltaX > 0);
        },
        [isPaginating, paginate]
    );

    const handleTouchStart = (e: React.TouchEvent) => {
        if (isModalOpen) return;
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            if (isModalOpen || isSummaryModalOpen || Date.now() - lastScrollTime.current < SCROLL_DEBOUNCE || isPaginating) return;
            const diffX = touchStartRef.current.x - e.changedTouches[0].clientX;
            if (Math.abs(diffX) > 50) paginate(diffX > 0);
        },
        [isModalOpen, isSummaryModalOpen, isPaginating, paginate]
    );

    const handleMonthSelect = useCallback(
        (monthIndex: number) => {
            if (calendarRef.current) {
                const api = calendarRef.current.getApi();
                const newDate = setMonth(pickerDate, monthIndex);
                api.gotoDate(newDate);
                setIsMonthPickerOpen(false);
                updateTitle();
            }
        },
        [pickerDate, updateTitle]
    );

    const handleYearChange = useCallback((offset: number) => {
        setPickerDate((prev) => setYear(prev, prev.getFullYear() + offset));
    }, []);

    const handlePickerToday = useCallback(() => {
        if (calendarRef.current) {
            calendarRef.current.getApi().today();
            setIsMonthPickerOpen(false);
            updateTitle();
        }
    }, [updateTitle]);

    return {
        // Refs
        calendarRef,
        calendarWrapperRef,
        // State
        events,
        isModalOpen,
        setIsModalOpen,
        isSummaryModalOpen,
        setIsSummaryModalOpen,
        selectedDate,
        setSelectedDate,
        title,
        isMonthPickerOpen,
        setIsMonthPickerOpen,
        pickerDate,
        isPaginating,
        animationClass,
        activeTab,
        setActiveTab,
        pendingEvents,
        setPendingEvents,
        // Handlers
        handleDateClick,
        handleEventClick,
        handleWheel,
        handleTouchStart,
        handleTouchEnd,
        handleMonthSelect,
        handleYearChange,
        handlePickerToday,
    };
}
