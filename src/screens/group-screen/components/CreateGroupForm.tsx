"use client";

import React from "react";
import { Plus, Loader2 } from "lucide-react";
import { CATEGORIES } from "../constants";

interface CreateGroupFormProps {
  groupName: string;
  setGroupName: (name: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  groupImage: string | null;
  onShowImagePicker: () => void;
  onClose: () => void;
  onCreate: () => void;
  isCreating: boolean;
}

export default function CreateGroupForm({
  groupName,
  setGroupName,
  selectedCategory,
  setSelectedCategory,
  groupImage,
  onShowImagePicker,
  onClose,
  onCreate,
  isCreating
}: CreateGroupFormProps) {
  const activeCategory = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];
  const isFormValid = groupName.trim().length > 0;

  return (
    <div className="flex-grow flex flex-col overflow-y-auto pb-6">
      <div className="pt-4 px-5">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 dark:border-slate-800/50 p-8 space-y-7">
          {/* Profile Picture Selection */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <button
                onClick={onShowImagePicker}
                className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800/50 border-4 border-slate-50 dark:border-slate-800 shadow-sm overflow-hidden flex items-center justify-center transition-all hover:scale-105"
              >
                {groupImage ? (
                  <img src={groupImage} alt="Group" className="w-full h-full object-cover" />
                ) : (
                  <activeCategory.icon size={32} className="text-slate-300 dark:text-slate-600" />
                )}
              </button>
              <button
                onClick={onShowImagePicker}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900 active:scale-90 transition-transform"
              >
                <Plus size={14} className="text-white" strokeWidth={3} />
              </button>
            </div>
            <p className="text-[10px] font-bold text-slate-400 capitalize mt-4 tracking-wide">รูปโปรไฟล์กลุ่ม</p>
          </div>

          {/* Group Name Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block px-1">
              ชื่อกลุ่มของคุณ
            </label>
            <div className="relative group">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="เช่น แก๊งค์หอพัก, ครอบครัวตัว ป."
                className="w-full bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 focus:border-slate-900 dark:focus:border-white rounded-2xl py-4 px-6 text-sm text-slate-800 dark:text-slate-100 font-bold placeholder:text-slate-400/40 focus:outline-none transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block px-1">
              เลือกประเภท
            </label>
            <div className="grid grid-cols-5 gap-2 pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex flex-col items-center gap-2 transition-all active:scale-90"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative ${selectedCategory === cat.id
                    ? `${cat.color} text-white shadow-md`
                    : "bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-50 dark:border-slate-800 shadow-sm"
                    }`}>
                    <cat.icon size={18} strokeWidth={selectedCategory === cat.id ? 2.5 : 2} />
                  </div>
                  <span className={`text-[9px] font-bold transition-all whitespace-nowrap ${selectedCategory === cat.id ? "text-slate-800 dark:text-white" : "text-slate-400"}`}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions Outside Card */}
        <div className="mt-4 flex items-center gap-3 px-1">
          <button
            onClick={onClose}
            className="h-[48px] flex-1 rounded-[1.5rem] font-bold text-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[#a1a9b5] dark:text-slate-500 active:scale-95 transition-all outline-none"
          >
            ยกเลิก
          </button>

          <button
            onClick={onCreate}
            disabled={!isFormValid || isCreating}
            className={`h-[48px] flex-[2.1] rounded-[1.5rem] font-bold text-sm transition-all flex items-center justify-center gap-3 ${isFormValid && !isCreating
              ? "bg-[#b8bfc9] dark:bg-slate-700 text-white shadow-sm active:scale-95"
              : "bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 cursor-not-allowed border border-slate-50 dark:border-slate-800/50"
              }`}
          >
            {isCreating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Plus size={18} strokeWidth={3} />
                <span>สร้างกลุ่ม</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
