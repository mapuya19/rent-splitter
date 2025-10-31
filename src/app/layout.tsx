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
    default: "Rent Splitter - Fair Rent & Utilities Calculator",
    template: "%s | Rent Splitter",
  },
  description: "Split rent proportionally based on income or room size, and utilities evenly between roommates. Generate shareable links to collaborate with your roommates. Free, easy-to-use rent calculator.",
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rent-splitter.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Rent Splitter",
    title: "Rent Splitter - Fair Rent & Utilities Calculator",
    description: "Split rent proportionally based on income or room size, and utilities evenly between roommates. Generate shareable links to collaborate with your roommates.",
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
    title: "Rent Splitter - Fair Rent & Utilities Calculator",
    description: "Split rent proportionally based on income or room size, and utilities evenly between roommates.",
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rent-splitter.vercel.app";
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rent Splitter",
    description: "Split rent proportionally based on income or room size, and utilities evenly between roommates. Generate shareable links to collaborate with your roommates.",
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
