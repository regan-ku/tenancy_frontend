"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/api/auth.api";

export const useAuthRedirect = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  const handlePostLoginRedirect = async () => {
    setIsRedirecting(true);
    setRedirectError(null);

    try {
      // 1. Ask the backend where this user should go
      const userState = await authApi.getUserState();

      // 2. Route based on the backend's response
      if (!userState.profile_complete) {
        router.push("/onboarding");
      } else if (userState.next_route) {
        // If the backend provides a specific route (e.g., /properties/wizard)
        router.push(userState.next_route);
      } else {
        // Fallback based on role if next_route is missing
        switch (userState.role) {
          case "tenant":
            router.push("/dashboard/tenant");
            break;
          case "landlord":
            router.push("/dashboard/landlord");
            break;
          case "agency":
          case "agent":
            router.push("/dashboard/agency");
            break;
          case "caretaker":
            router.push("/dashboard/caretaker");
            break;
          case "admin":
            router.push("/dashboard/admin");
            break;
          default:
            router.push("/");
        }
      }
    } catch (err: any) {
      console.error("Redirect failed:", err);
      setRedirectError(
        "Logged in, but failed to load user state. Please refresh.",
      );
      router.push("/");
    } finally {
      setIsRedirecting(false);
    }
  };

  return { handlePostLoginRedirect, isRedirecting, redirectError };
};
