"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AVAILABLE_IMAGES, CATEGORIES } from "../constants";

interface ImagePickerBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImage: string | null;
  onSelect: (image: string | null) => void;
  category: string;
}

export default function ImagePickerBottomSheet({
  isOpen,
  onClose,
  selectedImage,
  onSelect,
  category
}: ImagePickerBottomSheetProps) {
  const [renderImagePicker, setRenderImagePicker] = useState(false);
  const [animateImagePicker, setAnimateImagePicker] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (isOpen) {
      setRenderImagePicker(true);
      const timer = setTimeout(() => {
        if (mounted) setAnimateImagePicker(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateImagePicker(false);
      const timer = setTimeout(() => {
        if (mounted) setRenderImagePicker(false);
      }, 500); // Wait for slide-down animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!renderImagePicker) return null;

  const activeCategory = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${
          animateImagePicker ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-500 ease-in-out max-h-[85vh] transform ${
        animateImagePicker ? "translate-y-0" : "translate-y-full"
      }`}>
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-4 mb-2 flex-shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-50 dark:border-slate-800/50">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                เลือกรูปโปรไฟล์
            </h3>
            <button 
                onClick={onClose}
                className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
            >
                <X size={20} />
            </button>
        </div>
        
        {/* Image Grid */}
        <div className="flex-grow p-6 grid grid-cols-4 gap-4 overflow-y-auto content-start">
            {AVAILABLE_IMAGES.map((img, idx) => (
                <button 
                    key={idx}
                    onClick={() => onSelect(img)}
                    className={`aspect-square rounded-2xl overflow-hidden border-[3px] transition-all active:scale-90 ${
                        selectedImage === img 
                            ? "border-indigo-500 shadow-lg scale-105" 
                            : "border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                >
                    <img src={img} alt={`Profile ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
            ))}
            <button 
                onClick={() => onSelect(null)}
                className={`aspect-square rounded-2xl overflow-hidden border-[3px] transition-all active:scale-90 flex flex-col items-center justify-center gap-1.5 ${
                    !selectedImage 
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-lg" 
                        : "border-dashed border-slate-200 dark:border-slate-800"
                }`}
            >
                <activeCategory.icon size={18} className={!selectedImage ? "text-indigo-500" : "text-slate-300 dark:text-slate-700"} />
                <span className={`text-[8px] font-black uppercase tracking-tight ${!selectedImage ? "text-indigo-500" : "text-slate-300 dark:text-slate-600"}`}>Default</span>
            </button>
        </div>
        
        {/* Bottom Action Area */}
        <div className="p-6 pb-10 border-t border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/50">
            <button 
                onClick={onClose}
                className="w-full h-[48px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.50rem] font-bold text-sm shadow-xl active:scale-95 transition-all"
            >
                ตกลง
            </button>
        </div>
      </div>
    </div>
  );
}
