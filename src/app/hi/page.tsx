import { permanentRedirect } from "next/navigation";

/** The Hindi section starts at the blog — /hi itself has no landing page. */
export default function HindiRootPage() {
  permanentRedirect("/hi/blog");
}
