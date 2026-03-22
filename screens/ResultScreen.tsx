"use client";

import { TrendingUp, Calendar, CheckCircle2, Clock, ChevronRight } from "lucide-react";

export default function ResultScreen() {
  const stats = [
    { label: "กิจกรรมทั้งหมด", value: "12", icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "เสร็จสิ้นแล้ว", value: "8", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
    { label: "รอดำเนินการ", value: "4", icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  const recentActivities = [
    { title: "ประชุมทีมประจำสัปดาห์", date: "20 มี.ค. 2026", status: "เสร็จสิ้น", type: "งาน" },
    { title: "นัดกินข้าวกับลูกค้า", date: "21 มี.ค. 2026", status: "รอดำเนินการ", type: "ส่วนตัว" },
    { title: "ส่งโปรเจค Final", date: "25 มี.ค. 2026", status: "รอดำเนินการ", type: "งาน" },
  ];

  return (
    <div className="flex-grow overflow-y-auto px-1 pb-4">
      {/* Overview Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-slate-800" />
          <h2 className="font-bold text-slate-800">สรุปภาพรวมเดือนนี้</h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-3 flex flex-col items-center text-center shadow-sm border border-white/40`}>
              <stat.icon size={18} className={`${stat.color} mb-2`} />
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-2 px-2 flex justify-between items-center">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          กิจกรรมล่าสุด
        </h3>
        <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600">ดูทั้งหมด</button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden mb-4 border border-white/20">
        {recentActivities.map((activity, i) => (
          <button
            key={i}
            className={`w-full flex items-center justify-between px-5 py-4 active:bg-slate-50 transition-colors ${
              i < recentActivities.length - 1 ? "border-b border-slate-100/50" : ""
            }`}
          >
            <div className="flex items-center gap-4 text-left">
              <div className={`w-2 h-2 rounded-full ${activity.status === "เสร็จสิ้น" ? "bg-green-400" : "bg-orange-400"}`} />
              <div>
                <p className="text-slate-800 font-bold text-sm tracking-tight">{activity.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar size={10} /> {activity.date}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-medium">
                    {activity.type}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-300" />
          </button>
        ))}
      </div>

      {/* Small Chart Mockup / Decoration */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-xs text-white/60 font-medium mb-1 uppercase tracking-widest">ประสิทธิภาพการทำงาน</p>
          <p className="text-2xl font-bold mb-1">+15%</p>
          <p className="text-[10px] text-white/40 leading-relaxed max-w-[180px]">คุณจัดการงานได้เร็วขึ้นกว่าสัปดาห์ที่แล้ว ยอดเยี่ยมมาก!</p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <TrendingUp size={120} />
        </div>
      </div>
    </div>
  );
}
