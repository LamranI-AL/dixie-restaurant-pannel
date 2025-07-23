/** @format */

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import AuthProvider from "@/providers/auth-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "sonner";
// import "@uploadthing/react/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Afood - Admin pannel",
  description: "admin pannel for afood",
  keywords:
    "poulet frit, livraison poulet, chicken delivery, afood, restaurant , burger poulet, grillades poulet, poulet croustillant",
  // Configuration pour le favicon
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/afoodLogo.png", sizes: "16x16", type: "image/png" },
      { url: "/afoodLogo.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/jpg",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon/safari-pinned-tab.svg",
        color: "#FF6B00",
      },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    title: "afood - Spécialiste du Poulet",
    description:
      "Découvrez nos recettes exclusives de poulet frit, grillé et nos délicieux burgers. Livraison rapide à domicile ou à emporter.",
    type: "website",
    locale: "fr_FR",
    url: "https://www.afood.com",
    siteName: "afood Chicken",
    images: [
      {
        url: "/afoodLogo.jpg",
        width: 1200,
        height: 630,
        alt: "Délicieux plats de poulet afood",
      },
    ], //
  },
  twitter: {
    card: "summary_large_image",
    title: "afood Chicken & Grill - Le Meilleur Poulet Livré Chez Vous",
    description:
      "Spécialiste du poulet frit, grillé et des burgers de poulet. Livraison rapide et fraîcheur garantie.",
    images: ["/afoodLogo.png"],
  },
  alternates: {
    canonical: "https://www.afood.ma",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  applicationName: "afood admin",
  publisher: "othmane alaoui",
  viewport: "width=device-width, initial-scale=1",
  colorScheme: "light",
  creator: "othmane lamrani alaoui",
  authors: [{ name: "afood", url: "https://www.afood.ma" }],
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  category: "restaurant",
  other: {
    "revisit-after": "7 days",
    "geo.region": "FR",
  },
  themeColor: "#FF6B00",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const queryClient = new QueryClient();
  return (
    <html
      lang="en"
      suppressHydrationWarning>
      <body className={geistSans.className}>
        <ThemeProvider
          defaultTheme="light"
          storageKey="dixie-theme">
          <QueryProvider>
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
