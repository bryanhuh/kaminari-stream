import { useEffect } from "react";

const SITE = "raijin.";
const DEFAULT_DESC = `${SITE} — Watch anime online free.`;

function setMeta(attr: "name" | "property", value: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, value);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export function usePageMeta(title: string, description?: string, image?: string) {
  useEffect(() => {
    const desc = description ?? DEFAULT_DESC;

    document.title = title;

    // Standard
    setMeta("name", "description", desc);

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:site_name", SITE);
    setMeta("property", "og:type", image ? "video.other" : "website");
    if (image) setMeta("property", "og:image", image);

    // Twitter Card
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);
    if (image) setMeta("name", "twitter:image", image);
  }, [title, description, image]);
}
