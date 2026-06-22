"use client";

import React, { useState, useEffect } from "react";
import { adminUsersApi, VerificationRequest } from "@/api/adminUsers.api";

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "all" | "landlord" | "agency" | "payment_account"
  >("all");

  // Modal State
  const [reviewingRequest, setReviewingRequest] =
    useState<VerificationRequest | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    adminUsersApi.getPendingVerifications().then((data) => {
      setVerifications(data);
      setLoading(false);
    });
  }, []);

  const filteredVerifications = verifications.filter((v) =>
    activeTab === "all" ? true : v.user_type === activeTab,
  );

  const handleApprove = async () => {
    if (!reviewingRequest) return;
    setIsApproving(true);
    try {
      await adminUsersApi.approveVerification(reviewingRequest.id);
      setVerifications(
        verifications.map((v) =>
          v.id === reviewingRequest.id ? { ...v, status: "approved" } : v,
        ),
      );
      setReviewingRequest(null);
      alert("✅ Verification approved. User/Account access granted.");
    } catch (error) {
      alert("Failed to approve.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!reviewingRequest) return;
    if (!rejectionReason.trim())
      return alert("Please provide a reason for rejection.");

    setIsApproving(true);
    try {
      await adminUsersApi.rejectVerification(
        reviewingRequest.id,
        rejectionReason,
      );
      setVerifications(
        verifications.map((v) =>
          v.id === reviewingRequest.id
            ? { ...v, status: "rejected", rejection_reason: rejectionReason }
            : v,
        ),
      );
      setReviewingRequest(null);
      setRejectionReason("");
      alert("❌ Verification rejected. User has been notified.");
    } catch (error) {
      alert("Failed to reject.");
    } finally {
      setIsApproving(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      landlord: "bg-green-100 text-green-700",
      agency: "bg-purple-100 text-purple-700",
      payment_account: "bg-blue-100 text-blue-700",
    };
    return types[type] || "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Compliance & Verification Center
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review legal documents, business registrations, and payment account
          ownership before granting platform access.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { key: "all", label: "All Pending" },
            { key: "landlord", label: "Landlords" },
            { key: "agency", label: "Agencies" },
            { key: "payment_account", label: "Payment Accounts" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Verifications Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">User Type</th>
                <th className="px-6 py-4">Document Submitted</th>
                <th className="px-6 py-4">Submitted Date</th>
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
                    Loading verifications...
                  </td>
                </tr>
              ) : filteredVerifications.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No pending verifications in this category. 🎉
                  </td>
                </tr>
              ) : (
                filteredVerifications.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        {req.applicant_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {req.applicant_email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getTypeBadge(req.user_type)}`}
                      >
                        {req.user_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {req.document_type}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {req.submitted_at}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setReviewingRequest(req)}
                        className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90"
                      >
                        Review Document
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ REVIEW MODAL */}
      {reviewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-primary-dark">
                  Document Review
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Applicant: {reviewingRequest.applicant_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setReviewingRequest(null);
                  setRejectionReason("");
                }}
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

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Document Preview Area (Simulated) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Uploaded Document: {reviewingRequest.document_type}
                </label>
                <div className="w-full h-64 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                  <svg
                    className="w-12 h-12 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-sm font-bold">Document Preview Area</p>
                  <p className="text-xs mt-1">
                    In production, the actual PDF/Image renders here via secure
                    cloud URL.
                  </p>
                </div>
              </div>

              {/* Applicant Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">
                    Email
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {reviewingRequest.applicant_email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">
                    Submission Date
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {reviewingRequest.submitted_at}
                  </p>
                </div>
              </div>

              {/* Rejection Reason (Conditional) */}
              <div>
                <label className="block text-xs font-bold text-red-600 uppercase mb-1">
                  Rejection Reason (Required if Rejecting)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Document is blurred, KRA PIN does not match the provided name, etc."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={handleReject}
                disabled={isApproving || !rejectionReason.trim()}
                className="px-6 py-2.5 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject & Notify
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isApproving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                    Processing...
                  </>
                ) : (
                  <>✅ Approve & Grant Access</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
