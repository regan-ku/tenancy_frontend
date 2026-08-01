"use client";

import { usePathname } from "next/navigation";
import UniversalFooter from "./UniversalFooter";

export default function FooterWrapper() {
  const pathname = usePathname();

  // ✅ Hide footer on any route that includes "wizard" or "auth"
  // This ensures a clean, distraction-free screen for onboarding and login flows.
  if (pathname.includes("/wizard") || pathname.includes("/auth")) {
    return null;
  }

  return <UniversalFooter />;
}