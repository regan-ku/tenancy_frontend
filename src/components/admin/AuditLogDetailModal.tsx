"use client";

import React from "react";
import { GlobalAuditLog } from "@/api/adminAudit.api";

interface AuditLogDetailModalProps {
  log: GlobalAuditLog;
  onClose: () => void;
}

export default function AuditLogDetailModal({
  log,
  onClose,
}: AuditLogDetailModalProps) {
  // Mocking a raw JSON payload that would be stored in the backend for deep audits
  const mockPayload = {
    request_method: "POST",
    endpoint: `/api/${log.app_module}/`,
    status_code: log.status === "SUCCESS" ? 200 : 403,
    payload_size: "2.4 KB",
    execution_time: "142ms",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              Audit Log Deep Dive
            </h2>
            <p className="text-sm text-slate-500 font-mono mt-1">
              ID: {log.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-lg"
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Core Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetailBox label="Timestamp" value={log.timestamp} />
            <DetailBox
              label="User"
              value={`${log.user_name} (${log.user_role})`}
            />
            <DetailBox label="Module" value={log.app_module.toUpperCase()} />
            <DetailBox label="Action" value={log.action_type} />
          </div>

          {/* Target & IP Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-3">
              Target & Network Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">
                  Target Entity
                </p>
                <p className="text-slate-800 font-medium mt-1">
                  {log.target_entity}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">
                  IP Address
                </p>
                <p className="text-slate-800 font-mono font-medium mt-1">
                  {log.ip_address}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-400 uppercase font-bold">
                  User Agent (Device/Browser)
                </p>
                <p className="text-slate-800 font-mono text-xs mt-1 bg-white p-2 rounded border border-slate-200">
                  {log.user_agent}
                </p>
              </div>
            </div>
          </div>

          {/* Raw System Payload (Simulated) */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">
              System Execution Metadata
            </h3>
            <div className="bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <pre>{JSON.stringify(mockPayload, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100"
          >
            Close Inspector
          </button>
          {log.status === "FAILED" && (
            <button className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
              Block IP Address
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean data display
function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-white border border-slate-200 rounded-lg">
      <p className="text-[10px] text-slate-400 uppercase font-bold">{label}</p>
      <p className="text-sm font-bold text-slate-800 mt-1 capitalize">
        {value}
      </p>
    </div>
  );
}
