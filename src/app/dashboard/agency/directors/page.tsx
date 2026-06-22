"use client";

import React, { useState, useEffect } from "react";
import { agenciesApi, AgencyDirector } from "@/api/agencies.api";
import AddDirectorModal from "@/components/agency/AddDirectorModal";

export default function AgencyDirectorsPage() {
  const [directors, setDirectors] = useState<AgencyDirector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock Agency ID (In production, this comes from the user's agency profile)
  const mockAgencyId = 1;

  useEffect(() => {
    agenciesApi.getDirectors(mockAgencyId).then((data) => {
      setDirectors(data);
      setLoading(false);
    });
  }, []);

  const handleAddSuccess = (newDirector: AgencyDirector) => {
    setDirectors([...directors, newDirector]);
    setShowAddModal(false);
  };

  const handleRemove = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the board?`)) {
      await agenciesApi.removeDirector(mockAgencyId, id);
      setDirectors(directors.filter((d) => d.id !== id));
    }
  };

  // Check business rule: >= 1 verified director
  const hasVerifiedDirector = directors.some(
    (d) => d.verification_status === "verified",
  );
  const totalOwnership = directors.reduce(
    (acc, d) => acc + d.ownership_percentage,
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
              System Admin. Please add directors and submit their ID documents.
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
            className={`text-sm font-bold px-3 py-1 rounded-full ${totalOwnership === 100 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            Total: {totalOwnership}%{" "}
            {totalOwnership === 100 ? "✓" : "(Must equal 100%)"}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
          {directors.map((d, i) => (
            <div
              key={d.id}
              className={`h-full ${i % 2 === 0 ? "bg-primary" : "bg-secondary"}`}
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
                            {director.email} • {director.phone}
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
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(director.verification_status)}`}
                      >
                        {director.verification_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          handleRemove(director.id, director.full_name)
                        }
                        className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline"
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

      {/* Add Director Modal */}
      {showAddModal && (
        <AddDirectorModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
}
