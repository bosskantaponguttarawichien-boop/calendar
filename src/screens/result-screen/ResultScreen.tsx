"use client";

import React, { useMemo } from "react";
import { TrendingUp, Calendar, CheckCircle2, Clock, ChevronRight, HelpCircle, Sun, CloudSun, Moon, SunMoon, MoonStar, ShieldAlert, Zap } from "lucide-react";
import { format, isPast, isSameMonth, startOfDay, addDays, isSameDay, getWeek, differenceInHours } from "date-fns";
import { th } from "date-fns/locale";
import { EventData, Shift } from "@/types/event.types";

interface ResultScreenProps {
  events: EventData[];
  shifts: Shift[];
  pickerDate: Date;
}

const ICON_MAP: Record<string, any> = {
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

export default function ResultScreen({ events, shifts, pickerDate }: ResultScreenProps) {
  // 1. Filter events for the current selected month
  const monthlyEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = event.start instanceof Date ? event.start : (event.start as any).toDate();
      return isSameMonth(eventDate, pickerDate) && !event.isDeleted;
    }).map(e => ({
      ...e,
      startDate: e.start instanceof Date ? e.start : (e.start as any).toDate(),
      endDate: e.end instanceof Date ? e.end : (e.end as any).toDate(),
    })).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [events, pickerDate]);

  // 2. Calculate Stats
  const statsData = useMemo(() => {
    const total = monthlyEvents.length;
    const completed = monthlyEvents.filter(e => {
      return isPast(e.startDate) && !isSameDay(e.startDate, new Date());
    }).length;
    const pending = total - completed;

    return [
      { label: "เวรทั้งหมด", value: total.toString(), icon: Calendar, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
      { label: "เข้าเวรแล้ว", value: completed.toString(), icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
      { label: "รอดำเนินการ", value: pending.toString(), icon: Clock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    ];
  }, [monthlyEvents]);

  // 3. Shift Breakdown
  const shiftBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    monthlyEvents.forEach(e => {
      counts[e.shiftId] = (counts[e.shiftId] || 0) + 1;
    });

    return Object.entries(counts).map(([id, count]) => {
      const shift = shifts.find(s => s.id === id);
      return {
        id,
        count,
        title: shift?.title || "ไม่ทราบชื่อ",
        color: shift?.color || "#64748b",
        icon: shift?.icon || "help",
      };
    }).sort((a, b) => b.count - a.count);
  }, [monthlyEvents, shifts]);

  // 4. Advanced Health Analytics
  const insights = useMemo(() => {
    if (monthlyEvents.length === 0) {
      return {
        title: "ไม่มีตารางเวร",
        value: "พานั่งพัก",
        desc: "ยังไม่มีข้อมูลเวรในเดือนนี้ ลองเพิ่มเวรในปฏิทินดูสิ!",
        icon: Calendar,
        type: 'neutral'
      };
    }

    // A. Weekly Hours (Rule: > 60h/week is Overwork)
    const weeklyHoursMap: Record<number, number> = {};
    monthlyEvents.forEach(e => {
      const week = getWeek(e.startDate, { weekStartsOn: 1 }); // Monday start
      const hours = (e.endDate.getTime() - e.startDate.getTime()) / (1000 * 60 * 60);
      weeklyHoursMap[week] = (weeklyHoursMap[week] || 0) + hours;
    });
    const maxWeeklyHours = Math.max(...Object.values(weeklyHoursMap), 0);

    // B. Night Overload (Rule: Night streak > 3 is overload)
    let maxNightStreak = 0;
    let currentNightStreak = 0;
    const sortedNightDates = Array.from(new Set(
      monthlyEvents
        .filter(e => {
          const shift = shifts.find(s => s.id === e.shiftId);
          return shift?.icon === 'night' || shift?.title.includes('ดึก');
        })
        .map(e => startOfDay(e.startDate).getTime())
    )).sort((a, b) => a - b);

    for (let i = 0; i < sortedNightDates.length; i++) {
      if (i > 0 && sortedNightDates[i] === addDays(new Date(sortedNightDates[i - 1]), 1).getTime()) {
        currentNightStreak++;
      } else {
        currentNightStreak = 1;
      }
      maxNightStreak = Math.max(maxNightStreak, currentNightStreak);
    }

    // C. Rest Time (Rule: Gap < 8h is insufficient)
    let minRestHours = 999;
    let hasBadTransition = false;
    for (let i = 0; i < monthlyEvents.length - 1; i++) {
      const gap = (monthlyEvents[i + 1].startDate.getTime() - monthlyEvents[i].endDate.getTime()) / (1000 * 60 * 60);
      if (gap >= 0 && gap < minRestHours) {
        minRestHours = gap;
      }
      if (gap >= 0 && gap < 8) {
        hasBadTransition = true;
      }
    }

    // Determine Result (Severity: Rest > Overwork > Night Overload)
    if (hasBadTransition && minRestHours < 8) {
      return {
        title: "พักผ่อนไม่เพียงพอ",
        value: `ห่างเพียง ${minRestHours.toFixed(1)} ชม.`,
        desc: "ระยะเวลาพักระหว่างเวรไม่ถึง 8 ชั่วโมง ซึ่งผิดหลักสุขภาพและอาจส่งผลเสียต่อร่างกายได้!",
        icon: ShieldAlert,
        type: 'danger'
      };
    }

    if (maxWeeklyHours > 60) {
      return {
        title: "Overwork!",
        value: `${maxWeeklyHours.toFixed(0)} ชม./สัปดาห์`,
        desc: `คุณทำงานเกิน 60 ชม. ต่อสัปดาห์ ถือว่าเป็นภาระงานที่หนักเกินไป ควรลดภาระงานลงบ้าง`,
        icon: Zap,
        type: 'warning'
      };
    }

    if (maxNightStreak > 3) {
      return {
        title: "Night Overload",
        value: `${maxNightStreak} คืนติด`,
        desc: `เข้าเวรดึกติดต่อกัน ${maxNightStreak} คืนแล้วนะ ควรมีวันพักหลังเวรดึกเพื่อฟื้นฟูร่างกาย`,
        icon: Moon,
        type: 'warning'
      };
    }

    // Secondary insights from previous logic
    const totalStreak = (() => {
      let maxS = 0, currS = 0;
      const sortedDates = Array.from(new Set(monthlyEvents.map(e => startOfDay(e.startDate).getTime()))).sort((a, b) => a - b);
      for (let i = 0; i < sortedDates.length; i++) {
        if (i > 0 && sortedDates[i] === addDays(new Date(sortedDates[i - 1]), 1).getTime()) currS++;
        else currS = 1;
        maxS = Math.max(maxS, currS);
      }
      return maxS;
    })();

    if (totalStreak >= 6) {
      return {
        title: "โหมดบ้าพลัง!",
        value: `${totalStreak} วันติด`,
        desc: `คุณทำงานติดต่อกัน ${totalStreak} วันแล้วนะ อย่าลืมหาเวลาพักผ่อนยาวๆ บ้าง!`,
        icon: TrendingUp,
        type: 'warning'
      };
    }

    return {
      title: "สมดุลชีวิตดี",
      value: "ยอดเยี่ยม",
      desc: "ตารางเวรของคุณดูมีความสมดุลดีตามมาตรฐานสุขภาพ ขอให้มีความสุขกับการทำงานครับ!",
      icon: CheckCircle2,
      type: 'success'
    };
  }, [monthlyEvents, shifts]);

  // 5. Recent/Upcoming list (Top 3 closest to today)
  const recentActivitiesList = useMemo(() => {
    const today = startOfDay(new Date());
    return monthlyEvents
      .filter(e => e.startDate.getTime() >= today.getTime())
      .slice(0, 3)
      .map(e => {
        const shift = shifts.find(s => s.id === e.shiftId);
        return {
          title: shift?.title || e.title,
          date: format(e.startDate, "d MMM yyyy", { locale: th }),
          status: isPast(e.startDate) && !isSameDay(e.startDate, new Date()) ? "เสร็จสิ้น" : "รอดำเนินการ",
          type: "เวร",
          color: shift?.color || "#64748b"
        };
      });
  }, [monthlyEvents, shifts]);

  return (
    <div className="flex-grow overflow-y-auto px-1 pb-4">
      {/* Overview Card */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-slate-800 dark:text-slate-100" />
          <h2 className="font-bold text-slate-800 dark:text-slate-100">สรุปภาพรวมเดือนนี้</h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {statsData.map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-3 flex flex-col items-center text-center shadow-sm border border-white/40 dark:border-white/5`}>
              <stat.icon size={18} className={`${stat.color} mb-2`} />
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Breakdown */}
      {shiftBreakdown.length > 0 && (
        <>
          <div className="mb-2 px-2 flex justify-between items-center">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              ประเภทเวรที่เข้าบ่อย
            </h3>
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 px-1 scrollbar-hide">
            {shiftBreakdown.map((item) => {
              const Icon = ICON_MAP[item.icon] || HelpCircle;
              return (
                <div key={item.id} className="flex-shrink-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2 border border-white/40 dark:border-white/5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: item.color }}>
                    <Icon size={12} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight">{item.title}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.count} วัน</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Recent Activity */}
      <div className="mb-2 px-2 flex justify-between items-center">
        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          เวรที่กำลังจะถึง
        </h3>
        <button className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">ดูทั้งหมด</button>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden mb-4 border border-white/20 dark:border-slate-700/30">
        {recentActivitiesList.length > 0 ? (
          recentActivitiesList.map((activity, i) => (
            <button
              key={i}
              className={`w-full flex items-center justify-between px-5 py-4 active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors ${
                i < recentActivitiesList.length - 1 ? "border-b border-slate-100/50 dark:border-slate-700/50" : ""
              }`}
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activity.color }} />
                <div>
                  <p className="text-slate-800 dark:text-slate-200 font-bold text-sm tracking-tight">{activity.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar size={10} /> {activity.date}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 dark:text-slate-400 font-medium">
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
            </button>
          ))
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm">ไม่มีข้อมูลในเดือนนี้</div>
        )}
      </div>

      {/* Insight Card */}
      <div className={`rounded-3xl p-6 text-white shadow-lg overflow-hidden relative transition-colors duration-500 ${
        insights.type === 'danger' ? 'bg-gradient-to-br from-red-600 to-red-800' :
        insights.type === 'warning' ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
        insights.type === 'success' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
        'bg-gradient-to-br from-slate-800 to-slate-900'
      }`}>
        <div className="relative z-10">
          <p className="text-xs text-white/80 font-medium mb-1 uppercase tracking-widest">{insights.title}</p>
          <p className="text-3xl font-black mb-1">{insights.value}</p>
          <p className="text-[11px] text-white/70 leading-relaxed max-w-[210px] mt-2 font-medium">{insights.desc}</p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <insights.icon size={130} strokeWidth={1} />
        </div>
      </div>
    </div>
  );
}
