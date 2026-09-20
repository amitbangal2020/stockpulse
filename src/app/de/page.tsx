import { permanentRedirect } from "next/navigation";

/** The German section starts at the blog — /de itself has no landing page. */
export default function GermanRootPage() {
  permanentRedirect("/de/blog");
}
