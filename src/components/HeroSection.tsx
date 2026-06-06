import { MessageSquare, FileText, Scale, Search, Brain, BarChart, Shield, Lightbulb, LineChart, Zap, Cpu, Database, Code2, Building2, ArrowRight, Rocket, House, ScrollText, FilePen, PersonStanding, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedGavel } from "./AnimatedGavel";
import { useNavigate } from "react-router-dom";
import TypewriterText from "./TypewriterText";
import { Link } from "react-router-dom";
import { BookDemoForm } from "./BookDemoForm";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative pt-20 pb-16 sm:pt-24 sm:pb-20 md:pt-32 md:pb-28 overflow-hidden w-full bg-white dark:bg-transparent transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-judicial-gold/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-1/4 w-80 h-80 sm:w-128 sm:h-128 bg-judicial-blue/15 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Area */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-judicial-gold/10 dark:bg-judicial-gold/5 border border-judicial-gold/30 dark:border-judicial-gold/20 text-xs font-semibold text-judicial-gold tracking-wide uppercase">
              <span className="flex h-2 w-2 rounded-full bg-judicial-gold animate-pulse"></span>
              Introducing Dastavez AI 2.0
            </div>

            {/* Serif Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif-legal text-gray-900 dark:text-white leading-[1.15] tracking-tight">
              AI-Powered <br className="hidden sm:inline" />
              <span className="text-gradient-hero inline-flex items-baseline gap-2 sm:gap-3">
                Legal drafting
                <span className="inline-flex items-center translate-y-1"><AnimatedGavel /></span>
              </span>
              <br />
              <span className="text-gray-900 dark:text-gray-100">
                For{" "}
                <span className="text-judicial-gold font-serif-legal inline-block">
                  <TypewriterText
                    words={["Contract Creation", "Rent Agreements", "Case Summaries", "Airtight Clauses"]}
                  />
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              Supercharge your research, automate structural drafting, and identify hidden contractual liabilities in minutes. Built specifically for legal professionals.
            </p>

            {/* Highlighted Trust points */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="h-5 w-5 text-judicial-gold flex-shrink-0" />
                <span>10x faster document creation with active smart templates</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="h-5 w-5 text-judicial-gold flex-shrink-0" />
                <span>Trained on statutory rules, court guidelines and case law precedents</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="h-5 w-5 text-judicial-gold flex-shrink-0" />
                <span>Confidential data siloed under bank-grade isolated encryption</span>
              </div>
            </div>

            {/* CTA area */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <BookDemoForm />
              <Link to="/chat" className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-judicial-gold/30 hover:border-judicial-gold/50 rounded-lg text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-judicial-navy/10 font-medium transition-all duration-300">
                Start Chatting Free <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Hero Mockup Area - Animated Document Wizard */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[440px] aspect-[4/3] sm:aspect-[4/3.5] bg-white dark:bg-judicial-dark border border-gray-200 dark:border-judicial-gold/10 rounded-2xl p-5 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden group">
              
              {/* Modal Header bar */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-judicial-gold/15 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">📝</span>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">Create Document</h3>
                </div>
                <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-judicial-navy flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs select-none">✕</div>
              </div>

              <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-3">
                Answer a few questions and we'll create the right document for you
              </div>

              {/* Progress bar animation */}
              <div className="w-full bg-gray-100 dark:bg-judicial-navy h-1 rounded-full overflow-hidden mb-5">
                <motion.div 
                  initial={{ width: "10%" }}
                  animate={{ width: "35%" }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  className="bg-judicial-gold h-full"
                ></motion.div>
              </div>

              {/* Question heading */}
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-judicial-gold/20 text-judicial-gold w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold">1</span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">What type of document do you need?</span>
              </div>

              {/* Category options list */}
              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {/* Agreements Option */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-judicial-gold/30 bg-judicial-gold/5 dark:bg-judicial-gold/5 cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="p-1.5 bg-judicial-gold/10 text-judicial-gold rounded">📄</span>
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-800 dark:text-white leading-none">Agreements & Contracts</h4>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">Rent, sale, partnership, employment contracts</p>
                    </div>
                  </div>
                  <div className="w-3.5 h-3.5 rounded-full border border-judicial-gold flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-judicial-gold"></div>
                  </div>
                </motion.div>

                {/* Real Estate Option */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-judicial-gold/5 bg-transparent hover:border-judicial-gold/20 hover:bg-gray-50 dark:hover:bg-judicial-navy/10 cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="p-1.5 bg-gray-100 dark:bg-judicial-navy text-gray-600 dark:text-gray-400 rounded">🏠</span>
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-800 dark:text-white leading-none">Property & Real Estate</h4>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">Sale deed, gift deed, power of attorney</p>
                    </div>
                  </div>
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600"></div>
                </motion.div>

                {/* Personal Option */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-judicial-gold/5 bg-transparent hover:border-judicial-gold/20 hover:bg-gray-50 dark:hover:bg-judicial-navy/10 cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="p-1.5 bg-gray-100 dark:bg-judicial-navy text-gray-600 dark:text-gray-400 rounded">👥</span>
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-800 dark:text-white leading-none">Family & Personal</h4>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">Adoption deed, affidavit, will</p>
                    </div>
                  </div>
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600"></div>
                </motion.div>
              </div>

              {/* Modal footer navigation */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100 dark:border-judicial-gold/15">
                <span className="text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer">← Back</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 cursor-pointer hover:underline">Cancel</span>
                  <button className="px-3 py-1.5 bg-judicial-gold/30 dark:bg-judicial-gold/20 text-judicial-gold dark:text-judicial-lightGold hover:bg-judicial-gold hover:text-judicial-dark text-[10px] font-semibold rounded transition-colors flex items-center gap-1">
                    Next →
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Popular Legal Draft Cards */}
        <div className="mt-20 sm:mt-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-legal text-gray-900 dark:text-white">
              Popular <span className="text-judicial-gold">Legal Drafts</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Click any draft type to start with a standard pre-built template</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-judicial-navy/25 border border-gray-200 dark:border-judicial-gold/10 p-5 rounded-xl hover:border-judicial-gold/40 hover:shadow-md transition-all duration-300 group cursor-pointer" onClick={() => navigate('/chat')}>
              <div className="p-2.5 bg-judicial-gold/10 rounded-lg w-fit mb-4 group-hover:bg-judicial-gold/25 transition-colors">
                <Building2 className="h-6 w-6 text-judicial-gold" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Rent Agreement</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Residential & commercial lease configurations</p>
            </div>

            <div className="bg-white dark:bg-judicial-navy/25 border border-gray-200 dark:border-judicial-gold/10 p-5 rounded-xl hover:border-judicial-gold/40 hover:shadow-md transition-all duration-300 group cursor-pointer" onClick={() => navigate('/chat')}>
              <div className="p-2.5 bg-judicial-gold/10 rounded-lg w-fit mb-4 group-hover:bg-judicial-gold/25 transition-colors">
                <FilePen className="h-6 w-6 text-judicial-gold" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Lease Agreement</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Commercial properties and lock-in covenants</p>
            </div>

            <div className="bg-white dark:bg-judicial-navy/25 border border-gray-200 dark:border-judicial-gold/10 p-5 rounded-xl hover:border-judicial-gold/40 hover:shadow-md transition-all duration-300 group cursor-pointer" onClick={() => navigate('/chat')}>
              <div className="p-2.5 bg-judicial-gold/10 rounded-lg w-fit mb-4 group-hover:bg-judicial-gold/25 transition-colors">
                <ScrollText className="h-6 w-6 text-judicial-gold" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Affidavit Generator</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Formal declarations and registry ready formats</p>
            </div>

            <div className="bg-white dark:bg-judicial-navy/25 border border-gray-200 dark:border-judicial-gold/10 p-5 rounded-xl hover:border-judicial-gold/40 hover:shadow-md transition-all duration-300 group cursor-pointer" onClick={() => navigate('/chat')}>
              <div className="p-2.5 bg-judicial-gold/10 rounded-lg w-fit mb-4 group-hover:bg-judicial-gold/25 transition-colors">
                <Scale className="h-6 w-6 text-judicial-gold" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Power of Attorney</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">General or Special delegation deeds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sparkles helper component
function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z"/>
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/>
    </svg>
  );
}
