"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // Ensure we select from authReducer correctly
  const { user, isAuthenticated } = useAppSelector((state) => state.authReducer);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // We need to wait for rehydration? 
    // PersistGate in ReduxProvider handles rehydration blocking, so when this mounts, state should be ready.
    
    if (!isAuthenticated) {
        router.push("/signin");
    } else {
        if (user && (user.roleCode === "ADMIN" || user.roleCode === "STAFF")) {
            setAuthorized(true);
        } else {
            router.push("/");
        }
    }
    setChecking(false);
  }, [user, isAuthenticated, router]);

  if (checking || !authorized) {
      // Basic loading spinner
      return (
          <div className="flex h-screen items-center justify-center bg-gray-100">
              <div className="border-gray-300 h-10 w-10 animate-spin rounded-full border-4 border-t-blue-600" />
          </div>
      );
  }

  return <>{children}</>;
}
