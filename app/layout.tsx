import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Crystal Pressing — Gestion Pressing à Douala",
    template: "%s | Crystal Pressing",
  },
  description:
    "Crystal Pressing digitalise la gestion de son pressing à Douala : suivi des vêtements du dépôt à la livraison, caisse fiable et traçabilité complète des articles et accessoires.",
  keywords: [
    "pressing Douala",
    "nettoyage à sec Douala",
    "blanchisserie Cameroun",
    "Crystal Pressing",
  ],
  authors: [{ name: "Crystal Pressing" }],
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Crystal Pressing — Gestion Pressing à Douala",
    description:
      "Suivi des vêtements, traçabilité des accessoires et caisse fiable pour Crystal Pressing.",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/images/logo.png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}