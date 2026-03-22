import React from "react";

export interface EventData {
    id: string;
    userId: string;
    title: string;
    category: string;
    icon?: string;
    color?: string;
    startTime?: string | null;
    endTime?: string | null;
    start: Date;
    end: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Category {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    color: string;
}
