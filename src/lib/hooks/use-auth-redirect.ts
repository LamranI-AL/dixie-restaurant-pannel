/** @format */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export function useAuthRedirect(
  redirectTo: string = "/login",
  shouldBeAuthenticated: boolean = true,
) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (shouldBeAuthenticated && !currentUser) {
      router.push(redirectTo);
    } else if (!shouldBeAuthenticated && currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, loading, router, redirectTo, shouldBeAuthenticated]);

  return { currentUser, loading };
}
