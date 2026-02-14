import { MessageSquare, FileText, Scale, Search, Brain, BarChart, Shield, Lightbulb, LineChart, Zap, Cpu, Database,Code2, Building2, ArrowRight, Rocket, House, ScrollText,FilePen, PersonStanding } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedGavel, AnimatedLetterL } from "./AnimatedGavel";
import { useNavigate } from "react-router-dom";
import TypewriterText from "./TypewriterText";
import { Link } from "react-router-dom";
import { BookDemoForm } from "./BookDemoForm";

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <div className="relative pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-judicial-gold/5 rounded-full blur-3xl animate-fade-in stagger-1"></div>
        <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-56 h-56 sm:w-80 sm:h-80 bg-judicial-blue/10 rounded-full blur-3xl animate-fade-in stagger-2"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div className="relative perspective-1000 mb-4 sm:mb-8">
            <div className="relative preserve-3d" style={{
              animation: 'heroScale3D 6s ease-in-out infinite'
            }}>
              <Scale className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 text-judicial-gold" />
              <div className="absolute inset-0 bg-judicial-gold/20 blur-2xl -z-10" />
            </div>
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight sm:leading-[1.1] flex flex-col sm:flex-row items-center sm:items-baseline justify-center gap-2 sm:gap-3 -mt-2 sm:-mt-8"
          >
            <span className="text-gradient-hero inline-block leading-none">AI-Powered</span>
            <span className="inline-flex items-center flex-shrink-0 sm:translate-y-[2px]"><AnimatedGavel /></span>
            <span className="inline-block w-full sm:w-[360px] md:w-[400px] text-center sm:text-left flex-shrink-0 leading-none">
              <TypewriterText
                words={["Draft Creation", "Draft Suggestions", "Draft Editing"]}
              />
            </span>
          </motion.h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl animate-fade-in stagger-4 transition-opacity duration-700 px-4 sm:px-0">
            Dastavez AI helps legal professionals analyze cases, research precedents, and gain insights with advanced artificial intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 animate-fade-in stagger-5 w-full sm:w-auto">
            <BookDemoForm />
          </div>
        </div>

        {/* Popular Legal Draft Section */}
        <div className="mt-16 sm:mt-20 md:mt-24">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 animate-fade-in px-4 sm:px-0">
            <span className="text-judicial-gold">Popular</span>{' '}
            <span className="text-gradient-hero">Legal Draft</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="tool-card" style={{ animationDelay: '0.2s' }}>
              <div className="tool-icon">
                <Building2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">Rent Agreement</h3>
              <p className="text-gray-300 text-sm sm:text-base">Create legally structured rent agreements for residential or commercial properties</p>
            </div>
            
            <div className="tool-card" style={{ animationDelay: '0.4s' }}>
              <div className="tool-icon">
                <FilePen className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">Lease Agreement</h3>
              <p className="text-gray-300 text-sm sm:text-base">Generate comprehensive lease documents and legal protections for both parties</p>
            </div>
            
            <div className="tool-card" style={{ animationDelay: '0.6s' }}>
              <div className="tool-icon">
                <ScrollText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">Affidavit Generator</h3>
              <p className="text-gray-300 text-sm sm:text-base">Quickly prepare legally formatted affidavits for declarations</p>
            </div>
            
            <div className="tool-card" style={{ animationDelay: '0.8s' }}>
              <div className="tool-icon">
                <PersonStanding className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">Adoption Deed</h3>
              <p className="text-gray-300 text-sm sm:text-base">Draft adoption deeds defining guardianship transfer, consent, and legal rights in compliance with applicable laws.</p>
            </div>

            <div className="tool-card" style={{ animationDelay: '0.8s' }}>
              <div className="tool-icon">
                <House className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">Property Partition Deed</h3>
              <p className="text-gray-300 text-sm sm:text-base">Create partition deeds to formally divide jointly owned property with clear share allocation and legal documentation.</p>
            </div>

            <div className="tool-card" style={{ animationDelay: '0.8s' }}>
              <div className="tool-icon">
                <Scale className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">Power of Attorney</h3>
              <p className="text-gray-300 text-sm sm:text-base">Generate General or Special Power of Attorney documents specifying authority, scope, and duration of powers granted.</p>
            </div>

            <div className="tool-card" style={{ animationDelay: '0.8s' }}>
              <div className="tool-icon">
                <FileText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">Custom Documents</h3>
              <p className="text-gray-300 text-sm sm:text-base">Create custom legal documents tailored to your specific needs, ensuring compliance and accuracy.</p>
            </div>
          </div>
        </div>

        {/* Ready to Transform Section */}
        <div className="mt-16 sm:mt-20 md:mt-24 text-center">
          <div className="bg-judicial-navy/30 backdrop-blur-sm border border-judicial-gold/20 rounded-2xl p-6 sm:p-8 md:p-12 max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Ready to <span className="text-judicial-gold">Transform</span> Your Legal Practice?
            </h3>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Join thousands of legal professionals who are already using Dastavez AI to streamline their workflow and achieve better outcomes.
            </p>
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-judicial-gold hover:bg-judicial-gold/90 text-judicial-dark transition-transform duration-300 hover:scale-105 w-full sm:w-auto" onClick={() => navigate('/chat')}>
                <Rocket className="mr-2 h-5 w-5" />
                Get Started Today
              </Button>
              <Button size="lg" variant="outline" className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10 transition-transform duration-300 hover:scale-105 w-full sm:w-auto">
                <ArrowRight className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div> */}
            {/* <div className="mx-auto max-w-3xl text-center bg-judicial-navy/40 dark:bg-judicial-navy/40 light:bg-white/60 border border-judicial-gold/20 rounded-2xl p-4 md:p-6 backdrop-blur"> */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-300 light:text-judicial-navy/70 mb-3">
                    <span className="px-2 py-1 rounded bg-judicial-navy/60 dark:bg-judicial-navy/60 light:bg-judicial-navy/20 border border-judicial-gold/20">Ask Your Legal Query</span>
                    <span className="px-2 py-1 rounded bg-judicial-navy/60 dark:bg-judicial-navy/60 light:bg-judicial-navy/20 border border-judicial-gold/20">Be Specific</span>
                    <span className="px-2 py-1 rounded bg-judicial-navy/60 dark:bg-judicial-navy/60 light:bg-judicial-navy/20 border border-judicial-gold/20">Ask in Any Language</span>
                    <span className="px-2 py-1 rounded bg-judicial-navy/60 dark:bg-judicial-navy/60 light:bg-judicial-navy/20 border border-judicial-gold/20">Upload PDFs</span>
                    <span className="px-2 py-1 rounded bg-judicial-navy/60 dark:bg-judicial-navy/60 light:bg-judicial-navy/20 border border-judicial-gold/20">Find Case Laws</span>
                    <span className="px-2 py-1 rounded bg-judicial-navy/60 dark:bg-judicial-navy/60 light:bg-judicial-navy/20 border border-judicial-gold/20">Legal Draftings</span>
                  </div>
                  <div className="text-center mb-3">
                    <span className="px-2 py-1 rounded bg-judicial-gold text-judicial-dark font-semibold">It’s Free!</span>
                  </div>
                  <Link to="/chat" className="inline-block px-5 py-3 rounded-lg bg-judicial-gold text-judicial-dark font-semibold hover:bg-judicial-lightGold transition-colors">
                      Start Chatting
                  </Link>
                  </div>
          </div>
        </div>
      </div>
    // </div>
  );
}
