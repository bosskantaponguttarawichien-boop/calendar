"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import { format, setMonth, setYear } from "date-fns";
import { Group } from "@/types/group.types";
import { EventData } from "@/types/event.types";
import { useEventService } from "@/hooks/useEventService";
import { useGroupService } from "@/hooks/useGroupService";
import { useLiff } from "@/hooks/useLiff";
import { shareGroupInvitation, LIFF_ID } from "@/lib/liff";
import { THAI_MONTHS } from "@/lib/constants";
import { useShiftController } from "@/hooks/useShiftController";

export const useGroupCalendar = (group: Group) => {
    const { userId } = useLiff();
    const { subscribeToUserGroups } = useGroupService();
    const calendarRef = useRef<FullCalendar>(null);
    const { subscribeToMultiUserEvents } = useEventService();

    // Data & UI States
    const [events, setEvents] = useState<EventData[]>([]);
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [isGroupsMenuOpen, setIsGroupsMenuOpen] = useState(false);
    const [allUserGroups, setAllUserGroups] = useState<Group[]>([]);
    const [pickerDate, setPickerDate] = useState(new Date());
    const [title, setTitle] = useState(() => {
        const d = new Date();
        return `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
    });

    // Share Overlay States
    const [isShareOverlayOpen, setIsShareOverlayOpen] = useState(false);
    const [isSharingOverlay, setIsSharingOverlay] = useState(false);
    const [isOverlayLinkCopied, setIsOverlayLinkCopied] = useState(false);
    const [overlayInviteError, setOverlayInviteError] = useState<string | null>(null);

    // Visible range for data fetching
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    // Filter state
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(() => {
        return group.members.length === 1 ? group.members[0].id : null;
    });

    // Default to the only member if there is just one
    useEffect(() => {
        if (!selectedMemberId && group.members.length === 1) {
            setSelectedMemberId(group.members[0].id);
        }
    }, [group.members, selectedMemberId]);

    // Fetch Shifts related to the selected member (falling back to current user)
    const { shifts } = useShiftController(selectedMemberId || userId || undefined);
    
    // Create a mapping of shiftId -> Visual Data (Color, Icon)
    const shiftMap = useMemo(() => {
        const map = new Map<string, any>();
        shifts.forEach(s => {
            map.set(s.id, { 
                color: s.color, 
                icon: s.icon, 
                title: s.title 
            });
        });
        return map;
    }, [shifts]);

    const enrichedEvents = useMemo(() => {
        const filtered = selectedMemberId ? events.filter(e => e.userId === selectedMemberId) : events;
        return filtered.map(e => {
            const visual = shiftMap.get(e.shiftId);
            return {
                ...e,
                color: visual?.color || e.color || "#334155",
                icon: visual?.icon || e.icon || "",
                title: visual?.title || e.title || "เวร"
            };
        });
    }, [events, selectedMemberId, shiftMap]);

    // Subscriptions
    useEffect(() => {
        if (!userId) return;
        const unsub = subscribeToUserGroups(userId, (fetchedGroups) => {
            setAllUserGroups(fetchedGroups);
        });
        return () => unsub();
    }, [userId, subscribeToUserGroups]);

    useEffect(() => {
        if (!group.memberIds || group.memberIds.length === 0) return;
        
        const unsub = subscribeToMultiUserEvents(
            group.memberIds, 
            (fetchedEvents) => setEvents(fetchedEvents),
            startDate,
            endDate
        );
        return () => unsub();
    }, [group.memberIds, subscribeToMultiUserEvents, startDate, endDate]);

    const updateTitle = useCallback(() => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            const date = api.getDate();
            const month = THAI_MONTHS[date.getMonth()];
            const year = date.getFullYear() + 543;
            setTitle(`${month} ${year}`);
            setPickerDate(date);

            const { activeStart, activeEnd } = api.view;
            setStartDate(activeStart);
            setEndDate(activeEnd);
        }
    }, []);

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

    const handleOverlayCopyLink = async () => {
        const link = `https://liff.line.me/${LIFF_ID}?groupId=${group.id}`;
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(link);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = link;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
            }
            setIsOverlayLinkCopied(true);
            setTimeout(() => setIsOverlayLinkCopied(false), 3000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleOverlayInvite = async () => {
        setOverlayInviteError(null);
        setIsSharingOverlay(true);
        try {
            const result = await shareGroupInvitation(group.id, group.name);
            if (!result.success && result.reason !== "cancelled") {
                setOverlayInviteError(result.reason === "api_unavailable" ? "LINE Share ไม่พร้อมใช้งาน" : "เกิดข้อผิดพลาด");
                handleOverlayCopyLink();
            }
        } catch (error) {
            console.error("Share action failed:", error);
            setOverlayInviteError("เกิดข้อผิดพลาด");
            handleOverlayCopyLink();
        } finally {
            setIsSharingOverlay(false);
        }
    };

    return {
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
    };
};
