"use client";

import React from "react";
import { Users, UserPlus, Search, ChevronRight, MessageSquare, Plus } from "lucide-react";

export default function GroupScreen() {
  const groups = [
    { name: "ครอบครัว", members: 4, lastMsg: "วันนี้กินข้าวที่ไหนดี?", time: "10:20", id: "1" },
    { name: "แก๊งค์เพื่อนมัธยม", members: 12, lastMsg: "ทริปหน้าไปไหนกันดี", time: "เมื่อวาน", id: "2" },
    { name: "Project A", members: 8, lastMsg: "ส่งงานแล้วนะ", time: "08:15", id: "3" },
  ];

  return (
    <div className="flex-grow overflow-y-auto px-1 pb-4">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="ค้นหากลุ่มของคุณ..."
          className="w-full bg-white/70 backdrop-blur-md border border-white/20 rounded-full py-3 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all shadow-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button className="flex items-center justify-center gap-2 bg-slate-800 text-white rounded-2xl py-3 px-4 shadow-md active:scale-95 transition-transform hover:bg-slate-700">
          <Plus size={18} />
          <span className="text-xs font-bold">สร้างกลุ่ม</span>
        </button>
        <button className="flex items-center justify-center gap-2 bg-white/80 text-slate-800 rounded-2xl py-3 px-4 shadow-sm active:scale-95 transition-transform hover:bg-slate-50 border border-white/20">
          <UserPlus size={18} />
          <span className="text-xs font-bold">เข้าร่วมกลุ่ม</span>
        </button>
      </div>

      {/* Group List */}
      <div className="mb-2 px-2 flex justify-between items-center">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          กลุ่มของฉัน ({groups.length})
        </h3>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden mb-4 border border-white/20">
        {groups.map((group, i) => (
          <button
            key={group.id}
            className={`w-full flex items-center justify-between px-5 py-5 active:bg-slate-50 transition-colors ${
              i < groups.length - 1 ? "border-b border-slate-100/50" : ""
            }`}
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner relative">
                <Users size={24} className="text-slate-500" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 border-2 border-white rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">!</span>
                </div>
              </div>
              <div>
                <p className="text-slate-800 font-bold text-base tracking-tight">{group.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Users size={10} /> {group.members} สมาชิก
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {group.lastMsg}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-slate-300 font-medium tracking-tight">{group.time}</span>
              <ChevronRight size={14} className="text-slate-300" />
            </div>
          </button>
        ))}
      </div>

      {/* Empty State / Join Hint */}
      <div className="bg-white/40 border border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center text-center">
        <MessageSquare size={32} className="text-slate-300 mb-2" />
        <p className="text-slate-400 text-xs font-medium">คุณยังไม่มีกลุ่มอื่นๆ เพิ่มเติม</p>
        <p className="text-[10px] text-slate-300">เริ่มสร้างกลุ่มใหม่เพื่อจัดการกิจกรรมร่วมกัน</p>
      </div>
    </div>
  );
}
