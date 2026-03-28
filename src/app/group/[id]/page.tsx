"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGroupService } from "@/hooks/useGroupService";
import GroupCalendarScreen from "@/screens/group-screen/components/GroupCalendarScreen";
import { Group } from "@/types/group.types";

export default function GroupDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;
    const { subscribeToGroup } = useGroupService();
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!groupId) return;

        const unsub = subscribeToGroup(groupId, (fetchedGroup) => {
            setGroup(fetchedGroup);
            setLoading(false);
        });

        return () => unsub();
    }, [groupId, subscribeToGroup]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[100dvh] bg-[#f8fafc] dark:bg-[#0f172a]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-slate-200"></div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="flex flex-col items-center justify-center h-[100dvh] space-y-4 px-6 text-center bg-[#f8fafc] dark:bg-[#0f172a]">
                <div className="text-slate-400">ไม่พบกลุ่มที่ระบุ</div>
                <button 
                    onClick={() => router.push("/")}
                    className="text-slate-600 dark:text-slate-400 font-bold border-b border-slate-600 dark:border-slate-400"
                >
                    กลับไปหน้าหลัก
                </button>
            </div>
        );
    }

    return (
        <main className="h-[100dvh] overflow-hidden bg-[#f8fafc] dark:bg-[#0f172a] p-3 pt-4 max-w-lg mx-auto">
            <GroupCalendarScreen 
                group={group} 
            />
        </main>
    );
}
