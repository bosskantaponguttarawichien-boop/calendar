"use client";

import React from "react";
import { Palette, ChevronRight, LogOut, User, ClipboardList, Moon, Bell } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { useUserSettingsService, UserSettings } from "@/hooks/useUserSettingsService";
import { useLiff } from "@/hooks/useLiff";
import { useEffect, useState } from "react";
import FriendshipModal from "./components/FriendshipModal";

type SettingItem = { icon: React.ElementType; label: string; desc: string; href?: string };

const settingItems: { group: string; items: SettingItem[] }[] = [
  {
    group: "ทั่วไป",
    items: [
      { icon: ClipboardList, label: "รายการเวร", desc: "จัดการและดูรายการเวรทั้งหมด", href: "/duties" },
    ],
  },
  {
    group: "การแสดงผล",
    items: [
      { icon: Palette, label: "ธีม", desc: "สี และรูปแบบการแสดงผล" },
      { icon: Moon, label: "Dark Mode", desc: "สลับโหมดสว่าง-มืด" },
    ],
  },
];

export default function SettingScreen({ user }: { user?: any }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  const { userId, getFriendshipFlag } = useLiff();
  const { subscribeToUserSettings, updateUserSettings } = useUserSettingsService();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isFriendshipModalOpen, setIsFriendshipModalOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToUserSettings(userId, (newSettings) => {
      setSettings(newSettings);
    });
    return unsub;
  }, [userId, subscribeToUserSettings]);

  return (
    <div className="flex-grow overflow-y-auto px-1 pb-2">
      {/* Profile card */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-5 mb-4 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md overflow-hidden shrink-0">
          {user?.pictureUrl ? (
            <img
              src={user.pictureUrl}
              alt={user.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={26} className="text-white" />
          )}
        </div>
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100 text-base">
            {user?.displayName || "ผู้ใช้งาน"}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            {user?.displayName ? "เข้าสู่ระบบด้วย LINE แล้ว" : "ลงชื่อเข้าใช้งานด้วย LINE"}
          </p>
        </div>
      </div>

      {/* Setting groups */}
      {settingItems.map((group) => (
        <div key={group.group} className="mb-4">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
            {group.group}
          </p>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden">
            {group.items.map((item, i) => {
              const Icon = item.icon;
              const isDarkModeToggle = item.label === "Dark Mode";
              
              const content = (
                <>
                  <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-slate-700 dark:text-slate-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-slate-800 dark:text-slate-100 font-medium text-sm">{item.label}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs">{item.desc}</p>
                  </div>
                  {isDarkModeToggle ? (
                    <div 
                      className={`w-10 h-6 p-1 rounded-full transition-colors relative flex items-center ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  ) : (
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
                  )}
                </>
              );

              if (isDarkModeToggle) {
                return (
                  <button
                    key={item.label}
                    onClick={toggleDarkMode}
                    className={`w-full flex items-center gap-4 px-5 py-4 transition-colors ${
                      i < group.items.length - 1 ? "border-b border-slate-100 dark:border-slate-700" : ""
                    }`}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.href) {
                      router.push(item.href);
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 active:bg-slate-50 dark:active:bg-slate-700 transition-colors ${
                    i < group.items.length - 1 ? "border-b border-slate-100 dark:border-slate-700" : ""
                  }`}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Notification Section */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
          การแจ้งเตือน
        </p>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden">
          <button
            onClick={() => router.push("/settings/notifications")}
            className="w-full flex items-center gap-4 px-5 py-4 transition-colors active:bg-slate-50 dark:active:bg-slate-700"
          >
            <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <Bell size={18} className="text-slate-700 dark:text-slate-300" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-slate-800 dark:text-slate-100 font-medium text-sm">การแจ้งเตือนอัตโนมัติ</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs">ตั้งค่าการส่งเวรอัตโนมัติลงแชท</p>
            </div>
            <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden mb-4">
        <button className="w-full flex items-center gap-4 px-5 py-4 active:bg-red-50 dark:active:bg-red-950/30 transition-colors">
          <div className="w-9 h-9 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
            <LogOut size={18} className="text-red-500" />
          </div>
          <span className="text-red-500 font-medium text-sm">ออกจากระบบ</span>
        </button>
      </div>

      <FriendshipModal 
        isOpen={isFriendshipModalOpen} 
        onClose={() => setIsFriendshipModalOpen(false)} 
      />
    </div>
  );
}
