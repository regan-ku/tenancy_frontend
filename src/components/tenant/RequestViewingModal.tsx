"use client";

import React, { useState } from "react";
import {
  tenantMarketplaceApi,
  SavedProperty,
} from "@/api/tenantMarketplace.api";
import { useAuthStore } from "@/store/auth.store";

interface RequestViewingModalProps {
  property: SavedProperty;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestViewingModal({
  property,
  onClose,
  onSuccess,
}: RequestViewingModalProps) {
  const { user } = useAuthStore();

  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [contactChannel, setContactChannel] = useState<
    "whatsapp" | "phone_call" | "email"
  >("whatsapp");
  const [message, setMessage] = useState(
    "I am very interested in this property and would like to schedule a physical viewing.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!preferredDate || !preferredTime)
      return alert("Please select your preferred date and time.");

    setIsSubmitting(true);
    try {
      await tenantMarketplaceApi.requestViewing(property.listing_id, {
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        contact_channel: contactChannel,
        message: message,
      });
      alert(
        "✅ Viewing request submitted! The property agent will contact you shortly to confirm.",
      );
      onSuccess();
    } catch (error) {
      alert("Failed to submit viewing request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Default to tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-primary/5">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              Request Property Viewing
            </h2>
            <p className="text-xs text-slate-500 mt-1">{property.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Profile Sharing Notice */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>
              By submitting this request, your name, email, and phone number
              will be shared with the property's managing agent so they can
              coordinate the viewing with you.
            </p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Preferred Date
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={minDate}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Preferred Time
              </label>
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
              />
            </div>
          </div>

          {/* Contact Channel */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              How should the agent contact you?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["whatsapp", "phone_call", "email"] as const).map((channel) => (
                <button
                  key={channel}
                  onClick={() => setContactChannel(channel)}
                  className={`py-2.5 rounded-lg border text-xs font-bold capitalize transition-all ${
                    contactChannel === channel
                      ? "bg-primary/5 border-primary text-primary ring-2 ring-primary/20"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {channel === "phone_call"
                    ? "📞 Phone Call"
                    : channel === "whatsapp"
                      ? "🟢 WhatsApp"
                      : "✉️ Email"}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Message to Agent (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                Submitting...
              </>
            ) : (
              "📅 Request Viewing"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
