"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, Pencil, Trash2, Plus, GripVertical } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/constants";
import { useDutyListController } from "./hooks/useDutyListController";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function DutyListScreen() {
    const { 
        liffLoading, 
        ALL_ITEMS, 
        handleDelete, 
        handleEditClick, 
        handleReorder,
        router 
    } = useDutyListController();

    const [items, setItems] = useState(ALL_ITEMS);

    // Sync local state with ALL_ITEMS from controller when it changes (loading finished)
    useEffect(() => {
        setItems(ALL_ITEMS);
    }, [ALL_ITEMS]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const reorderedItems = Array.from(items);
        const [removed] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, removed);

        setItems(reorderedItems);
        handleReorder(reorderedItems);
    };

    if (liffLoading) {
        return (
            <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-800 border-t-slate-800 dark:border-t-slate-200 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0f172a] flex flex-col animate-in fade-in duration-500 transition-colors">
            <main className="flex-grow overflow-y-auto px-4 pt-6 pb-2">
                <div className="flex items-end justify-between px-2 mb-2">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        รายการเวรทั้งหมด
                    </p>
                    <p className="text-[11px] font-medium text-slate-400/80 dark:text-slate-500/80">
                        {items.length} รายการ
                    </p>
                </div>
                
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="duties">
                        {(provided) => (
                            <div 
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden mb-4"
                            >
                                {items.map((item, idx) => {
                                    const IconComponent = item.icon || HelpCircle;
                                    const itemColor = typeof item.color === 'string' ? item.color : CATEGORY_COLORS[item.id] || "#334155";
                                    const isLast = idx === items.length - 1;

                                    return (
                                        <Draggable key={item.id} draggableId={item.id} index={idx}>
                                            {(provided, snapshot) => (
                                                <div 
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${!isLast ? "border-b border-slate-100 dark:border-slate-700" : ""} ${snapshot.isDragging ? "bg-slate-50 dark:bg-slate-700/50 shadow-lg z-50" : ""}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div {...provided.dragHandleProps} className="text-slate-300 dark:text-slate-600 hover:text-slate-500 transition-colors">
                                                            <GripVertical size={20} />
                                                        </div>
                                                        <div 
                                                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0" 
                                                            style={{ backgroundColor: itemColor }}
                                                        >
                                                            <IconComponent size={20} />
                                                        </div>
                                                        <div className="flex flex-col text-left">
                                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-tight block mb-0.5">
                                                                {item.label}
                                                            </span>
                                                            {(item.startTime || item.endTime) && (
                                                                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                                    เวลา: {item.startTime || "??"} - {item.endTime || "??"}
                                                                </div>
                                                            )}
                                                            {(!item.startTime && !item.endTime && !item.isCustom) && (
                                                                <div className="text-xs text-slate-400 dark:text-slate-500">
                                                                    หมวดหมู่เวรเริ่มต้น
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {item.isCustom && (
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => handleEditClick(item)}
                                                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(item)}
                                                                className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                
                <button
                    onClick={() => router.push("/add")}
                    className="w-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 py-3 rounded-2xl font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-8"
                >
                    <Plus size={18} strokeWidth={3} />
                    เพิ่มเวรใหม่
                </button>
            </main>
        </div>
    );
}
