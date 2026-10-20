import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EASE, BEAT } from "@/lib/motion";
import logo from "@/assets/busto.webp.asset.json";

export function Faixa({ children }: { children: ReactNode }) { return <span className="faixa">{children}</span>; }
export function Logo({ className = "" }: { className?: string }) { return <span className={`brand-seal ${className}`}><img src={logo.url} alt="Busto de mármore com faixa de cobre — Homem Sem Manual" width="64" height="64" loading="lazy" /></span>; }
export function SectionHeading({ children, label }: { children: ReactNode; label?: string }) { return <div className="section-heading" data-reveal>{label && <p className="eyebrow">{label}</p>}<h2>{children}</h2></div>; }
export function Accordion({ items, className = "" }: { items: { title: string; text: string }[]; className?: string }) {
  return <div className={`manual-accordion ${className}`}>{items.map((item, index) => <AccordionItem key={item.title} item={item} id={`${className || "modules"}-${index}`} />)}</div>;
}
function AccordionItem({ item, id }: { item: { title: string; text: string }; id: string }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  return <div className={`accordion-item ${open ? "is-open" : ""}`}><Button variant="ghost" className="accordion-trigger" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><span>{item.title}</span><motion.span animate={{ rotate: reduced ? 0 : open ? 45 : 0 }} transition={{ duration: BEAT.accordion, ease: EASE }}><Plus size={20} strokeWidth={1.5} aria-hidden="true" /></motion.span></Button><AnimatePresence initial={false}>{open && <motion.div id={id} initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }} exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ duration: reduced ? BEAT.reduced : BEAT.accordion, ease: EASE }} className="accordion-panel"><p>{item.text}</p></motion.div>}</AnimatePresence></div>;
}
