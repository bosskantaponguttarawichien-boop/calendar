import React from "react";
import { Sun, CloudSun, Moon, SunMoon, MoonStar, HelpCircle } from "lucide-react";

export const ICON_MAP: Record<string, any> = {
    morning: Sun,
    afternoon: CloudSun,
    night: Moon,
    allday: SunMoon,
    nightafternoon: MoonStar,
    Sun: Sun,
    CloudSun: CloudSun,
    Moon: Moon,
    SunMoon: SunMoon,
    MoonStar: MoonStar,
};

interface CalendarIconProps {
    iconName: string;
    size?: number;
    className?: string;
    strokeWidth?: number;
}

export const CalendarIcon: React.FC<CalendarIconProps> = ({ 
    iconName, 
    size = 16, 
    className = "",
    strokeWidth = 2.5
}) => {
    const Icon = ICON_MAP[iconName] || HelpCircle;
    return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
};

export const THAI_DAY_NAMES = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
