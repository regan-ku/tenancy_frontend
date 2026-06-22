import React from "react";
import MarketplaceNavbar from "@/components/navigation/MarketplaceNavbar";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      {/* Top Navigation */}
      <MarketplaceNavbar />

      {/* Main Content Area */}
      <main className="flex-grow">{children}</main>

      {/* Simple Footer */}
      <footer className="bg-primary text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold mb-2">
            Tennacy<span className="text-secondary">.</span>
          </h2>
          <p className="text-purple-200 text-sm">
            &copy; {new Date().getFullYear()} Tennacy Platform. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
