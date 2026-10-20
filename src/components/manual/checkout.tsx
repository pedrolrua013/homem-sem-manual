import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHECKOUT_URL, META_PIXEL_ID, TIKTOK_PIXEL_ID } from "@/config";

type TrackingWindow = Window & { fbq?: (...args: unknown[]) => void; ttq?: { track?: (name: string, properties?: Record<string, unknown>) => void } };
export function checkoutHref() {
  const target = new URL(CHECKOUT_URL);
  if (typeof window !== "undefined") {
    const source = new URLSearchParams(window.location.search);
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const value = source.get(key);
      if (value !== null) target.searchParams.set(key, value);
    }
  }
  return target.toString();
}
export function trackCheckout() {
  if (typeof window === "undefined") return;
  const target = window as TrackingWindow;
  try { target.fbq?.("track", "InitiateCheckout", { value: 10, currency: "BRL", content_name: "Homem Sem Manual" }); } catch { /* Optional analytics never blocks checkout. */ }
  try { target.ttq?.track?.("InitiateCheckout", { value: 10, currency: "BRL", content_name: "Homem Sem Manual" }); } catch { /* Optional analytics never blocks checkout. */ }
}
export function CheckoutLink({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <a href={CHECKOUT_URL} className={className} onClick={(event) => { event.currentTarget.href = checkoutHref(); trackCheckout(); }}>{children}</a>;
}
export function CTA({ children, secondary = false, compact = false }: { children: React.ReactNode; secondary?: boolean; compact?: boolean }) {
  return <div className={compact ? "cta-wrap compact" : "cta-wrap"}>
    <Button asChild variant={secondary ? "manualOutline" : "manual"} className="checkout-button">
      <CheckoutLink>{children}<ArrowUpRight strokeWidth={1.5} aria-hidden="true" /></CheckoutLink>
    </Button>
    {!secondary && !compact && <p className="microcopy">PDF · acesso imediato no e-mail · garantia de 7 dias</p>}
  </div>;
}
export function Pixels() {
  useEffect(() => {
    if (META_PIXEL_ID && !document.getElementById("manual-meta-pixel")) {
      const script = document.createElement("script"); script.id = "manual-meta-pixel";
      script.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(META_PIXEL_ID)});fbq('track','PageView');`;
      document.head.appendChild(script);
    }
    if (TIKTOK_PIXEL_ID && !document.getElementById("manual-tiktok-pixel")) {
      const script = document.createElement("script"); script.id = "manual-tiktok-pixel";
      script.text = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){var e=ttq._i[t]||[];for(var n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var s=d.createElement('script');s.type='text/javascript';s.async=!0;s.src=r+'?sdkid='+e+'&lib='+t;var a=d.getElementsByTagName('script')[0];a.parentNode.insertBefore(s,a)};ttq.load(${JSON.stringify(TIKTOK_PIXEL_ID)});ttq.page()}(window,document,'ttq');`;
      document.head.appendChild(script);
    }
  }, []);
  return null;
}
