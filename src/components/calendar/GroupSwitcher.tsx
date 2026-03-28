"use client";

import React from "react";
import { ChevronDown, LayoutGrid, Users } from "lucide-react";
import { Group } from "@/types/group.types";
import { useRouter } from "next/navigation";

interface GroupSwitcherProps {
    currentGroup?: Group;
    allUserGroups: Group[];
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
    showMyCalendarOption?: boolean;
    className?: string;
}

export const GroupSwitcher: React.FC<GroupSwitcherProps> = ({
    currentGroup,
    allUserGroups,
    isMenuOpen,
    setIsMenuOpen,
    showMyCalendarOption = true,
    className = ""
}) => {
    const router = useRouter();

    return (
        <div className={`relative ${className}`}>
            {/* Group Identity Pill (Switcher) */}
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-11 flex items-center gap-2.5 px-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white dark:border-slate-700/50 shadow-sm hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-95 group outline-none"
            >
                <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-sm overflow-hidden text-[10px]">
                    {currentGroup?.image || currentGroup?.icon ? (
                        <img src={currentGroup.image || currentGroup.icon} alt={currentGroup.name} className="w-full h-full object-cover" />
                    ) : showMyCalendarOption && !currentGroup ? (
                        <div className="text-indigo-600 dark:text-indigo-400">
                             <LayoutGrid size={12} strokeWidth={3} />
                        </div>
                    ) : (
                        <Users size={14} strokeWidth={3} />
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        {currentGroup?.name || "ปฏิทินของฉัน"}
                    </span>
                    <ChevronDown 
                        size={14} 
                        strokeWidth={3}
                        className={`text-slate-400 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`} 
                    />
                </div>
            </button>

            {/* Group Switcher Overlay */}
            {isMenuOpen && (
                <div className="absolute top-12 right-0 z-[150] w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-slate-800 p-2 animate-in zoom-in-95 fade-in duration-200 origin-top-right">
                    <div className="max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                        {showMyCalendarOption && (
                            <div className="px-3 pt-3 pb-2">
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">ตารางส่วนตัว</span>
                                {/* Option: My Calendar */}
                                <button
                                    onClick={() => {
                                        router.push("/");
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all ${
                                        !currentGroup 
                                        ? "bg-indigo-600/10 text-indigo-600 border border-indigo-100/50" 
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 transition-transform">
                                        <LayoutGrid size={16} strokeWidth={2.5} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">ปฏิทินของฉัน</p>
                                        <p className="text-[9px] text-slate-400 font-bold leading-tight">Private Schedule</p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {showMyCalendarOption && <div className="px-3 py-2">
                            <div className="h-px bg-slate-100/50 dark:bg-slate-800/50 w-full" />
                        </div>}

                        <div className="px-3 pb-3">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">กลุ่มของคุณ</span>
                            <div className="space-y-1">
                                {allUserGroups.map((g) => (
                                    <button
                                        key={g.id}
                                        onClick={() => {
                                            if (g.id !== currentGroup?.id) {
                                                router.push(`/group/${g.id}`);
                                            }
                                            setIsMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all ${
                                            currentGroup && g.id === currentGroup.id 
                                            ? "bg-slate-900 text-white shadow-md shadow-slate-200 dark:shadow-none" 
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden ${currentGroup && g.id === currentGroup.id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}>
                                            {g.image || g.icon ? (
                                                <img src={g.image || g.icon} alt={g.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Users size={14} strokeWidth={currentGroup && g.id === currentGroup.id ? 2.5 : 2} />
                                            )}
                                        </div>
                                        <div className="text-left overflow-hidden translate-y-[-1px]">
                                            <p className={`text-xs font-black truncate tracking-tight ${currentGroup && g.id === currentGroup.id ? "text-white" : "text-slate-800 dark:text-slate-100"}`}>{g.name}</p>
                                            <p className={`text-[9px] ${currentGroup && g.id === currentGroup.id ? "text-white/60" : "text-slate-400"} font-bold leading-none`}>{g.members?.length || 0} สมาชิก</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Overlay click to close switcher */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[140]" onClick={() => setIsMenuOpen(false)} />
            )}
        </div>
    );
};
