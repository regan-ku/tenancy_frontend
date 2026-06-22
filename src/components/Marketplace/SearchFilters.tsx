"use client";

import React, { useState } from "react";

interface SearchFiltersProps {
  onSearch: (filters: {
    q: string;
    city: string;
    min_price: string;
    max_price: string;
    category: string;
  }) => void;
  initialFilters?: {
    q: string;
    city: string;
    min_price: string;
    max_price: string;
    category: string;
  };
}

export default function SearchFilters({
  onSearch,
  initialFilters,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    q: initialFilters?.q || "",
    city: initialFilters?.city || "",
    min_price: initialFilters?.min_price || "",
    max_price: initialFilters?.max_price || "",
    category: initialFilters?.category || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row gap-3"
    >
      {/* Search Query */}
      <div className="flex-1">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Search
        </label>
        <input
          type="text"
          name="q"
          value={filters.q}
          onChange={handleChange}
          placeholder="Location, property name..."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
        />
      </div>

      {/* City */}
      <div className="w-full md:w-40">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          City
        </label>
        <input
          type="text"
          name="city"
          value={filters.city}
          onChange={handleChange}
          placeholder="e.g. Nairobi"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
        />
      </div>

      {/* Category */}
      <div className="w-full md:w-40">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Type
        </label>
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-white"
        >
          <option value="">All Types</option>
          <option value="rental">Rental</option>
          <option value="sale">For Sale</option>
          <option value="short_stay">Short Stay</option>
        </select>
      </div>

      {/* Max Price */}
      <div className="w-full md:w-32">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Max Price
        </label>
        <input
          type="number"
          name="max_price"
          value={filters.max_price}
          onChange={handleChange}
          placeholder="Max KES"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-end">
        <button
          type="submit"
          className="w-full md:w-auto bg-primary hover:bg-primary-light text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          Search
        </button>
      </div>
    </form>
  );
}
