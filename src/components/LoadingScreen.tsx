import { useEffect } from "react";

export function LoadingScreen() {
  useEffect(() => {
    const loadingScreen = document.getElementById("loading-screen");
    const loadingProgress = document.getElementById("loading-progress");
    const loadingSlogan = document.querySelector(".loading-slogan");
    let exitTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;

    if (loadingScreen && loadingProgress) {
      /*
       * DO NOT set document.body.style.overflow here.
       * The global CSS (html { overflow-y: scroll }) permanently reserves the
       * scrollbar gutter so the viewport width never changes between pages.
       * Overriding overflow via JS creates inline styles that fight the CSS
       * and cause the navbar to shift horizontally when pages load.
       */

      // Kick off the progress bar fill
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          loadingProgress.style.width = "100%";
        });
      });

      // Exit after progress animation completes (2500ms)
      exitTimeout = setTimeout(() => {
        if (loadingSlogan) loadingSlogan.classList.add("is-exiting");
        loadingProgress.classList.add("is-exiting");

        // Give fade-out transitions time to finish (500ms)
        hideTimeout = setTimeout(() => {
          loadingScreen.classList.add("is-hidden");
          // NOTE: do NOT reset body.style.overflow — CSS handles it globally
        }, 500);
      }, 2500);

      // Expose globally reusable interface
      (window as any).LoadingScreen = {
        show: () => {
          loadingScreen.classList.remove("is-hidden");
          if (loadingSlogan) loadingSlogan.classList.remove("is-exiting");
          loadingProgress.classList.remove("is-exiting");
          loadingProgress.style.width = "0%";
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              loadingProgress.style.width = "100%";
            });
          });
        },
        hide: () => {
          loadingScreen.classList.add("is-hidden");
          // NOTE: do NOT reset body.style.overflow — CSS handles it globally
        },
      };

      return () => {
        clearTimeout(exitTimeout);
        if (hideTimeout) clearTimeout(hideTimeout);
        // NOTE: do NOT reset body.style.overflow — CSS handles it globally
      };
    }
  }, []);

  return null;
}
