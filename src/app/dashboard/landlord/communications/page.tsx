"use client";

import React, { useState, useEffect } from "react";
import { reportsApi, Notification, CampaignTemplate } from "@/api/reports.api";

export default function LandlordCommunicationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<"inbox" | "campaigns">("inbox");

  // Campaign State
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [audience, setAudience] = useState("all_tenants");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    reportsApi.getNotifications().then(setNotifications);
    reportsApi.getCampaignTemplates().then(setTemplates);
  }, []);

  const handleMarkRead = async (id: string) => {
    await reportsApi.markAsRead(id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const handleSendCampaign = async () => {
    if (!selectedTemplate) return alert("Please select a template.");
    setIsSending(true);
    try {
      await reportsApi.sendBroadcast(selectedTemplate, audience, channel);
      alert(
        "✅ Campaign queued successfully! Messages will be delivered shortly.",
      );
      setSelectedTemplate("");
    } catch (error) {
      alert("Failed to send campaign.");
    } finally {
      setIsSending(false);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "payment":
        return "💰";
      case "maintenance":
        return "🛠️";
      case "application":
        return "📝";
      default:
        return "🔔";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Communications Hub
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage system notifications, message logs, and broadcast campaigns.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { key: "inbox", label: "Notifications Inbox" },
            { key: "campaigns", label: "Send Broadcast / Campaign" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* INBOX TAB */}
      {activeTab === "inbox" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">
              Recent Activity & Alerts
            </h2>
            <button className="text-xs text-primary font-bold hover:underline">
              Mark All as Read
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors ${!notif.is_read ? "bg-blue-50/30" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                  {getNotifIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p
                      className={`font-bold ${!notif.is_read ? "text-primary-dark" : "text-slate-700"}`}
                    >
                      {notif.title}
                    </p>
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-4">
                      {notif.created_at}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                </div>
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="text-xs text-primary font-bold hover:underline flex-shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CAMPAIGNS TAB */}
      {activeTab === "campaigns" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-lg font-bold text-slate-800">
              Configure Broadcast
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Select Message Template
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`p-4 text-left rounded-xl border transition-all ${
                      selectedTemplate === t.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-800 text-sm">
                        {t.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {t.channel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {t.content}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Target Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="all_tenants">All Active Tenants</option>
                  <option value="overdue">Tenants with Overdue Rent</option>
                  <option value="expiring">Leases Expiring in 30 Days</option>
                  <option value="property_myles">
                    Tenants in Myles Apartment
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Delivery Channel
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setChannel("sms")}
                    className={`flex-1 py-2.5 rounded-lg border font-bold text-sm ${channel === "sms" ? "bg-blue-50 border-blue-500 text-blue-700" : "border-slate-200 text-slate-500"}`}
                  >
                    💬 SMS
                  </button>
                  <button
                    onClick={() => setChannel("whatsapp")}
                    className={`flex-1 py-2.5 rounded-lg border font-bold text-sm ${channel === "whatsapp" ? "bg-green-50 border-green-500 text-green-700" : "border-slate-200 text-slate-500"}`}
                  >
                    🟢 WhatsApp
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button className="px-6 py-2.5 text-slate-500 font-medium">
                Save as Draft
              </button>
              <button
                onClick={handleSendCampaign}
                disabled={isSending || !selectedTemplate}
                className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "🚀"
                )}
                {isSending ? "Queuing..." : "Send Broadcast"}
              </button>
            </div>
          </div>

          {/* Preview / Info Sidebar */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit">
            <h3 className="font-bold text-slate-800 mb-4">Campaign Summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Audience:</span>
                <span className="font-bold text-slate-800 capitalize">
                  {audience.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Recipients:</span>
                <span className="font-bold text-primary">~34 Tenants</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel:</span>
                <span className="font-bold text-slate-800 uppercase">
                  {channel}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 mt-4">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                  Compliance Note
                </p>
                <p className="text-xs text-slate-600">
                  Messages will only be sent to tenants who have opted-in to{" "}
                  {channel} notifications. System respects the 3-month data
                  privacy rule.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
