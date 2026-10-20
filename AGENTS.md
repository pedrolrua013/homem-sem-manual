# Homem Sem Manual — Site

Página de vendas do ebook. Stack: TanStack Start · React 19 · Tailwind 4 · Framer Motion · shadcn/ui · TypeScript.

## Regras de desenvolvimento

- Keep checkout destination, social URLs, optional pixel IDs and sales mode in `src/config.ts` so all purchase links share configuration and UTM propagation.
- Do not enable real-sales mode (`SHOW_REAL_SALES = true`) without a validated Kiwify checkout URL and configured pixels.
- Use semantic visual tokens in `src/styles.css` and manual Button variants for the editorial design.
- Prebundle the sales page's UI dependencies explicitly in Vite so late dependency discovery cannot invalidate the React dispatcher during live preview.
- Keep animated layers as decorative surfaces only — must preserve underlying layout and content. Motion runtime lives in `src/components/manual/motion-runtime.tsx`.
- Always respect `prefers-reduced-motion`. The engine uses `reduced` flag from `matchMedia`.

## Estrutura

```
src/
  config.ts                  ← URLs, pixels, SHOW_REAL_SALES, SITE_URL
  styles.css                 ← design system (carvão/grafite/osso/cobre)
  components/manual/
    content.ts               ← todo o copy (espelhos, módulos, citações, FAQ)
    sections.tsx             ← 15 seções da landing page
    motion-runtime.tsx       ← engine de animação (parallax, reveal, dust)
    overlays.tsx             ← MobileBar + ProofPopup
    checkout.tsx             ← CTA, pixels, checkout link
    shared.tsx               ← Logo, Faixa, Accordion, SectionHeading
    word-reveal.tsx          ← animação palavra a palavra
  lib/motion.ts              ← constantes EASE, DUR_*, BEAT
  routes/
    index.tsx                ← página principal (composição das seções)
    termos.tsx               ← termos de uso
    privacidade.tsx          ← política de privacidade
```

## Identidade visual

| Token | Valor |
|---|---|
| Carvão | `#111110` |
| Grafite | `#1E1D1B` |
| Osso | `#ECE6DA` |
| Mármore | `#D9D1C3` |
| Cobre | `#C2773B` |
| Fonte título | Anton |
| Fonte corpo | Archivo |
| Fonte citação | Cormorant Garamond italic |

## Deploy

- Plataforma: Netlify ou Cloudflare Pages
- Antes do deploy: preencher `SITE_URL` em `src/config.ts`
- Comando de build: `npm run build`
