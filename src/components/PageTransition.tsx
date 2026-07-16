import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";

/**
 * Premium page transition wrapper.
 *
 * Effect: New page fades in from slightly below with a subtle scale-up.
 * Exiting page fades out upward. Gives a refined, high-end feel.
 *
 * Skips transition for /chat and /department/* routes so interactive
 * app-style pages aren't disrupted.
 */

const SKIP_TRANSITION_PATHS = ["/chat", "/department"];

const variants = {
  initial: {
    opacity: 0,
    y: 18,
    scale: 0.985,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1], // custom cubic-bezier: fast start, smooth end
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 1.008,
    filter: "blur(2px)",
    transition: {
      duration: 0.22,
      ease: [0.4, 0, 1, 1], // quick ease-in for exit
    },
  },
};

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  // Skip for app-like routes that manage their own layout
  const shouldSkip = SKIP_TRANSITION_PATHS.some((p) =>
    location.pathname.startsWith(p)
  );

  if (shouldSkip) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        data-page-transition=""
        style={{ willChange: "opacity, transform, filter" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * A thin gold progress bar that sweeps across the top of the screen
 * on every route change — inspired by YouTube / GitHub / NProgress.
 */
export function RouteProgressBar() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname + "-bar"}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{
          scaleX: 1,
          opacity: 1,
          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        }}
        exit={{
          opacity: 0,
          transition: { duration: 0.25, delay: 0.1 },
        }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "2.5px",
          background:
            "linear-gradient(90deg, #d6ab55 0%, #f5d78a 50%, #d6ab55 100%)",
          transformOrigin: "left center",
          zIndex: 99999,
          pointerEvents: "none",
          boxShadow: "0 0 10px rgba(214, 171, 85, 0.7), 0 0 20px rgba(214, 171, 85, 0.3)",
        }}
      />
    </AnimatePresence>
  );
}
