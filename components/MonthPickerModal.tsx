"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const THAI_MONTHS = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
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
                className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-[280px] shadow-2xl p-6 flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between w-full mb-4 px-2">
                    <button onClick={() => onYearChange(-1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ChevronLeft size={20} className="text-slate-800 dark:text-slate-200" />
                    </button>
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {pickerDate.getFullYear() + 543}
                    </span>
                    <button onClick={() => onYearChange(1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ChevronRight size={20} className="text-slate-800 dark:text-slate-200" />
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-y-3 gap-x-2 w-full mb-6 text-center">
                    {THAI_MONTHS.map((month, index) => (
                        <button
                            key={month}
                            onClick={() => onMonthSelect(index)}
                            className={`py-2 rounded-full font-medium transition-all text-sm
                                ${pickerDate.getMonth() === index
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-900/20 active:scale-95'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            {month}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onToday}
                    className="bg-white dark:bg-slate-800 px-5 py-1.5 rounded-full shadow-md border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm active:scale-95 transition-transform"
                >
                    เลือกวันนี้
                </button>
            </div>
        </div>
    );
}
