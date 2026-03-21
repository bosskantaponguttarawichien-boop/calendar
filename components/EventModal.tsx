"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { X, Sun, CloudSun, Moon, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string | null;
    userId: string | undefined;
    initialEvent?: any; // For editing
}

const CATEGORIES = [
    { id: "morning", label: "เช้า", icon: Sun, color: "#86BBD8" },
    { id: "afternoon", label: "บ่าย", icon: CloudSun, color: "#F58220" },
    { id: "night", label: "ดึก", icon: Moon, color: "#D43B80" },
    { id: "allday", label: "เช้า/บ่าย", icon: Sun, color: "#00AB84" },
    { id: "custom", label: "เพิ่ม", icon: Plus, color: "#334155" },
];

const EventModal = ({ isOpen, onClose, selectedDate, userId, initialEvent }: EventModalProps) => {
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedCategory(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getThaiHeader = () => {
        if (!selectedDate) return "";
        const date = parseISO(selectedDate);
        const thaiDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
        return `วัน${thaiDays[date.getDay()]}ที่ ${date.getDate()}`;
    };

    const handleSave = async () => {
        if (!userId || !selectedDate || !selectedCategory) return;
        setLoading(true);
        try {
            const category = CATEGORIES.find(c => c.id === selectedCategory);
            const eventData = {
                userId,
                title: category?.label || "กิจกรรม",
                category: selectedCategory,
                start: parseISO(selectedDate),
                end: parseISO(selectedDate),
                createdAt: new Date(),
            };
            await addDoc(collection(db, "events"), eventData);
            onClose();
        } catch (error) {
            console.error("Error saving event:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialEvent?.id) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, "events", initialEvent.id));
            onClose();
        } catch (error) {
            console.error("Error deleting event:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            <div className={`bg-white w-full max-w-lg rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 pt-5 pb-5 transition-transform duration-500 ease-out pointer-events-auto transform ${isOpen ? "translate-y-0" : "translate-y-full"}`}>
                <div className="relative flex flex-col items-center">
                    <button 
                        onClick={onClose}
                        className="absolute right-0 top-0 text-slate-800 hover:text-slate-400 p-2 transition-colors"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>

                    <h2 className="text-lg font-bold text-slate-800 mb-3">
                        {getThaiHeader()}
                    </h2>

                    <div className="flex justify-between w-full mb-5 px-2">
                        {CATEGORIES.map((cat) => (
                            <div key={cat.id} className="flex flex-col items-center gap-2">
                                <button
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90
                                        ${selectedCategory === cat.id ? "scale-110 ring-4 ring-slate-100" : "scale-100 hover:scale-105"}`}
                                    style={{ backgroundColor: cat.color }}
                                >
                                    <cat.icon size={22} className="text-white" strokeWidth={2.5} />
                                </button>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{cat.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 w-full px-4">
                        <button
                            onClick={handleDelete}
                            disabled={loading || !initialEvent}
                            className="flex-1 bg-white border border-slate-100 py-2 rounded-full font-bold text-base text-slate-800 shadow-sm active:scale-95 transition-all disabled:opacity-30"
                        >
                            ลบ
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || !selectedCategory}
                            className="flex-1 bg-white border border-slate-100 py-2 rounded-full font-bold text-base text-slate-800 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? "..." : "ตกลง"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
