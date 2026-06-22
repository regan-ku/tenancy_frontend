"use client";

import React, { useRef } from "react";
import { useOnboardingWizardStore } from "@/store/onboardingWizard.store";

// ✅ FIX: Define the exact keys in OnboardingData that hold File | null values
type FileField =
  | "id_document_front"
  | "id_document_back"
  | "kra_tax_compliance_cert"
  | "business_registration"
  | "agency_license";

export default function StepVerification() {
  const { formData, updateFormData, userRole } = useOnboardingWizardStore();

  const isLandlord = userRole === "landlord";
  const isAgency = userRole === "agency";

  // ✅ FIX: Type the field parameter properly
  const handleFileChange = (field: FileField, file: File | null) => {
    updateFormData({ [field]: file });
  };

  // ✅ FIX: Replace `: any` with strict prop typing
  const DocumentDropzone = ({
    label,
    description,
    field,
    icon,
    required = true,
  }: {
    label: string;
    description: string;
    field: FileField; // ✅ Now TypeScript knows exactly what keys are allowed
    icon: React.ReactNode;
    required?: boolean;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const file = formData[field] as File | null;

    return (
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
          file
            ? "border-green-300 bg-green-50"
            : "border-dashed border-slate-300 bg-slate-50 hover:border-primary hover:bg-primary/5"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
        />
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-lg ${file ? "bg-green-100 text-green-600" : "bg-white text-slate-400 shadow-sm"}`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">
                  {label} {required && <span className="text-red-500">*</span>}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              </div>
              {file ? (
                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Uploaded
                </span>
              ) : (
                <span className="text-xs font-semibold text-primary">
                  Upload
                </span>
              )}
            </div>
            {file && (
              <p className="text-xs text-slate-600 mt-2 font-medium truncate max-w-xs">
                📎 {file.name}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (userRole === "tenant") {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-primary-dark">
          Verification Not Required
        </h3>
        <p className="text-slate-500 max-w-md mx-auto">
          As a tenant, you can skip identity verification. You can start
          browsing the marketplace immediately!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          Identity & Compliance Verification
        </h2>
        <p className="text-slate-500">
          {isLandlord &&
            "Upload your identity and tax compliance documents to verify your eligibility to list properties."}
          {isAgency &&
            "Upload your business registration, tax, and licensing documents to activate your agency account."}
        </p>
      </div>

      <div className="space-y-4">
        {/* 1. National ID (Landlord Only) */}
        {isLandlord && (
          <>
            <DocumentDropzone
              label="National ID / Passport (Front)"
              description="Clear photo of the front side."
              field="id_document_front"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              }
            />
            <DocumentDropzone
              label="National ID / Passport (Back)"
              description="Clear photo of the back side."
              field="id_document_back"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              }
            />
          </>
        )}

        {/* 2. KRA PIN Number (TEXT INPUT - Landlord & Agency) */}
        <div className="p-5 border-2 border-slate-200 rounded-xl bg-slate-50">
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            KRA PIN Number <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Enter your 11-character KRA PIN (e.g., P0123456789A)
          </p>
          <input
            type="text"
            value={formData.kra_pin}
            onChange={(e) =>
              updateFormData({ kra_pin: e.target.value.toUpperCase() })
            }
            placeholder="P0123456789A"
            maxLength={11}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none uppercase font-mono tracking-wider bg-white"
          />
        </div>

        {/* 3. KRA Tax Compliance Certificate */}
        <DocumentDropzone
          label="KRA Tax Compliance Certificate"
          description="Valid, up-to-date tax compliance certificate."
          field="kra_tax_compliance_cert"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />

        {/* 4. Agency Business Docs (Agency Only) */}
        {isAgency && (
          <>
            <DocumentDropzone
              label="Business Registration Certificate"
              description="Official certificate of business registration."
              field="business_registration"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              }
            />
            <DocumentDropzone
              label="EARB Agency License"
              description="Estate Agents Registration Board official license."
              field="agency_license"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
