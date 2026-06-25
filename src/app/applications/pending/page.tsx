"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";
import { applicationsApi } from "@/api/applications.api"; // ✅ Import the API client

interface Application {
  id: number;
  property_title: string;
  unit_code: string;
  status: string;
  created_at: string;
  anticipated_move_in_date: string;
}

export default function PendingApplicationPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Track which specific application is currently being cancelled to show a loading spinner
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.APPLICATIONS.LIST);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      // Filter for pending or under_review applications
      const pendingApps = data.filter(
        (app: any) => app.status === "pending" || app.status === "under_review",
      );
      setApplications(pendingApps);
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  // ✅ Handle Application Cancellation
  const handleCancelApplication = async (appId: number) => {
    if (
      !confirm(
        "Are you sure you want to cancel this application? This action cannot be undone.",
      )
    ) {
      return;
    }

    setCancellingId(appId);
    try {
      // Call the backend cancel endpoint we created earlier
      await applicationsApi.cancelApplication(appId);

      // Remove the cancelled application from the UI immediately
      setApplications((prev) => prev.filter((app) => app.id !== appId));

      // Optional: Show a success message (you can replace this with a toast notification if you have one)
      alert("Application cancelled successfully.");
    } catch (error: any) {
      console.error("Failed to cancel application", error);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to cancel application.";
      alert(errorMsg);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">
            Application Under Review
          </h1>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto">
            Your rental application has been successfully submitted and is
            currently awaiting review by the property manager. You will be
            notified once a decision is made.
          </p>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <p className="text-slate-500 mb-4">
              You don't have any pending applications at the moment.
            </p>
            <button
              onClick={() => router.push("/marketplace")}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {app.property_title || "Property"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Unit:{" "}
                    <span className="font-medium text-slate-700">
                      {app.unit_code || "N/A"}
                    </span>
                  </p>
                  {app.anticipated_move_in_date && (
                    <p className="text-xs text-slate-400 mt-1">
                      Desired Move-in:{" "}
                      {new Date(
                        app.anticipated_move_in_date,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* ✅ Updated Layout to include the Cancel Button */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase">
                      {app.status.replace("_", " ")}
                    </span>
                    <p className="text-xs text-slate-400">
                      Submitted: {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* ✅ NEW: Cancel Application Button */}
                  <button
                    onClick={() => handleCancelApplication(app.id)}
                    disabled={cancellingId === app.id}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {cancellingId === app.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Cancel Application
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/marketplace")}
            className="text-primary hover:text-secondary font-medium text-sm"
          >
            &larr; Return to Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}
