"use client";

import React, { useState, useEffect } from "react";
import {
  operationsApi,
  RentalApplication,
  TransferRequest,
  TerminationNotice,
  MaintenanceTicket,
} from "@/api/operations.api";

interface OperationsBoardProps {
  activeTab: "applications" | "notices" | "maintenance";
}

export default function OperationsBoard({ activeTab }: OperationsBoardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      {activeTab === "applications" && <ApplicationsQueue />}
      {activeTab === "notices" && <NoticesQueue />}
      {activeTab === "maintenance" && <MaintenanceBoard />}
    </div>
  );
}

// ==========================================
// 1. APPLICATIONS QUEUE (Rental & Transfer)
// ==========================================
function ApplicationsQueue() {
  const [rentalApps, setRentalApps] = useState<RentalApplication[]>([]);
  const [transferApps, setTransferApps] = useState<TransferRequest[]>([]);
  const [reviewingApp, setReviewingApp] = useState<RentalApplication | null>(
    null,
  );

  useEffect(() => {
    operationsApi.getApplications("rental").then(setRentalApps);
    operationsApi.getApplications("transfer").then(setTransferApps);
  }, []);

  return (
    <div className="space-y-8">
      {/* Rental Applications */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Incoming Rental Applications
        </h3>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-3">Applicant</th>
                <th className="px-6 py-3">Target Unit</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentalApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {app.applicant_name}
                    <p className="text-xs text-slate-500 font-normal">
                      {app.applicant_phone}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {app.unit_code}{" "}
                    <span className="text-xs text-slate-400">
                      ({app.property_name})
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 capitalize">
                      {app.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setReviewingApp(app)}
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary/90"
                    >
                      Review & Decide
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Requests */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Internal Transfer Requests
        </h3>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-3">Tenant</th>
                <th className="px-6 py-3">From → To</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transferApps.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {req.tenant_name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {req.from_unit} →{" "}
                    <span className="font-bold text-primary">
                      {req.to_unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {req.reason}
                  </td>
                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold">
                      Approve
                    </button>
                    <button className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-bold">
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Review Modal (With Tenancy Notes) */}
      {reviewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-primary-dark">
                Review Application: {reviewingApp.applicant_name}
              </h2>
              <button
                onClick={() => setReviewingApp(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs uppercase">
                    Target Unit
                  </p>
                  <p className="font-bold">{reviewingApp.unit_code}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase">Submitted</p>
                  <p className="font-bold">{reviewingApp.submitted_at}</p>
                </div>
              </div>

              {/* ✅ CRITICAL: TENANCY HISTORY & NOTES */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span>📋</span> Historical Tenancy Notes & Behavior
                </h3>
                {reviewingApp.past_tenancy_notes.length > 0 ? (
                  <div className="space-y-2">
                    {reviewingApp.past_tenancy_notes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-3 rounded-lg border-l-4 text-sm ${note.type === "payment" ? "border-green-500 bg-green-50" : note.type === "behavior" ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white"}`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-bold uppercase text-slate-600">
                            {note.type}
                          </span>
                          <span className="text-xs text-slate-400">
                            {note.date}
                          </span>
                        </div>
                        <p className="text-slate-700">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">
                    No previous tenancy records found (First-time applicant).
                  </p>
                )}
              </div>

              {/* Decision Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => alert("Approved & Tenancy Created")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
                >
                  Approve & Create Tenancy
                </button>
                <button
                  onClick={() => alert("Rejected")}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 rounded-xl"
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. NOTICES & TERMINATIONS QUEUE
// ==========================================
function NoticesQueue() {
  const [notices, setNotices] = useState<TerminationNotice[]>([]);
  useEffect(() => {
    operationsApi.getTerminations().then(setNotices);
  }, []);

  const getTypeBadge = (type: string) => {
    if (type === "tenant_request") return "bg-blue-100 text-blue-700";
    if (type === "breach") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
          <tr>
            <th className="px-6 py-3">Tenant & Unit</th>
            <th className="px-6 py-3">Notice Type</th>
            <th className="px-6 py-3">Move-Out Date</th>
            <th className="px-6 py-3">Notes</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {notices.map((notice) => (
            <tr key={notice.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-bold text-slate-800">
                {notice.tenant_name}
                <p className="text-xs text-slate-500 font-normal">
                  {notice.unit_code}
                </p>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getTypeBadge(notice.notice_type)}`}
                >
                  {notice.notice_type.replace("_", " ")}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-600">
                {notice.proposed_move_out_date}
              </td>
              <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                {notice.notes}
              </td>
              <td className="px-6 py-4 text-right flex gap-2 justify-end">
                <button className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold">
                  Process Checkout
                </button>
                <button className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-bold">
                  Dispute
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==========================================
// 3. MAINTENANCE BOARD
// ==========================================
function MaintenanceBoard() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  useEffect(() => {
    operationsApi.getMaintenanceTickets().then(setTickets);
  }, []);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "emergency":
        return "bg-red-100 text-red-700 animate-pulse";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
          <tr>
            <th className="px-6 py-3">Issue & Location</th>
            <th className="px-6 py-3">Priority</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Assigned To</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <p className="font-bold text-slate-800">{ticket.title}</p>
                <p className="text-xs text-slate-500">
                  {ticket.unit_code} • {ticket.property_name} •{" "}
                  {ticket.category}
                </p>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getPriorityColor(ticket.priority)}`}
                >
                  {ticket.priority}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 capitalize">
                  {ticket.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-600">
                {ticket.assigned_to || (
                  <span className="text-red-500 italic text-xs">
                    Unassigned
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                {ticket.status === "open" ? (
                  <button className="text-xs bg-secondary text-white px-3 py-1.5 rounded-lg font-bold">
                    Assign Caretaker
                  </button>
                ) : ticket.status === "in_progress" ? (
                  <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold">
                    Mark Resolved
                  </button>
                ) : (
                  <button className="text-xs text-slate-400 cursor-default">
                    No Action
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
