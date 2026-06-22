"use client";

import React, { useState, useEffect } from "react";
import {
  tenantCommunicationsApi,
  TenantNotification,
  NotificationType,
} from "@/api/tenantCommunications.api";
import NotificationPreferencesModal from "@/components/tenant/NotificationPreferencesModal";

export default function TenantCommunicationsPage() {
  const [notifications, setNotifications] = useState<TenantNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | NotificationType>(
    "all",
  );
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    tenantCommunicationsApi.getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    await tenantCommunicationsApi.markAsRead(id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const handleMarkAllAsRead = async () => {
    await tenantCommunicationsApi.markAllAsRead();
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  const getNotificationIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, string> = {
      billing: "💰",
      maintenance: "🛠️",
      application: "📝",
      tenancy: "📄",
      system: "⚙️",
    };
    return icons[type] || "🔔";
  };

  const getNotificationColor = (type: NotificationType) => {
    const colors: Record<NotificationType, string> = {
      billing: "bg-green-100 text-green-600",
      maintenance: "bg-orange-100 text-orange-600",
      application: "bg-blue-100 text-blue-600",
      tenancy: "bg-purple-100 text-purple-600",
      system: "bg-slate-100 text-slate-600",
    };
    return colors[type] || "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Communications & Alerts
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            System notifications regarding your tenancies, billing, and
            maintenance requests.
          </p>
        </div>
        <button
          onClick={() => setShowPreferences(true)}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          Notification Preferences
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="All"
            count={notifications.length}
            isActive={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          <FilterButton
            label="Billing"
            count={notifications.filter((n) => n.type === "billing").length}
            isActive={activeFilter === "billing"}
            onClick={() => setActiveFilter("billing")}
            icon="💰"
          />
          <FilterButton
            label="Maintenance"
            count={notifications.filter((n) => n.type === "maintenance").length}
            isActive={activeFilter === "maintenance"}
            onClick={() => setActiveFilter("maintenance")}
            icon="🛠️"
          />
          <FilterButton
            label="Tenancy"
            count={notifications.filter((n) => n.type === "tenancy").length}
            isActive={activeFilter === "tenancy"}
            onClick={() => setActiveFilter("tenancy")}
            icon="📄"
          />
          <FilterButton
            label="System"
            count={notifications.filter((n) => n.type === "system").length}
            isActive={activeFilter === "system"}
            onClick={() => setActiveFilter("system")}
            icon="⚙️"
          />
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-primary font-bold hover:underline whitespace-nowrap"
          >
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-slate-500 font-medium">
                No notifications in this category.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors ${!notif.is_read ? "bg-blue-50/40" : ""}`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${getNotificationColor(notif.type)}`}
                >
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p
                        className={`font-bold ${!notif.is_read ? "text-primary-dark" : "text-slate-700"}`}
                      >
                        {notif.title}
                        {!notif.is_read && (
                          <span className="ml-2 w-2 h-2 bg-primary rounded-full inline-block"></span>
                        )}
                      </p>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">
                      {notif.created_at}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-4">
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                    {notif.related_tenancy_id && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">
                        Linked to Tenancy #{notif.related_tenancy_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <NotificationPreferencesModal
          onClose={() => setShowPreferences(false)}
        />
      )}
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function FilterButton({ label, count, isActive, onClick, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
        isActive
          ? "bg-primary text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-white text-slate-500"}`}
      >
        {count}
      </span>
    </button>
  );
}
