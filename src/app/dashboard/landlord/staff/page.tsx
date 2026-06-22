"use client";

import React, { useState, useEffect } from "react";
import { staffApi, Caretaker } from "@/api/staff.api";
import CreateCaretakerModal from "@/components/landlord/CreateCaretakerModal";

export default function LandlordStaffPage() {
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    staffApi.getCaretakers().then((data) => {
      setCaretakers(data);
      setLoading(false);
    });
  }, []);

  const handleRevoke = async (id: number, name: string) => {
    if (
      confirm(
        `Are you sure you want to revoke access for ${name}? They will be immediately logged out.`,
      )
    ) {
      await staffApi.revokeAccess(id);
      setCaretakers(caretakers.filter((c) => c.id !== id));
    }
  };

  const getPermissionBadges = (perms: Caretaker["permissions"]) => {
    const badges = [];
    if (perms.can_manage_maintenance)
      badges.push({ label: "Maintenance", color: "bg-blue-100 text-blue-700" });
    if (perms.can_conduct_inspections)
      badges.push({
        label: "Inspections",
        color: "bg-purple-100 text-purple-700",
      });
    if (perms.can_view_tenant_contacts)
      badges.push({
        label: "Tenant Contacts",
        color: "bg-green-100 text-green-700",
      });
    if (perms.can_track_utilities)
      badges.push({
        label: "Utilities",
        color: "bg-yellow-100 text-yellow-700",
      });
    return badges;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Staff & Caretakers
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage field personnel, assign properties, and control operational
            access.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-primary/90"
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
          Add Caretaker
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <svg
          className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
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
          <p className="text-sm font-bold text-blue-800">
            Sub-User Architecture
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            Caretakers do not register themselves. You create their credentials
            here and provide them with their email/phone and password to log in.
            Their access is strictly limited to the permissions you define
            below.
          </p>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Caretaker Details</th>
                <th className="px-6 py-4">Access Level & Permissions</th>
                <th className="px-6 py-4">Status & Activity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Loading staff directory...
                  </td>
                </tr>
              ) : caretakers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No caretakers added yet. Click "Add Caretaker" to get
                    started.
                  </td>
                </tr>
              ) : (
                caretakers.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                          {staff.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {staff.full_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {staff.email}
                          </p>
                          <p className="text-xs text-slate-400">
                            {staff.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {getPermissionBadges(staff.permissions).map(
                          (badge, i) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          ),
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${staff.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {staff.is_active ? "Active" : "Revoked"}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Last login: {staff.last_login || "Never"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="text-xs text-primary hover:underline font-bold">
                          Edit Access
                        </button>
                        <button
                          onClick={() =>
                            handleRevoke(staff.id, staff.full_name)
                          }
                          className="text-xs text-red-500 hover:text-red-700 font-bold"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      <CreateCaretakerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => staffApi.getCaretakers().then(setCaretakers)}
      />
    </div>
  );
}
