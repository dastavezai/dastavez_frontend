import { useEffect } from "react";

export function LoadingScreen() {
  useEffect(() => {
    const loadingScreen = document.getElementById("loading-screen");
    const loadingProgress = document.getElementById("loading-progress");
    const loadingSlogan = document.querySelector(".loading-slogan");
    let exitTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;

    if (loadingScreen && loadingProgress) {
      document.body.style.overflow = "hidden";

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
          document.body.style.overflow = "";
        }, 500);
      }, 2500);

      // Expose globally reusable interface as requested in reference script
      (window as any).LoadingScreen = {
        show: () => {
          document.body.style.overflow = "hidden";
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
          document.body.style.overflow = "";
        },
      };

      return () => {
        clearTimeout(exitTimeout);
        if (hideTimeout) clearTimeout(hideTimeout);
        document.body.style.overflow = "";
      };
    }
  }, []);

  return null;
}
