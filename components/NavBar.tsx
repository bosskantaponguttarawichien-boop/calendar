"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => item.id === activeTab);
    const btn = buttonRefs.current[activeIndex];
    const nav = navRef.current;
    if (btn && nav) {
      const navRect = nav.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPillStyle({
        left: btnRect.left - navRect.left,
        width: btnRect.width,
      });
    }
  }, [activeTab]);

  return (
    <nav
      ref={navRef}
      className="relative bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-full px-3 py-2 flex items-center justify-between gap-2 max-w-[420px] w-full mx-auto mb-2 shrink-0"
    >
      {/* Sliding pill */}
      <span
        className="absolute top-2 bottom-2 rounded-full bg-[#1A1A1A] shadow-md pointer-events-none"
        style={{
          left: pillStyle.left,
          width: pillStyle.width,
          transition: "left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />

      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            ref={(el) => { buttonRefs.current[index] = el; }}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "relative z-10 flex items-center justify-center p-3.5 rounded-full transition-colors duration-200",
              isActive ? "text-white" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70"
            )}
          >
            <Icon size={24} strokeWidth={2.2} />
            <span className="sr-only">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
