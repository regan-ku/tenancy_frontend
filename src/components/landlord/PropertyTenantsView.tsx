"use client";

import React, { useState } from "react";

// Mock Data representing the aggregated Property -> Unit -> Tenancy -> Payment snapshot
const mockPropertyTenants = [
  {
    unit_code: "A-101",
    unit_type: "One Bedroom",
    tenant: {
      name: "John Doe",
      phone: "+254712345678",
      email: "john@gmail.com",
    },
    next_of_kin: {
      name: "Jane Doe",
      relation: "Spouse",
      phone: "+254798765432",
    },
    financials: {
      rent: 15000,
      balance: 0,
      arrears: 0,
      credits: 0,
      status: "paid",
    },
    lease_end: "2026-12-31",
  },
  {
    unit_code: "A-102",
    unit_type: "One Bedroom",
    tenant: {
      name: "Alice Smith",
      phone: "+254700000000",
      email: "alice@corp.com",
    },
    next_of_kin: {
      name: "Bob Smith",
      relation: "Brother",
      phone: "+254722222222",
    },
    financials: {
      rent: 15000,
      balance: 5000,
      arrears: 10000,
      credits: 0,
      status: "arrears",
    },
    lease_end: "2026-08-15",
  },
  {
    unit_code: "B-201",
    unit_type: "Bedsitter",
    tenant: null, // Vacant unit
    next_of_kin: null,
    financials: {
      rent: 8000,
      balance: 0,
      arrears: 0,
      credits: 0,
      status: "vacant",
    },
    lease_end: null,
  },
  {
    unit_code: "B-202",
    unit_type: "Bedsitter",
    tenant: {
      name: "Mike Ross",
      phone: "+254711111111",
      email: "mike@email.com",
    },
    next_of_kin: {
      name: "Rachel Zane",
      relation: "Friend",
      phone: "+254733333333",
    },
    financials: {
      rent: 8000,
      balance: -2000,
      arrears: 0,
      credits: 2000,
      status: "credit",
    },
    lease_end: "2027-01-01",
  },
];

export default function PropertyTenantsView() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = mockPropertyTenants.filter(
    (u) =>
      u.unit_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "-";
    return `KES ${Math.abs(amount).toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "arrears":
        return "bg-red-100 text-red-700";
      case "credit":
        return "bg-blue-100 text-blue-700";
      case "vacant":
        return "bg-slate-100 text-slate-500";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Occupancy & Tenant Financials
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time view of tenants, emergency contacts, and account balances
            for this property.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/5">
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Rent Roll
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
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
          placeholder="Search unit or tenant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Unit & Tenant</th>
              <th className="px-6 py-3">Next of Kin (Emergency)</th>
              <th className="px-6 py-3">Financial Status</th>
              <th className="px-6 py-3">Balance / Arrears / Credits</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((unit, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                {/* Unit & Tenant Info */}
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">
                    {unit.unit_code}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      ({unit.unit_type})
                    </span>
                  </p>
                  {unit.tenant ? (
                    <>
                      <p className="text-slate-700 mt-1">{unit.tenant.name}</p>
                      <p className="text-xs text-slate-500">
                        {unit.tenant.phone}
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-400 italic mt-1">Vacant</p>
                  )}
                </td>

                {/* Next of Kin */}
                <td className="px-6 py-4">
                  {unit.next_of_kin ? (
                    <>
                      <p className="font-medium text-slate-800">
                        {unit.next_of_kin.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {unit.next_of_kin.relation} • {unit.next_of_kin.phone}
                      </p>
                    </>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(unit.financials.status)}`}
                  >
                    {unit.financials.status}
                  </span>
                  {unit.lease_end && (
                    <p className="text-xs text-slate-400 mt-1">
                      Ends: {unit.lease_end}
                    </p>
                  )}
                </td>

                {/* Financials (Balance / Arrears / Credits) */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-xs">
                    {unit.financials.arrears > 0 && (
                      <span className="text-red-600 font-bold">
                        Arrears: {formatCurrency(unit.financials.arrears)}
                      </span>
                    )}
                    {unit.financials.credits > 0 && (
                      <span className="text-blue-600 font-bold">
                        Credit: {formatCurrency(unit.financials.credits)}
                      </span>
                    )}
                    {unit.financials.balance > 0 && (
                      <span className="text-slate-600">
                        Due: {formatCurrency(unit.financials.balance)}
                      </span>
                    )}
                    {unit.financials.status === "paid" && (
                      <span className="text-green-600 font-medium">
                        Up to date
                      </span>
                    )}
                    {unit.financials.status === "vacant" && (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  {unit.tenant ? (
                    <div className="flex justify-end gap-2">
                      <button className="text-xs text-primary hover:underline font-medium">
                        View Ledger
                      </button>
                      <button className="text-xs text-slate-500 hover:text-red-500 font-medium">
                        Send Reminder
                      </button>
                    </div>
                  ) : (
                    <button className="text-xs bg-secondary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-secondary/90">
                      List on Marketplace
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
