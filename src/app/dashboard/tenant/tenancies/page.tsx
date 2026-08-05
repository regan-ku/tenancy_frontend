"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { tenanciesApi, Tenancy } from "@/api/tenancies.api";

// ✅ Extend the Tenancy interface locally to include financial summaries.
// Note: Your Django Backend TenancySerializer should annotate these fields 
// from the Payments app so they are returned in the GET /tenancies/ list.
interface TenancyWithFinancials extends Tenancy {
  current_balance?: number;
  arrears_amount?: number;
  next_due_date?: string;
}

export default function MyTenanciesPage() {
  const [tenancies, setTenancies] = useState<TenancyWithFinancials[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenancies = async () => {
      try {
        const data = await tenanciesApi.getTenancies();
        setTenancies(data as TenancyWithFinancials[]);
      } catch (err) {
        setError("Failed to load your tenancies. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenancies();
  }, []);

  // Helper to format currency (KES)
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return "KES 0.00";
    return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper for status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending_payment":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "suspended":
        return "bg-red-100 text-red-700 border-red-200";
      case "terminated":
      case "expired":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-0">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-72 bg-slate-100 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">My Tenancies</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your active leases, track your rent payments, and view property details.
          </p>
        </div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Find New Property
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Tenancies Grid */}
      {tenancies.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Active Tenancies</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            You don't have any active rental agreements yet. Browse our marketplace to find your next home or commercial space.
          </p>
          <Link
            href="/marketplace"
            className="mt-6 inline-block px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tenancies.map((tenancy) => {
            const hasArrears = (tenancy.arrears_amount || 0) > 0;
            
            return (
              <div
                key={tenancy.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{tenancy.property_title}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Unit: <span className="font-mono font-medium">{tenancy.unit_code}</span></p>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wide ${getStatusBadge(
                      tenancy.status
                    )}`}
                  >
                    {tenancy.status.replace("_", " ")}
                  </span>
                </div>

                {/* Financials & Dates */}
                <div className="p-5 flex-1">
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rent Amount</p>
                      <p className="text-base font-bold text-slate-800 mt-1">{formatCurrency(tenancy.rent_amount)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${hasArrears ? 'bg-red-50' : 'bg-green-50'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${hasArrears ? 'text-red-400' : 'text-green-500'}`}>
                        {hasArrears ? 'Arrears Due' : 'Current Balance'}
                      </p>
                      <p className={`text-base font-bold mt-1 ${hasArrears ? 'text-red-600' : 'text-green-700'}`}>
                        {formatCurrency(hasArrears ? tenancy.arrears_amount : (tenancy.current_balance || 0))}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="text-slate-500">Lease Type</span>
                      <span className="font-medium text-slate-700 capitalize">{tenancy.tenancy_type}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="text-slate-500">Start Date</span>
                      <span className="font-medium text-slate-700">{formatDate(tenancy.start_date)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-500">End Date</span>
                      <span className="font-bold text-slate-800">{formatDate(tenancy.end_date)}</span>
                    </div>
                  </div>

                  {/* Health Alerts (e.g. Lease Expiring Soon) */}
                  {tenancy.health_status?.alerts && tenancy.health_status.alerts.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                      {tenancy.health_status.alerts.map((alert, idx) => (
                        <p key={idx} className="text-xs text-yellow-800 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {alert.message}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3">
                  {tenancy.status === "active" && (
                    <Link
                      href={`/dashboard/tenant/payments?tenancy_id=${tenancy.id}`}
                      className="flex-1 text-center px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Pay Rent
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/tenant/tenancies/${tenancy.id}`}
                    className="flex-1 text-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}