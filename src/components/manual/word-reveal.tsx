import { motion, useReducedMotion } from "framer-motion";
import { EASE, DUR_M, BEAT, VIEWPORT } from "@/lib/motion";

export function WordReveal({ text, active = true }: { text: string; active?: boolean }) {
  const reduced = useReducedMotion();
  return <motion.span aria-label={text} initial={{ opacity: reduced ? 0 : 1 }} whileInView={{ opacity: 1 }} viewport={VIEWPORT} transition={{ duration: BEAT.reduced, ease: EASE }}>
    {reduced ? text : text.split(" ").map((word, i) => <span className="word-space" key={`${i}-${word}`} aria-hidden="true"><motion.span className="word-reveal" initial={{ opacity: 0, y: 3 }} whileInView={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 }} viewport={VIEWPORT} transition={{ duration: DUR_M, delay: i * BEAT.word, ease: EASE }}>{word}</motion.span>{i < text.split(" ").length - 1 ? " " : ""}</span>)}
  </motion.span>;
}