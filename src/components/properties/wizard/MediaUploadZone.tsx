"use client";

import React, { useRef } from "react";
import { UploadTask } from "@/hooks/useMediaUpload";

interface MediaUploadZoneProps {
  title: string;
  description?: string;
  accept?: string;
  tasks: UploadTask[];
  onUpdate: (tasks: UploadTask[]) => void;
  maxFiles?: number; // ✅ ADDED: Allow configuring the limit
}

export default function MediaUploadZone({
  title,
  description,
  accept = "image/*,video/*,.pdf",
  tasks,
  onUpdate,
  maxFiles = 10, // ✅ DEFAULT: 10 files limit per zone
}: MediaUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    // ✅ STRICT LIMIT: Enforce the 10-file maximum per zone
    const currentCount = tasks.length;
    if (currentCount >= maxFiles) {
      alert(
        `You can only upload a maximum of ${maxFiles} files in this section.`,
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const files = Array.from(e.target.files);
    const remainingSlots = maxFiles - currentCount;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(
        `Only ${remainingSlots} more file(s) can be added to this section. The rest were ignored.`,
      );
    }

    const newTasks: UploadTask[] = filesToAdd.map((file) => ({
      id: crypto.randomUUID(),
      file,
      media_type: file.type.startsWith("video/")
        ? "video"
        : file.name.toLowerCase().endsWith(".pdf")
          ? "document"
          : "image",
      caption: "",
      is_cover: false,
    }));

    onUpdate([...tasks, ...newTasks]);
    if (inputRef.current) inputRef.current.value = ""; // Reset input to allow re-selecting
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-md font-semibold text-primary-dark">{title}</h4>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
          {/* ✅ Visual counter */}
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Limit: {tasks.length}/{maxFiles} files
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={tasks.length >= maxFiles}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add Files
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleSelect}
        className="hidden"
      />

      {tasks.length === 0 ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
        >
          <p className="text-sm text-slate-500">
            Click to upload (Max {maxFiles} files)
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="relative group bg-slate-50 border border-slate-200 rounded-lg overflow-hidden"
            >
              <div className="aspect-square bg-slate-200 flex items-center justify-center">
                {task.file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(task.file)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-slate-400">
                    {task.media_type === "video" ? "🎥" : "📄"}
                  </span>
                )}
              </div>
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Caption..."
                  value={task.caption || ""}
                  onChange={(e) =>
                    onUpdate(
                      tasks.map((t) =>
                        t.id === task.id
                          ? { ...t, caption: e.target.value }
                          : t,
                      ),
                    )
                  }
                  className="w-full text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <button
                onClick={() => onUpdate(tasks.filter((t) => t.id !== task.id))}
                className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
