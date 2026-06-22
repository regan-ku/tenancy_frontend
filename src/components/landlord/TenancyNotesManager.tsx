"use client";

import React, { useState } from "react";

// Mock Existing Notes
const initialNotes = [
  {
    id: 1,
    type: "payment",
    content:
      "Paid rent 3 days late in October due to M-Pesa delay. Waived penalty as a goodwill gesture.",
    date: "2026-10-05",
    author: "You",
  },
  {
    id: 2,
    type: "behavior",
    content:
      "Received a noise complaint from Unit A-102 regarding loud music after 10 PM. Issued a verbal warning.",
    date: "2026-11-12",
    author: "Caretaker John",
  },
];

interface TenancyNotesManagerProps {
  tenantName: string;
}

export default function TenancyNotesManager({
  tenantName,
}: TenancyNotesManagerProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [newNoteType, setNewNoteType] = useState("general");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;

    const note = {
      id: Date.now(),
      type: newNoteType,
      content: newNoteContent,
      date: new Date().toISOString().split("T")[0],
      author: "You",
    };

    setNotes([note, ...notes]);
    setNewNoteContent("");
    setShowForm(false);
  };

  const getNoteColor = (type: string) => {
    switch (type) {
      case "payment":
        return "border-l-green-500 bg-green-50";
      case "behavior":
        return "border-l-orange-500 bg-orange-50";
      case "maintenance":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-slate-400 bg-slate-50";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Tenancy Intelligence & Notes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Internal notes regarding {tenantName}. These will be visible to you
            and agencies during future rental applications.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1"
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
          Add Note
        </button>
      </div>

      {/* Add Note Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={newNoteType}
              onChange={(e) => setNewNoteType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="general">General</option>
              <option value="payment">Payment History</option>
              <option value="behavior">Behavior / Conduct</option>
              <option value="maintenance">Maintenance / Property</option>
            </select>
            <input
              type="text"
              placeholder="Author (e.g., Caretaker)"
              defaultValue="You"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <input
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <textarea
            rows={3}
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write detailed notes about the tenant's behavior, payment patterns, or property care..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-slate-500 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Notes Feed */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">
            No notes recorded yet.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg border-l-4 ${getNoteColor(note.type)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-600 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">
                    {note.type}
                  </span>
                  <span className="text-xs text-slate-500">
                    by {note.author}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{note.date}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
