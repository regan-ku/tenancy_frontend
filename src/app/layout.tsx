import type { Metadata } from "next";
import "./globals.css"; 
import MainLayoutWrapper from "@/components/layouts/MainLayoutWrapper";

export const metadata: Metadata = {
  title: "Tennacy | Unified Property Management & Marketplace",
  description: "Discover rental homes, commercial spaces, and short stays. Manage properties seamlessly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* ✅ REMOVED: next/font/google to fix the Turbopack build crash */}
      <body className="font-sans antialiased">
        {/* Your global wrapper remains perfectly intact */}
        <MainLayoutWrapper>
          {children}
        </MainLayoutWrapper>
      </body>
    </html>
  );
}