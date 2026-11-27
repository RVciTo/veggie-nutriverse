import type { Metadata } from "next";
import { Syne, Space_Mono } from "next/font/google";
import Script from "next/script";
import { ConsentBanner } from "./components/ConsentBanner";
import "./globals.css";
import foods from "../../public/data.json";

const BASE_URL = "https://veggie-nutriverse.vercel.app";
const TITLE = "Nutriverse — Veggie Protein Explorer";
const DESCRIPTION =
  "Interactive 3D visualization of vegetarian & vegan protein sources. Compare protein, cost, and calories across 43 foods.";

type Food = { food_item: string; protein_g_per_100g: number; is_vegan: boolean };
const topProtein = [...(foods as Food[])]
  .sort((a, b) => b.protein_g_per_100g - a.protein_g_per_100g)
  .slice(0, 10);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Nutriverse",
  url: BASE_URL,
  description: DESCRIPTION,
  applicationCategory: "HealthApplication",
  operatingSystem: "Any",
  inLanguage: "en",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
};

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
  metadataBase: new URL(BASE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Nutriverse",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <section className="sr-only" aria-label="About Nutriverse">
          <h2>Compare vegetarian and vegan protein sources</h2>
          <p>
            Nutriverse compares protein, cost and calories per 100 g across{" "}
            {foods.length} vegetarian and vegan foods, from legumes and dairy to
            nuts, grains and plant-based alternatives.
          </p>
          <h3>Highest protein per 100 g</h3>
          <ul>
            {topProtein.map((f) => (
              <li key={f.food_item}>
                {f.food_item}: {f.protein_g_per_100g} g protein
                {f.is_vegan ? " (vegan)" : ""}
              </li>
            ))}
          </ul>
        </section>
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
