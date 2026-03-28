"use client";

import React, { useEffect, useState } from "react";
import { Bell, User, Users, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/hooks/useLiff";
import { useUserSettingsService, UserSettings } from "@/hooks/useUserSettingsService";
import FriendshipModal from "./components/FriendshipModal";

export default function NotificationSettingScreen() {
    const router = useRouter();
    const { userId, getFriendshipFlag } = useLiff();
    const { subscribeToUserSettings, updateUserSettings } = useUserSettingsService();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [isFriendshipModalOpen, setIsFriendshipModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const unsub = subscribeToUserSettings(userId, (newSettings) => {
            setSettings(newSettings);
        });
        return unsub;
    }, [userId, subscribeToUserSettings]);

    const toggleAutoNotify = async () => {
        if (!userId || !settings || isUpdating) return;
        const newValue = !settings.autoNotify;

        // If turning ON, check friendship status first
        if (newValue === true) {
            const isFriend = await getFriendshipFlag();
            if (!isFriend) {
                setIsFriendshipModalOpen(true);
                return;
            }
        }

        try {
            setIsUpdating(true);
            await updateUserSettings(userId, { autoNotify: newValue });
        } catch (err) {
            console.error("Failed to toggle auto notify", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const setNotifyDataType = async (type: "user" | "group") => {
        if (!userId || !settings || isUpdating) return;
        try {
            setIsUpdating(true);
            await updateUserSettings(userId, { notifyDataType: type });
        } catch (err) {
            console.error("Failed to update notify data type", err);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
            <div className="flex-grow overflow-y-auto px-4 py-6 space-y-4">
                {/* Main Toggle Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-white dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm">เปิดการแจ้งเตือน</h2>
                                <p className="text-slate-400 dark:text-slate-500 text-[11px]">ส่งเวรลงแชทเมื่อเปิดแอป</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleAutoNotify}
                            disabled={isUpdating}
                            className={`w-12 h-7 p-1 rounded-full transition-all duration-300 relative flex items-center ${
                                settings?.autoNotify ? 'bg-indigo-500 shadow-lg shadow-indigo-500/30' : 'bg-slate-200 dark:bg-slate-700'
                            } ${isUpdating ? 'opacity-50' : ''}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 transform ${
                                settings?.autoNotify ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                        </button>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-50 dark:border-slate-700/50">
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">
                            ระบบจะส่งข้อมูลเวรของวันนี้ลงในแชทโดยอัตโนมัติ เพื่อให้ระบุเจ้าของเวรได้ทันทีเมื่อเข้ากลุ่ม
                        </p>
                    </div>
                </div>

                {/* Data Selection Section */}
                {settings?.autoNotify && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                            เลือกข้อมูลที่จะส่ง
                        </p>
                        
                        <div className="grid grid-cols-1 gap-2.5">
                            {/* Option 1: User only */}
                            <button
                                onClick={() => setNotifyDataType("user")}
                                className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                                    settings?.notifyDataType === "user" || !settings?.notifyDataType
                                        ? "bg-white dark:bg-slate-800 border-indigo-500 shadow-md"
                                        : "bg-white/50 dark:bg-slate-800/50 border-transparent grayscale-[0.5] opacity-70"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    settings?.notifyDataType === "user" || !settings?.notifyDataType
                                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"
                                        : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                                }`}>
                                    <User size={20} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className={`font-bold text-xs ${
                                        settings?.notifyDataType === "user" || !settings?.notifyDataType
                                            ? "text-slate-800 dark:text-white"
                                            : "text-slate-500 dark:text-slate-400"
                                    }`}>เฉพาะเวรของฉัน</p>
                                    <p className="text-[9px] text-slate-400 dark:text-slate-500">ส่งเฉพาะข้อมูลเวรของคุณคนเดียว</p>
                                </div>
                                {(settings?.notifyDataType === "user" || !settings?.notifyDataType) && (
                                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white scale-110 shadow-sm animate-in zoom-in duration-300">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                )}
                            </button>

                            {/* Option 2: Group */}
                            <button
                                onClick={() => setNotifyDataType("group")}
                                className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                                    settings?.notifyDataType === "group"
                                        ? "bg-white dark:bg-slate-800 border-indigo-500 shadow-md"
                                        : "bg-white/50 dark:bg-slate-800/50 border-transparent grayscale-[0.5] opacity-70"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    settings?.notifyDataType === "group"
                                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"
                                        : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                                }`}>
                                    <Users size={20} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className={`font-bold text-xs ${
                                        settings?.notifyDataType === "group"
                                            ? "text-slate-800 dark:text-white"
                                            : "text-slate-500 dark:text-slate-400"
                                    }`}>เวรรวมของกลุ่ม</p>
                                    <p className="text-[9px] text-slate-400 dark:text-slate-500">ส่งข้อมูลเวรของทุกคนในวันที่เลือก</p>
                                </div>
                                {settings?.notifyDataType === "group" && (
                                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white scale-110 shadow-sm animate-in zoom-in duration-300">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <FriendshipModal 
                isOpen={isFriendshipModalOpen} 
                onClose={() => setIsFriendshipModalOpen(false)} 
            />
        </div>
    );
}
