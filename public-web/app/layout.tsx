import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bedrock Security Platform - RMF-Native Compliance Solutions",
  description: "The world's first RMF-native platform transforming cybersecurity governance from burden to competitive advantage. Built by practitioners, for practitioners.",
  keywords: "RMF, NIST, compliance, cybersecurity, governance, CMMC, security platform",
  authors: [{ name: "Bedrock Security Platform" }],
  creator: "Jeremiah Price",
  openGraph: {
    title: "Bedrock Security Platform",
    description: "Transform cybersecurity compliance with the first RMF-native platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
