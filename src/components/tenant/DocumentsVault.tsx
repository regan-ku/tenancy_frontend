"use client";

import React, { useState, useEffect } from "react";
import { tenantProfileApi, TenantDocument } from "@/api/tenantProfile.api";
import { tenantDashboardApi, PersonalTenancy } from "@/api/tenantDashboard.api";

export default function DocumentVault() {
  const [documents, setDocuments] = useState<TenantDocument[]>([]);
  const [tenancies, setTenancies] = useState<PersonalTenancy[]>([]);
  const [filterTenancy, setFilterTenancy] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tenantProfileApi.getDocuments(),
      tenantDashboardApi.getMyPersonalTenancies(),
    ]).then(([docs, tens]) => {
      setDocuments(docs);
      setTenancies(tens);
      setLoading(false);
    });
  }, []);

  const filteredDocs =
    filterTenancy === "all"
      ? documents
      : documents.filter(
          (d) => d.related_tenancy_id === parseInt(filterTenancy),
        );

  const getDocIcon = (type: string) => {
    switch (type) {
      case "lease_agreement":
        return "📄";
      case "receipt":
        return "🧾";
      case "move_in_report":
        return "📋";
      default:
        return "📎";
    }
  };

  const handleDownload = (url: string, title: string) => {
    // In production, triggers a secure blob download
    alert(`Downloading: ${title}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Document Vault</h2>
          <p className="text-xs text-slate-500">
            Securely access your lease agreements, receipts, and inspection
            reports.
          </p>
        </div>

        {/* Tenancy Filter */}
        <select
          value={filterTenancy}
          onChange={(e) => setFilterTenancy(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none font-medium"
        >
          <option value="all">All Properties</option>
          {tenancies.map((t) => (
            <option key={t.id} value={t.id}>
              {t.property_name} - {t.unit_code}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Document</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  Loading documents...
                </td>
              </tr>
            ) : filteredDocs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  No documents found for this selection.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getDocIcon(doc.document_type)}
                      </span>
                      <p className="font-bold text-slate-800">{doc.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase">
                      {doc.document_type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {doc.created_at}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        handleDownload(doc.download_url, doc.title)
                      }
                      className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90 flex items-center gap-1 ml-auto"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
