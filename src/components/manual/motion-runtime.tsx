import { useEffect } from "react";
import { animate, scroll } from "framer-motion";
import { EASE, DUR_S, DUR_M, DUR_L, STAGGER, BEAT } from "@/lib/motion";

/** Enhances existing layout boxes; no content, links or flow dimensions are replaced. */
export function PageMotion() {
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};
    const start = () => { dispose(); dispose = enhance(media.matches); };
    start(); media.addEventListener("change", start);
    return () => { dispose(); media.removeEventListener("change", start); };
  }, []);
  return null;
}

function enhance(reduced: boolean) {
  const mobile = matchMedia("(max-width: 767px)").matches;
  const distance = (n: number) => mobile ? n / 2 : n;
  const cleanups: (() => void)[] = [];
  const originals = new Map<HTMLElement, string | null>();
  const remember = (el: HTMLElement) => { if (!originals.has(el)) originals.set(el, el.getAttribute("style")); };
  const active = new Set<ReturnType<typeof animate>>();
  const run = (el: HTMLElement, keyframes: Parameters<typeof animate>[1], duration: number, delay = 0) => {
    remember(el); el.style.willChange = "transform, opacity";
    const controls = animate(el, keyframes, { duration: reduced ? BEAT.reduced : duration, delay: reduced ? 0 : delay, ease: EASE });
    active.add(controls);
    controls.then(() => { el.style.willChange = "auto"; active.delete(controls); });
    return controls;
  };
  const pending = new Map<Element, () => void>();
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
      pending.get(entry.target)?.(); pending.delete(entry.target); observer.unobserve(entry.target);
    }
  }), { threshold: [0, 0.3] });
  const watch = (el: HTMLElement, callback: () => void) => { pending.set(el, callback); observer.observe(el); };
  const seen = new Set<HTMLElement>();
  const reveal = (el: HTMLElement, delay = 0, kind = "paragraph", immediate = false, duration = DUR_M) => {
    if (seen.has(el)) return; seen.add(el); remember(el);
    el.style.opacity = "0";
    const y = distance(kind === "button" ? 12 : kind === "card" ? 24 : 20);
    const enter = () => { el.dataset["motionEntered"] = "true"; run(el, reduced ? { opacity: [0, 1] } : { opacity: [0, 1], y: [y, 0], scale: [kind === "card" ? 0.98 : 1, 1] }, duration, delay); };
    if (immediate) enter(); else watch(el, enter);
  };
  const select = (selector: string) => Array.from(document.querySelectorAll<HTMLElement>(selector));

  // Each mask clips an exact clone of the original heading. The original retains
  // its flow box and accessible text, including line wraps chosen by the browser.
  const heading = (el: HTMLElement, delay = 0, immediate = false) => {
    if (seen.has(el)) return; seen.add(el); remember(el);
    if (reduced) { el.style.opacity = "0"; const cb = () => run(el, { opacity: [0, 1] }, BEAT.reduced); immediate ? cb() : watch(el, cb); return; }
    let prepared = false;
    let masks: HTMLElement[] = [];
    const build = () => {
      if (prepared) return; prepared = true;
      const bounds = el.getBoundingClientRect();
      const lines: { top: number; bottom: number }[] = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        for (let i = 0; i < (node.textContent?.length ?? 0); i++) {
          const range = document.createRange(); range.setStart(node, i); range.setEnd(node, i + 1);
          const r = range.getBoundingClientRect(); if (!r.width || !r.height) continue;
          const top = r.top - bounds.top, bottom = r.bottom - bounds.top;
          const line = lines.find(l => Math.abs(l.top - top) < r.height * 0.45);
          if (line) { line.top = Math.min(line.top, top); line.bottom = Math.max(line.bottom, bottom); } else lines.push({ top, bottom });
        }
      }
      if (!lines.length) { run(el, { opacity: [0, 1] }, DUR_L, delay); return; }
      lines.sort((a, b) => a.top - b.top);
      el.style.position = "relative";
      const layer = document.createElement("span"); layer.className = "heading-motion-layer"; layer.setAttribute("aria-hidden", "true");
      const source = el.cloneNode(true) as HTMLElement;
      source.style.cssText = "";
      for (const line of lines) {
        const mask = document.createElement("span"); mask.className = "heading-line-mask";
        const height = line.bottom - line.top;
        mask.style.top = `${line.top}px`; mask.style.height = `${height}px`;
        const inner = document.createElement("span"); inner.className = "heading-line-inner"; inner.style.height = `${height}px`;
        const copy = document.createElement("span"); copy.className = "heading-line-copy";
        copy.style.top = `${-line.top}px`; copy.innerHTML = source.innerHTML;
        inner.append(copy); mask.append(inner); layer.append(mask); masks.push(inner);
        inner.style.transform = `translateY(${height}px)`;
      }
      // Hide only original direct children/text, not the overlay. A paint-only
      // color token avoids changing any metric or duplicating accessible text.
      el.classList.add("heading-masked"); el.append(layer); el.style.opacity = "1";
      cleanups.push(() => { layer.remove(); el.classList.remove("heading-masked"); });
      masks.forEach((mask, i) => {
        run(mask, { y: [mask.offsetHeight, 0] }, DUR_L, delay + i * BEAT.line);
        mask.querySelectorAll<HTMLElement>(".faixa").forEach(ribbon => {
          ribbon.classList.add("ribbon-draw");
          const control = animate(ribbon, { "--ribbon-scale": [0, 1] }, { duration: BEAT.ribbon, delay: delay + i * BEAT.line + (immediate ? DUR_L * 0.6 : BEAT.tag), ease: EASE });
          active.add(control);
        });
      });
    };
    el.style.opacity = "0";
    // Fonts must settle before measuring, without a layout-dependent rerender.
    const ready = () => { void document.fonts.ready.then(build); };
    immediate ? ready() : watch(el, ready);
  };
  document.documentElement.classList.add("motion-ready");
  document.documentElement.classList.toggle("motion-reduced", reduced);
  select(".dark-section").forEach((el, i) => { remember(el); el.style.setProperty("--light-delay", `${-i * 1.37}s`); });
  const topbar = select(".topbar")[0]; if (topbar) run(topbar, reduced ? { opacity: [0, 1] } : { y: ["-100%", "0%"] }, DUR_S);
  const header = select(".site-header")[0]; if (header) {
    run(header, { opacity: [0, 1] }, DUR_M, BEAT.header);
    const update = () => header.classList.toggle("header-scrolled", window.scrollY > 80);
    update(); window.addEventListener("scroll", update, { passive: true }); cleanups.push(() => { window.removeEventListener("scroll", update); header.classList.remove("header-scrolled"); });
  }
  if (!reduced) {
    const bar = document.createElement("div");
    bar.style.cssText = "position:fixed;top:0;left:0;width:100%;height:2px;z-index:100;background:linear-gradient(90deg,var(--cobre),#FFB000);transform-origin:left;transform:scaleX(0);pointer-events:none;";
    document.body.prepend(bar);
    const stop = scroll(p => { bar.style.transform = `scaleX(${p})`; });
    cleanups.push(() => { stop(); bar.remove(); });
  }
  select(".hero h1").forEach(el => heading(el, BEAT.headline, true));
  select(".hero .eyebrow").forEach(el => reveal(el, BEAT.tag, "button", true));
  // Count-up the stat numbers inside the hero eyebrow as it fades in.
  if (!reduced) {
    const eyebrow = select(".hero .eyebrow")[0];
    if (eyebrow) {
      const orig = eyebrow.textContent ?? "";
      eyebrow.innerHTML = orig.replace(/(\d[\d.]*)/g, '<span data-n="$1">$1</span>');
      setTimeout(() => {
        eyebrow.querySelectorAll<HTMLElement>("[data-n]").forEach(span => {
          const raw = span.dataset.n ?? "0";
          const target = Number(raw.replace(/\./g, ""));
          if (!target) return;
          const hasSep = raw.includes(".");
          const ctrl = animate(0, target, { duration: DUR_M, ease: EASE,
            onUpdate: n => { span.textContent = hasSep ? Math.round(n).toLocaleString("pt-BR") : String(Math.round(n)); }
          });
          active.add(ctrl);
        });
      }, BEAT.tag * 1000);
      cleanups.push(() => { eyebrow.textContent = orig; });
    }
  }
  select(".hero-description").forEach(el => reveal(el, BEAT.subtitle, "paragraph", true));
  select(".hero .cta-wrap").forEach(el => reveal(el, BEAT.cta, "button", true));
  select(".hero-price").forEach(el => reveal(el, BEAT.price, "paragraph", true));
  select(".hero-price strong").forEach(el => { run(el, reduced ? { opacity: [0, 1] } : { opacity: [0, 1], scale: [0.96, 1] }, DUR_M, BEAT.price + BEAT.strike + DUR_S); });
  const strike = (el: HTMLElement, delay: number, immediate = false) => {
    if (reduced) return;
    el.classList.add("animated-strike"); const line = document.createElement("span"); line.className = "strike-line"; line.setAttribute("aria-hidden", "true"); el.append(line);
    line.style.transform = "scaleX(0)"; const cb = () => run(line, { scaleX: [0, 1] }, DUR_S, delay);
    immediate ? cb() : watch(el, cb); cleanups.push(() => { line.remove(); el.classList.remove("animated-strike"); });
  };
  select(".hero-price del").forEach(el => strike(el, BEAT.price + BEAT.strike, true));
  select(".section-heading h2, .audience-grid h2").forEach(el => heading(el));
  select(".section-heading .eyebrow").forEach(el => reveal(el));
  select(".mirror-card").forEach((el, i) => {
    reveal(el, i * BEAT.mirror, "card");
    const numeral = el.querySelector<HTMLElement>(".mirror-title span");
    if (numeral) { remember(numeral); numeral.style.opacity = "0"; watch(numeral, () => run(numeral, reduced ? { opacity: [0, 1] } : { opacity: [0, 1], scale: [1.15, 1] }, DUR_M, i * BEAT.mirror + BEAT.tag)); }
  });
  select(".pain-section .prose p").forEach((el, i, all) => reveal(el, BEAT.pain * i, "paragraph", false, i === all.length - 1 ? DUR_L : DUR_M));
  select(".turning-grid .prose p").forEach((el, i) => reveal(el, BEAT.paragraph * i));
  select(".philosophers article").forEach((el, i) => {
    remember(el); el.style.opacity = "0"; watch(el, () => run(el, reduced ? { opacity: [0, 1] } : { opacity: [0, 1], x: [-distance(24), 0] }, DUR_M, i * BEAT.line)); seen.add(el);
  });
  select(".step, .bonus-card").forEach((el, i) => reveal(el, (i % 6) * BEAT.paragraph, "card"));
  select(".bonus-card").forEach(el => {
    if (reduced) return;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "bonus-outline"); svg.setAttribute("aria-hidden", "true");
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect"); rect.setAttribute("x", "0.5"); rect.setAttribute("y", "0.5"); rect.setAttribute("width", "99%"); rect.setAttribute("height", "99%"); rect.setAttribute("rx", "3"); rect.setAttribute("pathLength", "1"); svg.append(rect); el.append(svg); cleanups.push(() => svg.remove());
  });
  select(".step-number").forEach((el, i) => {
    if (reduced) return;
    const text = el.textContent ?? ""; const value = Number(text); el.textContent = "00";
    watch(el, () => { const control = animate(0, value, { duration: BEAT.count, delay: i * BEAT.paragraph, ease: EASE, onUpdate: n => { el.textContent = String(Math.round(n)).padStart(2, "0"); } }); active.add(control); });
    cleanups.push(() => { el.textContent = text; });
  });
  const steps = select(".steps-grid")[0];
  if (steps && !reduced) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "steps-connector"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("viewBox", "0 0 1000 1000"); svg.setAttribute("preserveAspectRatio", "none");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); path.setAttribute("d", mobile ? "M1 0 V1000" : "M0 0 H1000 M0 500 H1000"); path.setAttribute("pathLength", "1"); svg.append(path); steps.append(svg);
    const stop = scroll(progress => { path.style.strokeDashoffset = String(1 - progress); }, { target: steps, offset: ["start 80%", "end 40%"] }); cleanups.push(() => { stop(); svg.remove(); });
  }
  select(".sample-section").forEach(el => {
    remember(el); el.style.opacity = "0"; el.style.transformOrigin = "top";
    watch(el, () => { el.dataset["motionEntered"] = "true"; run(el, reduced ? { opacity: [0, 1] } : { opacity: [0, 1], rotateX: [6, 0], transformPerspective: [1600, 1600] }, BEAT.page); });
  });
  select(".book-page-body > div").forEach(el => {
    const label = el.querySelector<HTMLElement>("h3"); if (label) reveal(label, 0, "button");
    el.querySelectorAll<HTMLElement>("p, small").forEach(text => reveal(text, BEAT.paragraph, "button"));
  });
  select(".sample-cta > p").forEach(el => { remember(el); el.style.opacity = "0"; watch(el, () => run(el, reduced ? { opacity: [0, 1] } : { opacity: [0, 1], scale: [0.9, 1] }, DUR_M)); });
  select(".audience-grid > div").forEach((el, i) => { remember(el); el.style.opacity = "0"; watch(el, () => run(el, reduced ? { opacity: [0, 1] } : { opacity: [0, 1], x: [distance(i ? 24 : -24), 0] }, DUR_M)); });
  select(".dash-list").forEach(list => Array.from(list.querySelectorAll<HTMLElement>("li")).forEach((el, i) => reveal(el, i * (list.closest(".offer-card") ? BEAT.paragraph : STAGGER))));
  select(".trust-row span").forEach((el, i) => reveal(el, i * BEAT.paragraph, "button"));
  select(".offer-card").forEach(el => reveal(el, 0, "card"));
  select(".offer-price del").forEach(el => { reveal(el); strike(el, BEAT.signature); });
  select(".offer-price strong").forEach(el => { remember(el); el.style.opacity = "0"; watch(el, () => { el.classList.add("price-lit"); run(el, reduced ? { opacity: [0, 1] } : { opacity: [0, 1], scale: [1.2, 1] }, DUR_L, BEAT.signature + DUR_S); }); cleanups.push(() => el.classList.remove("price-lit")); });
  select(".guarantee-seal").forEach(el => { remember(el); el.style.opacity = "0"; watch(el, () => run(el, reduced ? { opacity: [0, 1] } : { opacity: [0, 1], rotate: [-90, 0] }, BEAT.page)); });
  select(".final-letter p").forEach((el, i, all) => heading(el, i * BEAT.letter + (i === all.length - 1 ? BEAT.emphasis : 0)));
  select(".signature").forEach(el => reveal(el, BEAT.letter * 4 + BEAT.emphasis));
  select(".cta-wrap").forEach(el => { if (!el.closest(".mobile-bar")) reveal(el, el.closest(".offer-card") ? DUR_L : el.closest(".final-section") ? DUR_L + BEAT.emphasis : BEAT.signature, "button"); });
  select(".section-footnote, .guarantee-grid .prose, .offer-card blockquote, .page-number").forEach(el => reveal(el));
  select(".manual-accordion .accordion-item").forEach((el, i) => reveal(el, i * BEAT.paragraph, "button"));
  // Activate the paused metal-sweep shimmer on CTA buttons when they enter viewport.
  if (!reduced) {
    select(".checkout-button").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("motion-visible");
      else watch(el as HTMLElement, () => el.classList.add("motion-visible"));
      cleanups.push(() => el.classList.remove("motion-visible"));
    });
  }
  // On mobile: slide the sticky CTA bar up the first time the hero section exits the viewport.
  if (mobile && !reduced) {
    const mobileBar = select(".mobile-bar")[0];
    const heroEl = select(".hero")[0];
    if (mobileBar && heroEl) {
      remember(mobileBar); mobileBar.style.transform = "translateY(110%)";
      const heroObs = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) { run(mobileBar, { y: ["110%", "0%"] }, DUR_S); heroObs.disconnect(); }
      }, { threshold: 0 });
      heroObs.observe(heroEl);
      cleanups.push(() => heroObs.disconnect());
    }
  }

  // One-shot scale pulse on the final CTA after its reveal settles, drawing
  // the eye to the conversion action at the bottom of the reading journey.
  if (!reduced) {
    const finalCta = select(".final-section .checkout-button")[0];
    if (finalCta) {
      const pulsObs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          const ctrl = animate(finalCta, { scale: [1, 1.05, 1] },
            { duration: 0.6, delay: DUR_L + BEAT.emphasis + DUR_M + 0.1, ease: EASE });
          active.add(ctrl); pulsObs.disconnect();
        }
      }, { threshold: 0.3 });
      pulsObs.observe(finalCta);
      cleanups.push(() => pulsObs.disconnect());
    }
  }

  // Use the existing media boxes as an entry layer and the image as a scroll/
  // pointer layer, so independent transforms never fight over the same node.
  select("[data-parallax]").forEach(el => {
    const hero = el.classList.contains("hero-media"), offer = el.classList.contains("offer-media");
    const img = el.querySelector<HTMLElement>("img"); if (!img) return;
    remember(el); remember(img); el.style.opacity = "0";
    const enter = () => {
      const frames = reduced ? { opacity: [0, 1] } : hero ? { opacity: [0, 1], y: [distance(40), 0], rotateY: [-8, 0], transformPerspective: [1200, 1200] } : offer ? { opacity: [0, 1], scale: [0.92, 1] } : { opacity: [0, 1] };
      run(el, frames, hero || offer ? BEAT.mockup : BEAT.statue, hero ? BEAT.headline : 0).then(() => { if (!reduced && (hero || offer)) el.classList.add("media-floating"); });
      el.dataset["motionEntered"] = "true";
    };
    hero ? enter() : watch(el, enter);
    if (!reduced && !mobile && !offer) {
      let parallax = 0, angle = 0, targetAngle = 0, velocity = 0, frame = 0;
      const stop = scroll((_p, info) => { parallax = (info.y.current - info.y.targetOffset) * (hero ? 0.15 : 0.08); }, { target: el, offset: ["start start", "end start"] });
      const pointer = (event: PointerEvent) => { targetAngle = ((event.clientX / window.innerWidth) * 2 - 1) * 4; };
      const reset = () => { targetAngle = 0; };
      if (hero) { window.addEventListener("pointermove", pointer, { passive: true }); document.addEventListener("pointerleave", reset); }
      let last = 0;
      const tick = (time: number) => {
        const dt = Math.min((time - last) / 1000 || 0.016, 0.032); last = time;
        velocity += (60 * (targetAngle - angle) - 20 * velocity) * dt; angle += velocity * dt;
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) img.style.transform = `perspective(1200px) translateY(${parallax}px) rotateY(${angle}deg)`;
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      cleanups.push(() => { stop(); cancelAnimationFrame(frame); window.removeEventListener("pointermove", pointer); document.removeEventListener("pointerleave", reset); });
    }
    if (!reduced && (hero || offer)) {
      const reflection = document.createElement("span"); reflection.className = "book-reflection"; reflection.setAttribute("aria-hidden", "true");
      reflection.style.setProperty("--book-mask", `url("${img.getAttribute("src") ?? ""}")`); el.append(reflection); cleanups.push(() => reflection.remove());
    }
    cleanups.push(() => el.classList.remove("media-floating"));
  });
  // Pause decorative CSS work whenever its section leaves the viewport.
  const visibility = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle("motion-visible", e.isIntersecting)));
  select(".dark-section, .checkout-button, .guarantee-seal").forEach(el => visibility.observe(el));
  select("#hero, #oferta").forEach(el => {
    if (reduced) return;
    const dust = document.createElement("div"); dust.className = "studio-dust"; dust.setAttribute("aria-hidden", "true");
    for (let i = 0; i < (mobile ? 8 : 18); i++) {
      const particle = document.createElement("i"); particle.style.setProperty("--dust-x", `${(i * 37 + 11) % 100}%`); particle.style.setProperty("--dust-size", `${1 + (i % 3) / 2}px`); particle.style.setProperty("--dust-duration", `${14 + i % 9}s`); particle.style.setProperty("--dust-delay", `${-i * 2.3}s`); particle.style.setProperty("--dust-drift", `${(i % 2 ? -1 : 1) * (12 + i)}px`); dust.append(particle);
    }
    el.prepend(dust); cleanups.push(() => dust.remove());
  });
  const offerSection = select("#oferta")[0]; if (offerSection) watch(offerSection, () => offerSection.classList.add("offer-illuminated"));
  return () => {
    observer.disconnect(); visibility.disconnect(); active.forEach(c => c.stop()); cleanups.forEach(cb => cb());
    originals.forEach((style, el) => { if (style === null) el.removeAttribute("style"); else el.setAttribute("style", style); delete el.dataset["motionEntered"]; });
    document.documentElement.classList.remove("motion-ready", "motion-reduced"); offerSection?.classList.remove("offer-illuminated");
  };
}