"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import { ChevronDown, Plus, LayoutGrid } from "lucide-react";
import { format } from "date-fns";

import SettingScreen from "@/screens/setting-screen/SettingScreen";
import ResultScreen from "@/screens/result-screen/ResultScreen";
import GroupScreen from "@/screens/group-screen/GroupScreen";
import EventModal from "./components/EventModal";
import MonthPickerModal from "./components/MonthPickerModal";
import NavBar from "./components/NavBar";
import { useCalendarController } from "./hooks/useCalendarController";
import { useLiff } from "@/hooks/useLiff";
import { useGroupService } from "@/hooks/useGroupService";
import EventSummaryModal from "./components/EventSummaryModal";
import { Group } from "@/types/group.types";
import { useRouter } from "next/navigation";
import { DayCellContent } from "./components/calendar/DayCellContent";
import { THAI_DAY_NAMES } from "@/components/calendar/CalendarIcon";
import { GroupSwitcher } from "@/components/calendar/GroupSwitcher";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const CALENDAR_PLUGINS = [dayGridPlugin, interactionPlugin];
const MODAL_APPROX_HEIGHT = 220;

const DayHeader = React.memo(({ date, pickerDate }: { date: Date; pickerDate: Date }) => {
    const dayName = THAI_DAY_NAMES[date.getDay()];
    const today = new Date();
    const isTodayMonth =
        pickerDate.getMonth() === today.getMonth() &&
        pickerDate.getFullYear() === today.getFullYear();
    const isTodayDay = isTodayMonth && date.getDate() === today.getDate();

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

const HomeScreen = () => {
    const router = useRouter();
    const { userId, displayName, pictureUrl, loading: liffLoading } = useLiff();
    const { subscribeToUserGroups } = useGroupService();
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

    const [allUserGroups, setAllUserGroups] = React.useState<Group[]>([]);
    const [isGroupsMenuOpen, setIsGroupsMenuOpen] = React.useState(false);

    // Fetch user groups to show switcher
    React.useEffect(() => {
        if (!userId) return;
        const unsub = subscribeToUserGroups(userId, (groups) => setAllUserGroups(groups));
        return () => unsub();
    }, [userId, subscribeToUserGroups]);

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
        <div className={`px-3 pb-2 max-w-lg mx-auto h-[100dvh] flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 ${isModalOpen ? "pt-0" : "pt-2"} relative`}>
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
                        {allUserGroups.length > 0 && (
                            <GroupSwitcher 
                                allUserGroups={allUserGroups}
                                isMenuOpen={isGroupsMenuOpen}
                                setIsMenuOpen={setIsGroupsMenuOpen}
                                showMyCalendarOption={true}
                            />
                        )}
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
            <div className={`mt-auto pt-2 pb-1 transition-all duration-500 ease-in-out ${isModalOpen ? "translate-y-24 opacity-0 h-0 overflow-hidden" : "translate-y-0 opacity-100"}`}>
                <NavBar activeTab={activeTab} onTabChange={(tab) => {
                    setActiveTab(tab);
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
        </div>
    );
};

export default HomeScreen;
