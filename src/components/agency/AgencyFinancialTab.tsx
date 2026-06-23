"use client";

import React, { useState, useEffect } from "react";
import {
  agencyUnitManagementApi,
  TenantFinancialInfo,
} from "@/api/agencyUnitManagement.api";

interface TenantsFinancialsTabProps {
  propertyId: number;
}

export default function TenantsFinancialsTab({
  propertyId,
}: TenantsFinancialsTabProps) {
  const [tenants, setTenants] = useState<TenantFinancialInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] =
    useState<TenantFinancialInfo | null>(null);

  useEffect(() => {
    loadTenants();
  }, [propertyId]);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data =
        await agencyUnitManagementApi.getTenantFinancials(propertyId);
      setTenants(data);
    } catch (error) {
      console.error("Failed to load tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  // ✅ NESTED GROUPING: Group tenants by Property, then by Unit Code
  const tenantsByPropertyAndUnit = tenants.reduce(
    (acc, tenant) => {
      const propertyName = tenant.property_name || "Unknown Property";
      const unitCode = tenant.unit_code || "Unassigned";

      if (!acc[propertyName]) acc[propertyName] = {};
      if (!acc[propertyName][unitCode]) acc[propertyName][unitCode] = [];

      acc[propertyName][unitCode].push(tenant);
      return acc;
    },
    {} as Record<string, Record<string, TenantFinancialInfo[]>>,
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading tenant information...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Total Tenants
          </p>
          <p className="text-2xl font-extrabold text-primary-dark mt-1">
            {tenants.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Occupied Units
          </p>
          <p className="text-2xl font-extrabold text-green-600 mt-1">
            {/* Count unique property-unit combinations */}
            {
              tenants.reduce((acc, curr) => {
                const key = `${curr.property_name}-${curr.unit_code}`;
                if (!acc.includes(key)) acc.push(key);
                return acc;
              }, [] as string[]).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Total Arrears
          </p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">
            {formatCurrency(tenants.reduce((sum, t) => sum + t.arrears, 0))}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Monthly Revenue
          </p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            {formatCurrency(tenants.reduce((sum, t) => sum + t.rent_amount, 0))}
          </p>
        </div>
      </div>

      {/* ✅ EMPTY STATE: No Occupancy */}
      {tenants.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-4">
            🏢
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            This property has no occupancy yet
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Once tenants are assigned to units and tenancies are activated,
            their details, financials, and next of kin will appear here.
          </p>
        </div>
      ) : (
        /* ✅ OCCUPIED STATE: Grouped by Property, then by Unit */
        <div className="space-y-6">
          {Object.entries(tenantsByPropertyAndUnit).map(
            ([propertyName, units]) => {
              const totalTenantsInProperty = Object.values(units).flat().length;

              return (
                <div
                  key={propertyName}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {/* 🏢 PROPERTY HEADER */}
                  <div className="px-6 py-4 bg-primary/5 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-base font-bold text-primary-dark flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                      {propertyName}
                    </h2>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold">
                      {totalTenantsInProperty}{" "}
                      {totalTenantsInProperty === 1 ? "Tenant" : "Tenants"}
                    </span>
                  </div>

                  {/* 🚪 UNITS WITHIN THIS PROPERTY */}
                  <div className="divide-y divide-slate-100">
                    {Object.entries(units).map(([unitCode, unitTenants]) => (
                      <div key={unitCode}>
                        {/* UNIT SUB-HEADER */}
                        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                          <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Unit: {unitCode}
                          </h3>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">
                            {unitTenants.length}{" "}
                            {unitTenants.length === 1 ? "Tenant" : "Tenants"}
                          </span>
                        </div>

                        {/* TENANTS TABLE FOR THIS UNIT */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                              <tr>
                                <th className="px-6 py-3">Tenant Details</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Financials</th>
                                <th className="px-6 py-3">Balance & Arrears</th>
                                <th className="px-6 py-3">Next of Kin</th>
                                <th className="px-6 py-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {unitTenants.map((tenant) => (
                                <tr
                                  key={tenant.tenant_id}
                                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                                  onClick={() => setSelectedTenant(tenant)}
                                >
                                  <td className="px-6 py-4">
                                    <p className="font-bold text-slate-800">
                                      {tenant.tenant_name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {tenant.tenancy_start_date} -{" "}
                                      {tenant.tenancy_end_date}
                                    </p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="text-xs text-slate-600">
                                      {tenant.tenant_email}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      {tenant.tenant_phone}
                                    </p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-1 text-xs">
                                      <p>
                                        <span className="text-slate-500">
                                          Rent:
                                        </span>{" "}
                                        <span className="font-medium">
                                          {formatCurrency(tenant.rent_amount)}
                                        </span>
                                      </p>
                                      <p>
                                        <span className="text-slate-500">
                                          Deposit:
                                        </span>{" "}
                                        <span className="font-medium">
                                          {formatCurrency(
                                            tenant.deposit_amount,
                                          )}
                                        </span>
                                      </p>
                                      <p>
                                        <span className="text-slate-500">
                                          Service:
                                        </span>{" "}
                                        <span className="font-medium">
                                          {formatCurrency(
                                            tenant.service_charge,
                                          )}
                                        </span>
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-1">
                                      <p
                                        className={`text-xs font-bold ${tenant.balance_due > 0 ? "text-red-600" : "text-green-600"}`}
                                      >
                                        Bal:{" "}
                                        {formatCurrency(tenant.balance_due)}
                                      </p>
                                      {tenant.arrears > 0 && (
                                        <p className="text-xs font-bold text-red-600">
                                          Arr: {formatCurrency(tenant.arrears)}
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {tenant.next_of_kin ? (
                                      <div className="text-xs">
                                        <p className="font-medium text-slate-800">
                                          {tenant.next_of_kin.full_name}
                                        </p>
                                        <p className="text-slate-500">
                                          {tenant.next_of_kin.relationship}
                                        </p>
                                        <p className="text-slate-500">
                                          {tenant.next_of_kin.phone_number}
                                        </p>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-slate-400 italic">
                                        Not provided
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        tenant.tenancy_status === "active"
                                          ? "bg-green-100 text-green-700"
                                          : tenant.tenancy_status === "pending"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {tenant.tenancy_status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <TenantDetailModal
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
        />
      )}
    </div>
  );
}

// ==========================================
// TENANT DETAIL MODAL (UNCHANGED)
// ==========================================
function TenantDetailModal({
  tenant,
  onClose,
}: {
  tenant: TenantFinancialInfo;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tenant Details</h3>
            <p className="text-xs text-slate-500 mt-1">
              {tenant.property_name} • Unit {tenant.unit_code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">
              Personal Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">Full Name</p>
                <p className="font-medium text-slate-800">
                  {tenant.tenant_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-800">
                  {tenant.tenant_email}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-medium text-slate-800">
                  {tenant.tenant_phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tenancy Period</p>
                <p className="font-medium text-slate-800">
                  {tenant.tenancy_start_date} - {tenant.tenancy_end_date}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">
              Financial Information
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Monthly Rent</p>
                <p className="text-lg font-bold text-slate-800">
                  KES {tenant.rent_amount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Deposit</p>
                <p className="text-lg font-bold text-slate-800">
                  KES {tenant.deposit_amount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Service Charge</p>
                <p className="text-lg font-bold text-slate-800">
                  KES {tenant.service_charge.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Balance Due</p>
                <p
                  className={`text-lg font-bold ${tenant.balance_due > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  KES {tenant.balance_due.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Arrears</p>
                <p
                  className={`text-lg font-bold ${tenant.arrears > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  KES {tenant.arrears.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Last Payment</p>
                <p className="text-sm font-medium text-slate-800">
                  {tenant.last_payment_date}
                  <br />
                  <span className="text-xs text-slate-500">
                    KES {tenant.last_payment_amount.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Next of Kin */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">
              Next of Kin
            </h4>
            {tenant.next_of_kin ? (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500">Full Name</p>
                  <p className="font-medium text-slate-800">
                    {tenant.next_of_kin.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Relationship</p>
                  <p className="font-medium text-slate-800">
                    {tenant.next_of_kin.relationship}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone Number</p>
                  <p className="font-medium text-slate-800">
                    {tenant.next_of_kin.phone_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">City</p>
                  <p className="font-medium text-slate-800">
                    {tenant.next_of_kin.city}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Next of kin information not provided.
              </p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
