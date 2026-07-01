"use client";

import React, { useState, useEffect } from "react";
import {
  agencyStaffApi,
  AgencyStaffMember,
  AgencyRole,
  CreateStaffPayload,
} from "@/api/agencyStaff.api";
import AssignStaffModal from "@/components/agency/AssignStaffModal";
import RevokeStaffModal from "@/components/agency/RevokeStaffModal";
import ManageStaffAccessModal from "@/components/agency/ManageStaffAcceesModal"; // ✅ NEW IMPORT

export default function AgencyStaffPage() {
  const [staff, setStaff] = useState<AgencyStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assigningStaff, setAssigningStaff] =
    useState<AgencyStaffMember | null>(null);
  const [revokingStaff, setRevokingStaff] = useState<AgencyStaffMember | null>(
    null,
  );

  // ✅ NEW: State for the Manage Access modal
  const [managingStaff, setManagingStaff] = useState<AgencyStaffMember | null>(
    null,
  );

  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [formData, setFormData] = useState<CreateStaffPayload>({
    full_name: "",
    email: "",
    phone_number: "",
    role: "agent",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      setStaff(await agencyStaffApi.getStaff());
    } catch (error) {
      console.error("Failed to fetch staff", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.full_name || !formData.email || !formData.phone_number) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      const response = await agencyStaffApi.createStaff(formData);
      setCreatedCredentials({
        email: response.email,
        password: response.temp_password,
      });
      setShowAddModal(false);
      setFormData({
        full_name: "",
        email: "",
        phone_number: "",
        role: "agent",
      });
      fetchStaff();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to create staff member.");
    }
  };

  const getRoleBadge = (role: AgencyRole) => {
    switch (role) {
      case "property_manager":
        return {
          label: "Property Manager",
          color: "bg-purple-100 text-purple-700",
          icon: "👑",
        };
      case "agent":
        return {
          label: "Field Agent",
          color: "bg-blue-100 text-blue-700",
          icon: "🤝",
        };
      case "caretaker":
        return {
          label: "Caretaker",
          color: "bg-green-100 text-green-700",
          icon: "🛠️",
        };
      default:
        return {
          label: "Staff",
          color: "bg-slate-100 text-slate-600",
          icon: "👤",
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Role Cards (Keep exactly as they are) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Internal Team & Staff
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage Property Managers, Agents, and Caretakers.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
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
          Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard
          role="property_manager"
          count={staff.filter((s) => s.role === "property_manager").length}
        />
        <RoleCard
          role="agent"
          count={staff.filter((s) => s.role === "agent").length}
        />
        <RoleCard
          role="caretaker"
          count={staff.filter((s) => s.role === "caretaker").length}
        />
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Staff Details & Role</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Loading team...
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No staff members added yet.
                  </td>
                </tr>
              ) : (
                staff.map((member) => {
                  const badge = getRoleBadge(member.role);
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg">
                            {badge.icon}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {member.full_name}
                            </p>
                            <span
                              className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600">{member.email}</p>
                        <p className="text-xs text-slate-400">
                          {member.phone_number}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${member.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {member.is_active ? "Active" : "Revoked"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {member.date_joined}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          {/* ✅ NEW: Manage Access Button */}
                          <button
                            onClick={() => setManagingStaff(member)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
                          >
                            Manage Access
                          </button>
                          <button
                            onClick={() => setAssigningStaff(member)}
                            className="text-xs text-primary hover:underline font-bold"
                          >
                            Assign Properties
                          </button>
                          <button
                            onClick={() => setRevokingStaff(member)}
                            disabled={!member.is_active}
                            className="text-xs text-red-500 hover:text-red-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-primary-dark">
                Add New Staff Member
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as AgencyRole,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="property_manager">Property Manager</option>
                  <option value="agent">Field Agent</option>
                  <option value="caretaker">Caretaker</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2.5 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-center p-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <h2 className="text-xl font-bold text-primary-dark mb-2">
              Staff Account Created!
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Share these temporary credentials with the staff member.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left space-y-3 mb-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Email
                </p>
                <p className="text-sm font-bold text-slate-800 break-all">
                  {createdCredentials.email}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Temporary Password
                </p>
                <p className="text-sm font-mono font-bold text-primary break-all bg-primary/5 p-2 rounded border border-primary/20">
                  {createdCredentials.password}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCreatedCredentials(null)}
              className="w-full px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {assigningStaff && (
        <AssignStaffModal
          staff={assigningStaff}
          onClose={() => setAssigningStaff(null)}
          onSave={() => {
            setAssigningStaff(null);
            fetchStaff();
          }}
        />
      )}

      {revokingStaff && (
        <RevokeStaffModal
          staff={revokingStaff}
          onClose={() => setRevokingStaff(null)}
          onSuccess={() => {
            setRevokingStaff(null);
            fetchStaff();
          }}
        />
      )}

      {/* ✅ NEW: Manage Access Modal */}
      {managingStaff && (
        <ManageStaffAccessModal
          staff={managingStaff}
          onClose={() => setManagingStaff(null)}
          onRevoke={() => {
            setManagingStaff(null);
            setRevokingStaff(managingStaff); // Opens the full revocation modal
          }}
          onAssignmentChange={fetchStaff}
        />
      )}
    </div>
  );
}

function RoleCard({ role, count }: { role: AgencyRole; count: number }) {
  const badge = {
    property_manager: {
      label: "Property Managers",
      color: "bg-purple-50 text-purple-600",
      desc: "Oversees operations, approvals & staff.",
    },
    agent: {
      label: "Field Agents",
      color: "bg-blue-50 text-blue-600",
      desc: "Customer facing. Viewings & lead conversion.",
    },
    caretaker: {
      label: "Caretakers",
      color: "bg-green-50 text-green-600",
      desc: "Field ops. Maintenance & inspections.",
    },
  }[role];

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${badge?.color || "bg-slate-50 text-slate-600"}`}
      >
        {role === "property_manager" ? "👑" : role === "agent" ? "🤝" : "🛠️"}
      </div>
      <p className="text-2xl font-extrabold text-primary-dark">{count}</p>
      <p className="text-sm font-bold text-slate-700">
        {badge?.label || "Staff"}
      </p>
      <p className="text-xs text-slate-500 mt-1">{badge?.desc || ""}</p>
    </div>
  );
}
