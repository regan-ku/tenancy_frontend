"use client";

import { usePathname } from "next/navigation";
import MarketplaceNavbar from "@/components/navigation/MarketplaceNavbar";
import FooterWrapper from "./FooterWrapper";

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ CHECK IF USER IS LOCKED IN THE WIZARD OR AUTH FLOW
  // If they are, we render ONLY the page content. NO NAVBAR OR FOOTER.
  const isLockedInWizardOrAuth = 
    pathname.includes("/wizard") || 
    pathname.includes("/auth") || 
    pathname.includes("/login") || 
    pathname.includes("/register");

  if (isLockedInWizardOrAuth) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation */}
      <MarketplaceNavbar />

      {/* Main Content Area (This is where your actual pages get injected) */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Smart Footer (Automatically hides on wizards/auth via the FooterWrapper) */}
      <FooterWrapper />
    </div>
  );
}