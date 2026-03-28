import { Briefcase, Heart, Users, Trophy, Plus } from "lucide-react";

export const CATEGORIES = [
  { id: "work", name: "งาน", icon: Briefcase, color: "bg-indigo-500", glow: "shadow-indigo-500/40" },
  { id: "family", name: "ครอบครัว", icon: Heart, color: "bg-rose-500", glow: "shadow-rose-500/40" },
  { id: "friends", name: "เพื่อนฝูง", icon: Users, color: "bg-teal-500", glow: "shadow-teal-500/40" },
  { id: "hobby", name: "อดิเรก", icon: Trophy, color: "bg-amber-500", glow: "shadow-amber-500/40" },
  { id: "other", name: "อื่นๆ", icon: Plus, color: "bg-slate-500", glow: "shadow-slate-500/40" },
];

export const AVAILABLE_IMAGES = [
  "/images/image-1.png",
  "/images/image-2.png",
  "/images/image-3.png",
  "/images/image-4.png",
  "/images/image-5.png",
  "/images/image-6.png",
];
