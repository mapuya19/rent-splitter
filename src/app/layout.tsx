import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    default: "Free Rent Calculator - Split Rent by Income or Room Size | Rent Splitter",
    template: "%s | Rent Splitter",
  },
  description: "Calculate fair rent splits by income or room size. Free online rent and utilities calculator for roommates. Split expenses evenly, generate shareable links, and support multiple currencies. No signup required.",
  keywords: [
    "rent splitter",
    "rent calculator",
    "roommate rent calculator",
    "fair rent split",
    "rent by income",
    "rent by room size",
    "utilities calculator",
    "split rent",
    "roommate expenses",
    "rent sharing",
    "housing calculator",
    "rental expenses",
  ],
  authors: [{ name: "Rent Splitter" }],
  creator: "Rent Splitter",
  publisher: "Rent Splitter",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rent-splitted.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Rent Splitter",
    title: "Free Rent Calculator - Split Rent by Income or Room Size | Rent Splitter",
    description: "Calculate fair rent splits by income or room size. Free online rent and utilities calculator for roommates. Split expenses evenly, generate shareable links, and support multiple currencies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rent Splitter - Fair Rent & Utilities Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Rent Calculator - Split Rent by Income or Room Size | Rent Splitter",
    description: "Calculate fair rent splits by income or room size. Free online rent and utilities calculator for roommates. Split expenses evenly, generate shareable links, and support multiple currencies.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  category: "finance",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rent-splitted.vercel.app";
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rent Splitter",
    description: "Calculate fair rent splits by income or room size. Free online rent and utilities calculator for roommates. Split expenses evenly, generate shareable links, and support multiple currencies. No signup required.",
    url: baseUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Income-based rent splitting",
      "Room size-based rent splitting",
      "Even utilities splitting",
      "Custom expenses tracking",
      "Shareable calculation links",
      "Multi-currency support",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
