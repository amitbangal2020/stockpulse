import { permanentRedirect } from "next/navigation";

/** The Bengali section starts at the blog — /bn itself has no landing page. */
export default function BengaliRootPage() {
  permanentRedirect("/bn/blog");
}
