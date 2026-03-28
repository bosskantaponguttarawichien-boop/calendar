"use client";

import React, { useState } from "react";
import { X, Users, Briefcase, Heart, Trophy, Plus, Share2, Sparkles, PenLine, CheckCircle2, ArrowRight, Camera, Copy, Check, Loader2 } from "lucide-react";
import { shareGroupInvitation, LIFF_ID } from "@/lib/liff";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, category: string, image?: string) => Promise<string | void>;
}

type ModalStep = "form" | "success";

const categories = [
  { id: "work", name: "งาน", icon: Briefcase, color: "bg-indigo-500", glow: "shadow-indigo-500/40" },
  { id: "family", name: "ครอบครัว", icon: Heart, color: "bg-rose-500", glow: "shadow-rose-500/40" },
  { id: "friends", name: "เพื่อนฝูง", icon: Users, color: "bg-teal-500", glow: "shadow-teal-500/40" },
  { id: "hobby", name: "อดิเรก", icon: Trophy, color: "bg-amber-500", glow: "shadow-amber-500/40" },
  { id: "other", name: "อื่นๆ", icon: Plus, color: "bg-slate-500", glow: "shadow-slate-500/40" },
];

const AVAILABLE_IMAGES = [
  "/images/image-1.png",
  "/images/image-2.png",
  "/images/image-3.png",
  "/images/image-4.png",
  "/images/image-5.png",
  "/images/image-6.png",
];

export default function CreateGroupModal({ isOpen, onClose, onCreate }: CreateGroupModalProps) {
  const [step, setStep] = useState<ModalStep>("form");
  const [groupName, setGroupName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("friends");
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep("form");
    setGroupName("");
    setGroupImage(null);
    setCreatedGroupId(null);
    setShowImagePicker(false);
    setInviteError(null);
    setIsSharing(false);
    setIsCopied(false);
    onClose();
  };

  const handleCreate = async () => {
    if (groupName.trim() && !isCreating) {
      setIsCreating(true);
      try {
        const id = await onCreate(groupName, selectedCategory, groupImage || undefined);
        if (id) {
          setCreatedGroupId(id);
          setStep("success");
        }
      } catch (error) {
        console.error("Failed to create group:", error);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleCopyLink = async () => {
    if (createdGroupId) {
      const link = `https://liff.line.me/${LIFF_ID}?groupId=${createdGroupId}`;
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
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      } catch (err) {
        console.error("Failed to copy:", err);
        alert(`คัดลอกลิงก์นี้ส่งให้เพื่อน: ${link}`);
      }
    }
  };

  const handleInvite = async () => {
    if (createdGroupId) {
      console.log("[DEBUG] handleInvite called for ID:", createdGroupId);
      setInviteError(null);
      setIsSharing(true);
      try {
        const result = await shareGroupInvitation(createdGroupId, groupName);
        console.log("[DEBUG] shareGroupInvitation result:", result);
        if (!result.success) {
          if (result.reason === "api_unavailable") {
            setInviteError("LINE Share ไม่พร้อมใช้งาน");
            handleCopyLink();
          } else if (result.reason === "error") {
            setInviteError("ไม่สามารถเปิด LINE ได้ (Timeout)");
            handleCopyLink();
          } else if (result.reason !== "cancelled") {
            setInviteError("เกิดข้อผิดพลาดในการชวนเพื่อน");
            handleCopyLink();
          }
        }
      } catch (err) {
        console.error("Invite failed exception:", err);
        setInviteError("เกิดข้อผิดพลาดในการคำนวณ");
        handleCopyLink();
      } finally {
        setIsSharing(false);
      }
    }
  };

  const activeCategory = categories.find(c => c.id === selectedCategory) || categories[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500" 
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl border border-white/40 dark:border-slate-800/60 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 ease-out max-h-[90vh] overflow-y-auto">
        
        {step === "form" ? (
          <>
            {/* Super Compact Header */}
            <div className="h-20 bg-slate-900 relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900" />
                
                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all z-20"
                >
                    <X size={16} className="text-white/60" />
                </button>

                <div className="absolute top-1/2 -translate-y-1/2 left-7 z-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center">
                        <Sparkles size={16} className="text-amber-400 opacity-60" />
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight">
                        สร้างกลุ่มใหม่
                    </h3>
                </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Picture Selection */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                    <button 
                        onClick={() => setShowImagePicker(true)}
                        className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden flex items-center justify-center transition-all hover:ring-4 hover:ring-slate-100 dark:hover:ring-slate-800"
                    >
                        {groupImage ? (
                            <img src={groupImage} alt="Group" className="w-full h-full object-cover" />
                        ) : (
                            <activeCategory.icon size={28} className={`text-slate-400 opacity-50`} />
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera size={20} className="text-white" />
                        </div>
                    </button>
                    <button 
                        onClick={() => setShowImagePicker(true)}
                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border-2 border-slate-50 dark:border-slate-900 active:scale-90 transition-transform"
                    >
                        <Plus size={14} className="text-indigo-500" />
                    </button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">รูปโปรไฟล์กลุ่ม</p>
              </div>

              {/* Group Name Input */}
              <div className="space-y-2.5">
                <label className="text-[9px] uppercase tracking-[0.1em] font-black text-slate-400 dark:text-slate-500 px-1">
                    ชื่อกลุ่มของคุณ
                </label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 scale-90">
                        <PenLine size={16} />
                    </div>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="เช่น แก๊งค์หอพัก, ครอบครัวตัว ป."
                        className="w-full bg-slate-50 dark:bg-slate-800/40 border-[1.5px] border-slate-100 dark:border-slate-800 focus:border-slate-900 dark:focus:border-white rounded-2xl py-3 pl-11 pr-4 text-[13px] text-slate-800 dark:text-slate-100 font-bold placeholder:text-slate-400/60 focus:outline-none transition-all shadow-sm"
                        autoFocus
                    />
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <label className="text-[9px] uppercase tracking-[0.1em] font-black text-slate-400 dark:text-slate-500 px-1">
                  เลือกประเภท
                </label>
                <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="flex flex-col items-center gap-1.5 transition-all active:scale-95"
                    >
                      <div className={`w-10 h-10 rounded-[0.9rem] flex items-center justify-center transition-all duration-300 relative ${
                        selectedCategory === cat.id 
                          ? `${cat.color} text-white ${cat.glow} scale-110 shadow-lg` 
                          : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-sm"
                      }`}>
                        <cat.icon size={16} strokeWidth={selectedCategory === cat.id ? 2.5 : 2} />
                      </div>
                      <span className={`text-[8px] font-black transition-all whitespace-nowrap ${
                        selectedCategory === cat.id ? "text-slate-900 dark:text-white" : "text-slate-400"
                      }`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button 
                  onClick={handleClose}
                  className="flex-1 py-3.5 px-3 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all underline decoration-slate-200 underline-offset-4"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={!groupName.trim() || isCreating}
                  className={`flex-[1.5] py-3.5 px-6 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                    groupName.trim() && !isCreating
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg active:scale-95" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {isCreating ? "กำลังสร้าง..." : "สร้างกลุ่ม"}
                  {!isCreating && <ArrowRight size={14} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* SUCCESS STEP */
          <div className="p-8 sm:p-10 flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-20 rounded-full animate-pulse" />
                
                {/* Visual Feedback with Profile Pic */}
                <div className="relative w-28 h-28 flex items-center justify-center text-center">
                    <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border-4 border-emerald-500/20 shadow-xl" />
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center">
                        {groupImage ? (
                            <img src={groupImage} alt="Success" className="w-full h-full object-cover animate-in scale-in-90 duration-500" />
                        ) : (
                            <activeCategory.icon size={36} className="text-emerald-500 drop-shadow-sm" />
                        )}
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800 transform translate-x-2 translate-y-2">
                            <CheckCircle2 size={16} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">สร้างกลุ่มสำเร็จ!</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                    กลุ่ม <span className="text-slate-900 dark:text-white font-bold">"{groupName}"</span> พร้อมใช้งานแล้ว<br/>
                    เริ่มบริหารจัดการเวลาร่วมกับเพื่อนๆ ได้เลย
                </p>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] p-7 border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center space-y-6">
                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform relative">
                        <Share2 size={24} className="text-teal-500" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center animate-bounce">
                            <Plus size={10} className="text-white font-bold" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-none">ชวนเพื่อนเข้ากลุ่ม</p>
                        <p className="text-[10px] text-slate-400 font-bold opacity-80 mt-1">ส่งคำชวนผ่าน LINE ทันที</p>
                    </div>
                    
                    <div className="w-full space-y-3">
                        <button 
                            onClick={handleInvite}
                            disabled={isSharing}
                            className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4.5 rounded-[1.25rem] shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/btn ${isSharing ? "opacity-90" : ""}`}
                        >
                            {isSharing ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    กำลังเปิด LINE...
                                </>
                            ) : (
                                <>
                                    ชวนเพื่อนเลย
                                    <Share2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                </>
                            )}
                        </button>

                        <button 
                            onClick={handleCopyLink}
                            className={`w-full bg-white dark:bg-slate-800 border-2 ${isCopied ? "border-emerald-500 text-emerald-500" : "border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400"} font-bold py-3.5 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[11px]`}
                        >
                            {isCopied ? (
                                <>
                                    <Check size={14} />
                                    คัดลอกลิงก์แล้ว!
                                </>
                            ) : (
                                <>
                                    <Copy size={14} />
                                    คัดลอกลิงก์เชิญเพื่อน
                                </>
                            )}
                        </button>
                    </div>

                    {inviteError && (
                        <p className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-500/10 py-1.5 px-3 rounded-full animate-in fade-in slide-in-from-top-1">
                            {inviteError}
                        </p>
                    )}
                </div>
            </div>

            <button 
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
            >
                ไว้ทีหลัง / ปิดหน้าต่าง
            </button>
          </div>
        )}

        {/* Image Picker Overlay */}
        {showImagePicker && (
            <div className="absolute inset-0 bg-white dark:bg-slate-900 z-[110] flex flex-col animate-in slide-in-from-right duration-300">
                <div className="h-20 bg-slate-900 relative flex-shrink-0 flex items-center px-7">
                    <button 
                        onClick={() => setShowImagePicker(false)}
                        className="mr-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                        <ArrowRight size={16} className="text-white/60 rotate-180" />
                    </button>
                    <h3 className="text-lg font-black text-white tracking-tight">
                        เลือกรูปโปรไฟล์
                    </h3>
                </div>
                
                <div className="p-8 grid grid-cols-3 gap-4 overflow-y-auto">
                    {AVAILABLE_IMAGES.map((img, idx) => (
                        <button 
                            key={idx}
                            onClick={() => {
                                setGroupImage(img);
                                setShowImagePicker(false);
                            }}
                            className={`aspect-square rounded-[2rem] overflow-hidden border-4 transition-all active:scale-95 ${
                                groupImage === img 
                                    ? "border-indigo-500 shadow-lg shadow-indigo-500/20 scale-105" 
                                    : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                        >
                            <img src={img} alt={`Profile ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                    <button 
                         onClick={() => {
                            setGroupImage(null);
                            setShowImagePicker(false);
                        }}
                        className={`aspect-square rounded-[2rem] overflow-hidden border-4 transition-all active:scale-95 flex flex-col items-center justify-center gap-1.5 ${
                            !groupImage 
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
                                : "border-dashed border-slate-200 dark:border-slate-800"
                        }`}
                    >
                        <activeCategory.icon size={20} className={!groupImage ? "text-indigo-500" : "text-slate-400"} />
                        <span className={`text-[8px] font-bold ${!groupImage ? "text-indigo-500" : "text-slate-400"}`}>Default</span>
                    </button>
                </div>
                
                <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={() => setShowImagePicker(false)}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                        ตกลง
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
