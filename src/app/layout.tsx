/** @format */

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import AuthProvider from "@/providers/auth-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
// import "@uploadthing/react/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dixie - Admin panel",
  description: "Dixie - Admin panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning>
      <body className={geistSans.className}>
        <ThemeProvider
          defaultTheme="light"
          storageKey="dixie-theme">
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
