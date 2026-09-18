// Shared between the pre-paint script in the root layout and the client theme
// provider, so both agree on the storage key and the `dark` class.
export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

/**
 * Runs before first paint so a dark-mode visitor never sees a light flash.
 * Kept as plain HTML in the (server) root layout: rendering a <script> from a
 * client component makes React 19 warn that it will never execute.
 */
export const themeInitScript = `(function(){try{var dark=localStorage.getItem("${THEME_STORAGE_KEY}")==="dark";var root=document.documentElement;if(dark){root.classList.add("dark")}else{root.classList.remove("dark")}root.style.colorScheme=dark?"dark":"light"}catch(e){}})();`;
