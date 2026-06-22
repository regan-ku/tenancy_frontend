"use client";

import React, { useState, useEffect } from "react";
import {
  tenantCommunicationsApi,
  NotificationPreferences,
} from "@/api/tenantCommunications.api";

interface NotificationPreferencesModalProps {
  onClose: () => void;
}

export default function NotificationPreferencesModal({
  onClose,
}: NotificationPreferencesModalProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    sms_enabled: false,
    whatsapp_enabled: false,
    email_enabled: false,
    in_app_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    tenantCommunicationsApi.getPreferences().then((data) => {
      setPrefs(data);
      setLoading(false);
    });
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await tenantCommunicationsApi.updatePreferences(prefs);
      alert("✅ Notification preferences updated successfully.");
      onClose();
    } catch (error) {
      alert("Failed to update preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-8 text-slate-500">
          Loading preferences...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              Notification Preferences
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Choose how you want to receive system alerts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
            <strong>Note:</strong> Critical alerts (e.g., emergency maintenance,
            lease termination) will always be delivered via In-App and SMS
            regardless of your preferences.
          </div>

          <PreferenceToggle
            icon="📱"
            label="SMS Notifications"
            description="Receive text messages for rent reminders and urgent alerts."
            isEnabled={prefs.sms_enabled}
            onToggle={() => handleToggle("sms_enabled")}
          />

          <PreferenceToggle
            icon="🟢"
            label="WhatsApp Notifications"
            description="Receive structured messages and media updates via WhatsApp."
            isEnabled={prefs.whatsapp_enabled}
            onToggle={() => handleToggle("whatsapp_enabled")}
          />

          <PreferenceToggle
            icon="✉️"
            label="Email Notifications"
            description="Receive invoices, receipts, and formal notices via email."
            isEnabled={prefs.email_enabled}
            onToggle={() => handleToggle("email_enabled")}
          />

          <PreferenceToggle
            icon="🔔"
            label="In-App Notifications"
            description="View alerts directly in your Tennacy dashboard inbox."
            isEnabled={prefs.in_app_enabled}
            onToggle={() => handleToggle("in_app_enabled")}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function PreferenceToggle({
  icon,
  label,
  description,
  isEnabled,
  onToggle,
}: any) {
  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-bold text-slate-800 text-sm">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${isEnabled ? "bg-green-500" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isEnabled ? "translate-x-6" : ""}`}
        />
      </button>
    </div>
  );
}
