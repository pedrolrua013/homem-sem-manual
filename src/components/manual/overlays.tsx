import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE, DUR_S, BEAT } from "@/lib/motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CTA, CheckoutLink } from "./checkout";
import { Logo } from "./shared";
import { excerpts } from "./content";
export function MobileBar() {
  const [show, setShow] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const hero = document.getElementById("hero"), offer = document.getElementById("oferta");
    if (!hero || !offer) return;
    let afterHero = false, inOffer = false;
    const update = () => setShow(afterHero && !inOffer);
    const heroObserver = new IntersectionObserver(([entry]) => { if (!entry) return; afterHero = entry.boundingClientRect.bottom <= 0; update(); });
    const offerObserver = new IntersectionObserver(([entry]) => { if (!entry) return; inOffer = entry.isIntersecting; update(); });
    heroObserver.observe(hero); offerObserver.observe(offer);
    return () => { heroObserver.disconnect(); offerObserver.disconnect(); };
  }, []);
  return <AnimatePresence>{show && <motion.aside className="mobile-bar" aria-label="Comprar o manual" initial={reduced ? { opacity: 0 } : { y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduced ? { opacity: 0 } : { y: "100%", opacity: 0 }} transition={{ duration: reduced ? BEAT.reduced : BEAT.accordion, ease: EASE }}><div><del>De R$ 40</del><strong>por R$ 10</strong></div><CTA compact>QUERO O MANUAL</CTA></motion.aside>}</AnimatePresence>;
}
export function ProofPopup() {
  const [visible, setVisible] = useState(false), [index, setIndex] = useState(0), [dismissed, setDismissed] = useState(0);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(6000), started = useRef(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    let closes = 0;
    try { closes = Number(sessionStorage.getItem("manual-popup-closes") || 0); } catch { /* Session storage can be unavailable. */ }
    if (closes >= 2 || dismissed >= 2) return;
    let cycleTimer: ReturnType<typeof setTimeout>;
    const appear = () => { remaining.current = 6000; setVisible(true); cycleTimer = setTimeout(appear, 30000); };
    const initial = setTimeout(appear, 15000);
    return () => { clearTimeout(initial); clearTimeout(cycleTimer); };
  }, [dismissed]);
  useEffect(() => {
    if (!visible || paused) return;
    started.current = performance.now();
    const timer = setTimeout(() => { setVisible(false); setIndex(value => (value + 1) % excerpts.length); remaining.current = 6000; }, remaining.current);
    return () => { clearTimeout(timer); remaining.current = Math.max(0, remaining.current - (performance.now() - started.current)); };
  }, [visible, paused]);
  function close() { setVisible(false); let count = dismissed + 1; try { count = Number(sessionStorage.getItem("manual-popup-closes") || 0) + 1; sessionStorage.setItem("manual-popup-closes", String(count)); } catch { /* Keep in-memory close limit. */ } setDismissed(count); }
  return <AnimatePresence>{visible && <motion.aside className={`proof-popup ${paused ? "popup-paused" : ""}`} aria-label="Trecho do manual" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} initial={reduced ? { opacity: 0 } : { x: 24, opacity: 0 }} animate={{ x: 0, opacity: paused ? 1 : 0.82 }} exit={reduced ? { opacity: 0 } : { x: 12, opacity: 0 }} transition={{ duration: reduced ? BEAT.reduced : visible ? DUR_S : BEAT.popupExit, ease: EASE }}><Logo /><div><p>{excerpts[index]}</p><CheckoutLink>Ler o manual</CheckoutLink></div><Button variant="manualIcon" size="icon" title="Fechar trecho" aria-label="Fechar trecho" onClick={close}><X size={14} strokeWidth={1.5} /></Button><span className="popup-progress" aria-hidden="true" /></motion.aside>}</AnimatePresence>;
}
