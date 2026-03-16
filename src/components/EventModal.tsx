"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { X, Share2, Calendar as CalendarIcon, CheckCircle2, Trash2 } from "lucide-react";
import { shareEvent } from "@/lib/liff";
import { format } from "date-fns";

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string | null;
    userId: string | undefined;
    initialEvent?: any; // For editing
}

const EventModal = ({ isOpen, onClose, selectedDate, userId, initialEvent }: EventModalProps) => {
    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [savedEventData, setSavedEventData] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialEvent) {
                setTitle(initialEvent.title || "");
                setLocation(initialEvent.location || "");
                setDescription(initialEvent.description || "");

                const start = initialEvent.start instanceof Date ? initialEvent.start : initialEvent.start.toDate();
                const end = initialEvent.end instanceof Date ? initialEvent.end : initialEvent.end.toDate();

                setStartTime(format(start, "HH:mm"));
                setEndTime(format(end, "HH:mm"));
            } else {
                setTitle("");
                setStartTime("09:00");
                setEndTime("10:00");
                setLocation("");
                setDescription("");
            }
            setIsSuccess(false);
            setSavedEventData(null);
        }
    }, [isOpen, initialEvent]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !title || !selectedDate) return;

        setLoading(true);
        try {
            const start = new Date(`${selectedDate}T${startTime}`);
            const end = new Date(`${selectedDate}T${endTime}`);
            const eventData = {
                userId,
                title,
                start,
                end,
                location,
                description,
                updatedAt: new Date(),
            };

            if (initialEvent?.id) {
                await updateDoc(doc(db, "events", initialEvent.id), eventData);
                setSavedEventData(eventData);
                setIsSuccess(true);
            } else {
                await addDoc(collection(db, "events"), {
                    ...eventData,
                    createdAt: new Date(),
                });
                setSavedEventData(eventData);
                setIsSuccess(true);
            }
        } catch (error) {
            console.error("Error saving event: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialEvent?.id) return;
        if (!confirm("คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?")) return;

        setLoading(true);
        try {
            await deleteDoc(doc(db, "events", initialEvent.id));
            onClose();
        } catch (error) {
            console.error("Error deleting event: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!savedEventData) return;
        try {
            await shareEvent(savedEventData);
        } catch (error) {
            console.error("Share failed", error);
        }
    };

    const handleAddToLineCalendar = () => {
        if (!savedEventData) return;

        const formatForLine = (date: Date) => format(date, "yyyyMMdd'T'HHmmss");
        const startStr = formatForLine(savedEventData.start);
        const endStr = formatForLine(savedEventData.end);

        const params = new URLSearchParams({
            title: savedEventData.title,
            start: startStr,
            end: endStr,
            location: savedEventData.location || "",
            description: savedEventData.description || "",
        });

        const url = `https://calendar.line.me/event/create?${params.toString()}`;
        window.open(url, "_blank");
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isSuccess ? "สำเร็จ!" : initialEvent ? "แก้ไขกิจกรรม" : "สร้างกิจกรรมใหม่"}
                    </h2>
                    <div className="flex items-center gap-4">
                        {initialEvent && !isSuccess && (
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="text-red-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={22} />
                            </button>
                        )}
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="p-8 text-center space-y-6 pb-12 sm:pb-8">
                        <div className="flex justify-center">
                            <div className="bg-green-100 p-4 rounded-full">
                                <CheckCircle2 size={48} className="text-green-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-800">{savedEventData?.title}</h3>
                            <p className="text-slate-500">บันทึกลงในปฏิทินเรียบร้อยแล้ว</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-4">
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center gap-2 bg-[#00b900] text-white py-3 rounded-xl font-bold hover:bg-green-600 active:scale-[0.98] transition-all shadow-md"
                            >
                                <Share2 size={20} />
                                แชร์ไปยังแชท
                            </button>
                            <button
                                onClick={handleAddToLineCalendar}
                                className="flex items-center justify-center gap-2 bg-white text-[#1e293b] py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm"
                            >
                                <CalendarIcon size={20} />
                                เพิ่มลงใน LINE Calendar
                            </button>
                            <button
                                onClick={onClose}
                                className="text-slate-400 text-sm font-medium hover:text-slate-600 pt-2"
                            >
                                ปิดหน้าต่าง
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 pb-12 sm:pb-6">
                        {/* ... Existing form fields ... */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">หัวข้อกิจกรรม</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="เช่น ประชุมงาน, นัดกินข้าว"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">เวลาเริ่ม</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">เวลาสิ้นสุด</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">สถานที่</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="สถานที่จัดงาน"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">คำอธิบาย</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                placeholder="รายละเอียดเพิ่มเติม..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-600 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? "กำลังบันทึก..." : "บันทึกกิจกรรม"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EventModal;
