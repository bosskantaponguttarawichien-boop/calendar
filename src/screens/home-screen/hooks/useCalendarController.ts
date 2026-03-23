"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import { useEventService } from "@/hooks/useEventService";
import { format, setMonth, setYear } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import { EventData } from "@/types/event.types";
import { THAI_MONTHS } from "@/lib/constants";
import { useShiftController } from "@/hooks/useShiftController";

const SCROLL_DEBOUNCE = 200;
const TRANSITION_DELAY = 150;

export function useCalendarController(userId: string | null) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { subscribeToEvents } = useEventService();
    const { shifts, loading: shiftsLoading } = useShiftController(userId || undefined);

    const calendarRef = useRef<FullCalendar>(null);
    const calendarWrapperRef = useRef<HTMLDivElement>(null);
    const lastScrollTime = useRef(0);
    const touchStartRef = useRef({ x: 0, y: 0 });

    const [events, setEvents] = useState<EventData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [title, setTitle] = useState(() => {
        const d = new Date();
        return `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
    });
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [pickerDate, setPickerDate] = useState(new Date());
    const [isPaginating, setIsPaginating] = useState(false);
    const [animationClass, setAnimationClass] = useState("");
    const [activeTab, setActiveTab] = useState("home");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [pendingEvents, setPendingEvents] = useState<Record<string, string | number>>(() => {
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
            // Using a slight delay to avoid synchronous state update warning
            const timer = setTimeout(() => {
                setSelectedDate(dateParam);
                setIsModalOpen(true);
                router.replace("/", { scroll: false });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router, setSelectedDate, setIsModalOpen]);

    // Firestore real-time listener
    useEffect(() => {
        if (!userId) return;
        const unsubscribe = subscribeToEvents(userId, (eventData) => {
            setEvents(eventData);
        }, startDate, endDate);
        return () => unsubscribe();
    }, [userId, subscribeToEvents, startDate, endDate]);

    const updateTitle = useCallback(() => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            const date = api.getDate();
            const month = THAI_MONTHS[date.getMonth()];
            const year = date.getFullYear() + 543;
            setTitle(`${month} ${year}`);
            setPickerDate((prev) => (prev.getTime() !== date.getTime() ? date : prev));
            
            // Update visible range for data optimization
            const { activeStart, activeEnd } = api.view;
            setStartDate(activeStart);
            setEndDate(activeEnd);
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

    // Group events by date for O(1) lookup in calendar cells
    const groupedEvents = useMemo(() => {
        const groups: Record<string, EventData[]> = {};
        events.forEach((event) => {
            try {
                const date = event.start instanceof Date ? event.start : (event.start as any).toDate();
                const key = format(date, "yyyy-MM-dd");
                if (!groups[key]) groups[key] = [];
                groups[key].push(event);
            } catch {
                console.warn("[CalendarController] Skipped event with invalid date:", event);
            }
        });
        return groups;
    }, [events]);

    return {
        // Refs
        calendarRef,
        calendarWrapperRef,
        // State
        events,
        groupedEvents,
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
        updateTitle,
        shifts,
        shiftsLoading,
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
