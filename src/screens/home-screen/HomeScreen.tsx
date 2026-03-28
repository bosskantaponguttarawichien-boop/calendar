"use client";

import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ChevronDown, Plus, HelpCircle, Sun, CloudSun, Moon, SunMoon, MoonStar } from "lucide-react";
import { format } from "date-fns";

const ICON_MAP: Record<string, any> = {
    morning: Sun,
    afternoon: CloudSun,
    night: Moon,
    allday: SunMoon,
    nightafternoon: MoonStar,
    Sun: Sun,
    CloudSun: CloudSun,
    Moon: Moon,
    SunMoon: SunMoon,
    MoonStar: MoonStar,
};

import SettingScreen from "@/screens/setting-screen/SettingScreen";
import ResultScreen from "@/screens/result-screen/ResultScreen";
import GroupScreen from "@/screens/group-screen/GroupScreen";
import GroupCalendarScreen from "@/screens/group-screen/components/GroupCalendarScreen";
import EventModal from "./components/EventModal";
import MonthPickerModal from "./components/MonthPickerModal";
import { FlexMessageEmulator } from "@/components/debug/FlexMessageEmulator";
import { buildShiftCarouselMessage } from "@/lib/flexMessageBuilder";
import NavBar from "./components/NavBar";
import { useCalendarController } from "./hooks/useCalendarController";
import { useLiff } from "@/hooks/useLiff";
import EventSummaryModal from "./components/EventSummaryModal";
import { Group } from "@/types/group.types";

const THAI_DAY_NAMES = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const CALENDAR_PLUGINS = [dayGridPlugin, interactionPlugin];
const MODAL_APPROX_HEIGHT = 220;

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
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-slate-800 dark:border-b-slate-200" />
            )}
        </div>
    );
});
DayHeader.displayName = "DayHeader";

const DayCellContent = React.memo(({
    arg,
    groupedEvents,
    pendingEvents,
    isModalOpen,
    shifts
}: {
    arg: any;
    groupedEvents: Record<string, any[]>;
    pendingEvents: Record<string, string | number>;
    isModalOpen: boolean;
    shifts: any[];
}) => {
    const dateStr = format(arg.date, "yyyy-MM-dd");
    const dayEvents = groupedEvents[dateStr] || [];

    const pendingCat = pendingEvents[dateStr];
    const isDeleted = pendingCat === "delete";
    const hasExistingEvent = dayEvents.length > 0;

    const activeCatId = (pendingCat && !isDeleted) ? pendingCat : (hasExistingEvent ? dayEvents[0].shiftId : null);
    const displayCategory = shifts.find(s => s.id === activeCatId);

    const color = isDeleted
        ? ""
        : (pendingCat && pendingCat !== "delete")
            ? (displayCategory?.color || "#334155")
            : (hasExistingEvent ? (dayEvents[0].color || displayCategory?.color || "#334155") : "");

    const IconComponent = useMemo(() => {
        if (!displayCategory) return null;
        if (typeof displayCategory.icon !== 'string') return displayCategory.icon;
        return ICON_MAP[displayCategory.icon] || HelpCircle;
    }, [displayCategory]);

    const isPast = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const cellDate = new Date(arg.date);
        cellDate.setHours(0, 0, 0, 0);
        return cellDate < today;
    }, [arg.date]);

    return (
        <div
            className="absolute inset-0 flex flex-col items-center pt-1 pb-2 transition-all duration-300"
            style={{ 
                backgroundColor: color || "transparent",
                opacity: (isPast && color) ? 0.45 : 1
            }}
        >
            <div className={`pill-date-circle shrink-0 z-10 ${isPast && color ? "opacity-70" : ""}`}>{arg.dayNumberText}</div>

            {displayCategory && IconComponent && !isDeleted && (
                <div className="flex flex-col items-center justify-center flex-grow w-full animate-in zoom-in-50 duration-300 z-10">
                    <div className="text-white">
                        <IconComponent size={!isModalOpen ? 16 : 14} strokeWidth={2.5} />
                    </div>
                    {!isModalOpen && (
                        <span className="text-[8px] font-black text-white uppercase tracking-tighter text-center leading-[1] px-0.5">
                            {displayCategory.title || displayCategory.label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
});
DayCellContent.displayName = "DayCellContent";

const HomeScreen = () => {
    const { userId, displayName, pictureUrl, loading: liffLoading } = useLiff();
    const {
        calendarRef,
        calendarWrapperRef,
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
        updateTitle,
        shifts,
    } = useCalendarController(userId);

    const [selectedGroup, setSelectedGroup] = React.useState<Group | null>(null);

    if (liffLoading) {
        return (
            <div className="flex items-center justify-center h-[100dvh] bg-[#f8fafc] dark:bg-[#0f172a]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-slate-200"></div>
            </div>
        );
    }

    const renderPageContent = () => {
        switch (activeTab) {
            case "setting":
                return <SettingScreen user={{ displayName, pictureUrl }} />;
            case "result":
                return <ResultScreen events={events} shifts={shifts} pickerDate={pickerDate} />;
            case "group":
                if (selectedGroup) {
                    return <GroupCalendarScreen
                        group={selectedGroup}
                        onBack={() => setSelectedGroup(null)}
                    />;
                }
                return <GroupScreen onGroupClick={setSelectedGroup} />;
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
                                initialDate={pickerDate}
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
                                datesSet={updateTitle}
                                dayCellClassNames={(arg) => {
                                    const dateStr = format(arg.date, "yyyy-MM-dd");
                                    const dayEvents = groupedEvents[dateStr] || [];
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
                                        groupedEvents={groupedEvents}
                                        pendingEvents={pendingEvents}
                                        isModalOpen={isModalOpen}
                                        shifts={shifts}
                                    />
                                )}
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`px-3 pb-2 max-w-lg mx-auto h-[100dvh] flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 ${isModalOpen ? "pt-0" : "pt-2"}`}>
            {/* Header — only show on home tab */}
            {activeTab === "home" && (
                <div className={`flex justify-between items-center shrink-0 transition-all duration-500 ease-in-out ${isModalOpen ? "h-0 mb-0 pointer-events-none opacity-0 overflow-hidden" : "h-12 mb-2 opacity-100"}`}>
                    <button
                        onClick={() => setIsMonthPickerOpen(true)}
                        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm active:scale-95 transition-transform"
                    >
                        {title}
                        <ChevronDown size={16} className="text-slate-400" />
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-slate-700 dark:text-slate-200 font-bold text-xs active:scale-95 transition-transform">
                            ปฏิทินของฉัน
                        </button>
                        <button
                            onClick={() => {
                                const today = new Date();
                                const isSameMonth = pickerDate.getMonth() === today.getMonth() &&
                                    pickerDate.getFullYear() === today.getFullYear();
                                const defaultDate = isSameMonth ? today : pickerDate;
                                setSelectedDate(format(defaultDate, "yyyy-MM-dd"));
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
            <div className={`mt-auto pt-2 pb-1 transition-all duration-500 ease-in-out ${isModalOpen || selectedGroup ? "translate-y-24 opacity-0 h-0 overflow-hidden" : "translate-y-0 opacity-100"}`}>
                <NavBar activeTab={activeTab} onTabChange={(tab) => {
                    setActiveTab(tab);
                    if (tab !== "group") setSelectedGroup(null);
                }} />
            </div>

            <EventSummaryModal
                isOpen={isSummaryModalOpen}
                onClose={() => setIsSummaryModalOpen(false)}
                selectedDate={selectedDate}
                events={events}
                shifts={shifts}
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
                shifts={shifts}
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

            {/* Debug Section for Localhost - Commented out as requested
            {typeof window !== "undefined" && window.location.hostname === "localhost" && (
                <div style={{ marginTop: '40px', padding: '20px', borderTop: '2px dashed #ccc', paddingBottom: '100px' }}>
                    <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>LINE Flex Message Preview (Local Only)</h3>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <FlexMessageEmulator json={
                            buildShiftCarouselMessage(
                                { title: "เวรเช้า", startTime: "08:00", endTime: "16:00", color: "#f97316", icon: "morning" },
                                { title: "เวรดึก", startTime: "00:00", endTime: "08:00", color: "#8b5cf6", icon: "night" },
                                "อ. 24 มี.ค.",
                                "พ. 25 มี.ค."
                            )
                        } />
                    </div>
                </div>
            )}
            */}
        </div>
    );
};

export default HomeScreen;
