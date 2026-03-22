"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ChevronDown, Plus } from "lucide-react";
import { format } from "date-fns";

import SettingScreen from "@/screens/SettingScreen";
import ResultScreen from "@/screens/ResultScreen";
import GroupScreen from "@/screens/GroupScreen";
import EventModal from "@/components/EventModal";
import EventSummaryModal from "@/components/EventSummaryModal";
import MonthPickerModal from "@/components/MonthPickerModal";
import NavBar from "@/components/NavBar";
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/constants";
import { useCalendarController } from "@/hooks/useCalendarController";
import { useLiff } from "@/hooks/useLiff";

const THAI_DAY_NAMES = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const CALENDAR_PLUGINS = [dayGridPlugin, interactionPlugin];
const MODAL_APPROX_HEIGHT = 200;

const DayHeader = React.memo(({ date, pickerDate }: { date: Date; pickerDate: Date }) => {
    const dayName = THAI_DAY_NAMES[date.getDay()];
    const today = new Date();
    const isTodayMonth =
        pickerDate.getMonth() === today.getMonth() &&
        pickerDate.getFullYear() === today.getFullYear();
    const isTodayDay = isTodayMonth && date.getDay() === today.getDay();

    return (
        <div className="flex flex-col items-center gap-1">
            <span className={isTodayDay ? "font-bold" : ""}>{dayName}</span>
            {isTodayDay && (
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-slate-800" />
            )}
        </div>
    );
});

const DayCellContent = React.memo(({ 
    arg, 
    events, 
    pendingEvents, 
    isModalOpen 
}: { 
    arg: any; 
    events: any[]; 
    pendingEvents: Record<string, string | number>;
    isModalOpen: boolean;
}) => {
    const dateStr = format(arg.date, "yyyy-MM-dd");
    const dayEvents = events.filter((e) => {
        const start = e.start instanceof Date ? e.start : (e.start as any).toDate();
        return format(start, "yyyy-MM-dd") === dateStr;
    });

    const pendingCat = pendingEvents[dateStr];
    const isDeleted = pendingCat === "delete";
    const isCustom = (typeof pendingCat === "string" && pendingCat.startsWith("custom:")) || (dayEvents.length > 0 && typeof dayEvents[0].shiftId === "number" && !pendingCat);
    const actualCatId = isCustom ? "custom" : pendingCat;
    
    const activeCatId = (pendingCat && !isDeleted) ? actualCatId : (dayEvents.length > 0 ? dayEvents[0].shiftId : null);
    const category = CATEGORIES.find(c => c.id === activeCatId);
    
    // Virtual category for custom numeric shifts
    const customCategory = (typeof activeCatId === "number" && dayEvents.length > 0) ? {
        icon: CATEGORIES.find(c => c.id === dayEvents[0].icon)?.icon || CATEGORIES[0].icon,
        label: dayEvents[0].title
    } : null;

    const displayCategory = category || customCategory;

    const color = isDeleted 
        ? "" 
        : (pendingCat && pendingCat !== "delete")
            ? (CATEGORY_COLORS[actualCatId] || "#334155")
            : (dayEvents.length > 0 ? (dayEvents[0].color || CATEGORY_COLORS[dayEvents[0].shiftId as string] || "#334155") : "");

    return (
        <div 
            className="absolute inset-0 flex flex-col items-center pt-1 pb-2 transition-colors duration-300"
            style={{ backgroundColor: color || "transparent" }}
        >
            <div className="pill-date-circle shrink-0 z-10">{arg.dayNumberText}</div>
            
            {displayCategory && !isDeleted && (
                <div className="flex flex-col items-center justify-center flex-grow w-full animate-in zoom-in-50 duration-300 z-10">
                    <displayCategory.icon 
                        size={!isModalOpen ? 16 : 14} 
                        className={`text-white transition-all ${!isModalOpen ? "mb-0.5" : ""}`} 
                        strokeWidth={2.5} 
                    />
                    {!isModalOpen && (
                        <span className="text-[8px] font-black text-white uppercase tracking-tighter text-center leading-[1] px-0.5">
                            {displayCategory.label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
});

const HomeScreen = () => {
    const { userId, loading: liffLoading } = useLiff();
    const {
        calendarRef,
        calendarWrapperRef,
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
        handleDateClick,
        handleEventClick,
        handleWheel,
        handleTouchStart,
        handleTouchEnd,
        handleMonthSelect,
        handleYearChange,
        handlePickerToday,
    } = useCalendarController(userId);

    if (liffLoading) {
        return (
            <div className="flex items-center justify-center h-[100dvh] bg-[#f8fafc]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            </div>
        );
    }

    const renderPageContent = () => {
        switch (activeTab) {
            case "setting":
                return <SettingScreen />;
            case "result":
                return <ResultScreen />;
            case "group":
                return <GroupScreen />;
            case "home":
            default:
                return (
                    <div className={`flex-grow relative min-h-0 ${animationClass}`}>
                        <div
                            ref={calendarWrapperRef}
                            className={isModalOpen ? "absolute inset-x-0 top-0 overflow-hidden" : "h-full w-full overflow-hidden"}
                            style={{ bottom: isModalOpen ? MODAL_APPROX_HEIGHT : 0 }}
                            onWheel={handleWheel}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <FullCalendar
                                key={`calendar-${isModalOpen}`}
                                ref={calendarRef}
                                plugins={CALENDAR_PLUGINS}
                                initialView="dayGridMonth"
                                headerToolbar={false}
                                locale="th"
                                events={events}
                                dateClick={handleDateClick}
                                eventClick={handleEventClick}
                                height="100%"
                                expandRows={true}
                                fixedWeekCount={true}
                                dayHeaderFormat={{ weekday: "short" }}
                                 dayHeaderContent={(arg) => <DayHeader date={arg.date} pickerDate={pickerDate} />}
                                dayCellClassNames={(arg) => {
                                    const dateStr = format(arg.date, "yyyy-MM-dd");
                                    const dayEvents = events.filter((e) => {
                                        const start = e.start instanceof Date ? e.start : (e.start as any).toDate();
                                        return format(start, "yyyy-MM-dd") === dateStr;
                                    });
                                    const pendingCat = pendingEvents[dateStr];
                                    const isDeleted = pendingCat === "delete";
                                    const hasEvent = !isDeleted && (dayEvents.length > 0 || (pendingCat && pendingCat !== "delete"));
                                    
                                    return [
                                        dateStr === selectedDate ? "selected-day" : "",
                                        hasEvent ? "has-event" : "is-empty"
                                    ].filter(Boolean).join(" ");
                                }}
                                dayCellContent={(arg) => (
                                    <DayCellContent 
                                        arg={arg} 
                                        events={events} 
                                        pendingEvents={pendingEvents} 
                                        isModalOpen={isModalOpen} 
                                    />
                                )}
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
                        className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 text-slate-800 font-bold text-sm active:scale-95 transition-transform"
                    >
                        {title}
                        <ChevronDown size={16} className="text-slate-400" />
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-slate-700 font-bold text-xs active:scale-95 transition-transform">
                            ปฏิทินของฉัน
                        </button>
                        <button
                            onClick={() => {
                                setSelectedDate(format(new Date(), "yyyy-MM-dd"));
                                setIsSummaryModalOpen(false);
                                setIsModalOpen(true);
                            }}
                            className="bg-[#C2185B] text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all hover:bg-[#AD1457] shrink-0"
                        >
                            <Plus size={22} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            {renderPageContent()}

            {/* Navigation */}
            <div className={`mt-auto pt-2 pb-1 transition-all duration-500 ease-in-out ${isModalOpen ? "translate-y-24 opacity-0 h-0 overflow-hidden" : "translate-y-0 opacity-100"}`}>
                <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <EventSummaryModal
                isOpen={isSummaryModalOpen}
                onClose={() => setIsSummaryModalOpen(false)}
                selectedDate={selectedDate}
                events={events}
                onEdit={() => {
                    setIsSummaryModalOpen(false);
                    setIsModalOpen(true);
                }}
            />

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={selectedDate}
                userId={userId || "local-user"}
                setSelectedDate={setSelectedDate}
                events={events}
                pendingEvents={pendingEvents}
                setPendingEvents={setPendingEvents}
            />

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

export default HomeScreen;
