"use client";

import React, { useState, useEffect } from "react";
import { agenciesApi, PropertyDelegation } from "@/api/agencies.api";

export default function AgencyDelegationsPage() {
  const [delegations, setDelegations] = useState<PropertyDelegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "active">("all");

  useEffect(() => {
    agenciesApi.getDelegations().then((data) => {
      setDelegations(data);
      setLoading(false);
    });
  }, []);

  const handleAccept = async (id: number) => {
    if (
      confirm(
        "Accept this delegation? You will assume operational control based on the defined permissions.",
      )
    ) {
      await agenciesApi.acceptDelegation(id);
      setDelegations(
        delegations.map((d) => (d.id === id ? { ...d, status: "active" } : d)),
      );
    }
  };

  const filteredDelegations = delegations.filter((d) =>
    filter === "all" ? true : d.status === filter,
  );

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "full":
        return "bg-purple-100 text-purple-700";
      case "partial":
        return "bg-blue-100 text-blue-700";
      case "view_only":
        return "bg-slate-100 text-slate-600";
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
            Property Delegations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage properties delegated to your agency by landlords. Review
            permissions and operational scope.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(["all", "pending", "active"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${filter === f ? "bg-white text-primary-dark shadow-sm" : "text-slate-500"}`}
            >
              {f}{" "}
              {f !== "all" &&
                `(${delegations.filter((d) => d.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 font-bold uppercase">
            Total Properties Managed
          </p>
          <p className="text-3xl font-extrabold text-primary-dark mt-1">
            {delegations.filter((d) => d.status === "active").length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 font-bold uppercase">
            Total Units Under Management
          </p>
          <p className="text-3xl font-extrabold text-primary-dark mt-1">
            {delegations.reduce((acc, d) => acc + d.total_units, 0)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 font-bold uppercase">
            Pending Acceptance
          </p>
          <p className="text-3xl font-extrabold text-orange-600 mt-1">
            {delegations.filter((d) => d.status === "pending").length}
          </p>
        </div>
      </div>

      {/* Delegations Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Property & Landlord</th>
                <th className="px-6 py-4">Delegation Scope</th>
                <th className="px-6 py-4">Permissions Granted</th>
                <th className="px-6 py-4">Status</th>
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
                    Loading delegations...
                  </td>
                </tr>
              ) : filteredDelegations.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No delegations found for this filter.
                  </td>
                </tr>
              ) : (
                filteredDelegations.map((del) => (
                  <tr
                    key={del.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        {del.property_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {del.property_location}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Owner: {del.landlord_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getTypeBadge(del.delegation_type)}`}
                      >
                        {del.delegation_type.replace("_", " ")}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        {del.total_units} Units
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {del.permissions.slice(0, 3).map((perm, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                          >
                            {perm.replace("_", " ")}
                          </span>
                        ))}
                        {del.permissions.length > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{del.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${del.status === "active" ? "bg-green-100 text-green-700" : del.status === "pending" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}
                      >
                        {del.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {del.status === "pending" ? (
                        <button
                          onClick={() => handleAccept(del.id)}
                          className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90"
                        >
                          Accept Delegation
                        </button>
                      ) : del.status === "active" ? (
                        <button className="text-xs text-primary hover:underline font-bold">
                          Manage Property →
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
