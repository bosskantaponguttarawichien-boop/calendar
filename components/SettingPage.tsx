"use client";

import React from "react";
import { User, Bell, Shield, Palette, ChevronRight, LogOut } from "lucide-react";

const settingItems = [
  {
    group: "บัญชี",
    items: [
      { icon: User, label: "โปรไฟล์", desc: "ชื่อ, รูปภาพ, ข้อมูลทั่วไป" },
      { icon: Bell, label: "การแจ้งเตือน", desc: "ตั้งค่าการแจ้งเตือนกิจกรรม" },
    ],
  },
  {
    group: "การแสดงผล",
    items: [
      { icon: Palette, label: "ธีม", desc: "สี และรูปแบบการแสดงผล" },
    ],
  },
  {
    group: "ความปลอดภัย",
    items: [
      { icon: Shield, label: "ความเป็นส่วนตัว", desc: "จัดการสิทธิ์การเข้าถึง" },
    ],
  },
];

export default function SettingPage() {
  return (
    <div className="flex-grow overflow-y-auto px-1 pb-2">
      {/* Profile card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 mb-4 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md shrink-0">
          <User size={26} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-base">ผู้ใช้งาน</p>
          <p className="text-slate-400 text-sm">ลงชื่อเข้าใช้งานด้วย LINE</p>
        </div>
      </div>

      {/* Setting groups */}
      {settingItems.map((group) => (
        <div key={group.group} className="mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
            {group.group}
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden">
            {group.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-4 px-5 py-4 active:bg-slate-50 transition-colors ${
                    i < group.items.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-slate-700" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-slate-800 font-medium text-sm">{item.label}</p>
                    <p className="text-slate-400 text-xs">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Logout */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden mb-4">
        <button className="w-full flex items-center gap-4 px-5 py-4 active:bg-red-50 transition-colors">
          <div className="w-9 h-9 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
            <LogOut size={18} className="text-red-500" />
          </div>
          <span className="text-red-500 font-medium text-sm">ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
}
