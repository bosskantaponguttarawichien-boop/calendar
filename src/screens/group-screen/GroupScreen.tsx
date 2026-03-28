"use client";

import React, { useEffect, useState } from "react";
import { Users, UserPlus, Search, ChevronRight, MessageSquare, Plus, Briefcase, Heart, Trophy } from "lucide-react";

import { Group } from "@/types/group.types";
import CreateGroupModal from "./components/CreateGroupModal";
import { useGroupService } from "@/hooks/useGroupService";
import { useLiff } from "@/hooks/useLiff";

const CATEGORY_ICONS: Record<string, any> = {
  work: Briefcase,
  family: Heart,
  friends: Users,
  hobby: Trophy,
  other: Plus,
};

interface GroupScreenProps {
  onGroupClick: (group: Group) => void;
}

export default function GroupScreen({ onGroupClick }: GroupScreenProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { userId, displayName, pictureUrl } = useLiff();
  const { subscribeToUserGroups, createGroup } = useGroupService();

  useEffect(() => {
    if (!userId) return;

    const unsub = subscribeToUserGroups(userId, (fetchedGroups) => {
      setGroups(fetchedGroups);
      setLoading(false);
    });

    return () => unsub();
  }, [userId, subscribeToUserGroups]);

  const handleCreateGroup = async (name: string, category: string, image?: string) => {
    if (!userId) return;
    try {
      await createGroup(userId, displayName || "User", pictureUrl, { name, category, image });
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-grow overflow-y-auto px-1 pb-4">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-400 dark:text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="ค้นหากลุ่มของคุณ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-full py-3 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 transition-all shadow-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl py-3 px-4 shadow-md active:scale-95 transition-transform hover:bg-slate-700 dark:hover:bg-slate-600"
        >
          <Plus size={18} />
          <span className="text-xs font-bold">สร้างกลุ่ม</span>
        </button>
        <button className="flex items-center justify-center gap-2 bg-white/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl py-3 px-4 shadow-sm active:scale-95 transition-transform hover:bg-slate-50 dark:hover:bg-slate-700 border border-white/20 dark:border-slate-700/50">
          <UserPlus size={18} />
          <span className="text-xs font-bold">เข้าร่วมกลุ่ม</span>
        </button>
      </div>

      {/* Group List */}
      <div className="mb-2 px-2 flex justify-between items-center">
        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          กลุ่มของฉัน ({groups.length})
        </h3>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 dark:border-slate-800 dark:border-t-white rounded-full animate-spin" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">กำลังโหลดกลุ่ม...</p>
        </div>
      ) : groups.length > 0 ? (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden mb-4 border border-white/20 dark:border-slate-700/30">
          {filteredGroups.map((group, i) => {
            const IconComponent = CATEGORY_ICONS[group.category] || Users;
            return (
              <button
                key={group.id}
                onClick={() => onGroupClick(group)}
                className={`w-full flex items-center justify-between px-5 py-5 active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors ${
                  i < filteredGroups.length - 1 ? "border-b border-slate-100/50 dark:border-slate-700/50" : ""
                }`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner relative overflow-hidden">
                    {group.image ? (
                        <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                    ) : (
                        <IconComponent size={24} className="text-slate-500 dark:text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-slate-800 dark:text-slate-200 font-bold text-base tracking-tight">{group.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Users size={10} /> {group.members?.length || 0} สมาชิก
                      </span>
                      {group.lastMsg && (
                        <>
                          <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {group.lastMsg}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-300 dark:text-slate-500 font-medium tracking-tight">{group.time || "ใหม่"}</span>
                  <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white/40 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center text-center">
          <MessageSquare size={32} className="text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-slate-400 text-xs font-medium">คุณยังไม่มีกลุ่มอื่นๆ เพิ่มเติม</p>
          <p className="text-[10px] text-slate-300 dark:text-slate-500">เริ่มสร้างกลุ่มใหม่เพื่อจัดการกิจกรรมร่วมกัน</p>
        </div>
      )}

      <CreateGroupModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateGroup}
      />
    </div>
  );
}
