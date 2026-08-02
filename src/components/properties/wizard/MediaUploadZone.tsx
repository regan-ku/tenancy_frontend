"use client";

import React, { useRef } from "react";
import { UploadTask, UploadResult } from "@/hooks/useMediaUpload";

interface MediaUploadZoneProps {
  title: string;
  description?: string;
  accept?: string;
  tasks: UploadTask[];
  onUpdate: (tasks: UploadTask[]) => void;
  maxFiles?: number;
  onSetAsCover?: (task: UploadTask) => void;
  isUploaded?: boolean;
  uploadedCount?: number;
  onEdit?: () => void;
  progress?: number;
  isUploading?: boolean;
  results?: UploadResult[];
}

export default function MediaUploadZone({
  title,
  description,
  accept = "image/*,video/*,.pdf",
  tasks,
  onUpdate,
  maxFiles = 10,
  onSetAsCover,
  isUploaded = false,
  uploadedCount = 0,
  onEdit,
  progress = 0,
  isUploading = false,
  results = [],
}: MediaUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFull = tasks.length >= maxFiles;

  // Calculate circumference for circular progress animation
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const remainingSlots = maxFiles - tasks.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(`Only ${remainingSlots} more file(s) can be added to this section.`);
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
    if (inputRef.current) inputRef.current.value = "";
  };

  // Filter out only the failed results to show specific errors
  const failedResults = results.filter((r) => !r.success);

  // ==========================================
  // ✅ STATE 1: UPLOAD COMPLETE (Clean Success Card)
  // ==========================================
  if (isUploaded) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        <div className="border border-green-200 bg-green-50/50 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 ring-4 ring-green-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-green-800">Upload Complete</p>
              <p className="text-xs text-green-700 mt-1">
                {uploadedCount} file(s) successfully uploaded and saved to the server.
              </p>
            </div>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-5 py-2.5 bg-white border border-green-300 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-100 hover:border-green-400 transition-all shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Edit / Add More
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // ✅ STATE 2: ACTIVE UPLOADING / STAGING
  // ==========================================
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isFull ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-700'}`}>
          {tasks.length} / {maxFiles}
        </span>
      </div>

      {/* ✅ SPECIFIC ERROR MESSAGES (Only shows if some files failed) */}
      {failedResults.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {failedResults.length} file(s) failed to upload:
          </p>
          <ul className="text-xs text-red-600 space-y-1 pl-5 list-disc">
            {failedResults.map((res, idx) => (
              <li key={idx}>
                <span className="font-medium">{res.fileName}:</span> {res.error || "Unknown error"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ✅ CIRCULAR PROGRESS LOADER */}
      {isUploading && (
        <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <div className="relative w-16 h-16 mb-3">
            {/* Background circle */}
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-slate-200"
              />
              {/* Animated progress circle */}
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-primary transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-700">{progress}%</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-600">Uploading files...</p>
          <p className="text-xs text-slate-400 mt-1">Please do not close this window</p>
        </div>
      )}

      {/* ✅ DRAG & DROP ZONE (Hidden while uploading) */}
      {!isUploading && (
        <div
          onClick={() => !isFull && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
            isFull 
              ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60' 
              : 'border-slate-300 hover:border-primary hover:bg-blue-50/30 cursor-pointer group'
          }`}
        >
          <input
            type="file"
            ref={inputRef}
            onChange={handleSelect}
            accept={accept}
            multiple={maxFiles > 1}
            className="hidden"
            disabled={isFull}
          />
          <div className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFull ? 'bg-slate-200 text-slate-400' : 'bg-blue-100 text-primary group-hover:bg-primary group-hover:text-white'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
            </div>
            <p className="text-sm text-slate-600">
              {isFull ? (
                <span className="text-slate-400 font-medium">Maximum files reached</span>
              ) : (
                <>Click to <span className="text-primary font-semibold">browse</span> or drag and drop</>
              )}
            </p>
            <p className="text-xs text-slate-400">Supports JPG, PNG, PDF, MP4 (Max {maxFiles} files)</p>
          </div>
        </div>
      )}

      {/* ✅ PREVIEW GRID (Hidden while uploading) */}
      {tasks.length > 0 && !isUploading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {tasks.map((task) => (
            <div key={task.id} className="relative group aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              {task.file.type.startsWith("image/") ? (
                <img src={URL.createObjectURL(task.file)} alt="Preview" className="w-full h-full object-cover" />
              ) : task.file.type.startsWith("video/") ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white">
                  <span className="text-3xl mb-1">🎥</span>
                  <span className="text-[10px] text-slate-300 truncate px-2">{task.file.name}</span>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-2">
                  <svg className="w-8 h-8 mb-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-[10px] text-center truncate w-full">{task.file.name}</span>
                </div>
              )}
              
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onUpdate(tasks.filter((t) => t.id !== task.id)); }}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Remove
                </button>
                
                {onSetAsCover && !task.is_cover && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onSetAsCover(task); }}
                    className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                    </svg>
                    Set as Cover
                  </button>
                )}
                
                {task.is_cover && (
                  <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Current Cover
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}