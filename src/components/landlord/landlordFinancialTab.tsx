"use client";

import React, { useState, useEffect } from "react";
import {
  landlordUnitManagementApi,
  TenantFinancialInfo,
} from "@/api/landlordUnitManagement.api";
import { tenanciesApi } from "@/api/tenancies.api";
import {
  landlordOperationsApi,
  LandlordApplication,
} from "@/api/landlordOperations.api"; // ✅ Fixed import path

import TerminateTenancyModal from "@/components/agency/TerminateTennacyModal";
import TransferTenantModal from "@/components/agency/TransferTenantModal";
import ExtendTenancyModal from "@/components/agency/ExtendTenancyModal";
import TenantNotesModal from "@/components/agency/TenantNotesModal";
import ApplicationEditModal from "@/components/applications/ApplicationEditModal";

interface TenantsFinancialsTabProps {
  propertyId: number;
}

interface PendingRequests {
  transfer?: {
    id: number;
    to_unit: string;
    to_property: string;
    move_in_date: string | null;
    reason: string;
  };
  extension?: {
    id: number;
    new_end_date: string;
    reason: string;
  };
  termination?: {
    id: number;
    effective_date: string;
    termination_type: string;
    notes: string;
  };
}

export default function TenantsFinancialsTab({
  propertyId,
}: TenantsFinancialsTabProps) {
  const [tenants, setTenants] = useState<TenantFinancialInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] =
    useState<TenantFinancialInfo | null>(null);
  const [pendingRequests, setPendingRequests] =
    useState<PendingRequests | null>(null);
  const [loadingPending, setLoadingPending] = useState(false);
  const [tenantApplications, setTenantApplications] = useState<
    LandlordApplication[]
  >([]);

  // Modal States
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<LandlordApplication | null>(null);

  useEffect(() => {
    if (propertyId) {
      loadTenants();
    }
  }, [propertyId]);

  useEffect(() => {
    if (selectedTenant?.tenancy_id) {
      loadPendingRequests(selectedTenant.tenancy_id);
      loadTenantApplications(selectedTenant.tenant_id);
    } else {
      setPendingRequests(null);
      setTenantApplications([]);
    }
  }, [selectedTenant]);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const response =
        await landlordUnitManagementApi.getTenantFinancials(propertyId);
      const data = response as any;
      const tenantList = Array.isArray(data) ? data : data?.results || [];

      console.log(
        `✅ Loaded ${tenantList.length} tenants for property ${propertyId}`,
      );
      setTenants(tenantList);
    } catch (error) {
      console.error("❌ Failed to load tenants:", error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async (tenancyId: number) => {
    setLoadingPending(true);
    try {
      const tenancy = await tenanciesApi.getTenancy(tenancyId);
      setPendingRequests(tenancy.pending_requests || null);
    } catch (error) {
      console.error("Failed to load pending requests:", error);
      setPendingRequests(null);
    } finally {
      setLoadingPending(false);
    }
  };

  const loadTenantApplications = async (tenantId: number) => {
    try {
      const apps = await landlordOperationsApi.getTenantApplications(tenantId);
      setTenantApplications(apps);
    } catch (error) {
      console.error("Failed to load tenant applications:", error);
      setTenantApplications([]);
    }
  };

  const formatCurrency = (amount: number) =>
    `KES ${amount?.toLocaleString() || 0}`;

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

  const handleTerminate = (tenant: TenantFinancialInfo) => {
    setSelectedTenant(tenant);
    setShowTerminateModal(true);
  };

  const handleTransfer = (tenant: TenantFinancialInfo) => {
    setSelectedTenant(tenant);
    setShowTransferModal(true);
  };

  const handleExtend = (tenant: TenantFinancialInfo) => {
    setSelectedTenant(tenant);
    setShowExtendModal(true);
  };

  const handleNotes = (tenant: TenantFinancialInfo) => {
    setSelectedTenant(tenant);
    setShowNotesModal(true);
  };

  const handleEditApplication = (app: LandlordApplication) => {
    setEditingApplication(app);
    setShowEditModal(true);
  };

  const handleActionComplete = () => {
    setShowTerminateModal(false);
    setShowTransferModal(false);
    setShowExtendModal(false);
    setShowNotesModal(false);
    setShowEditModal(false);
    setSelectedTenant(null);
    setPendingRequests(null);
    setTenantApplications([]);
    setEditingApplication(null);
    loadTenants();
  };

  const handleCancelTransfer = async () => {
    if (!selectedTenant?.tenancy_id) return;
    if (!confirm("Are you sure you want to cancel this transfer request?"))
      return;

    try {
      await tenanciesApi.cancelTransfer(selectedTenant.tenancy_id);
      alert("✅ Transfer request cancelled successfully");
      loadPendingRequests(selectedTenant.tenancy_id);
      loadTenantApplications(selectedTenant.tenant_id);
    } catch (error: any) {
      alert(
        "❌ " + (error.response?.data?.detail || "Failed to cancel transfer"),
      );
    }
  };

  const handleCancelExtension = async () => {
    if (!selectedTenant?.tenancy_id) return;
    if (!confirm("Are you sure you want to cancel this extension request?"))
      return;

    try {
      await tenanciesApi.cancelExtension(selectedTenant.tenancy_id);
      alert("✅ Extension request cancelled successfully");
      loadPendingRequests(selectedTenant.tenancy_id);
      loadTenantApplications(selectedTenant.tenant_id);
    } catch (error: any) {
      alert(
        "❌ " + (error.response?.data?.detail || "Failed to cancel extension"),
      );
    }
  };

  const handleCancelTermination = async () => {
    if (!selectedTenant?.tenancy_id) return;
    if (!confirm("Are you sure you want to cancel this termination request?"))
      return;

    try {
      await tenanciesApi.cancelTermination(selectedTenant.tenancy_id);
      alert("✅ Termination request cancelled successfully");
      loadPendingRequests(selectedTenant.tenancy_id);
      loadTenantApplications(selectedTenant.tenant_id);
    } catch (error: any) {
      alert(
        "❌ " +
          (error.response?.data?.detail || "Failed to cancel termination"),
      );
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: {
        color: "bg-yellow-100 text-yellow-700",
        label: "Pending Review",
      },
      under_review: {
        color: "bg-yellow-100 text-yellow-700",
        label: "Under Review",
      },
      approved: {
        color: "bg-green-100 text-green-700",
        label: "Awaiting Payment",
      },
      completed: {
        color: "bg-blue-100 text-blue-700",
        label: "Tenancy Active",
      },
      rejected: { color: "bg-red-100 text-red-700", label: "Rejected" },
      cancelled: { color: "bg-slate-100 text-slate-700", label: "Cancelled" },
    };

    const config = statusConfig[status] || {
      color: "bg-slate-100 text-slate-700",
      label: status,
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-bold ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

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
            {formatCurrency(
              tenants.reduce((sum, t) => sum + (t.arrears || 0), 0),
            )}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Monthly Revenue
          </p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            {formatCurrency(
              tenants.reduce((sum, t) => sum + (t.rent_amount || 0), 0),
            )}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {tenants.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-4">
            🏠
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
        <div className="space-y-6">
          {Object.entries(tenantsByPropertyAndUnit).map(
            ([propertyName, units]) => {
              const totalTenantsInProperty = Object.values(units).flat().length;

              return (
                <div
                  key={propertyName}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
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

                  <div className="divide-y divide-slate-100">
                    {Object.entries(units).map(([unitCode, unitTenants]) => (
                      <div key={unitCode}>
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

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                              <tr>
                                <th className="px-6 py-3">Tenant Details</th>
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
                                    <p className="font-bold text-slate-800 text-base">
                                      {tenant.tenant_name}
                                    </p>
                                    <div className="mt-1 space-y-0.5">
                                      <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <span>✉️</span> {tenant.tenant_email}
                                      </p>
                                      {tenant.tenant_phone && (
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                          <span>📞</span> {tenant.tenant_phone}
                                        </p>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 border-t border-slate-100 pt-1">
                                      {tenant.tenancy_start_date} -{" "}
                                      {tenant.tenancy_end_date || "Ongoing"}
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
                                        className={`text-xs font-bold ${(tenant.balance_due || 0) > 0 ? "text-red-600" : "text-green-600"}`}
                                      >
                                        Bal:{" "}
                                        {formatCurrency(tenant.balance_due)}
                                      </p>
                                      {(tenant.arrears || 0) > 0 && (
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
                                          : tenant.tenancy_status ===
                                              "pending_payment"
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
      {selectedTenant &&
        !showTerminateModal &&
        !showTransferModal &&
        !showExtendModal &&
        !showNotesModal &&
        !showEditModal && (
          <TenantDetailModal
            tenant={selectedTenant}
            pendingRequests={pendingRequests}
            loadingPending={loadingPending}
            tenantApplications={tenantApplications}
            onClose={() => {
              setSelectedTenant(null);
              setPendingRequests(null);
              setTenantApplications([]);
            }}
            onTerminate={() => handleTerminate(selectedTenant)}
            onTransfer={() => handleTransfer(selectedTenant)}
            onExtend={() => handleExtend(selectedTenant)}
            onNotes={() => handleNotes(selectedTenant)}
            onEditApplication={handleEditApplication}
            onCancelTransfer={handleCancelTransfer}
            onCancelExtension={handleCancelExtension}
            onCancelTermination={handleCancelTermination}
            getApplicationStatusBadge={getApplicationStatusBadge}
          />
        )}

      {/* Action Modals */}
      {showTerminateModal && selectedTenant && (
        <TerminateTenancyModal
          tenant={selectedTenant}
          propertyId={propertyId}
          onClose={() => {
            setShowTerminateModal(false);
            setSelectedTenant(null);
          }}
          onComplete={handleActionComplete}
        />
      )}

      {showTransferModal && selectedTenant && (
        <TransferTenantModal
          tenant={selectedTenant}
          propertyId={propertyId}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedTenant(null);
          }}
          onComplete={handleActionComplete}
        />
      )}

      {showExtendModal && selectedTenant && (
        <ExtendTenancyModal
          tenant={selectedTenant}
          propertyId={propertyId}
          onClose={() => {
            setShowExtendModal(false);
            setSelectedTenant(null);
          }}
          onComplete={handleActionComplete}
        />
      )}

      {showNotesModal && selectedTenant && (
        <TenantNotesModal
          tenant={selectedTenant}
          onClose={() => {
            setShowNotesModal(false);
            setSelectedTenant(null);
          }}
        />
      )}

      {showEditModal && editingApplication && (
        <ApplicationEditModal
          application={editingApplication}
          onClose={() => {
            setShowEditModal(false);
            setEditingApplication(null);
          }}
          onComplete={handleActionComplete}
        />
      )}
    </div>
  );
}

// ✅ FULL TenantDetailModal with Lifecycle Tracking and Actions
function TenantDetailModal({
  tenant,
  pendingRequests,
  loadingPending,
  tenantApplications,
  onClose,
  onTerminate,
  onTransfer,
  onExtend,
  onNotes,
  onEditApplication,
  onCancelTransfer,
  onCancelExtension,
  onCancelTermination,
  getApplicationStatusBadge,
}: {
  tenant: TenantFinancialInfo;
  pendingRequests: PendingRequests | null;
  loadingPending: boolean;
  tenantApplications: LandlordApplication[];
  onClose: () => void;
  onTerminate: () => void;
  onTransfer: () => void;
  onExtend: () => void;
  onNotes: () => void;
  onEditApplication: (app: LandlordApplication) => void;
  onCancelTransfer: () => void;
  onCancelExtension: () => void;
  onCancelTermination: () => void;
  getApplicationStatusBadge: (status: string) => React.ReactElement;
}) {
  const hasPendingRequests =
    pendingRequests &&
    (pendingRequests.transfer ||
      pendingRequests.extension ||
      pendingRequests.termination);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tenant Details</h3>
            <p className="text-xs text-slate-500 mt-1">
              {tenant.property_name} • Unit {tenant.unit_code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">
              Tenant Profile
            </h4>
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg mb-4">
              <p className="text-xs text-primary font-bold uppercase mb-1">
                Full Name
              </p>
              <p className="text-xl font-extrabold text-slate-800">
                {tenant.tenant_name}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Email Address</p>
                <p className="font-medium text-slate-800 break-all">
                  {tenant.tenant_email}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                <p className="font-medium text-slate-800">
                  {tenant.tenant_phone || "Not provided"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg md:col-span-2">
                <p className="text-xs text-slate-500 mb-1">Tenancy Period</p>
                <p className="font-medium text-slate-800">
                  {tenant.tenancy_start_date} -{" "}
                  {tenant.tenancy_end_date || "Ongoing"}
                </p>
              </div>
            </div>
          </div>

          {/* Application Lifecycle Tracking */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">
              Application Lifecycle
            </h4>
            {tenantApplications.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-sm text-slate-500">No applications found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tenantApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                              app.application_type === "transfer"
                                ? "bg-blue-100 text-blue-700"
                                : app.application_type === "termination"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {app.application_type}
                          </span>
                          {getApplicationStatusBadge(app.status)}
                        </div>
                        <p className="text-xs text-slate-500">
                          Submitted:{" "}
                          {new Date(app.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      {["pending", "under_review", "approved"].includes(
                        app.status,
                      ) && (
                        <button
                          onClick={() => onEditApplication(app)}
                          className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded hover:bg-amber-200 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {app.application_type === "transfer" && (
                      <div className="text-sm text-slate-700 space-y-1">
                        <p>
                          <span className="font-medium">From:</span>{" "}
                          {app.from_property_name} - {app.from_unit_code}
                        </p>
                        <p>
                          <span className="font-medium">To:</span>{" "}
                          {app.to_property_name} - {app.to_unit_code}
                        </p>
                        {app.desired_move_in_date && (
                          <p>
                            <span className="font-medium">Move-in Date:</span>{" "}
                            {app.desired_move_in_date}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Reason:</span>{" "}
                          {app.transfer_reason || "No reason provided"}
                        </p>
                      </div>
                    )}

                    {app.application_type === "termination" && (
                      <div className="text-sm text-slate-700 space-y-1">
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {app.termination_type?.replace("_", " ") || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Move-out Date:</span>{" "}
                          {app.proposed_move_out_date || "N/A"}
                        </p>
                        {app.penalty_amount && app.penalty_amount > 0 && (
                          <p>
                            <span className="font-medium">Penalty:</span> KES{" "}
                            {app.penalty_amount.toLocaleString()}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Notes:</span>{" "}
                          {app.termination_notes || "No notes"}
                        </p>
                      </div>
                    )}

                    {app.application_type === "extension" && (
                      <div className="text-sm text-slate-700 space-y-1">
                        <p>
                          <span className="font-medium">New End Date:</span>{" "}
                          {app.new_end_date || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Reason:</span>{" "}
                          {app.extension_reason || "No reason provided"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Requests Section */}
          {hasPendingRequests && (
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-3">
                Pending Requests
              </h4>
              <div className="space-y-3">
                {pendingRequests.transfer && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                          TRANSFER
                        </span>
                        <span className="text-xs text-slate-600">
                          Pending Approval
                        </span>
                      </div>
                      <button
                        onClick={onCancelTransfer}
                        className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <p>
                        <span className="font-medium">To:</span>{" "}
                        {pendingRequests.transfer.to_unit} (
                        {pendingRequests.transfer.to_property})
                      </p>
                      {pendingRequests.transfer.move_in_date && (
                        <p>
                          <span className="font-medium">Move-in Date:</span>{" "}
                          {pendingRequests.transfer.move_in_date}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Reason:</span>{" "}
                        {pendingRequests.transfer.reason}
                      </p>
                    </div>
                  </div>
                )}

                {pendingRequests.extension && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded">
                          EXTENSION
                        </span>
                        <span className="text-xs text-slate-600">
                          Pending Approval
                        </span>
                      </div>
                      <button
                        onClick={onCancelExtension}
                        className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <p>
                        <span className="font-medium">New End Date:</span>{" "}
                        {pendingRequests.extension.new_end_date}
                      </p>
                      <p>
                        <span className="font-medium">Reason:</span>{" "}
                        {pendingRequests.extension.reason}
                      </p>
                    </div>
                  </div>
                )}

                {pendingRequests.termination && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
                          TERMINATION
                        </span>
                        <span className="text-xs text-slate-600">
                          Pending Approval
                        </span>
                      </div>
                      <button
                        onClick={onCancelTermination}
                        className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {pendingRequests.termination.termination_type.replace(
                          "_",
                          " ",
                        )}
                      </p>
                      <p>
                        <span className="font-medium">Effective Date:</span>{" "}
                        {pendingRequests.termination.effective_date}
                      </p>
                      {pendingRequests.termination.notes && (
                        <p>
                          <span className="font-medium">Notes:</span>{" "}
                          {pendingRequests.termination.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                  className={`text-lg font-bold ${(tenant.balance_due || 0) > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  KES {(tenant.balance_due || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Arrears</p>
                <p
                  className={`text-lg font-bold ${(tenant.arrears || 0) > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  KES {(tenant.arrears || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Last Payment</p>
                <p className="text-sm font-medium text-slate-800">
                  {tenant.last_payment_date || "No payments"}
                  {tenant.last_payment_amount > 0 && (
                    <>
                      <br />
                      <span className="text-xs text-slate-500">
                        KES {tenant.last_payment_amount.toLocaleString()}
                      </span>
                    </>
                  )}
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

        {/* Action Buttons */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 sticky bottom-0">
          <p className="text-xs text-slate-500 mb-3 font-bold uppercase">
            Manage Tenancy
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={onNotes}
              className="px-4 py-2.5 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Notes
            </button>
            <button
              onClick={onExtend}
              disabled={!!pendingRequests?.extension}
              className="px-4 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Extend
            </button>
            <button
              onClick={onTransfer}
              disabled={!!pendingRequests?.transfer}
              className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Transfer
            </button>
            <button
              onClick={onTerminate}
              disabled={!!pendingRequests?.termination}
              className="px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Terminate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
