"use client";

import React, { useState, useEffect } from "react";
// ✅ UPDATED IMPORT: Points to Landlord Unit Management API
import { TenantFinancialInfo } from "@/api/landlordUnitManagement.api";
import { tenanciesApi, TenancyNote } from "@/api/tenancies.api";

interface TenantNotesModalProps {
  tenant: TenantFinancialInfo;
  onClose: () => void;
}

export default function TenantNotesModal({
  tenant,
  onClose,
}: TenantNotesModalProps) {
  const [notes, setNotes] = useState<TenancyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteType, setNoteType] = useState<string>("general");
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotes();
  }, [tenant.tenancy_id]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await tenanciesApi.getTenancyNotes(tenant.tenancy_id);
      setNotes(data);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      setError("Please enter note content");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const newNote = await tenanciesApi.addTenancyNote(tenant.tenancy_id, {
        note_type: noteType,
        content: noteContent,
        is_confidential: false,
      });

      setNotes([newNote, ...notes]);
      setNoteContent("");
      setNoteType("general");
      setIsAddingNote(false);
    } catch (err: any) {
      console.error("Failed to add note:", err);
      setError(err.response?.data?.detail || "Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNoteTypeBadge = (type: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      general: { color: "bg-slate-100 text-slate-700", label: "General" },
      behavior: { color: "bg-purple-100 text-purple-700", label: "Behavior" },
      payment: { color: "bg-blue-100 text-blue-700", label: "Payment" },
      maintenance: {
        color: "bg-orange-100 text-orange-700",
        label: "Maintenance",
      },
      handover: { color: "bg-green-100 text-green-700", label: "Handover" },
      financial: { color: "bg-indigo-100 text-indigo-700", label: "Financial" },
    };

    const badge = badges[type] || badges.general;
    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tenant Notes</h3>
            <p className="text-xs text-slate-500 mt-1">
              {tenant.tenant_name} • Unit {tenant.unit_code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* ⚠️ Important Notice */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
          <div className="flex gap-2">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
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
            <div>
              <p className="text-sm font-bold text-amber-800">
                Permanent Record
              </p>
              <p className="text-xs text-amber-700">
                Notes are permanent and cannot be deleted. They are used during
                application reviews, transfer requests, and tenancy renewals to
                assess tenant history.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Add Note Button/Form */}
          {!isAddingNote ? (
            <button
              onClick={() => setIsAddingNote(true)}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
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
              Add New Note
            </button>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Note Type
                </label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="general">General Note</option>
                  <option value="behavior">Behavior Observation</option>
                  <option value="payment">Payment Issue</option>
                  <option value="maintenance">Maintenance Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Note Content
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  placeholder="Enter your observations, concerns, or notes about this tenant..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsAddingNote(false);
                    setNoteContent("");
                    setError("");
                  }}
                  className="flex-1 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={isSubmitting || !noteContent.trim()}
                  className="flex-1 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Note"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notes List */}
          {loading ? (
            <div className="text-center py-8 text-slate-400">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-3">
                📝
              </div>
              <p className="text-sm text-slate-500 font-medium">
                No notes yet for this tenant
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Add notes to track observations, concerns, or important
                information
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-bold uppercase">
                Notes History ({notes.length})
              </p>
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getNoteTypeBadge(note.note_type)}
                      <span className="text-xs text-slate-500">
                        by {note.created_by_email}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDate(note.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
