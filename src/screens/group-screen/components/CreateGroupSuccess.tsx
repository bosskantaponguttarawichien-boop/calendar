"use client";

import React from "react";
import { Check, Share2, ArrowRight, Copy, Loader2, ChevronLeft } from "lucide-react";
import { CATEGORIES } from "../constants";

interface CreateGroupSuccessProps {
  groupName: string;
  groupImage: string | null;
  category: string;
  isSharing: boolean;
  isCopied: boolean;
  inviteError: string | null;
  onInvite: () => void;
  onCopyLink: () => void;
  onClose: () => void;
}

export default function CreateGroupSuccess({
  groupName,
  groupImage,
  category,
  isSharing,
  isCopied,
  inviteError,
  onInvite,
  onCopyLink,
  onClose
}: CreateGroupSuccessProps) {
  const activeCategory = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 text-center space-y-4 animate-in zoom-in-95 duration-500 bg-[#f8fafc] dark:bg-slate-950 overflow-y-auto">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 blur-[80px] -z-10 rounded-full" />

        <div className="relative w-24 h-24 flex items-center justify-center mx-auto">
          <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-[2.5rem] rotate-6 border-2 border-emerald-500/10" />
          <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border-2 border-emerald-500/20 flex items-center justify-center overflow-hidden">
            {groupImage ? (
              <img src={groupImage} alt="Success" className="w-full h-full object-cover animate-in scale-in-90 duration-500" />
            ) : (
              <activeCategory.icon size={40} className="text-emerald-500 drop-shadow-md" />
            )}
            <div className="absolute top-2 right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800 animate-bounce">
              <Check size={20} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">สร้างกลุ่มสำเร็จ!</h3>
        <p className="text-slate-500 dark:text-slate-400 text-[12px] max-w-[240px] mx-auto leading-relaxed">
          กลุ่ม <span className="text-slate-900 dark:text-white font-bold">"{groupName}"</span> พร้อมใช้งานแล้ว<br />
          เริ่มชวนเพื่อนๆ ของคุณเข้ากลุ่มได้เลย
        </p>
      </div>

      <div className="w-full max-w-[320px] bg-white dark:bg-slate-800/30 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 relative group overflow-hidden shadow-sm">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <Share2 size={24} className="text-white" />
          </div>

          <div className="w-full space-y-4">
            <button
              onClick={onInvite}
              disabled={isSharing}
              className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-[1.25rem] shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm ${isSharing ? "opacity-90" : ""}`}
            >
              {isSharing ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  ชวนเพื่อนผ่าน LINE
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <button
              onClick={onCopyLink}
              className={`w-full py-3 rounded-xl font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[11px] ${isCopied
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm"
                }`}
            >
              {isCopied ? <Check size={16} /> : <Copy size={16} />}
              {isCopied ? "คัดลอกลิงก์แล้ว!" : "คัดลอกลิงก์กิจกรรม"}
            </button>
          </div>

          {inviteError && (
            <p className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-500/10 py-2 px-5 rounded-full">
              {inviteError}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full max-w-[280px] h-[52px] bg-[#0b101b] text-white font-bold rounded-full shadow-lg shadow-black/10 active:scale-95 transition-all text-sm tracking-wider"
      >
        ตกลง
      </button>
    </div>
  );
}
