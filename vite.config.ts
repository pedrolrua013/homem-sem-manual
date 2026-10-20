// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    optimizeDeps: {
      // Prebundle the page's UI dependencies with React on the first pass.
      // Late Slot discovery can otherwise invalidate the live React graph.
      include: ["@radix-ui/react-slot", "@tanstack/react-query", "lucide-react", "class-variance-authority", "clsx", "tailwind-merge", "framer-motion"],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // netlify preset: use Netlify Functions for SSR. Falls back to cloudflare-module
  // inside Lovable. NITRO_PRESET env var in Netlify CI overrides automatically.
  nitro: { preset: "netlify" },
});
