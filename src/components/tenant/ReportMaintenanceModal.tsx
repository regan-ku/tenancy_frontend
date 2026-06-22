"use client";

import React, { useState, useRef } from "react";
import {
  tenantMaintenanceApi,
  MaintenanceCategory,
  MaintenancePriority,
  CreateMaintenancePayload,
} from "@/api/tenantMaintance.api";
import { PersonalTenancy } from "@/api/tenantDashboard.api";

interface ReportMaintenanceModalProps {
  tenancies: PersonalTenancy[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportMaintenanceModal({
  tenancies,
  onClose,
  onSuccess,
}: ReportMaintenanceModalProps) {
  const [tenancyId, setTenancyId] = useState<number>(tenancies[0]?.id || 0);
  const [category, setCategory] = useState<MaintenanceCategory>("general");
  const [priority, setPriority] = useState<MaintenancePriority>("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMediaFiles((prev) => [...prev, ...files]);

      // Generate local previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!tenancyId || !title.trim() || !description.trim()) {
      return alert("Please fill in all required fields.");
    }

    setIsSubmitting(true);
    try {
      const payload: CreateMaintenancePayload = {
        tenancy_id: tenancyId,
        title,
        description,
        category,
        priority,
        media_files: mediaFiles,
      };
      await tenantMaintenanceApi.createRequest(payload);
      alert(
        "✅ Maintenance request submitted successfully! The on-site team has been notified.",
      );
      onSuccess();
    } catch (error) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTenancy = tenancies.find((t) => t.id === tenancyId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-primary/5">
          <h2 className="text-xl font-bold text-primary-dark">
            Report Maintenance Issue
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. Select Tenancy */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              1. Which property has the issue?
            </label>
            <select
              value={tenancyId}
              onChange={(e) => setTenancyId(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
            >
              {tenancies.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.property_name} - Unit {t.unit_code} ({t.unit_type})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                2. Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as MaintenanceCategory)
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none text-sm capitalize"
              >
                <option value="plumbing">Plumbing / Water</option>
                <option value="electrical">Electrical / Power</option>
                <option value="structural">Structural / Walls</option>
                <option value="security">Security / Locks</option>
                <option value="appliances">Appliances</option>
                <option value="general">General / Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                3. Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as MaintenancePriority)
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
              >
                <option value="low">Low (Minor issue)</option>
                <option value="medium">Medium (Needs attention)</option>
                <option value="high">High (Disruptive)</option>
                <option value="emergency">🚨 Emergency (Urgent hazard)</option>
              </select>
            </div>
          </div>

          {priority === "emergency" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <span className="text-lg">🚨</span>
              <p>
                <strong>Emergency Alert:</strong> Selecting this will
                immediately SMS and WhatsApp the on-site caretaker and agency
                manager.
              </p>
            </div>
          )}

          {/* 3. Details */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              4. Issue Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Kitchen sink leaking"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              5. Detailed Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          {/* 4. Media Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              6. Attach Photos / Videos (Evidence)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                capture="environment"
                className="hidden"
                multiple
              />
              <svg
                className="w-8 h-8 mx-auto text-slate-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-sm font-bold text-slate-700">
                Tap to upload or take a photo
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Max 5MB per file. JPG, PNG, MP4.
              </p>
            </div>

            {/* Previews */}
            {mediaPreviews.length > 0 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {mediaPreviews.map((preview, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0"
                  >
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMedia(idx);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              "🚀 Submit Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
