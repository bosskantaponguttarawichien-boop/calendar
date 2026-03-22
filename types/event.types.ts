import React from "react";

export interface EventData {
    id: string;
    userId: string;
    title: string;
    shiftId: string | number;
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
