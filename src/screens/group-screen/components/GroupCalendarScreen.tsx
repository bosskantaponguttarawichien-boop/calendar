"use client";

import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ChevronLeft, HelpCircle, Sun, CloudSun, Moon, SunMoon, MoonStar } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import { Group } from "@/types/group.types";
import { EventData } from "@/types/event.types";

const ICON_MAP: Record<string, any> = {
    morning: Sun,
    afternoon: CloudSun,
    night: Moon,
    allday: SunMoon,
    nightafternoon: MoonStar,
};

const THAI_DAY_NAMES = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

interface GroupCalendarScreenProps {
    group: Group;
    onBack: () => void;
}

const DayCellContent = ({ arg, groupEvents }: { arg: any, groupEvents: EventData[] }) => {
    const dateStr = format(arg.date, "yyyy-MM-dd");
    const dayEvents = groupEvents.filter(e => format(e.start, "yyyy-MM-dd") === dateStr);

    return (
        <div className="absolute inset-0 flex flex-col items-center pt-1 pb-1 overflow-hidden">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">{arg.dayNumberText}</span>
            <div className="flex flex-col gap-0.5 w-full px-0.5 mt-auto">
                {dayEvents.slice(0, 3).map((event) => {
                    const Icon = ICON_MAP[event.icon || ""] || HelpCircle;
                    return (
                        <div 
                            key={event.id} 
                            className="flex items-center gap-0.5 px-1 py-0.5 rounded-sm text-[8px] text-white truncate"
                            style={{ backgroundColor: event.color || "#334155" }}
                        >
                            <Icon size={8} strokeWidth={3} />
                            <span className="truncate">{event.title}</span>
                        </div>
                    );
                })}
                {dayEvents.length > 3 && (
                    <div className="text-[7px] text-slate-400 text-center">+{dayEvents.length - 3}</div>
                )}
            </div>
        </div>
    );
};

export default function GroupCalendarScreen({ group, onBack }: GroupCalendarScreenProps) {
    // Mock events for group members
    const mockEvents: EventData[] = useMemo(() => {
        const today = new Date();
        const events: EventData[] = [];
        const baseDate = startOfMonth(today);
        
        group.members.forEach((member, memberIdx) => {
            // Add 1-2 shifts for each member
            for (let i = 0; i < 5; i++) {
                const day = (memberIdx * 3) + (i * 5) + 2;
                const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
                const shiftTypes = [
                    { title: "เช้า", color: "#F59E0B", icon: "morning" },
                    { title: "บ่าย", color: "#3B82F6", icon: "afternoon" },
                    { title: "ดึก", color: "#6366F1", icon: "night" }
                ];
                const shift = shiftTypes[(memberIdx + i) % 3];
                
                events.push({
                    id: `event-${member.id}-${i}`,
                    userId: member.id,
                    title: `${member.displayName.substring(0, 3)}: ${shift.title}`,
                    shiftId: `shift-${i}`,
                    color: shift.color,
                    icon: shift.icon,
                    start: date,
                    end: date,
                });
            }
        });
        return events;
    }, [group]);

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 px-1">
                <button 
                    onClick={onBack}
                    className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm active:scale-95 transition-transform"
                >
                    <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {group.name}
                        <span className="text-xs font-normal text-slate-400">({group.members.length} สมาชิก)</span>
                    </h2>
                    <p className="text-[10px] text-slate-400">ตารางเวรรวมของสมาชิกในกลุ่ม</p>
                </div>
            </div>

            {/* Calendar */}
            <div className="flex-grow bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-white/20 dark:border-slate-700/30 overflow-hidden mb-2">
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={false}
                    locale="th"
                    height="100%"
                    dayHeaderContent={(arg) => (
                        <span className="text-[10px] font-semibold text-slate-400 py-2">
                            {THAI_DAY_NAMES[arg.date.getDay()]}
                        </span>
                    )}
                    dayCellContent={(arg) => (
                        <DayCellContent arg={arg} groupEvents={mockEvents} />
                    )}
                />
            </div>
            
            {/* Member List Legend */}
            <div className="flex flex-wrap gap-2 px-2 pb-2">
                {group.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{member.displayName}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
