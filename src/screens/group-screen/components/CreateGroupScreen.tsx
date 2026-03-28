"use client";

import React, { useState } from "react";
import { shareGroupInvitation, LIFF_ID } from "@/lib/liff";
import CreateGroupForm from "./CreateGroupForm";
import CreateGroupSuccess from "./CreateGroupSuccess";
import ImagePickerBottomSheet from "./ImagePickerBottomSheet";

interface CreateGroupScreenProps {
  onBack: () => void;
  onCreate: (name: string, category: string, image?: string) => Promise<string | void>;
}

type ScreenStep = "form" | "success";

export default function CreateGroupScreen({ onBack, onCreate }: CreateGroupScreenProps) {
  const [step, setStep] = useState<ScreenStep>("form");
  const [groupName, setGroupName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("friends");
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleClose = () => {
    onBack();
  };

  const handleCreate = async () => {
    if (groupName.trim() && !isCreating) {
      setIsCreating(true);
      try {
        const id = await onCreate(groupName, selectedCategory, groupImage || undefined);
        if (id) {
          setCreatedGroupId(id);
          setStep("success");
        }
      } catch (error) {
        console.error("Failed to create group:", error);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleCopyLink = async () => {
    if (createdGroupId) {
      const link = `https://liff.line.me/${LIFF_ID}?groupId=${createdGroupId}`;
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(link);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = link;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      } catch (err) {
        console.error("Failed to copy:", err);
        alert(`คัดลอกลิงก์นี้ส่งให้เพื่อน: ${link}`);
      }
    }
  };

  const handleInvite = async () => {
    if (createdGroupId) {
      setInviteError(null);
      setIsSharing(true);
      try {
        const result = await shareGroupInvitation(createdGroupId, groupName);
        if (!result.success) {
          if (result.reason === "api_unavailable") {
            setInviteError("LINE Share ไม่พร้อมใช้งาน");
            handleCopyLink();
          } else if (result.reason === "error") {
            setInviteError("ไม่สามารถเปิด LINE ได้ (Timeout)");
            handleCopyLink();
          } else if (result.reason !== "cancelled") {
            setInviteError("เกิดข้อผิดพลาดในการชวนเพื่อน");
            handleCopyLink();
          }
        }
      } catch (err) {
        console.error("Invite failed exception:", err);
        setInviteError("เกิดข้อผิดพลาด");
        handleCopyLink();
      } finally {
        setIsSharing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#f8fafc] dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      {step === "form" ? (
        <CreateGroupForm
          groupName={groupName}
          setGroupName={setGroupName}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          groupImage={groupImage}
          onShowImagePicker={() => setShowImagePicker(true)}
          onClose={handleClose}
          onCreate={handleCreate}
          isCreating={isCreating}
        />
      ) : (
        <CreateGroupSuccess
          groupName={groupName}
          groupImage={groupImage}
          category={selectedCategory}
          isSharing={isSharing}
          isCopied={isCopied}
          inviteError={inviteError}
          onInvite={handleInvite}
          onCopyLink={handleCopyLink}
          onClose={handleClose}
        />
      )}

      <ImagePickerBottomSheet
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        selectedImage={groupImage}
        onSelect={(img) => setGroupImage(img)}
        category={selectedCategory}
      />
    </div>
  );
}
