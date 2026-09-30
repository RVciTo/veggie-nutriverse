import type { Metadata } from "next";
import { Syne, Space_Mono } from "next/font/google";
import Script from "next/script";
import { ConsentBanner } from "./components/ConsentBanner";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nutriverse — Veggie Protein Explorer",
  description:
    "Interactive 3D visualization of vegetarian & vegan protein sources. Compare protein, cost, and calories across 43 foods.",
  verification: {
    google: "XwCZWEwwRuWU53RYmd9JXvua7dKWsHfORDcP38bVE8M",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceMono.variable}`}>
      <body className="bg-void antialiased">
        {children}
        <ConsentBanner />
      </body>
      {/* Consent Mode v2 default: every signal denied until the visitor accepts. */}
      <Script id="consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>
    </html>
  );
}
