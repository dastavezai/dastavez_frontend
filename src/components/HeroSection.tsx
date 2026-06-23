import { MessageSquare, FileText, Scale, Search, Brain, BarChart, Shield, Lightbulb, LineChart, Zap, Cpu, Database, Code2, Building2, ArrowRight, Rocket, House, ScrollText, FilePen, PersonStanding, CheckCircle2, ChevronRight, Play, Pause, Volume2, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedGavel } from "./AnimatedGavel";
import { useNavigate } from "react-router-dom";
import TypewriterText from "./TypewriterText";
import { Link } from "react-router-dom";
import { BookDemoForm } from "./BookDemoForm";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.6,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="relative pt-14 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-28 overflow-hidden w-full bg-[var(--bg-primary)] transition-colors duration-300">
      {/* Background Glows and Grid */}
      <div className="hero-bg-grid opacity-25"></div>
      <div className="hero-glow opacity-60 dark:opacity-40"></div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Area */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-left reveal">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--border-light)] dark:bg-slate-800/40 border border-[var(--border-color)] rounded-full w-fit text-xs sm:text-sm text-[var(--text-secondary)] shadow-sm hover:border-[var(--accent-primary)] hover:-translate-y-0.5 transition-all duration-200 font-body-premium">
              <span>AI Legal Intelligence &bull; Trusted by 1000+ Advocates &rarr;</span>
            </div>
            
            <h1 className="hero-title text-[24px] min-[375px]:text-[28px] sm:text-5xl lg:text-6xl font-bold font-serif-legal text-[var(--text-primary)] leading-[1.25] tracking-tight">
              Top-Tier Legal AI.<br />
              <span className="rotating-word-wrapper">
                <span className="rotating-words-slide">
                  <span className="gradient-text">2-Hour Turnaround</span>
                  <span className="gradient-text">Legal Drafting</span>
                  <span className="gradient-text">Precedent Research</span>
                  <span className="gradient-text">Case Analysis</span>
                  <span className="gradient-text">Regulatory Compliance</span>
                  <span className="gradient-text">Court Rebuttals</span>
                </span>
              </span>.
            </h1>
            
            <p className="hero-subtitle text-base sm:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed font-body-premium">
              Get all your legal questions answered today. Fill your forms, create drafts online using our AI-Powered Legal Intelligence.
            </p>

            {/* Highlighted Trust points with stagger animation */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2.5 pt-1 font-body-premium"
            >
              <motion.div variants={itemVariants} className="flex items-center gap-3 text-sm text-[var(--text-secondary)] font-medium">
                <CheckCircle2 className="h-5 w-5 text-[var(--accent-primary)] flex-shrink-0" />
                <span>10x faster drafting with active smart templates</span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center gap-3 text-sm text-[var(--text-secondary)] font-medium">
                <CheckCircle2 className="h-5 w-5 text-[var(--accent-primary)] flex-shrink-0" />
                <span>Trained on active statutes & case precedents</span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center gap-3 text-sm text-[var(--text-secondary)] font-medium">
                <CheckCircle2 className="h-5 w-5 text-[var(--accent-primary)] flex-shrink-0" />
                <span>Confidential data secured by isolated encryption</span>
              </motion.div>
            </motion.div>

            {/* CTA area */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 hero-ctas font-body-premium">
              <BookDemoForm />
              <Link to="/chat" className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--border-color)] hover:border-[var(--accent-primary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-medium transition-all duration-300">
                Talk to Law AI Helper <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Hero Mockup Area - Animated Document Scanner */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end hero-media reveal">
            <div 
              className={cn("media-window cursor-pointer group", isPlaying && "is-playing")} 
              id="dashboard-player"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {/* Window header details */}
              <div className="window-header select-none">
                <div className="window-dots">
                  <span className="window-dot dot-red"></span>
                  <span className="window-dot dot-yellow"></span>
                  <span className="window-dot dot-green"></span>
                </div>
                <div className="window-title">Dastavez AI Oracle - Counter Studio</div>
                <div style={{ width: "2rem" }}></div> {/* Spacer */}
              </div>

              {/* Dashboard live viewport space */}
              <div className="media-viewport">
                {/* Clickable overlay mimicking a video play button */}
                <div className="video-play-overlay" id="video-overlay">
                  <button className="play-circle" aria-label="Play Demo Video">
                    <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </button>
                </div>

                {/* Animated Scan Workspace */}
                <div className="scan-container">
                  <div className="scan-doc-header">
                    <span className="scan-doc-title">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      Rebuttal_Case_Precedent_Scan.docx
                    </span>
                    <span className="scan-doc-badge">Counter Studio Active</span>
                  </div>
                  
                  <div className="scan-doc-body font-mono">
                    <div className="scan-line">OPPONENT CLAIMS: Petitoners claim arbitrary state action...</div>
                    <div className="scan-line highlight-danger">GROUND 1: Arbitrary categorization violating fundamental rights.</div>
                    <div className="scan-line">State allocated resources unequally across districts...</div>
                    <div className="scan-line highlight-warning">PROVISION: Article 14 (Equality Before Law) protection invoked.</div>
                    <div className="scan-line">Averred that discrimination lack reasonable classification...</div>
                    <div className="scan-line highlight-success">REBUTTAL CASE: State action is backed by intelligible differentia.</div>
                    <div className="scan-line">State action meets the twin-tests laid down under Article 14 jurisprudence...</div>
                  </div>

                  {/* Vertical scanning laser line */}
                  <div className="scan-beam" id="laser-beam"></div>

                  {/* Floating Analysis Widget overlay */}
                  <div className="scan-analysis-overlay">
                    <div className="analysis-stat-row">
                      <span>Rebuttal Generation:</span>
                      <span className="analysis-stat-val highlight-val">98.4% Confidence</span>
                    </div>
                    <div className="analysis-stat-row">
                      <span>Precedent Citations:</span>
                      <span className="analysis-stat-val">Article 14, 19, 21</span>
                    </div>
                    <div className="analysis-stat-row">
                      <span>Scan Speed:</span>
                      <span className="analysis-stat-val">300ms / clause</span>
                    </div>
                    <div className="analysis-progress-bar">
                      <div className="analysis-progress-fill" id="bar-fill"></div>
                    </div>
                  </div>
                </div>



              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Video Showcase - FULL SCREEN WIDTH */}
      <div className="mt-16 w-full relative overflow-hidden border-y border-judicial-gold/20 dark:border-judicial-gold/20 shadow-2xl bg-slate-900/60 backdrop-blur-sm">
        <video
          src="/demo-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-auto max-h-[600px] object-cover"
        />
        {/* Ambient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* Style block for gold border animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes goldBorderAnimation {
          0%, 100% {
            border-color: rgba(214, 171, 85, 0.25);
            box-shadow: 0 0 4px rgba(214, 171, 85, 0.05);
          }
          50% {
            border-color: rgba(214, 171, 85, 0.95);
            box-shadow: 0 0 16px rgba(214, 171, 85, 0.35);
          }
        }
        
        .gold-animate-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .gold-animate-hover:hover {
          animation: goldBorderAnimation 2s infinite ease-in-out;
          transform: translateY(-4px);
        }
      `}} />

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        {/* Popular Legal Draft Cards */}
        <div className="mt-20 sm:mt-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-legal text-gray-900 dark:text-white">
              Popular <span className="text-judicial-gold">Legal Drafts</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Click any draft type to start with a standard pre-built template</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-[#121620] border border-gray-200 dark:border-slate-800/80 p-5 rounded-xl transition-all duration-300 group cursor-pointer gold-animate-hover" onClick={() => navigate('/chat')}>
              <div className="p-2.5 bg-judicial-gold/10 rounded-lg w-fit mb-4 group-hover:bg-judicial-gold/25 transition-colors">
                <Building2 className="h-6 w-6 text-judicial-gold" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Rent Agreement</h3>
              <p className="text-xs text-gray-600 dark:text-slate-300/90">Residential & commercial lease configurations</p>
            </div>

            <div className="bg-white dark:bg-[#121620] border border-gray-200 dark:border-slate-800/80 p-5 rounded-xl transition-all duration-300 group cursor-pointer gold-animate-hover" onClick={() => navigate('/chat')}>
              <div className="p-2.5 bg-judicial-gold/10 rounded-lg w-fit mb-4 group-hover:bg-judicial-gold/25 transition-colors">
                <FilePen className="h-6 w-6 text-judicial-gold" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Lease Agreement</h3>
              <p className="text-xs text-gray-600 dark:text-slate-300/90">Commercial properties and lock-in covenants</p>
            </div>

            <div className="bg-white dark:bg-[#121620] border border-gray-200 dark:border-slate-800/80 p-5 rounded-xl transition-all duration-300 group cursor-pointer gold-animate-hover" onClick={() => navigate('/chat')}>
              <div className="p-2.5 bg-judicial-gold/10 rounded-lg w-fit mb-4 group-hover:bg-judicial-gold/25 transition-colors">
                <ScrollText className="h-6 w-6 text-judicial-gold" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Affidavit Generator</h3>
              <p className="text-xs text-gray-600 dark:text-slate-300/90">Formal declarations and registry ready formats</p>
            </div>

            <div className="bg-white dark:bg-[#121620] border border-gray-200 dark:border-slate-800/80 p-5 rounded-xl transition-all duration-300 group cursor-pointer gold-animate-hover" onClick={() => navigate('/chat')}>
              <div className="p-2.5 bg-judicial-gold/10 rounded-lg w-fit mb-4 group-hover:bg-judicial-gold/25 transition-colors">
                <Scale className="h-6 w-6 text-judicial-gold" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Power of Attorney</h3>
              <p className="text-xs text-gray-600 dark:text-slate-300/90">General or Special delegation deeds</p>
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
