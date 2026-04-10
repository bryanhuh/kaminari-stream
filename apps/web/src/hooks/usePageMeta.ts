import { useEffect } from "react";

const SITE = "raijin.";

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;

    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.content = description ?? `${SITE} — Watch anime online free.`;
  }, [title, description]);
}
