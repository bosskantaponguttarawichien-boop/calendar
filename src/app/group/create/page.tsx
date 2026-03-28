"use client";

import CreateGroupScreen from "@/screens/group-screen/components/CreateGroupScreen";
import { useLiff } from "@/hooks/useLiff";
import { useGroupService } from "@/hooks/useGroupService";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

function CreateGroupContent() {
  const { userId, displayName, pictureUrl, loading } = useLiff();
  const { createGroup } = useGroupService();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-slate-200"></div>
      </div>
    );
  }

  const handleCreateGroup = async (name: string, category: string, image?: string) => {
    if (!userId) return;
    try {
      const id = await createGroup(userId, displayName || "User", pictureUrl, { name, category, image });
      return id;
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  return (
    <CreateGroupScreen 
        onBack={() => router.push('/?tab=group')} 
        onCreate={handleCreateGroup} 
    />
  );
}

export default function CreateGroupPage() {
  return (
    <main className="h-[100dvh] overflow-hidden bg-[#f8fafc] dark:bg-[#0f172a]">
      <Suspense fallback={null}>
        <CreateGroupContent />
      </Suspense>
    </main>
  );
}
