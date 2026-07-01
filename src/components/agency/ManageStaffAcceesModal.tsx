"use client";

import React, { useState, useEffect } from "react";
import {
  AgencyStaffMember,
  agencyStaffApi,
  PropertyAssignment,
} from "@/api/agencyStaff.api";

interface ManageStaffAccessModalProps {
  staff: AgencyStaffMember;
  onClose: () => void;
  onRevoke: () => void; // Triggers the full account revocation
  onAssignmentChange: () => void; // Refreshes parent data
}

export default function ManageStaffAccessModal({
  staff,
  onClose,
  onRevoke,
  onAssignmentChange,
}: ManageStaffAccessModalProps) {
  const [assignments, setAssignments] = useState<PropertyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, [staff.id]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await agencyStaffApi.getStaffAssignments(staff.id);
      setAssignments(data);
    } catch (err) {
      console.error("Failed to fetch assignments", err);
      setError("Failed to load property assignments.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccess = async (
    propertyId: number,
    propertyName: string,
  ) => {
    if (!confirm(`Remove ${staff.full_name}'s access to "${propertyName}"?`))
      return;

    setRemovingId(propertyId);
    setError("");
    try {
      await agencyStaffApi.removeStaffFromProperty(staff.id, propertyId);
      setAssignments((prev) =>
        prev.filter((a) => a.property_id !== propertyId),
      );
      onAssignmentChange();
    } catch (err: any) {
      console.error("Failed to remove access", err);
      setError(err.response?.data?.error || "Failed to remove access.");
    } finally {
      setRemovingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "property_manager":
        return {
          label: "Property Manager",
          color: "bg-purple-100 text-purple-700",
        };
      case "agent":
        return { label: "Field Agent", color: "bg-blue-100 text-blue-700" };
      case "caretaker":
        return { label: "Caretaker", color: "bg-green-100 text-green-700" };
      default:
        return { label: "Staff", color: "bg-slate-100 text-slate-600" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              Manage Access: {staff.full_name}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {staff.email} • {staff.phone_number}
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 uppercase">
              Current Property Assignments ({assignments.length})
            </h3>
            <button
              onClick={fetchAssignments}
              className="text-xs text-primary font-bold hover:underline"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">
              Loading assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-3xl">
                🏢
              </div>
              <p className="text-slate-500">
                This staff member is not assigned to any properties yet.
              </p>
              <p className="text-xs text-slate-400">
                Use "Assign Properties" on the main page to grant access.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const badge = getRoleBadge(assignment.operational_role);
                const isRemoving = removingId === assignment.property_id;

                return (
                  <div
                    key={assignment.assignment_id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-slate-800">
                          {assignment.property_name}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Assigned by: {assignment.assigned_by_agency} • Since:{" "}
                        {assignment.assigned_at || "N/A"}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleRemoveAccess(
                          assignment.property_id,
                          assignment.property_name,
                        )
                      }
                      disabled={isRemoving}
                      className="ml-4 px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isRemoving ? (
                        <>
                          <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                          Removing...
                        </>
                      ) : (
                        "Remove Access"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <button
            onClick={onRevoke}
            className="px-6 py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 flex items-center gap-2"
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
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
            Revoke Entire Account
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
