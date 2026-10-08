/**
 * Ambient type for `window.turnstile`, injected by Cloudflare's hosted
 * Turnstile script (https://challenges.cloudflare.com/turnstile/v0/api.js)
 * — loaded via next/script in EstimateForm.tsx with explicit rendering
 * (`?render=explicit`), so the component calls `render`/`reset` itself
 * rather than relying on the script's automatic DOM scanning.
 *
 * This is a type-only declaration for a script Cloudflare serves, not a
 * library we install — no dependency is added by this file.
 */

export {};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          "timeout-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "flexible" | "compact";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}
