"use client";

import React from "react";

interface CountryOption {
  code: string;
  flag: string;
  dialCode: string;
  name: string;
}

const COUNTRIES: CountryOption[] = [
  { code: "KE", flag: "🇰🇪", dialCode: "+254", name: "Kenya" },
  { code: "UG", flag: "🇺🇬", dialCode: "+256", name: "Uganda" },
  { code: "TZ", flag: "🇹🇿", dialCode: "+255", name: "Tanzania" },
  { code: "RW", flag: "🇷🇼", dialCode: "+250", name: "Rwanda" },
  // ✅ Added the two European countries we discussed
  { code: "GB", flag: "🇬🇧", dialCode: "+44", name: "United Kingdom" },
  { code: "DE", flag: "🇩🇪", dialCode: "+49", name: "Germany" },
];

interface PhoneNumberInputProps {
  value: string;
  countryCode: string;
  onChange: (phone: string, code: string) => void;
  placeholder?: string;
  label: string;
  required?: boolean;
}

export default function PhoneNumberInput({
  value,
  countryCode,
  onChange,
  placeholder = "e.g., 712345678",
  label,
  required = false,
}: PhoneNumberInputProps) {
  const selectedCountry =
    COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-digit characters for cleaner storage
    const cleanNumber = e.target.value.replace(/\D/g, "");
    onChange(cleanNumber, countryCode);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(value, e.target.value);
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex rounded-lg shadow-sm">
        {/* Country Code Selector with Flag */}
        <div className="relative">
          <select
            value={countryCode}
            onChange={handleCountryChange}
            className="h-10 px-3 pr-8 border border-r-0 border-slate-300 rounded-l-lg bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none cursor-pointer"
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.dialCode}
              </option>
            ))}
          </select>
          {/* Custom Dropdown Arrow */}
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
              />
            </svg>
          </div>
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          required={required}
          className="flex-1 h-10 px-4 border border-slate-300 rounded-r-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
      </div>
      <p className="text-xs text-slate-500">
        Format: {selectedCountry.dialCode} {placeholder}
      </p>
    </div>
  );
}
