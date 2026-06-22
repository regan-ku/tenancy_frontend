"use client";

import React, { useState } from "react";
import Link from "next/link";

// Mock Tenant Data (Including Next of Kin)
const mockTenants = [
  {
    id: 1,
    name: "John Doe",
    email: "john@gmail.com",
    phone: "+254712345678",
    unit: "A-101 (Myles Apts)",
    rent: 15000,
    status: "active",
    next_of_kin: {
      name: "Jane Doe (Wife)",
      phone: "+254798765432",
      relation: "Spouse",
    },
    days_overdue: 0,
  },
  {
    id: 2,
    name: "Alice Smith",
    email: "alice@corp.com",
    phone: "+254700000000",
    unit: "B-201 (Myles Apts)",
    rent: 8000,
    status: "active",
    next_of_kin: {
      name: "Bob Smith (Brother)",
      phone: "+254722222222",
      relation: "Sibling",
    },
    days_overdue: 12,
  },
];

export default function TenantsDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTenants = mockTenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.unit.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header & Privacy Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Tenant Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage occupants, track leases, and view emergency contacts.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-primary/90">
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
          Add Tenant Manually
        </button>
      </div>

      {/* 3-Month Privacy Rule Banner (System Transparency) */}
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
            Data Privacy & Retention Policy
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            To comply with data minimization standards, tenant history and
            behavioral notes for moved-out tenants are automatically archived
            and hidden from your dashboard after{" "}
            <strong>90 days (3 months)</strong>. Active tenancies remain fully
            visible.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, unit code, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Overdue</option>
          <option>Notice Given</option>
        </select>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Tenant Details</th>
                <th className="px-6 py-4">Unit & Rent</th>
                <th className="px-6 py-4">Next of Kin (Emergency)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {/* Tenant Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {tenant.name}
                        </p>
                        <p className="text-xs text-slate-500">{tenant.phone}</p>
                      </div>
                    </div>
                  </td>

                  {/* Unit & Rent */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{tenant.unit}</p>
                    <p className="text-xs text-slate-500">
                      KES {tenant.rent.toLocaleString()}/mo
                    </p>
                  </td>

                  {/* Next of Kin */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800 text-sm">
                      {tenant.next_of_kin.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {tenant.next_of_kin.relation} • {tenant.next_of_kin.phone}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {tenant.days_overdue > 0 ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        Overdue ({tenant.days_overdue}d)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/landlord/tenants/${tenant.id}`}
                      className="text-primary hover:text-primary-dark font-bold text-xs hover:underline"
                    >
                      View Profile & Notes →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
