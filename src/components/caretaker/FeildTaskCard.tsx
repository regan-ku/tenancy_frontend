"use client";

import React, { useState, useRef } from "react";
import { FieldTask, caretakerApi } from "@/api/caretaker.api";

interface FieldTaskCardProps {
  task: FieldTask;
  onComplete: () => void;
}

export default function FieldTaskCard({
  task,
  onComplete,
}: FieldTaskCardProps) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)]);
    }
  };

  const handleResolve = async () => {
    setIsSubmitting(true);
    try {
      await caretakerApi.updateTask(task.id, {
        status: "completed",
        notes: notes,
        media_files: photos,
      });
      setIsActionSheetOpen(false);
      onComplete(); // Update UI
    } catch (error) {
      alert("Failed to submit. Check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityStyles = () => {
    switch (task.priority) {
      case "emergency":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-400 text-yellow-900";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header: Priority & Type */}
        <div
          className={`px-4 py-2 flex justify-between items-center ${task.priority === "emergency" ? "bg-red-50 border-b border-red-100" : "bg-slate-50 border-b border-slate-100"}`}
        >
          <span
            className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded ${getPriorityStyles()}`}
          >
            {task.priority === "emergency" && "🚨 "} {task.priority}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            {task.type === "maintenance" ? "🛠️ Repair" : "📋 Inspection"}
          </span>
        </div>

        {/* Body: Details */}
        <div className="p-4">
          <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
            {task.title}
          </h3>
          <p className="text-xs text-slate-500 mb-3 line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2 rounded-lg">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium">
              {task.property_name} • Unit {task.unit_code}
            </span>
          </div>

          {/* SLA Warning */}
          {task.priority === "emergency" && (
            <div className="flex items-center gap-2 text-red-600 text-xs font-bold mb-4">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              SLA Deadline: {task.sla_deadline}
            </div>
          )}

          {/* Actions */}
          {task.status !== "completed" ? (
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                Navigate
              </button>
              <button
                onClick={() => setIsActionSheetOpen(true)}
                className="py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 flex items-center justify-center gap-1"
              >
                {task.status === "assigned" ? "Start Task" : "Mark Complete"}
              </button>
            </div>
          ) : (
            <div className="py-2.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg text-center border border-green-100">
              ✅ Completed & Verified
            </div>
          )}
        </div>
      </div>

      {/* ✅ MOBILE ACTION SHEET (Bottom Modal for Evidence) */}
      {isActionSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsActionSheetOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-2"></div>
            <h3 className="text-lg font-bold text-slate-800">
              {task.status === "assigned"
                ? "Start Task & Add Notes"
                : "Submit Evidence & Complete"}
            </h3>

            {/* Photo Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Photo Evidence
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50"
              >
                {photos.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto">
                    {photos.map((p, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(p)}
                        className="w-16 h-16 object-cover rounded-lg"
                        alt="preview"
                      />
                    ))}
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xl">
                      +
                    </div>
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-8 h-8 mx-auto text-slate-400 mb-1"
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
                    <p className="text-xs text-slate-500 font-medium">
                      Tap to take photo or upload
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  multiple
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Technician Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Replaced the main valve. Tested for leaks."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleResolve}
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                  Syncing...
                </>
              ) : (
                <>✅ Confirm & Complete Task</>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
