export const EASE = [0.22, 1, 0.36, 1] as const;
export const DUR_S = 0.5;
export const DUR_M = 0.8;
export const DUR_L = 1.2;
export const STAGGER = 0.08;
export const VIEWPORT = { once: true, amount: 0.3 } as const;
// Specific editorial beats are kept here beside the shared motion vocabulary.
export const BEAT = {
  reduced: 0.2, header: 0.15, tag: 0.2, headline: 0.35, line: 0.12,
  ribbon: 0.7, subtitle: 1.1, price: 1.3, strike: 0.4, cta: 1.6,
  mockup: 1.4, word: 0.06, signature: 0.3, paragraph: 0.1,
  mirror: 0.15, pain: 0.25, statue: 1.6, count: 0.6,
  accordion: 0.4, page: 1, letter: 0.3, emphasis: 0.4,
  carousel: 6, popup: 6, popupExit: 0.4,
} as const;