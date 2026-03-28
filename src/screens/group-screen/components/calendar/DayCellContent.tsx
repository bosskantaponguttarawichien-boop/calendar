import React from "react";
import { format } from "date-fns";
import { EventData } from "@/types/event.types";
import { CalendarIcon } from "@/components/calendar/CalendarIcon";

interface DayCellContentProps {
    arg: any;
    groupEvents: EventData[];
    members: any[];
    isSingleView: boolean;
}

export const DayCellContent: React.FC<DayCellContentProps> = ({ 
    arg, 
    groupEvents, 
    members, 
    isSingleView 
}) => {
    const dateStr = format(arg.date, "yyyy-MM-dd");
    const dayEvents = groupEvents.filter(e => {
        const start = e.start instanceof Date ? e.start : (e.start as any).toDate();
        return format(start, "yyyy-MM-dd") === dateStr;
    });

    if (isSingleView) {
        const event = dayEvents[0];
        
        return (
            <div className="absolute inset-0 flex items-center justify-center p-[2px]">
                {event ? (
                    <div 
                        className="w-full h-full flex flex-col items-center justify-between py-1.5 rounded-[1.25rem] transition-all duration-300 shadow-sm border border-white/20"
                        style={{ backgroundColor: event.color || "#334155" }}
                    >
                        {/* Day Number Circle */}
                        <div className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-[9px] font-black text-slate-800">
                            {arg.dayNumberText}
                        </div>

                        {/* Icon */}
                        <div className="flex-grow flex items-center justify-center -my-1">
                            <CalendarIcon 
                                iconName={event.icon || ""} 
                                size={18} 
                                className="text-white drop-shadow-sm" 
                                strokeWidth={2.5} 
                            />
                        </div>

                        {/* Label */}
                        <span className="text-[7px] font-black text-white/90 uppercase tracking-tighter text-center leading-none mb-0.5 px-0.5 truncate w-full">
                            {event.title || "เวร"}
                        </span>
                    </div>
                ) : (
                    /* Empty Day in Single View */
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-400 dark:text-slate-500 absolute top-1.5">
                        {arg.dayNumberText}
                    </div>
                )}
            </div>
        );
    }

    // Default Merge View Style
    return (
        <div className="absolute inset-0 flex flex-col items-center pt-1 pb-1 overflow-hidden">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">{arg.dayNumberText}</span>
            <div className="flex flex-col gap-0.5 w-full px-0.5 mt-auto">
                {dayEvents.slice(0, 3).map((event) => {
                    const member = members.find(m => m.id === event.userId);
                    const nameLabel = member ? member.displayName.substring(0, 2) : "??";
                    return (
                        <div 
                            key={event.id} 
                            className="flex items-center gap-0.5 px-1 py-0.5 rounded-sm text-[8px] text-white truncate shadow-sm"
                            style={{ backgroundColor: event.color || "#334155" }}
                        >
                            <span className="font-bold opacity-80 shrink-0">{nameLabel}:</span>
                            <span className="truncate">{event.title || "เวร"}</span>
                        </div>
                    );
                })}
                {dayEvents.length > 3 && (
                    <div className="text-[7px] text-slate-400 text-center font-bold">+{dayEvents.length - 3}</div>
                )}
            </div>
        </div>
    );
};

export default DayCellContent;
