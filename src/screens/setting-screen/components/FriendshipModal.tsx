"use client";

import React from "react";
import { UserPlus, X, MessageSquare, BellRing } from "lucide-react";

interface FriendshipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendshipModal({ isOpen, onClose }: FriendshipModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[320px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-700/50 overflow-hidden animate-in zoom-in-90 fade-in duration-500 ease-out">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all z-10 hover:rotate-90"
        >
          <X size={16} className="text-slate-300 dark:text-slate-500" />
        </button>

        <div className="pt-12 pb-8 px-6 flex flex-col items-center text-center">
          {/* Icon Area */}
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-emerald-400/30 blur-xl rounded-full scale-110 group-hover:scale-115 transition-transform duration-700" />
            
            <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200/50 dark:shadow-none ring-6 ring-white dark:ring-slate-800 overflow-hidden">
              <div className="absolute inset-2 border-2 border-white/20 rounded-full" />
              <UserPlus size={40} className="text-white drop-shadow-md animate-float" />
            </div>
            
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-4 border-emerald-50/50 dark:border-slate-700/50">
              <BellRing size={18} className="text-emerald-500 animate-pulse-gentle" />
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
              เชื่อมต่อกับ <span className="text-emerald-500">LINE OA</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[0.85rem] leading-relaxed max-w-[220px] mx-auto">
              เปิดรับแจ้งเตือนเวรรายวันแบบส่วนตัว 
              <span className="block mt-1 font-medium text-slate-400">กรุณากดเพิ่มเพื่อนก่อนดำเนินการต่อ</span>
            </p>
          </div>

          <div className="w-full space-y-3">
            <a 
              href="https://line.me/R/ti/p/@296rwimv"
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative w-full bg-[#06C755] hover:bg-[#05b34d] text-white font-bold py-4 rounded-[1.25rem] flex items-center justify-center gap-2.5 shadow-[0_10px_20px_-5px_rgba(6,199,85,0.3)] dark:shadow-none transition-all hover:-translate-y-1 active:scale-[0.97]"
            >
              <MessageSquare size={18} fill="currentColor" className="group-hover/btn:rotate-12 transition-transform" />
              <span className="text-md">เพิ่มเพื่อน @296rwimv</span>
            </a>
            
            <button 
              onClick={onClose}
              className="w-full py-1 text-slate-400 dark:text-slate-500 font-bold text-[0.8rem] tracking-wider uppercase hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              ยังไม่ตอนนี้
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
