import { Sun, CloudSun, Moon, SunMoon, MoonStar, Plus } from "lucide-react";
import { Category } from "@/types/event.types";

export const CATEGORY_COLORS: Record<string, string> = {
    morning: "#86BBD8",
    afternoon: "#F58220",
    night: "#D43B80",
    allday: "#00AB84",
    nightafternoon: "#8338EC",
    custom: "#334155",
};

export const CATEGORIES: Category[] = [
    { id: "morning",       label: "เช้า",     icon: Sun,     color: "#86BBD8" },
    { id: "afternoon",     label: "บ่าย",     icon: CloudSun, color: "#F58220" },
    { id: "night",         label: "ดึก",      icon: Moon,    color: "#D43B80" },
    { id: "allday",        label: "เช้า/บ่าย", icon: SunMoon, color: "#00AB84" },
    { id: "nightafternoon",label: "ดึก/บ่าย", icon: MoonStar, color: "#8338EC" },
    { id: "custom",        label: "เพิ่ม",    icon: Plus,    color: "#334155" },
];
