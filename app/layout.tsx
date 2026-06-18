import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GreenDrive Currency | Drive Today. Own Tomorrow.",
  description:
    "Good drivers deserve smarter financial moves. No credit checks, real-time affordability, instant handover. Vehicle ownership for Bolt, Uber, taxi and delivery drivers, and fleets for South African businesses.",
  keywords: [
    "GreenDrive Currency",
    "vehicle finance South Africa",
    "Bolt driver car finance",
    "Uber driver car finance",
    "no credit check car finance",
    "fleet finance South Africa",
  ],
  openGraph: {
    title: "GreenDrive Currency | Drive Today. Own Tomorrow.",
    description: "Banks say no. We say yes. Vehicle ownership built on affordability, not credit history.",
    locale: "en_ZA",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d7a34",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gd-black">
        {children}
      </body>
    </html>
  );
}
