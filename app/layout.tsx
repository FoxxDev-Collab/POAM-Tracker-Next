import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemePaletteProvider } from "@/components/ThemePaletteProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "POAM Tracker Next - Vulnerability Management System",
  description: "Advanced Plan of Action and Milestones tracking system for comprehensive vulnerability management and security operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemePaletteProvider>
          {children}
        </ThemePaletteProvider>
      </body>
    </html>
  );
}
