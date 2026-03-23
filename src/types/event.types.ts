import React from "react";

export interface Shift {
    id: string;
    userId: string;
    title: string;
    color: string;
    icon: string;
    startTime?: string | null;
    endTime?: string | null;
    mainShiftId?: string | null; // Links to a MainShift if this is an override
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MainShift {
    id: string;
    title: string;
    color: string;
    icon: string;
    startTime: string;
    endTime: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface EventData {
    id: string;
    userId: string;
    title: string;
    shiftId: string;
    icon?: string;
    color?: string;
    startTime?: string | null;
    endTime?: string | null;
    start: Date;
    end: Date;
    createdAt?: Date;
    updatedAt?: Date;
    collectionName?: "events" | "shifts";
    isTemplateOverride?: boolean;
    isDeleted?: boolean;
}

export interface Category {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    color: string;
}
