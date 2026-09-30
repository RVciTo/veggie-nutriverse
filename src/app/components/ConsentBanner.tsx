"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { GA_ID, getStoredConsent, setConsent, type ConsentChoice } from "@/lib/analytics";

/**
 * Consent Mode v2 banner: analytics storage defaults to denied. GA's own
 * script only loads once the visitor accepts, so no cookie is set before
 * consent. Declining hides the banner and GA never loads.
 */
export function ConsentBanner() {
  const [choice, setChoice] = useState<ConsentChoice | null>("denied");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChoice(getStoredConsent());
    setReady(true);
  }, []);

  const respond = (next: ConsentChoice) => {
    setConsent(next);
    setChoice(next);
  };

  return (
    <>
      {choice === "granted" && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {ready && choice === null && (
        <div className="glass pointer-events-auto fixed inset-x-4 bottom-4 z-50 max-w-md rounded-2xl p-4 md:inset-x-auto md:right-6">
          <p className="text-xs text-slate-300">
            We use cookie-free audience measurement to see how Nutriverse is used. No data leaves
            this site unless you accept.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => respond("granted")}
              className="rounded-lg bg-white/[0.1] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/[0.15]"
            >
              Accept
            </button>
            <button
              onClick={() => respond("denied")}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-300"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}
