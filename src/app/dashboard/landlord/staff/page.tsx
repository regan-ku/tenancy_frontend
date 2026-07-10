"use client";

import React, { useState, useEffect } from "react";
import { landlordStaffApi, LandlordStaffMember } from "@/api/LandlordStaff.api";;

// ✅ Modal Imports (We will build these in the next step)
import AddCaretakerModal from "@/components/landlord/AddCaretakerModal";
import AssignCaretakerModal from "@/components/landlord/AssignCaretakerModal";
import RevokeCaretakerModal from "@/components/landlord/RevokeCaretakerModal";
import ManageCaretakerAccessModal from "@/components/landlord/ManageCaretakerAccesModal";

export default function LandlordStaffPage() {
  const [staff, setStaff] = useState<LandlordStaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [assigningCaretaker, setAssigningCaretaker] =
    useState<LandlordStaffMember | null>(null);
  const [revokingCaretaker, setRevokingCaretaker] =
    useState<LandlordStaffMember | null>(null);
  const [managingCaretaker, setManagingCaretaker] =
    useState<LandlordStaffMember | null>(null);

  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    fetchCaretakers();
  }, []);

  const fetchCaretakers = async () => {
    setLoading(true);
    try {
      const data = await landlordStaffApi.getStaff();
      setStaff(data);
    } catch (error) {
      console.error("Failed to fetch caretakers", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Property Caretakers
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Assign and manage field caretakers for your properties.
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
            Landlord Staff Permissions
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            As a landlord, you can only assign <strong>Caretakers</strong> to
            handle physical property maintenance, inspections, and tenant
            support. For broader operational roles (Agents/Managers), you must
            delegate property management to an Agency.
          </p>
        </div>
      </div>

      {/* Caretakers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Caretaker Details</th>
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
                    Loading caretakers...
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No caretakers added yet. Click "Add Caretaker" to get
                    started.
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center text-lg">
                          🛠️
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {member.full_name}
                          </p>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
                            Caretaker
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
                        <button
                          onClick={() => setManagingCaretaker(member)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
                        >
                          Manage Access
                        </button>
                        <button
                          onClick={() => setAssigningCaretaker(member)}
                          className="text-xs text-primary hover:underline font-bold"
                        >
                          Assign Properties
                        </button>
                        <button
                          onClick={() => setRevokingCaretaker(member)}
                          disabled={!member.is_active}
                          className="text-xs text-red-500 hover:text-red-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Modals Rendering */}
      {showAddModal && (
        <AddCaretakerModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(creds) => {
            setCreatedCredentials(creds);
            setShowAddModal(false);
            fetchCaretakers();
          }}
        />
      )}

      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-center p-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <h2 className="text-xl font-bold text-primary-dark mb-2">
              Caretaker Account Created!
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Share these temporary credentials with your caretaker.
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

      {assigningCaretaker && (
        <AssignCaretakerModal
          caretaker={assigningCaretaker}
          onClose={() => setAssigningCaretaker(null)}
          onSave={() => {
            setAssigningCaretaker(null);
            fetchCaretakers();
          }}
        />
      )}

      {revokingCaretaker && (
        <RevokeCaretakerModal
          caretaker={revokingCaretaker}
          onClose={() => setRevokingCaretaker(null)}
          onSuccess={() => {
            setRevokingCaretaker(null);
            fetchCaretakers();
          }}
        />
      )}

      {managingCaretaker && (
        <ManageCaretakerAccessModal
          caretaker={managingCaretaker}
          onClose={() => setManagingCaretaker(null)}
          onRevoke={() => {
            setManagingCaretaker(null);
            setRevokingCaretaker(managingCaretaker);
          }}
          onAssignmentChange={fetchCaretakers}
        />
      )}
    </div>
  );
}
