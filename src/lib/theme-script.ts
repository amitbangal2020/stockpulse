import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/locales";

// Shared between the pre-paint script in the root layout and the client theme
// provider, so both agree on the storage key and the `dark` class.
export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

const URL_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

/**
 * Runs before first paint so a dark-mode visitor never sees a light flash — it
 * also stamps `<html lang>`: the saved language, or the language of a
 * URL-scoped route (/bn/*, /hi/*), whose markup is in that language regardless
 * of the visitor's saved preference. Kept as plain HTML in the (server) root
 * layout: rendering a <script> from a client component makes React 19 warn that
 * it will never execute.
 *
 * The locale list is interpolated rather than hand-written so this script can
 * never disagree with `LOCALES` about which languages have URLs.
 */
export const themeInitScript = `(function(){try{var root=document.documentElement;var dark=localStorage.getItem("${THEME_STORAGE_KEY}")==="dark";if(dark){root.classList.add("dark")}else{root.classList.remove("dark")}root.style.colorScheme=dark?"dark":"light";var p=location.pathname;var langs=${JSON.stringify(URL_LOCALES)};var scoped=null;for(var i=0;i<langs.length;i++){var l=langs[i];if(p==="/"+l||p.indexOf("/"+l+"/")===0){scoped=l;break}}var saved=localStorage.getItem("locale");root.lang=scoped||(langs.indexOf(saved)>=0?saved:"${DEFAULT_LOCALE}")}catch(e){}})();`;
