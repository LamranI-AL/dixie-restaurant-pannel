/** @format */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar isOpen={true} />
      <div className="flex-1 overflow-hidden">
        <Header />
        <main className="p-4 md:p-6 h-[calc(100vh-64px)] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
