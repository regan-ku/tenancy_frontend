"use client";

import React, { useState, useEffect } from "react";
import { adminUsersApi, PlatformUser } from "@/api/adminUsers.api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    adminUsersApi.getAllUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const action = newStatus === "suspended" ? "suspend" : "activate";

    if (confirm(`Are you sure you want to ${action} this user?`)) {
      await adminUsersApi.updateUserStatus(userId, newStatus as any);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, status: newStatus as any } : u,
        ),
      );
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    const roles: Record<string, string> = {
      tenant: "bg-blue-100 text-blue-700",
      landlord: "bg-green-100 text-green-700",
      agency: "bg-purple-100 text-purple-700",
      agent: "bg-orange-100 text-orange-700",
      caretaker: "bg-slate-100 text-slate-700",
      admin: "bg-red-100 text-red-700",
    };
    return roles[role] || "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          User Management & Access Control
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor platform users, manage roles, and enforce security
          suspensions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={users.length}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Active Accounts"
          value={users.filter((u) => u.status === "active").length}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Suspended"
          value={users.filter((u) => u.status === "suspended").length}
          color="bg-red-50 text-red-600"
        />
        <StatCard
          title="Pending Verification"
          value={
            users.filter((u) => u.status === "pending_verification").length
          }
          color="bg-yellow-50 text-yellow-600"
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none capitalize"
        >
          <option value="all">All Roles</option>
          <option value="tenant">Tenants</option>
          <option value="landlord">Landlords</option>
          <option value="agency">Agencies</option>
          <option value="agent">Agents</option>
          <option value="caretaker">Caretakers</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
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
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getRoleBadge(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : user.status === "suspended"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {user.date_joined}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== "admin" && (
                        <button
                          onClick={() =>
                            handleToggleStatus(user.id, user.status)
                          }
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                            user.status === "active"
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </button>
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

function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
        {title}
      </p>
      <p className={`text-2xl font-extrabold mt-1 ${color.split(" ")[1]}`}>
        {value}
      </p>
    </div>
  );
}
