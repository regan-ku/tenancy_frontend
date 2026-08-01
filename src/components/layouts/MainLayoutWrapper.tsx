"use client";

import { usePathname } from "next/navigation";
import MarketplaceNavbar from "@/components/navigation/MarketplaceNavbar";
import FooterWrapper from "./FooterWrapper";

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ ROUTES WHERE NAVBAR & FOOTER SHOULD BE COMPLETELY HIDDEN
  // If the current URL includes ANY of these strings, we render a blank shell.
  const hiddenLayoutRoutes = [
    "/wizard",               // Catches /applications/wizard, /properties/wizard, etc.
    "/onboarding",           // Catches the main profile onboarding flow
    "/pending-verification", // Catches the document verification holding page
    "/auth",                 // Catches /auth/login, /auth/register
    "/login",                // Direct login route
    "/register",             // Direct register route
    "/forgot-password",      // Password recovery flows
    "/reset-password",       // Password reset flows
  ];

  // Check if the current path matches any of our hidden routes
  const shouldHideLayout = hiddenLayoutRoutes.some((route) => 
    pathname.includes(route)
  );

  // ✅ If they are in a wizard, onboarding, or auth flow, render ONLY the page content.
  if (shouldHideLayout) {
    return <>{children}</>;
  }

  // ✅ Otherwise, render the standard public/logged-in shell
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation */}
      <MarketplaceNavbar />

      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Smart Footer */}
      <FooterWrapper />
    </div>
  );
}