"use client";

import React, { useEffect, useState } from "react";
import { Users, UserPlus, Search, ChevronRight, MessageSquare, Plus, Briefcase, Heart, Trophy, Trash2, LogOut, X, AlertTriangle } from "lucide-react";

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

const SwipeableGroupItem = ({ 
    group, 
    onDelete, 
    onClick, 
    isLast,
    isCreator 
  }: { 
    group: Group; 
    onDelete: (e: React.MouseEvent) => void; 
    onClick: () => void; 
    isLast: boolean;
    isCreator: boolean;
  }) => {
    const [startX, setStartX] = useState(0);
    const [offsetX, setOffsetX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const REVEAL_WIDTH = 80;
  
    const onTouchStart = (e: React.TouchEvent) => {
        setStartX(e.touches[0].clientX);
        setIsSwiping(true);
    };
  
    const onTouchMove = (e: React.TouchEvent) => {
        if (!isSwiping) return;
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - startX;
        
        let newOffset = isRevealed ? -REVEAL_WIDTH + deltaX : deltaX;
        if (newOffset > 0) newOffset = 0;
        if (newOffset < -REVEAL_WIDTH - 20) newOffset = -REVEAL_WIDTH - 20;
        
        setOffsetX(newOffset);
    };
  
    const onTouchEnd = () => {
        setIsSwiping(false);
        if (offsetX < -REVEAL_WIDTH / 2) {
            setOffsetX(-REVEAL_WIDTH);
            setIsRevealed(true);
        } else {
            setOffsetX(0);
            setIsRevealed(false);
        }
    };

    const IconComponent = CATEGORY_ICONS[group.category] || Users;
  
    return (
      <div className="relative overflow-hidden group/swipe bg-rose-500">
        {/* Background Action Button */}
        <div 
            className="absolute inset-y-0 right-0 flex items-center justify-end pr-6 text-white w-full transition-opacity duration-300 pointer-events-none"
            style={{ opacity: offsetX < -10 ? 1 : 0 }}
        >
            <div className="flex flex-col items-center gap-1 scale-90 opacity-80">
                {isCreator ? <Trash2 size={24} /> : <LogOut size={24} />}
                <span className="text-[10px] font-black uppercase tracking-widest">{isCreator ? "ลบ" : "ออก"}</span>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(e);
                }}
                className="absolute inset-y-0 right-0 w-20 flex items-center justify-center pointer-events-auto"
                aria-label={isCreator ? "Delete Group" : "Leave Group"}
            />
        </div>
  
        {/* Main Content Card */}
        <div
          className={`relative bg-white dark:bg-slate-900 transition-transform duration-300 ease-out flex items-center justify-between px-5 py-5 active:bg-slate-50 dark:active:bg-slate-800/50 cursor-pointer ${
            !isLast ? "border-b border-slate-100/50 dark:border-slate-800/50" : ""
          }`}
          style={{ transform: `translateX(${offsetX}px)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={() => {
              if (Math.abs(offsetX) < 5) onClick();
              else {
                  setOffsetX(0);
                  setIsRevealed(false);
              }
          }}
        >
          <div className="flex items-center gap-4 text-left pointer-events-none">
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
          <div className="flex items-center gap-3 pointer-events-none">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-slate-300 dark:text-slate-500 font-medium tracking-tight">{group.time || "ใหม่"}</span>
              <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
            </div>
          </div>
        </div>
      </div>
    );
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
  const { subscribeToUserGroups, createGroup, deleteGroup, leaveGroup } = useGroupService();
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string, isCreator: boolean } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const id = await createGroup(userId, displayName || "User", pictureUrl, { name, category, image });
      return id;
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleGroupAction = async () => {
    if (!confirmDelete || !userId || isDeleting) return;
    setIsDeleting(true);
    try {
      if (confirmDelete.isCreator) {
        await deleteGroup(confirmDelete.id);
      } else {
        await leaveGroup(confirmDelete.id, userId);
      }
      setConfirmDelete(null);
    } catch (error) {
      console.error("Group action failed:", error);
      alert("Failed to process request. Please try again.");
    } finally {
      setIsDeleting(false);
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
            const isCreator = group.creatorId === userId;
              
            return (
              <SwipeableGroupItem 
                key={group.id}
                group={group}
                isLast={i === filteredGroups.length - 1}
                isCreator={isCreator}
                onClick={() => onGroupClick(group)}
                onDelete={() => {
                    setConfirmDelete({ id: group.id, name: group.name, isCreator });
                }}
              />
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

      {/* Confirmation Modal */}
      {confirmDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isDeleting && setConfirmDelete(null)} />
              <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-white/20 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                        <AlertTriangle size={28} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                            {confirmDelete.isCreator ? "ลบกลุ่มถาวร?" : "ออกจากกลุ่ม?"}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                            คุณแน่ใจหรือไม่ว่าต้องการ{confirmDelete.isCreator ? "ลบกลุ่ม" : "ออกจากกลุ่ม"} <span className="font-bold text-slate-900 dark:text-white">"{confirmDelete.name}"</span>?
                            {confirmDelete.isCreator && <span className="block mt-1 text-rose-500 font-bold uppercase text-[9px] tracking-wider italic">การกระทำนี้ไม่สามารถย้อนคืนได้</span>}
                        </p>
                    </div>
                    <div className="w-full pt-2 space-y-2">
                        <button 
                            onClick={handleGroupAction}
                            disabled={isDeleting}
                            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isDeleting ? "กำลังประมวลผล..." : (confirmDelete.isCreator ? "ยืนยันลบกลุ่ม" : "ยืนยันออกจากกลุ่ม")}
                        </button>
                        <button 
                            onClick={() => setConfirmDelete(null)}
                            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold py-4 rounded-2xl active:scale-95 transition-all text-xs"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
              </div>
          </div>
      )}
    </div>
  );
}
