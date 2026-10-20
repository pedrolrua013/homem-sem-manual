import { createFileRoute } from "@tanstack/react-router";
import { TopBar, Header, Hero, Phrase, Mirror, Pain, TurningPoint, HowItWorks, Contents, FreeSample, BookQuotes, Audience, Offer, Guarantee, FAQ, FinalCTA, Footer } from "@/components/manual/sections";
import { MobileBar, ProofPopup } from "@/components/manual/overlays";
import { Pixels } from "@/components/manual/checkout";
import shareImage from "@/assets/manual-share.webp.asset.json";
import { PageMotion } from "@/components/manual/motion-runtime";
import { SITE_URL } from "@/config";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Homem Sem Manual — o manual que ninguém te deu | R$ 10" },
    { name: "description", content: "40 pílulas de 2.000 anos de história para quem cansou de ser a pior versão de si mesmo. Marco Aurélio, Sêneca e Epicteto traduzidos para a sua vida. De R$ 40 por R$ 10." },
    { property: "og:title", content: "Homem Sem Manual — o manual que ninguém te deu | R$ 10" },
    { property: "og:description", content: "40 pílulas de 2.000 anos de história para quem cansou de ser a pior versão de si mesmo. Marco Aurélio, Sêneca e Epicteto traduzidos para a sua vida. De R$ 40 por R$ 10." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    { property: "og:image", content: `${SITE_URL}${shareImage.url}` },
    { name: "twitter:image", content: `${SITE_URL}${shareImage.url}` },
  ] }),
  component: Index,
});
function Index() { return <><TopBar /><Header /><main><Hero /><Phrase /><Mirror /><Pain /><TurningPoint /><HowItWorks /><Contents /><FreeSample /><BookQuotes /><Audience /><Offer /><Guarantee /><FAQ /><FinalCTA /></main><Footer /><MobileBar /><ProofPopup /><Pixels /><PageMotion /></>; }
