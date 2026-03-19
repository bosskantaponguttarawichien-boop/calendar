"use client";

import React, { useState } from "react";
import { Home, ClipboardList, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "result", icon: ClipboardList, label: "Result" },
  { id: "group", icon: Users, label: "Group" },
  { id: "setting", icon: Settings, label: "Setting" },
];

export default function NavBar() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <nav className="bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-full px-1 py-1 flex items-center justify-between gap-4 max-w-[380px] w-full mx-auto mb-1 shrink-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex items-center justify-center p-2 rounded-full transition-all duration-300",
                isActive ? "bg-[#1A1A1A] text-white scale-105 shadow-md" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70"
              )}
            >
              <Icon size={20} strokeWidth={2.5} />
              {isActive && (
                <span className="sr-only">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
  );
}
