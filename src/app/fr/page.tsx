import { permanentRedirect } from "next/navigation";

/** The French section starts at the blog — /fr itself has no landing page. */
export default function FrenchRootPage() {
  permanentRedirect("/fr/blog");
}
