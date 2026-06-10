"use client";

import React, { useEffect, useState } from "react";
import { Bell, User, Users, Check } from "lucide-react";
import { useLiff } from "@/hooks/useLiff";
import { useUserSettingsService, UserSettings } from "@/hooks/useUserSettingsService";
import { useGroupService } from "@/hooks/useGroupService";
import { Group } from "@/types/group.types";
import FriendshipModal from "./components/FriendshipModal";

export default function NotificationSettingScreen() {
    const { userId, getFriendshipFlag } = useLiff();
    const { subscribeToUserSettings, updateUserSettings } = useUserSettingsService();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [isFriendshipModalOpen, setIsFriendshipModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const { subscribeToUserGroups } = useGroupService();

    useEffect(() => {
        if (!userId) return;
        return subscribeToUserSettings(userId, setSettings);
    }, [userId, subscribeToUserSettings]);

    useEffect(() => {
        if (!userId) return;
        return subscribeToUserGroups(userId, setGroups);
    }, [userId, subscribeToUserGroups]);

    const toggleAutoNotify = async () => {
        if (!userId || !settings || isUpdating) return;
        const newValue = !settings.autoNotify;
        if (newValue) {
            const isFriend = await getFriendshipFlag();
            if (!isFriend) { setIsFriendshipModalOpen(true); return; }
        }
        try {
            setIsUpdating(true);
            await updateUserSettings(userId, { autoNotify: newValue });
        } finally {
            setIsUpdating(false);
        }
    };

    const setNotifyDataType = async (type: "user" | "group") => {
        if (!userId || !settings || isUpdating) return;
        try {
            setIsUpdating(true);
            await updateUserSettings(userId, { notifyDataType: type });
            if (type === "group" && groups.length === 1 && settings?.notifyGroupId !== groups[0].id) {
                await updateUserSettings(userId, { notifyGroupId: groups[0].id });
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const isUserSelected = settings?.notifyDataType === "user" || !settings?.notifyDataType;
    const isGroupSelected = settings?.notifyDataType === "group";

    return (
        <div className="flex-grow overflow-y-auto px-4 py-6 space-y-4 bg-[#f8fafc] dark:bg-[#0f172a]">

            {/* Main Toggle */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            <Bell size={18} className="text-slate-700 dark:text-slate-300" />
                        </div>
                        <div>
                            <p className="text-slate-800 dark:text-slate-100 font-medium text-sm">เปิดการแจ้งเตือน</p>
                            <p className="text-slate-400 dark:text-slate-500 text-xs">ส่งเวรลงแชทเมื่อเปิดแอป</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleAutoNotify}
                        disabled={isUpdating}
                        className={`w-10 h-6 p-1 rounded-full transition-colors relative flex items-center shrink-0 ${
                            settings?.autoNotify ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-600"
                        } ${isUpdating ? "opacity-50" : ""}`}
                    >
                        <span className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                            settings?.autoNotify ? "translate-x-4" : "translate-x-0"
                        }`} />
                    </button>
                </div>
                <div className="px-5 pb-4 border-t border-slate-50 dark:border-slate-700/50">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-3 leading-relaxed">
                        ระบบจะส่งข้อมูลเวรของวันนี้ลงในแชทโดยอัตโนมัติ เพื่อให้ระบุเจ้าของเวรได้ทันทีเมื่อเข้ากลุ่ม
                    </p>
                </div>
            </div>

            {/* Data Type Selection */}
            {settings?.autoNotify && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
                            เลือกข้อมูลที่จะส่ง
                        </p>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm">
                            {/* Option: เฉพาะเวรของฉัน */}
                            <button
                                onClick={() => setNotifyDataType("user")}
                                disabled={isUpdating}
                                className="w-full flex items-center gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-700 transition-colors active:bg-slate-50 dark:active:bg-slate-700/50"
                            >
                                <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                    <User size={18} className="text-slate-700 dark:text-slate-300" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-slate-800 dark:text-slate-100 font-medium text-sm">เฉพาะเวรของฉัน</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs">ส่งเฉพาะข้อมูลเวรของคุณคนเดียว</p>
                                </div>
                                {isUserSelected && (
                                    <Check size={16} strokeWidth={2.5} className="text-slate-800 dark:text-slate-100 shrink-0" />
                                )}
                            </button>

                            {/* Option: เวรรวมของกลุ่ม */}
                            <button
                                onClick={() => setNotifyDataType("group")}
                                disabled={isUpdating}
                                className="w-full flex items-center gap-4 px-5 py-4 transition-colors active:bg-slate-50 dark:active:bg-slate-700/50"
                            >
                                <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                    <Users size={18} className="text-slate-700 dark:text-slate-300" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-slate-800 dark:text-slate-100 font-medium text-sm">เวรรวมของกลุ่ม</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs">ส่งข้อมูลเวรของทุกคนในวันที่เลือก</p>
                                </div>
                                {isGroupSelected && (
                                    <Check size={16} strokeWidth={2.5} className="text-slate-800 dark:text-slate-100 shrink-0" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Group List (when group selected) */}
                    {isGroupSelected && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
                                เลือกกลุ่ม
                            </p>

                            {groups.length === 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-3xl px-5 py-4 shadow-sm">
                                    <p className="text-sm text-slate-400 dark:text-slate-500">
                                        ⚠️ ยังไม่มีกลุ่ม กรุณาสร้างกลุ่มก่อน
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm">
                                    {groups.map((group, i) => {
                                        const isSelected = settings?.notifyGroupId === group.id;
                                        const isLast = i === groups.length - 1;
                                        return (
                                            <button
                                                key={group.id}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!userId || isUpdating) return;
                                                    try {
                                                        setIsUpdating(true);
                                                        await updateUserSettings(userId, { notifyGroupId: group.id });
                                                    } finally {
                                                        setIsUpdating(false);
                                                    }
                                                }}
                                                className={`w-full flex items-center gap-4 px-5 py-4 transition-colors active:bg-slate-50 dark:active:bg-slate-700/50 ${
                                                    !isLast ? "border-b border-slate-100 dark:border-slate-700" : ""
                                                }`}
                                            >
                                                <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 text-sm font-bold text-slate-600 dark:text-slate-300">
                                                    {group.name.charAt(0)}
                                                </div>
                                                <span className="flex-1 text-left text-sm font-medium text-slate-800 dark:text-slate-100">
                                                    {group.name}
                                                </span>
                                                {isSelected && (
                                                    <Check size={16} strokeWidth={2.5} className="text-slate-800 dark:text-slate-100 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <FriendshipModal
                isOpen={isFriendshipModalOpen}
                onClose={() => setIsFriendshipModalOpen(false)}
            />
        </div>
    );
}
