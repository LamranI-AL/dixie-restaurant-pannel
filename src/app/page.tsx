/** @format */

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Link href={"/dashboard"}>
        <Button className="bg-[var(--geist-foreground)] text-[var(--geist-background)] hover:bg-[var(--geist-background)] hover:text-[var(--geist-foreground)]">
          <span className="text-[var(--geist-background)]">
            Go to Dashboard
          </span>
        </Button>
      </Link>
    </div>
  );
}
