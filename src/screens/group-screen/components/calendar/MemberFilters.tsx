import React from "react";
import { LayoutGrid } from "lucide-react";

interface MemberFiltersProps {
    members: any[];
    selectedMemberId: string | null;
    setSelectedMemberId: (id: string | null) => void;
}

export const MemberFilters: React.FC<MemberFiltersProps> = ({
    members,
    selectedMemberId,
    setSelectedMemberId
}) => {
    return (
        <div className="flex flex-wrap gap-2 px-1 pb-4">
            {/* Option: All - Only show if there are multiple members */}
            {members.length > 1 && (
                <button
                    onClick={() => setSelectedMemberId(null)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                        selectedMemberId === null
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-white/50 dark:bg-slate-800/50 text-slate-500 border-slate-100 dark:border-slate-700"
                    }`}
                >
                    <LayoutGrid size={12} className={selectedMemberId === null ? "text-white" : "text-slate-400"} />
                    <span className="text-[10px] font-black tracking-tight">ทั้งหมด</span>
                </button>
            )}

            {members.map((member) => {
                const isActive = selectedMemberId === member.id;
                return (
                    <button 
                        key={member.id} 
                        onClick={() => setSelectedMemberId(member.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                            isActive
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-400 opacity-50"}`} />
                        <span className="text-[10px] font-bold tracking-tight">{member.displayName}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default MemberFilters;
