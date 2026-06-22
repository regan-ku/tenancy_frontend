import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// ✅ ADDED: Import the Bootstrap Provider
import { AuthBootstrapProvider } from "@/components/providers/AuthBootstrapProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tennacy - Property Management & Marketplace",
  description: "Unified Property Management & Real Estate Marketplace Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-surface-muted min-h-screen`}>
        {/* ✅ CRITICAL: WRAP CHILDREN TO FIX THE REFRESH BUG */}
        <AuthBootstrapProvider>{children}</AuthBootstrapProvider>
      </body>
    </html>
  );
}
