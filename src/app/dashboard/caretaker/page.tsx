"use client";

import React, { useState, useEffect } from "react";
import { caretakerApi, FieldTask } from "@/api/caretaker.api";
import FieldTaskCard from "@/components/caretaker/FeildTaskCard";

export default function CaretakerDashboard() {
  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "maintenance" | "inspections"
  >("all");

  useEffect(() => {
    caretakerApi.getMyTasks().then((data) => {
      setTasks(data);
      setLoading(false);
    });
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === "all") return true;
    return t.type === activeFilter;
  });

  const stats = {
    emergency: tasks.filter(
      (t) => t.priority === "emergency" && t.status !== "completed",
    ).length,
    pending: tasks.filter((t) => t.status === "assigned").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    // ✅ Mobile-First Container: Max width simulates a phone screen on desktop, full width on mobile
    <div className="min-h-screen bg-slate-50 pb-24 max-w-md mx-auto relative shadow-2xl sm:border-x sm:border-slate-200">
      {/* Header */}
      <header className="bg-white px-5 pt-6 pb-4 border-b border-slate-100 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 font-medium">Good Morning,</p>
            <h1 className="text-xl font-bold text-primary-dark">
              James Mwangi
            </h1>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
              JM
            </div>
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white"></span>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 px-5 py-4">
        <StatBox
          label="Emergencies"
          value={stats.emergency}
          color="text-red-600"
          bg="bg-red-50"
          pulse={stats.emergency > 0}
        />
        <StatBox
          label="Pending"
          value={stats.pending}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatBox
          label="Done Today"
          value={stats.completed}
          color="text-green-600"
          bg="bg-green-50"
        />
      </div>

      {/* Filter Tabs */}
      <div className="px-5 mb-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(["all", "maintenance", "inspections"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                activeFilter === filter
                  ? "bg-white text-primary-dark shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {filter === "all" ? "All Tasks" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Task Feed */}
      <div className="px-5 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-slate-200 animate-pulse rounded-2xl"
              ></div>
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <FieldTaskCard
              key={task.id}
              task={task}
              onComplete={() =>
                setTasks(
                  tasks.map((t) =>
                    t.id === task.id ? { ...t, status: "completed" } : t,
                  ),
                )
              }
            />
          ))
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-bold">All caught up!</p>
            <p className="text-sm">No pending tasks for this filter.</p>
          </div>
        )}
      </div>

      {/* ✅ MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-30 shadow-lg">
        <NavButton
          icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          label="Home"
          active
        />
        <NavButton
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          label="Tasks"
        />
        <NavButton
          icon="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          label="Map"
        />
        <NavButton
          icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          label="Profile"
        />
      </nav>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function StatBox({ label, value, color, bg, pulse }: any) {
  return (
    <div className={`${bg} p-3 rounded-xl text-center relative`}>
      {pulse && (
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

function NavButton({ icon, label, active }: any) {
  return (
    <button
      className={`flex flex-col items-center gap-1 ${active ? "text-primary" : "text-slate-400"}`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={icon}
        />
      </svg>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}
