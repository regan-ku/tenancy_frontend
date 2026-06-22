"use client";

import React, { useState, useEffect } from "react";
import {
  agencyIntelligenceApi,
  SystemNotification,
  Campaign,
  AudienceSegment,
} from "@/api/agencyIntelligence.api";

export default function AgencyCommunicationsPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "campaigns" | "logs">(
    "inbox",
  );

  // Data States
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [audiences, setAudiences] = useState<AudienceSegment[]>([]);

  // Campaign Builder States
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<"sms" | "whatsapp">(
    "whatsapp",
  );
  const [messageBody, setMessageBody] = useState(
    "Dear {tenant_name}, this is a reminder that your rent of {amount} for {unit} is due on {date}.",
  );

  useEffect(() => {
    const fetchData = async () => {
      const [n, c, a] = await Promise.all([
        agencyIntelligenceApi.getNotifications(),
        agencyIntelligenceApi.getCampaigns(),
        agencyIntelligenceApi.getAudienceSegments(),
      ]);
      setNotifications(n);
      setCampaigns(c);
      setAudiences(a);
    };
    fetchData();
  }, []);

  const handleMarkRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const handleSendCampaign = async () => {
    if (!selectedAudience) return alert("Please select an audience.");
    alert(
      `✅ Campaign queued successfully! ${audiences.find((a) => a.id === selectedAudience)?.estimated_count} messages will be sent via ${selectedChannel.toUpperCase()}.`,
    );
    setShowBuilder(false);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "payment":
        return "💰";
      case "maintenance":
        return "🛠️";
      case "application":
        return "📝";
      case "compliance":
        return "🛡️";
      default:
        return "🔔";
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Communications Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            System notifications, delivery logs, and bulk tenant campaigns.
          </p>
        </div>
        {activeTab === "campaigns" && (
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-primary/90"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Campaign
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            {
              key: "inbox",
              label: `System Inbox ${unreadCount > 0 ? `(${unreadCount})` : ""}`,
            },
            { key: "campaigns", label: "Campaigns & Broadcasts" },
            { key: "logs", label: "Delivery Logs" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* INBOX TAB */}
      {activeTab === "inbox" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors ${!notif.is_read ? "bg-blue-50/40" : ""}`}
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
        <div className="space-y-6">
          {/* Campaign Builder (Toggleable) */}
          {showBuilder && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/20 animate-in fade-in slide-in-from-top-2">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                New Broadcast Campaign
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    1. Select Audience
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {audiences.map((aud) => (
                      <button
                        key={aud.id}
                        onClick={() => setSelectedAudience(aud.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${selectedAudience === aud.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-slate-200 hover:border-slate-300"}`}
                      >
                        <p className="text-sm font-bold text-slate-800">
                          {aud.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {aud.estimated_count} Tenants
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      2. Delivery Channel
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedChannel("whatsapp")}
                        className={`flex-1 py-3 rounded-lg border font-bold text-sm ${selectedChannel === "whatsapp" ? "bg-green-50 border-green-500 text-green-700" : "border-slate-200 text-slate-500"}`}
                      >
                        🟢 WhatsApp
                      </button>
                      <button
                        onClick={() => setSelectedChannel("sms")}
                        className={`flex-1 py-3 rounded-lg border font-bold text-sm ${selectedChannel === "sms" ? "bg-blue-50 border-blue-500 text-blue-700" : "border-slate-200 text-slate-500"}`}
                      >
                        💬 SMS
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      3. Message Template
                    </label>
                    <textarea
                      rows={5}
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Variables: {"{tenant_name}"}, {"{unit}"}, {"{amount}"},{" "}
                      {"{date}"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowBuilder(false)}
                  className="px-6 py-2.5 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendCampaign}
                  className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90"
                >
                  Queue Campaign
                </button>
              </div>
            </div>
          )}

          {/* Campaign History Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Campaign Name</th>
                  <th className="px-6 py-4">Channel</th>
                  <th className="px-6 py-4">Audience Size</th>
                  <th className="px-6 py-4">Delivery Rate</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => {
                  const deliveryRate =
                    c.audience_size > 0
                      ? Math.round((c.delivered / c.audience_size) * 100)
                      : 0;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {c.name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${c.channel === "whatsapp" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                        >
                          {c.channel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {c.audience_size}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div
                              className="bg-green-500 h-1.5 rounded-full"
                              style={{ width: `${deliveryRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {deliveryRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${c.status === "sent" ? "bg-green-100 text-green-700" : c.status === "scheduled" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {c.created_at}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOGS TAB (Placeholder for deep delivery tracking) */}
      {activeTab === "logs" && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">
            📜
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Message Delivery Logs
          </h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Deep-dive analytics into individual message delivery statuses, API
            response codes, and retry attempts from Africa's Talking and
            WhatsApp Business APIs.
          </p>
        </div>
      )}
    </div>
  );
}
