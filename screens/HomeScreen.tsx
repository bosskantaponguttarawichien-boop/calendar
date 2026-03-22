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
import { CATEGORY_COLORS } from "@/lib/constants";
import { useCalendarController } from "@/hooks/useCalendarController";

const THAI_DAY_NAMES = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const CALENDAR_PLUGINS = [dayGridPlugin, interactionPlugin];
const MODAL_APPROX_HEIGHT = 200;

const _today = new Date();
const FALLBACK_EVENTS = [
    { title: "Meeting", date: format(_today, "yyyy-MM-dd") },
    { title: "Appointment", date: format(new Date(_today.getFullYear(), _today.getMonth(), _today.getDate() + 2), "yyyy-MM-dd") },
    { title: "Deadline", date: format(new Date(_today.getFullYear(), _today.getMonth(), _today.getDate() - 3), "yyyy-MM-dd") },
];

const HomeScreen = () => {
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
    } = useCalendarController();

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
                                dayHeaderFormat={{ weekday: "short" }}
                                dayHeaderContent={(arg) => {
                                    const dayName = THAI_DAY_NAMES[arg.date.getDay()];
                                    const today = new Date();
                                    const isTodayMonth =
                                        pickerDate.getMonth() === today.getMonth() &&
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
                                dayCellContent={(arg) => {
                                    const dateStr = format(arg.date, "yyyy-MM-dd");
                                    const dayEvents = events.filter((e) => {
                                        const start = e.start instanceof Date ? e.start : (e.start as any).toDate();
                                        return format(start, "yyyy-MM-dd") === dateStr;
                                    });

                                    const pendingCat = pendingEvents[dateStr];
                                    const isDeleted = pendingCat === "delete";
                                    const isCustom = pendingCat?.startsWith("custom:");
                                    const actualCatId = isCustom ? "custom" : pendingCat;

                                    return (
                                        <div className="flex flex-col items-center w-full h-full relative">
                                            <div className="fc-daygrid-day-number">{arg.dayNumberText}</div>
                                            {!isDeleted && (
                                                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center px-0.5 max-h-[14px] overflow-hidden">
                                                    {!pendingCat &&
                                                        dayEvents.map((event, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="w-1.5 h-1.5 rounded-full z-10"
                                                                style={{ backgroundColor: event.color || CATEGORY_COLORS[event.category] || "#334155" }}
                                                            />
                                                        ))}
                                                    {pendingCat && (
                                                        <div
                                                            className="w-1.5 h-1.5 rounded-full z-10 opacity-50 animate-pulse"
                                                            style={{ backgroundColor: CATEGORY_COLORS[actualCatId] || "#334155" }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
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
                                setIsSummaryModalOpen(false);
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
                userId="local-user"
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
