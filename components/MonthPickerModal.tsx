"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

interface MonthPickerModalProps {
    pickerDate: Date;
    onClose: () => void;
    onYearChange: (offset: number) => void;
    onMonthSelect: (monthIndex: number) => void;
    onToday: () => void;
}

export default function MonthPickerModal({ pickerDate, onClose, onYearChange, onMonthSelect, onToday }: MonthPickerModalProps) {
    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 pb-20"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl p-8 flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between w-full mb-8 px-4">
                    <button onClick={() => onYearChange(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-slate-800" />
                    </button>
                    <span className="text-2xl font-bold text-slate-800">
                        {pickerDate.getFullYear() + 543}
                    </span>
                    <button onClick={() => onYearChange(1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronRight size={24} className="text-slate-800" />
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-y-6 gap-x-2 w-full mb-10">
                    {THAI_MONTHS.map((month, index) => (
                        <button
                            key={month}
                            onClick={() => onMonthSelect(index)}
                            className={`py-2 px-1 rounded-full text-center font-medium transition-all text-sm
                                ${pickerDate.getMonth() === index
                                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                                    : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            {month}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onToday}
                    className="bg-white px-6 py-2 rounded-full shadow-lg border border-slate-100 text-slate-800 font-bold text-base active:scale-95 transition-transform"
                >
                    เลือกวันนี้
                </button>
            </div>
        </div>
    );
}
