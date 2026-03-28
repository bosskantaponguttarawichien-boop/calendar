import React, { useMemo } from "react";
import { format } from "date-fns";
import { ICON_MAP } from "@/components/calendar/CalendarIcon";
import { HelpCircle } from "lucide-react";

interface DayCellContentProps {
    arg: any;
    groupedEvents: Record<string, any[]>;
    pendingEvents: Record<string, string | number>;
    isModalOpen: boolean;
    shifts: any[];
}

export const DayCellContent: React.FC<DayCellContentProps> = React.memo(({
    arg,
    groupedEvents,
    pendingEvents,
    isModalOpen,
    shifts
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
