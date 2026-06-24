"use client";

import React, { useState, useEffect } from "react";
import { agenciesApi, AgencyDirector } from "@/api/agencies.api";
// ✅ Updated import to match the new unified modal component
import DirectorModal from "@/components/agency/AddDirectorModal";

export default function AgencyDirectorsPage() {
  const [directors, setDirectors] = useState<AgencyDirector[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Modal State Management (Handles both Add and Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDirector, setEditingDirector] = useState<AgencyDirector | null>(
    null,
  );

  // Dynamic Agency ID
  const [agencyId, setAgencyId] = useState<number | null>(null);
  const [loadingAgency, setLoadingAgency] = useState(true);

  // 1. Fetch the current user's agency ID
  useEffect(() => {
    agenciesApi.getCurrentAgency().then((agency) => {
      if (agency) {
        setAgencyId(agency.id);
      }
      setLoadingAgency(false);
    });
  }, []);

  // 2. Fetch directors once we have the agency ID
  useEffect(() => {
    if (agencyId) {
      agenciesApi
        .getDirectors(agencyId)
        .then((data) => {
          setDirectors(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [agencyId]);

  // ✅ Handlers for Modal
  const handleOpenAddModal = () => {
    setEditingDirector(null); // Clear editing state for "Add" mode
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (director: AgencyDirector) => {
    setEditingDirector(director); // Pass director for "Edit" mode
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDirector(null); // Reset state on close
  };

  // ✅ Unified Success Handler (Handles both Add and Update)
  const handleDirectorSuccess = (savedDirector: AgencyDirector) => {
    if (editingDirector) {
      // UPDATE: Replace the existing director in the list
      setDirectors((prev) =>
        prev.map((d) => (d.id === savedDirector.id ? savedDirector : d)),
      );
    } else {
      // ADD: Append the new director to the list
      setDirectors((prev) => [...prev, savedDirector]);
    }
    handleCloseModal();
  };

  const handleRemove = async (id: number, name: string) => {
    if (!agencyId) return;
    if (confirm(`Are you sure you want to remove ${name} from the board?`)) {
      try {
        await agenciesApi.removeDirector(agencyId, id);
        setDirectors((prev) => prev.filter((d) => d.id !== id));
      } catch (error) {
        alert(
          "Failed to remove director. They may be the primary director or linked to active delegations.",
        );
      }
    }
  };

  const hasVerifiedDirector = directors.some(
    (d) => d.verification_status === "verified",
  );
  const totalOwnership = directors.reduce(
    (acc, d) => acc + Number(d.ownership_percentage),
    0,
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loadingAgency) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading agency details...
      </div>
    );
  }

  if (!agencyId) {
    return (
      <div className="p-8 text-center bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
        <p className="font-bold">No Agency Found</p>
        <p className="text-sm mt-1">
          You must register an agency before managing directors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Board of Directors
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage agency ownership, legal representatives, and compliance
            verification.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-primary/90 transition-colors"
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
          Add Director
        </button>
      </div>

      {/* Compliance Warning Banner */}
      {!hasVerifiedDirector && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="text-sm font-bold text-red-800">
              Agency Activation Blocked
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Your agency cannot manage properties or process payments until at
              least <strong>one (1) director is fully verified</strong> by the
              System Admin.
            </p>
          </div>
        </div>
      )}

      {/* Ownership Summary Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Ownership Structure
          </h2>
          <span
            className={`text-sm font-bold px-3 py-1 rounded-full ${
              totalOwnership === 100
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            Total: {totalOwnership}%{" "}
            {totalOwnership === 100 ? "✓" : "(Must equal 100%)"}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
          {directors.map((d, i) => (
            <div
              key={d.id}
              className={`h-full ${
                i % 2 === 0 ? "bg-primary" : "bg-secondary"
              }`}
              style={{ width: `${d.ownership_percentage}%` }}
              title={`${d.full_name}: ${d.ownership_percentage}%`}
            ></div>
          ))}
        </div>
      </div>

      {/* Directors Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Director Details</th>
                <th className="px-6 py-4">Identification</th>
                <th className="px-6 py-4">Ownership</th>
                <th className="px-6 py-4">Verification Status</th>
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
                    Loading board of directors...
                  </td>
                </tr>
              ) : directors.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No directors added. Click "Add Director" to begin compliance
                    setup.
                  </td>
                </tr>
              ) : (
                directors.map((director) => (
                  <tr
                    key={director.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                          {director.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-2">
                            {director.full_name}
                            {director.is_primary_director && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                Primary
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            {director.email} • {director.phone_number}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 font-medium text-xs">
                        {director.national_id
                          ? `ID: ${director.national_id}`
                          : `Passport: ${director.passport_number}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {director.nationality}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-extrabold text-primary-dark">
                        {director.ownership_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(
                          director.verification_status,
                        )}`}
                      >
                        {director.verification_status}
                      </span>
                    </td>
                    {/* ✅ UPDATED ACTIONS COLUMN */}
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => handleOpenEditModal(director)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleRemove(director.id, director.full_name)
                        }
                        className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ UNIFIED DIRECTOR MODAL (Handles Add & Edit) */}
      <DirectorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleDirectorSuccess}
        agencyId={agencyId}
        director={editingDirector} // ✅ Passing null for Add, or the object for Edit
      />
    </div>
  );
}
