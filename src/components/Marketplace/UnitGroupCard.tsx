"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface UnitGroupCardProps {
  unitGroup: {
    id: number;
    name: string;
    unit_type: string;
    base_rent_amount: string;
    available_units: number;
    total_units: number;
  };
  listingType: "rental" | "sale" | "short_stay";
  contactPhone: string; // Fallback contact for sale/short stay
}

export default function UnitGroupCard({
  unitGroup,
  listingType,
  contactPhone,
}: UnitGroupCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [showContact, setShowContact] = useState(false);

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return isNaN(num) ? "Contact for Price" : `KES ${num.toLocaleString()}`;
  };

  const handleAction = () => {
    if (listingType === "rental") {
      if (!isAuthenticated) {
        router.push(
          `/login?redirect=/marketplace/listings/${unitGroup.id}&action=apply`,
        );
      } else {
        alert(
          "Launches Application Wizard for this specific unit group. (Coming in Phase 3)",
        );
      }
    } else {
      setShowContact(!showContact);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-primary-dark text-lg">
            {unitGroup.name}
          </h3>
          <p className="text-sm text-slate-500 capitalize">
            {unitGroup.unit_type.replace("_", " ")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase font-semibold">
            Est. Rent
          </p>
          <p className="text-lg font-bold text-secondary">
            {formatPrice(unitGroup.base_rent_amount)}
          </p>
        </div>
      </div>

      {/* Availability Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>Availability</span>
          <span className="font-bold">
            {unitGroup.available_units} / {unitGroup.total_units} units
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${unitGroup.available_units > 0 ? "bg-green-500" : "bg-red-500"}`}
            style={{
              width: `${(unitGroup.available_units / unitGroup.total_units) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Action Area */}
      {listingType === "rental" ? (
        <button
          onClick={handleAction}
          disabled={unitGroup.available_units === 0}
          className="w-full btn-primary py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {unitGroup.available_units > 0 ? "Apply Now" : "Fully Occupied"}
        </button>
      ) : (
        <div>
          <button
            onClick={handleAction}
            className="w-full btn-outline py-2 text-sm font-semibold"
          >
            {showContact ? "Hide Contact Info" : "Contact Management"}
          </button>
          {showContact && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg text-center border border-slate-200 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs text-slate-500 mb-1">Call or WhatsApp:</p>
              <a
                href={`tel:${contactPhone}`}
                className="text-lg font-bold text-primary hover:text-secondary"
              >
                {contactPhone}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
