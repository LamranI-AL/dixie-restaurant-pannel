/** @format */
"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/dashboard");
  }, []);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Link href={"/dashboard"}>
        <Button className="bg-slate-800 text-[var(--geist-background)] hover:bg-[var(--geist-background)] hover:text-[var(--geist-foreground)]">
          <span className="text-slate-50">Go to Dashboard</span>
        </Button>
      </Link>
    </div>
  );
}
