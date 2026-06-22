"use client";

import React, { useState } from "react";

// Define our supported countries and their phone rules
const COUNTRIES = [
  {
    name: "Kenya",
    code: "+254",
    flag: "🇪",
    length: 9,
    placeholder: "712 345 678",
  },
  {
    name: "Uganda",
    code: "+256",
    flag: "🇺🇬",
    length: 9,
    placeholder: "712 345 678",
  },
  {
    name: "Tanzania",
    code: "+255",
    flag: "🇹🇿",
    length: 9,
    placeholder: "712 345 678",
  },
  {
    name: "Rwanda",
    code: "+250",
    flag: "🇷🇼",
    length: 9,
    placeholder: "712 345 678",
  },
  {
    name: "United Kingdom",
    code: "+44",
    flag: "🇬🇧",
    length: 10,
    placeholder: "7123 456789",
  },
  {
    name: "Germany",
    code: "+49",
    flag: "🇩🇪",
    length: 10,
    placeholder: "151 12345678",
  },
];

interface PhoneInputProps {
  value: string;
  countryCode: string;
  onChangePhone: (value: string) => void;
  onChangeCountry: (code: string) => void;
  error?: string;
}

export default function PhoneInput({
  value,
  countryCode,
  onChangePhone,
  onChangeCountry,
  error,
}: PhoneInputProps) {
  const selectedCountry =
    COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const numericValue = e.target.value.replace(/\D/g, "");

    // Enforce max length for the specific country
    if (numericValue.length <= selectedCountry.length) {
      onChangePhone(numericValue);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Phone Number
      </label>
      <div className="flex rounded-lg shadow-sm">
        {/* Country Dropdown */}
        <div className="relative">
          <select
            value={countryCode}
            onChange={(e) => {
              onChangeCountry(e.target.value);
              onChangePhone(""); // Clear phone number when country changes
            }}
            className="h-full py-2 pl-3 pr-7 border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm rounded-l-lg focus:ring-primary focus:border-primary outline-none appearance-none cursor-pointer"
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.code}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-500 sm:text-sm">
              {selectedCountry.code}{" "}
            </span>
          </div>
          <input
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            placeholder={selectedCountry.placeholder}
            className={`block w-full pl-16 pr-3 py-2 border ${error ? "border-red-500" : "border-slate-300"} rounded-r-lg focus:ring-primary focus:border-primary outline-none sm:text-sm`}
          />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
