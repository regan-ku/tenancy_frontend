// src/hooks/useWizardLock.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useWizardLock(isActive: boolean = true) {
  const router = useRouter();

  useEffect(() => {
    if (!isActive) return;

    // 1. Block Tab Close / Refresh / External Links
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Triggers native browser "Are you sure you want to leave?" warning
    };

    // 2. Block Browser Back Button
    const handleBackButton = (e: PopStateEvent) => {
      // Trap the user by pushing the state back immediately
      window.history.pushState(null, "", window.location.href);

      const confirmed = window.confirm(
        "Are you sure you want to exit the application wizard? Any unsaved progress will be lost.",
      );

      if (confirmed) {
        // Clean up listeners before navigating so it doesn't block the actual exit
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handleBackButton);
        router.back();
      }
    };

    // Push initial state to catch the very first back click
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleBackButton);

    // ✅ CRITICAL: Cleanup on unmount.
    // When the user clicks "Cancel", the component unmounts,
    // automatically removing these locks so router.push() works perfectly.
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [isActive, router]);
}
