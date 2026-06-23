import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Link2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
  isHighlighted?: boolean;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  metaTitle: string;
  metaDescription: string;
  sections: LegalSection[];
}

export function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  metaTitle,
  metaDescription,
  sections,
}: LegalLayoutProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();

  // References for scroll spy
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Dynamic SEO Metadata
  useEffect(() => {
    document.title = `${metaTitle} | Dastavez AI`;

    // Manage meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", metaDescription);

    // Open Graph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", `${metaTitle} | Dastavez AI`);

    // Open Graph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute("content", metaDescription);

    // Open Graph Type
    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      ogType = document.createElement("meta");
      ogType.setAttribute("property", "og:type");
      document.head.appendChild(ogType);
    }
    ogType.setAttribute("content", "website");

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.origin + location.pathname);

    // Focus top on page load
    window.scrollTo(0, 0);
  }, [metaTitle, metaDescription, location.pathname]);

  // Deep linking: scroll to hash on load or hash change
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        // Wait slightly for layout/framer motion to mount
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
          setActiveSection(id);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash]);

  // Scroll spy & Progress bar logic
  useEffect(() => {
    const handleScroll = () => {
      // 1. Scroll Progress
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }

      // 2. Show/Hide scroll top button
      setShowScrollTop(window.scrollY > 300);

      // 3. Scroll Spy for active TOC link
      const scrollPosition = window.scrollY + 200; // Offset for header
      let currentSection = sections[0]?.id || "";

      for (const section of sections) {
        const el = sectionRefs.current[section.id];
        if (el && el.offsetTop <= scrollPosition) {
          currentSection = section.id;
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger initially
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const copyLink = (id: string) => {
    const linkUrl = `${window.location.origin}${location.pathname}#${id}`;
    navigator.clipboard.writeText(linkUrl).then(() => {
      setCopiedId(id);
      toast({
        title: "Link Copied",
        description: "Direct link to this section has been copied to your clipboard.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Update browser history hash
      window.history.pushState(null, "", `#${id}`);
      setActiveSection(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.pushState(null, "", window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 relative">
      <Navbar />

      {/* Progress Bar (print:hidden) */}
      <div 
        className="fixed top-0 left-0 h-1 bg-[var(--accent-primary)] z-[100] transition-all duration-100 ease-out print:hidden"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Main Container */}
      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-body-premium"
      >
        {/* Skip to content link for accessibility */}
        <a 
          href="#legal-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:bg-[var(--accent-primary)] focus:text-[var(--bg-primary)] focus:px-4 focus:py-2 focus:rounded-md focus:z-50"
        >
          Skip to main legal content
        </a>

        {/* Hero Section */}
        <div className="border-b border-[var(--border-color)] pb-8 mb-12 text-center md:text-left print:border-b-2 print:border-black print:pb-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-legal mb-4 text-[var(--text-primary)]">
            {title}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-3xl mb-4 print:text-black">
            {subtitle}
          </p>
          <div className="text-sm font-semibold text-[var(--accent-primary)] flex items-center justify-center md:justify-start gap-2 print:text-black">
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-12" id="legal-content">
          {/* TOC Sidebar (print:hidden) */}
          <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-28 self-start print:hidden">
            <nav 
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm"
              aria-label="Table of contents"
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4 font-serif-legal">
                Table of Contents
              </h2>
              <ul className="space-y-3 text-sm">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      onClick={(e) => handleTocClick(e, sec.id)}
                      className={`block py-1 hover:text-[var(--accent-primary)] transition-all relative ${
                        activeSection === sec.id
                          ? "text-[var(--accent-primary)] font-bold pl-3"
                          : "text-[var(--text-secondary)] pl-3"
                      }`}
                      aria-current={activeSection === sec.id ? "location" : undefined}
                    >
                      {activeSection === sec.id && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                      )}
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Body */}
          <article className="flex-1 max-w-4xl space-y-12 print:w-full print:max-w-none print:p-0">
            {sections.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                ref={(el) => (sectionRefs.current[sec.id] = el)}
                className={`scroll-mt-24 p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${
                  sec.isHighlighted
                    ? "bg-[var(--bg-secondary)] border-[var(--accent-primary)] shadow-[0_0_20px_rgba(214,171,85,0.05)] print:bg-gray-100 print:border-black"
                    : "bg-[var(--bg-tertiary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 print:border-none print:bg-transparent print:p-0"
                }`}
              >
                <div className="flex items-center justify-between group mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-serif-legal pr-4">
                    {sec.title}
                  </h2>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 print:hidden">
                    <button
                      onClick={() => copyLink(sec.id)}
                      className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all cursor-pointer relative"
                      title="Copy link to this section"
                      aria-label={`Copy link to section ${sec.title}`}
                    >
                      {copiedId === sec.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed text-base print:text-black space-y-4">
                  {sec.content}
                </div>
              </section>
            ))}
          </article>
        </div>
      </motion.main>

      <Footer />

      {/* Floating Back to Top Button (print:hidden) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[90] p-3 rounded-full bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] border border-[var(--accent-primary)] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer print:hidden focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            aria-label="Scroll back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Embedded print-friendly styling */}
      <style>{`
        @media print {
          .nav-link, nav, footer, aside, .print\\:hidden, button, [aria-hidden="true"], aside {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          h1, h2, h3, p, span, li, article, section {
            color: black !important;
            background-color: transparent !important;
            border-color: transparent !important;
            box-shadow: none !important;
          }
          article {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          section {
            page-break-inside: avoid;
            margin-bottom: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
