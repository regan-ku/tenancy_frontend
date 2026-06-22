"use client";

import React, { useState, useEffect } from "react";
import { adminPlatformApi, IntegrationStatus } from "@/api/adminPlatform.api";

export default function IntegrationHealthPanel() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    adminPlatformApi.getIntegrations().then((data) => {
      setIntegrations(data);
      setLoading(false);
    });
  }, []);

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      await adminPlatformApi.testIntegration(id);
      alert("✅ Connection successful. API is responding normally.");
    } catch (error) {
      alert("❌ Connection failed. Check API keys or provider status.");
    } finally {
      setTestingId(null);
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "active":
        return {
          color: "bg-green-500",
          text: "Operational",
          textColor: "text-green-700",
        };
      case "degraded":
        return {
          color: "bg-yellow-500",
          text: "Degraded",
          textColor: "text-yellow-700",
        };
      case "offline":
        return {
          color: "bg-red-500",
          text: "Offline",
          textColor: "text-red-700",
        };
      default:
        return {
          color: "bg-slate-400",
          text: "Unknown",
          textColor: "text-slate-600",
        };
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "mpesa":
        return "📱";
      case "africastalking_sms":
        return "💬";
      case "whatsapp_business":
        return "🟢";
      case "google_maps":
        return "🗺️";
      default:
        return "🔌";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          Monitor external API gateways, credentials, and delivery health.
        </p>
        <button className="text-xs font-bold px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
          View Global API Logs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-slate-100 animate-pulse rounded-2xl"
                ></div>
              ))
          : integrations.map((intg) => {
              const status = getStatusIndicator(intg.status);
              return (
                <div
                  key={intg.id}
                  className="p-6 border border-slate-200 rounded-2xl hover:shadow-md transition-shadow bg-white"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {getProviderIcon(intg.provider)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {intg.service_name}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          ID: {intg.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${status.color}`}
                      ></div>
                      <span className={`text-xs font-bold ${status.textColor}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">
                        API Key
                      </p>
                      <p className="font-mono text-slate-700 text-xs mt-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {intg.api_key_masked}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">
                        Last Health Check
                      </p>
                      <p className="text-slate-700 text-xs mt-1">
                        {intg.last_health_check}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">
                        Error Rate (24h)
                      </p>
                      <p
                        className={`font-bold mt-1 ${intg.error_rate_24h > 2 ? "text-red-600" : "text-green-600"}`}
                      >
                        {intg.error_rate_24h}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">
                        Account Balance
                      </p>
                      <p className="font-bold text-primary-dark mt-1">
                        {intg.account_balance !== undefined
                          ? `KES ${intg.account_balance.toLocaleString()}`
                          : "N/A (Unlimited)"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleTestConnection(intg.id)}
                      disabled={testingId === intg.id}
                      className="flex-1 text-xs font-bold py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 disabled:opacity-50"
                    >
                      {testingId === intg.id ? "Testing..." : "Test Connection"}
                    </button>
                    <button className="flex-1 text-xs font-bold py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                      Edit Credentials
                    </button>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
