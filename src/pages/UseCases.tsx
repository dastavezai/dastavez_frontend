import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  FileText, Search, Award, ShieldCheck, Layers, Sparkles, Brain, Globe, 
  Upload, Activity, CheckCircle, Download, ArrowRight, GraduationCap, 
  Briefcase, Building2, Users, Check, Cpu, Zap, Star, AlertTriangle, FileUp
} from "lucide-react";
import { Link } from "react-router-dom";

// ----------------- Count Up Component for Section 3 -----------------
interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
}

function CountUp({ end, suffix = "", duration = 2 }: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const endVal = end;
    const totalFrames = Math.round(duration * 60);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out cubic
      const easeVal = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.round(easeVal * endVal);
      setCount(currentCount);

      if (frame >= totalFrames) {
        setCount(endVal);
        clearInterval(counter);
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [end, duration, isInView]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// ----------------- Interactive Mockup for Hero (Section 1) -----------------
const MOCKUP_STEPS = [
  {
    id: "upload",
    title: "Document Ingestion",
    subtitle: "Uploading agreement.pdf...",
    icon: FileUp,
    colorClass: "bg-blue-50/80 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-100"
  },
  {
    id: "analyze",
    title: "AI Analysis",
    subtitle: "Scanning structure & clauses...",
    icon: Cpu,
    colorClass: "bg-amber-50/80 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-100"
  },
  {
    id: "detect",
    title: "Clause Identification",
    subtitle: "Tagging indemnity & renewal...",
    icon: Layers,
    colorClass: "bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-100"
  },
  {
    id: "assess",
    title: "Risk Assessment",
    subtitle: "Evaluating liability caps...",
    icon: AlertTriangle,
    colorClass: "bg-rose-50/80 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-100"
  },
  {
    id: "summary",
    title: "Executive Summary",
    subtitle: "Generating smart overview...",
    icon: FileText,
    colorClass: "bg-purple-50/80 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-900 dark:text-purple-100"
  }
];

function ProductMockup() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIdx((prev) => (prev + 1) % MOCKUP_STEPS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const currentStep = MOCKUP_STEPS[stepIdx];
  const StepIcon = currentStep.icon;

  return (
    <div className="relative w-full max-w-xl mx-auto bg-gray-50 dark:bg-slate-900/90 border border-gray-200 dark:border-amber-500/20 shadow-2xl overflow-hidden aspect-[4/3] backdrop-blur-xl transition-all duration-300">
      {/* Window Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-slate-950/60 border-b border-gray-200 dark:border-white/5">
        <div className="flex space-x-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 block"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500 block"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
        </div>
        <div className="text-xs text-gray-700 dark:text-gray-400 font-mono tracking-wider">dastavez-oracle-v2.ai</div>
        <div className="w-12"></div>
      </div>

      {/* Screen Area */}
      <div className="p-6 h-[calc(100%-45px)] flex flex-col justify-between relative overflow-hidden">
        {/* Animated flow connectors */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(214,171,85,0.05),transparent)] pointer-events-none"></div>

        {/* Step indicator pills */}
        <div className="flex justify-between gap-1 sm:gap-2 mb-4 relative z-10">
          {MOCKUP_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setStepIdx(idx)}
              className={`flex-1 text-[10px] sm:text-xs py-1.5 px-1 rounded-md text-center transition-all border duration-300 font-medium ${
                idx === stepIdx
                  ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-judicial-gold border-amber-500/30 dark:border-amber-500/40 shadow-[0_0_12px_rgba(214,171,85,0.15)] dark:shadow-[0_0_12px_rgba(214,171,85,0.2)]"
                  : "bg-gray-200/50 dark:bg-slate-800/40 text-gray-600 dark:text-gray-500 border-transparent hover:bg-gray-200 dark:hover:bg-slate-800/80"
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>

        {/* Active Mockup Screen */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.4 }}
              className={`w-full max-w-sm rounded-xl p-5 border ${currentStep.colorClass} backdrop-blur-md shadow-xl flex flex-col items-center text-center justify-center min-h-[180px]`}
            >
              <div className="p-3 rounded-full bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-white/10 mb-3 text-amber-600 dark:text-judicial-gold shadow-lg animate-pulse">
                <StepIcon className="h-8 w-8" />
              </div>
              <h4 className="text-gray-900 dark:text-white text-lg font-bold tracking-tight font-serif-legal mb-1">
                {currentStep.title}
              </h4>
              <p className="text-amber-700 dark:text-judicial-gold text-xs font-mono mb-2">
                {currentStep.subtitle}
              </p>

              {/* Step specifics animations */}
              {currentStep.id === "upload" && (
                <div className="w-full max-w-[200px] mt-2">
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-amber-500 dark:bg-judicial-gold" 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 block">Uploading... 84%</span>
                </div>
              )}

              {currentStep.id === "analyze" && (
                <div className="w-full mt-2 space-y-1 relative">
                  <div className="absolute inset-x-0 h-0.5 bg-amber-500/60 shadow-[0_0_8px_#d6ab55] z-10 top-0 animate-[bounce_2s_infinite]"></div>
                  <div className="h-2 w-3/4 bg-gray-200/80 dark:bg-white/10 rounded-md mx-auto"></div>
                  <div className="h-2 w-5/6 bg-gray-200/80 dark:bg-white/10 rounded-md mx-auto"></div>
                  <div className="h-2 w-2/3 bg-gray-200/80 dark:bg-white/10 rounded-md mx-auto"></div>
                </div>
              )}

              {currentStep.id === "detect" && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 px-2 py-0.5 rounded-full">
                    ✔ Indemnity Clause
                  </span>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 px-2 py-0.5 rounded-full">
                    ✔ Term & Renewal
                  </span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 px-2 py-0.5 rounded-full">
                    ✔ Governing Law
                  </span>
                </div>
              )}

              {currentStep.id === "assess" && (
                <div className="mt-2 text-left bg-gray-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-gray-200 dark:border-white/5 w-full space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500 dark:text-gray-400">Compliance score:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">92% Compliance</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-rose-600 dark:text-rose-300 flex-wrap">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                    <span>Liability cap exceeds playbook limits</span>
                  </div>
                </div>
              )}

              {currentStep.id === "summary" && (
                <div className="mt-2 text-[10px] text-gray-600 dark:text-gray-300 text-left list-disc pl-2 space-y-1">
                  <div className="flex gap-1.5 items-start">
                    <span className="text-amber-600 dark:text-judicial-gold">✦</span>
                    <span>12-month lease with auto-renewal clause.</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="text-amber-600 dark:text-judicial-gold">✦</span>
                    <span>Dispute resolution governed by courts in Patna, Bihar.</span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ----------------- Main UseCases Component -----------------
export default function UseCases() {
  const [activeWorkflow, setActiveWorkflow] = useState(0);

  // Solutions Grid Data (Section 2)
  const solutions = [
    {
      title: "Contract Analysis & Risk Detection",
      description: "Auto-scan agreements to flag missing provisions, liabilities, and deviation from guidelines.",
      highlights: ["Deviation detection", "Risk severity scoring", "Remediation advice"],
      icon: FileText
    },
    {
      title: "Legal Research & Case Intelligence",
      description: "Perform comprehensive search across thousands of Central Acts and Supreme Court precedents.",
      highlights: ["Indian citation mapping", "Semantic contextual search", "Precedent summaries"],
      icon: Search
    },
    {
      title: "Business Documentation",
      description: "Quickly generate standard templates including NDAs, Lease Deeds, and Service contracts.",
      highlights: ["Dynamic variable insertion", "E-sign readiness", "Playbook alignment"],
      icon: Award
    },
    {
      title: "Compliance & Regulatory Review",
      description: "Ensure legal compliance with state and central frameworks, labor policies, and audits.",
      highlights: ["Statute verification", "Gap analysis reporting", "Automated compliance checks"],
      icon: ShieldCheck
    },
    {
      title: "Due Diligence Automation",
      description: "Ingest and analyze bulky M&A folders and documents in parallel within minutes.",
      highlights: ["Multi-file processing", "Redline analysis", "Key terms summary"],
      icon: Layers
    },
    {
      title: "AI Legal Assistant",
      description: "Converse directly with legal files using context-aware prompts and legal templates.",
      highlights: ["Conversational Q&A", "Follow-up prompts", "Source link referencing"],
      icon: Sparkles
    },
    {
      title: "Knowledge Management",
      description: "Securely train proprietary AI models on your firm's precedents and contract libraries.",
      highlights: ["Encrypted vector store", "Isolated workspaces", "Precedent autocomplete"],
      icon: Brain
    },
    {
      title: "Multilingual Legal Documents",
      description: "Analyze, summarize, and translate legal templates across major local Indian languages.",
      highlights: ["Vernacular extraction", "Accurate legal mapping", "Side-by-side translation"],
      icon: Globe
    }
  ];

  // Workflow Data (Section 4)
  const workflows = [
    {
      num: "01",
      title: "Upload Document",
      desc: "Drag and drop any legal contract, petition, or notice (PDF/DOCX) into the secure workspace.",
      sub: "Supports encrypted bulk uploads for large transactions."
    },
    {
      num: "02",
      title: "AI Pre-Analysis",
      desc: "Our model segments text, maps citations, and parses clauses in under 10 seconds.",
      sub: "Context-aware OCR scans scanned copies with high precision."
    },
    {
      num: "03",
      title: "Insight Generation",
      desc: "Automatically extracts summaries, flags risky terms, and aligns with custom playbooks.",
      sub: "Scores each section for compliance and potential liability."
    },
    {
      num: "04",
      title: "Human Verification",
      desc: "Legal teams or in-house counsel verify AI suggestions on our interactive review panel.",
      sub: "Integrates smoothly with existing legal workflows."
    },
    {
      num: "05",
      title: "Export & Share",
      desc: "Generate finalized Word summaries, PDFs, or audit sheets ready for signatures.",
      sub: "Tracks version changes and export histories."
    }
  ];

  // Auto-cycle workflow steps in a loop (resets timer on manual click)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWorkflow((prev) => (prev + 1) % workflows.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeWorkflow, workflows.length]);

  // Audiences Data (Section 5)
  const audiences = [
    {
      title: "Individuals",
      desc: "Draft rent agreements, check contract terms, and review legal notices without standard legal complexity.",
      icon: Users
    },
    {
      title: "Students",
      desc: "Research historical Indian cases, extract case ratios, and draft papers with citations in seconds.",
      icon: GraduationCap
    },
    {
      title: "Lawyers",
      desc: "Speed up precedent lookups, automate contract drafting, and conduct compliance checks efficiently.",
      icon: Briefcase
    },
    {
      title: "Startups",
      desc: "Prepare founders' agreements, NDAs, and consultancy terms quickly without massive retainers.",
      icon: Zap
    },
    {
      title: "Businesses",
      desc: "Streamline lease deeds, NDA logs, and employment agreements using central compliant libraries.",
      icon: Building2
    },
    {
      title: "Enterprises",
      desc: "Oversee high-volume vendor compliance audits, M&A due diligence, and secure playbooks.",
      icon: Cpu
    }
  ];

  // Why Choose Features Data (Section 6)
  const highlightsList = [
    {
      title: "Faster Analysis",
      desc: "Reduce file research and contract pre-drafting times by up to 60%.",
      icon: Zap
    },
    {
      title: "Secure Processing",
      desc: "Enterprise-grade encryption with context-isolated private data safeguards.",
      icon: ShieldCheck
    },
    {
      title: "AI-Powered Insights",
      desc: "Deep parsing trained on specialized legal datasets and citation mapping.",
      icon: Brain
    },
    {
      title: "Modern User Experience",
      desc: "Interactive dashboards designed specifically for smooth review workflows.",
      icon: Sparkles
    },
    {
      title: "Scalable Architecture",
      desc: "Process individual agreements or run parallel vector queries across 1,000+ files.",
      icon: Layers
    },
    {
      title: "Productivity Improvements",
      desc: "Reclaim lost hours spent on manual reviews and focus on advisory value.",
      icon: Activity
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-judicial-dark transition-colors duration-300 relative overflow-hidden font-sans-premium">
      <Navbar />

      {/* Floating particles background background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-amber-500/5 dark:bg-amber-500/5 blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[45vw] h-[45vw] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[150px]"></div>
      </div>

      <main className="relative z-10 pt-16">
        {/* ================= SECTION 1: HERO SECTION ================= */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-judicial-gold text-xs sm:text-sm font-semibold mx-auto lg:mx-0"
              >
                <Sparkles className="h-4 w-4" />
                <span>DocClair Dastavez AI Platform</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif-legal text-gray-900 dark:text-white leading-tight"
              >
                AI-Powered <span className="text-judicial-gold">Legal Solutions</span> for Every Need
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-gray-600 dark:text-slate-200 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Dastavez AI helps individuals, startups, businesses, and legal professionals analyze documents, automate legal workflows, generate insights, and improve productivity using artificial intelligence.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex justify-center lg:justify-start"
              >
                <Link
                  to="/auth"
                  className="px-8 py-3 rounded-md bg-judicial-gold hover:bg-judicial-gold/90 text-judicial-dark font-bold text-center transition-all shadow-[0_4px_14px_rgba(214,171,85,0.3)] hover:translate-y-[-1px]"
                >
                  Get Started
                </Link>
              </motion.div>
            </div>

            {/* Right Hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6"
            >
              <ProductMockup />
            </motion.div>
          </div>
        </section>

        {/* ================= SECTION 2: SOLUTIONS GRID ================= */}
        <section id="solutions" className="py-16 md:py-24 border-t border-gray-200/50 dark:border-slate-800 bg-white dark:bg-judicial-dark transition-colors duration-300">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold font-serif-legal text-gray-900 dark:text-white">
                Comprehensive <span className="text-judicial-gold">Solutions</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Explore the range of legal productivity tools engineered specifically for document automation, deep search, and M&A compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {solutions.map((sol, index) => {
                const SolIcon = sol.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group hover-card-group bg-white dark:bg-judicial-navy backdrop-blur-md rounded-xl p-6 border border-gray-200/60 dark:border-white/10 hover:border-judicial-gold hover:shadow-[0_0_25px_rgba(234,179,8,0.25)] transition-all duration-300 hover:duration-0 cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
                  >
                    <div className="space-y-4">
                      <div className="hover-card-icon p-3 rounded-lg bg-amber-500/10 text-judicial-gold w-fit group-hover:bg-judicial-gold group-hover:text-judicial-dark transition-colors duration-300">
                        <SolIcon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white font-serif-legal">
                        {sol.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-slate-200 leading-relaxed">
                        {sol.description}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 dark:border-white/5 mt-5 pt-4">
                      <ul className="space-y-2">
                        {sol.highlights.map((high, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-300">
                            <Check className="h-3.5 w-3.5 text-judicial-gold flex-shrink-0" />
                            <span>{high}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: ANIMATED STATISTICS ================= */}
        <section className="py-16 bg-gray-50 dark:bg-judicial-dark text-gray-900 dark:text-white border-y border-gray-200 dark:border-judicial-gold/15 relative overflow-hidden transition-colors duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(214,171,85,0.08),transparent)] pointer-events-none"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
              <div className="space-y-2">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif-legal text-judicial-gold">
                  <CountUp end={50000} suffix="+" />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Documents Processed</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif-legal text-judicial-gold">
                  <CountUp end={95} suffix="%" />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Analysis Accuracy</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif-legal text-judicial-gold">
                  24/7
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Availability</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif-legal text-judicial-gold">
                  <CountUp end={100} suffix="+" />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Legal Templates</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: INTERACTIVE WORKFLOW ================= */}
        <section className="py-16 md:py-24 bg-white dark:bg-judicial-dark transition-colors duration-300">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold font-serif-legal text-gray-900 dark:text-white">
                How Dastavez AI <span className="text-judicial-gold">Works</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                A seamless pipeline designed to process files, tag provisions, identify compliance gaps, and output verified contracts.
              </p>
            </div>

            {/* Desktop Horizontal Workflow Visualizer */}
            <div className="hidden lg:block relative mb-16">
              {/* Connector line */}
              <div className="absolute top-[38px] left-[5%] right-[5%] h-0.5 bg-gray-200 dark:bg-slate-800 z-0">
                <motion.div 
                  className="h-full bg-gradient-to-r from-judicial-gold via-yellow-400 to-judicial-gold shadow-[0_0_8px_#d6ab55]"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>

              <div className="grid grid-cols-5 gap-6 relative z-10">
                {workflows.map((w, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center cursor-pointer group"
                    onClick={() => setActiveWorkflow(idx)}
                  >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-lg ${
                      activeWorkflow === idx 
                        ? "bg-judicial-dark border-judicial-gold text-judicial-gold scale-110 shadow-amber-500/20" 
                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 hover:border-amber-500/50"
                    }`}>
                      <span className="text-xl font-bold font-serif-legal">{w.num}</span>
                    </div>
                    <h3 className={`mt-4 text-base font-bold transition-colors ${
                      activeWorkflow === idx ? "text-judicial-gold" : "text-gray-900 dark:text-white group-hover:text-judicial-gold"
                    }`}>
                      {w.title}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Detail Display Card (Desktop/Tablet) */}
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-8 border border-gray-200/50 dark:border-white/5 shadow-xl max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeWorkflow}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                >
                  <div className="md:col-span-8 space-y-4">
                    <div className="inline-block px-3 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-judicial-gold text-sm font-bold font-mono">
                      Workflow Stage {workflows[activeWorkflow].num}
                    </div>
                    <h3 className="text-2xl font-bold font-serif-legal text-gray-900 dark:text-white">
                      {workflows[activeWorkflow].title}
                    </h3>
                    <p className="text-gray-700 dark:text-slate-200 text-base leading-relaxed">
                      {workflows[activeWorkflow].desc}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400 italic">
                      💡 {workflows[activeWorkflow].sub}
                    </p>
                  </div>
                  <div className="md:col-span-4 flex justify-center">
                    <div className="w-32 h-32 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-judicial-gold shadow-inner animate-[pulse_3s_infinite]">
                      {activeWorkflow === 0 && <Upload className="h-16 w-16" />}
                      {activeWorkflow === 1 && <Cpu className="h-16 w-16" />}
                      {activeWorkflow === 2 && <Sparkles className="h-16 w-16" />}
                      {activeWorkflow === 3 && <ShieldCheck className="h-16 w-16" />}
                      {activeWorkflow === 4 && <Download className="h-16 w-16" />}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile Vertical Alternative Timeline */}
            <div className="mt-12 lg:hidden space-y-6 max-w-md mx-auto">
              {workflows.map((w, idx) => (
                <div 
                  key={idx} 
                  className="flex gap-4 p-4 rounded-xl border border-gray-150 dark:border-white/5 bg-slate-50 dark:bg-slate-900/30"
                >
                  <div className="w-10 h-10 rounded-full bg-judicial-dark border border-judicial-gold text-judicial-gold flex items-center justify-center flex-shrink-0 font-bold font-serif-legal">
                    {w.num}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 dark:text-white font-serif-legal">{w.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-200">{w.desc}</p>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 italic mt-1">💡 {w.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SECTION 5: WHO USES DASTAVEZ AI ================= */}
        <section className="py-16 md:py-24 border-t border-gray-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold font-serif-legal text-gray-900 dark:text-white">
                Who Uses <span className="text-judicial-gold">Dastavez AI</span>?
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Empowering legal research, document reviews, and transactional structures for every stage of your personal or business journey.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {audiences.map((aud, index) => {
                const AudIcon = aud.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="bg-white dark:bg-slate-900/60 p-6 rounded-xl border border-gray-200/60 dark:border-white/5 hover:border-amber-500/60 dark:hover:border-amber-500/50 shadow-md hover:shadow-xl transition-all duration-300 flex items-start gap-4 hover:-translate-y-1"
                  >
                    <div className="p-3 rounded-lg bg-amber-500/10 text-judicial-gold flex-shrink-0">
                      <AudIcon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white font-serif-legal">
                        {aud.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-slate-200 leading-relaxed">
                        {aud.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= SECTION 6: WHY CHOOSE DASTAVEZ AI ================= */}
        <section className="py-16 md:py-24 bg-white dark:bg-judicial-dark transition-colors duration-300">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold font-serif-legal text-gray-900 dark:text-white">
                Why Choose <span className="text-judicial-gold">Dastavez AI</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                A combination of context isolation, verified output, and modern workflow integration that sets us apart.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {highlightsList.map((hl, index) => {
                const HlIcon = hl.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="relative bg-white/40 dark:bg-slate-900/30 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 dark:border-white/5 hover:border-amber-500/40 transition-colors"
                  >
                    {/* Subtle Gold Corner Accent */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-transparent hover:border-judicial-gold/40 rounded-tr-xl transition-all duration-300 pointer-events-none"></div>

                    <div className="flex gap-4">
                      <div className="p-3 rounded-full bg-amber-500/10 text-judicial-gold flex-shrink-0 h-fit">
                        <HlIcon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-gray-900 dark:text-white font-serif-legal">
                          {hl.title}
                        </h4>
                         <p className="text-sm text-gray-500 dark:text-slate-200 leading-relaxed">
                          {hl.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= SECTION 7: FINAL CTA ================= */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="relative rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-judicial-navy dark:to-slate-950 p-8 md:p-12 border border-gray-200 dark:border-amber-500/25 shadow-2xl dark:shadow-none text-center space-y-8 overflow-hidden max-w-5xl mx-auto transition-all duration-300">
            {/* Animated bg circles */}
            <div className="absolute -top-[50%] -left-[50%] w-full h-full rounded-full bg-amber-500/5 blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-[50%] -right-[50%] w-full h-full rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold font-serif-legal text-gray-900 dark:text-white">
                Transform Legal Workflows with AI
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                Experience faster document review, smarter legal research, and AI-powered productivity with Dastavez AI.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="px-8 py-3.5 rounded-md bg-judicial-gold hover:bg-judicial-gold/90 text-judicial-dark font-bold transition-all shadow-[0_4px_14px_rgba(214,171,85,0.3)] hover:translate-y-[-1px]"
              >
                Get Started
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3.5 rounded-md border border-gray-300 hover:border-gray-400 dark:border-white/20 dark:hover:border-white/50 text-gray-900 dark:text-white bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 font-bold transition-all hover:translate-y-[-1px]"
              >
                Schedule Demo
              </Link>
            </div>

            {/* Badges */}
            <div className="relative z-10 flex flex-wrap justify-center gap-x-8 gap-y-4 pt-6 border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <ShieldCheck className="h-4 w-4 text-judicial-gold" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Sparkles className="h-4 w-4 text-judicial-gold" />
                <span>AI Powered</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Zap className="h-4 w-4 text-judicial-gold" />
                <span>Fast Processing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Activity className="h-4 w-4 text-judicial-gold" />
                <span>Reliable</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
