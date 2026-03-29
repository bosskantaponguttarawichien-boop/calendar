"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ChevronDown, Share2 } from "lucide-react";
import { Group } from "@/types/group.types";
import MonthPickerModal from "@/screens/home-screen/components/MonthPickerModal";
import { THAI_DAY_NAMES } from "@/components/calendar/CalendarIcon";
import { GroupSwitcher } from "@/components/calendar/GroupSwitcher";
import { useGroupCalendar } from "../hooks/useGroupCalendar";
import { DayCellContent } from "./calendar/DayCellContent";
import { MemberFilters } from "./calendar/MemberFilters";
import { ShareModal } from "./calendar/ShareModal";

interface GroupCalendarScreenProps {
    group: Group;
}

export default function GroupCalendarScreen({ group }: GroupCalendarScreenProps) {
    const {
        calendarRef,
        enrichedEvents,
        isMonthPickerOpen,
        setIsMonthPickerOpen,
        isGroupsMenuOpen,
        setIsGroupsMenuOpen,
        allUserGroups,
        pickerDate,
        title,
        isShareOverlayOpen,
        setIsShareOverlayOpen,
        isSharingOverlay,
        isOverlayLinkCopied,
        overlayInviteError,
        selectedMemberId,
        setSelectedMemberId,
        updateTitle,
        handleMonthSelect,
        handleYearChange,
        handlePickerToday,
        handleOverlayCopyLink,
        handleOverlayInvite
    } = useGroupCalendar(group);

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 relative">
            {/* Super Premium Header */}
            <div className="h-10 mb-2 px-1 flex justify-between items-center transition-all duration-300">
                {/* Left: Month Picker */}
                <button
                    onClick={() => setIsMonthPickerOpen(true)}
                    className="h-10 flex items-center gap-1.5 px-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white dark:border-slate-700/50 shadow-sm hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-95 group/btn outline-none whitespace-nowrap"
                >
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight">{title}</span>
                    <ChevronDown size={12} strokeWidth={3} className="text-slate-400 group-hover/btn:translate-y-0.5 transition-transform" />
                </button>

                {/* Right: Group Identity + Actions */}
                <div className="flex items-center gap-1.5">
                    <GroupSwitcher 
                        currentGroup={group}
                        allUserGroups={allUserGroups}
                        isMenuOpen={isGroupsMenuOpen}
                        setIsMenuOpen={setIsGroupsMenuOpen}
                    />

                    {/* Share Button */}
                    <button
                        onClick={() => setIsShareOverlayOpen(true)}
                        className="w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full border-2 border-white dark:border-slate-800 shadow-md text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-90"
                        title="แชร์กลุ่ม"
                    >
                        <Share2 size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Calendar */}
            <div className="flex-grow bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-white/20 dark:border-slate-700/30 overflow-hidden mb-4 relative z-0">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={false}
                    locale="th"
                    height="100%"
                    datesSet={updateTitle}
                    dayHeaderContent={(arg) => (
                        <span className="text-[10px] font-semibold text-slate-400 py-2">
                            {THAI_DAY_NAMES[arg.date.getDay()]}
                        </span>
                    )}
                    dayCellContent={(arg) => (
                        <DayCellContent 
                            arg={arg} 
                            groupEvents={enrichedEvents} 
                            members={group.members} 
                            isSingleView={selectedMemberId !== null} 
                        />
                    )}
                />
            </div>
            
            {/* Member List Legend & Filter */}
            <MemberFilters 
                members={group.members}
                selectedMemberId={selectedMemberId}
                setSelectedMemberId={setSelectedMemberId}
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

            {/* Share Modal Popup */}
            <ShareModal 
                isOpen={isShareOverlayOpen}
                onClose={() => setIsShareOverlayOpen(false)}
                onInvite={handleOverlayInvite}
                onCopyLink={handleOverlayCopyLink}
                isSharing={isSharingOverlay}
                isLinkCopied={isOverlayLinkCopied}
                inviteError={overlayInviteError}
            />
        </div>
    );
}
