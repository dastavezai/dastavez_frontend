import { MessageSquare, FileText, Scale, Search, Brain, BarChart, Shield, Lightbulb, LineChart, Zap, Cpu, Database, Code2, ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedGavel, AnimatedLetterL } from "./AnimatedGavel";
import { useNavigate } from "react-router-dom";

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
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight sm:leading-[1.1] flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 -mt-8 sm:-mt-16"
          >
            <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent inline-block">AI-Powered</span>
            <span className="inline-flex items-center"><AnimatedGavel /></span>
            <span className="inline-block text-gradient-gold"><AnimatedLetterL />egal Intelligence</span>
          </motion.h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl animate-fade-in stagger-4 transition-opacity duration-700 px-4 sm:px-0">
            Dastavez AI helps legal professionals analyze cases, research precedents, and gain insights with advanced artificial intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 animate-fade-in stagger-5 w-full sm:w-auto">
            <Button size="lg" className="bg-judicial-gold hover:bg-judicial-gold/90 text-judicial-dark transition-transform duration-300 hover:scale-105 w-full sm:w-auto" onClick={() => navigate('/auth')}>
              <MessageSquare className="mr-2 h-5 w-5" />
              Try AI Assistant
            </Button>
            <Button size="lg" variant="outline" className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10 transition-transform duration-300 hover:scale-105 w-full sm:w-auto">
              <FileText className="mr-2 h-5 w-5" />
              Explore Features
            </Button>
          </div>
        </div>
        
        {/* Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-16 max-w-4xl mx-auto">
          <div className="feature-pill" style={{ animationDelay: '0s' }}>
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-judicial-gold mr-2" />
            <span className="text-xs sm:text-sm font-medium">AI-Powered Analysis</span>
          </div>
          <div className="feature-pill" style={{ animationDelay: '0.1s' }}>
            <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-judicial-gold mr-2" />
            <span className="text-xs sm:text-sm font-medium">Data Insights</span>
          </div>
          <div className="feature-pill" style={{ animationDelay: '0.2s' }}>
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-judicial-gold mr-2" />
            <span className="text-xs sm:text-sm font-medium">Secure Platform</span>
          </div>
          <div className="feature-pill" style={{ animationDelay: '0.3s' }}>
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-judicial-gold mr-2" />
            <span className="text-xs sm:text-sm font-medium">Smart Solutions</span>
          </div>
        </div>

        {/* AI-Driven Legal Tools Section */}
        <div className="mt-16 sm:mt-20 md:mt-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 animate-fade-in px-4 sm:px-0">
            <span className="text-gradient-gold">Powerful AI-Driven</span>{' '}
            <span className="text-white">Legal Tools</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="tool-card" style={{ animationDelay: '0.2s' }}>
              <div className="tool-icon">
                <Zap className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">Smart Analysis</h3>
              <p className="text-gray-300 text-sm sm:text-base">Advanced AI algorithms for comprehensive legal analysis</p>
            </div>
            
            <div className="tool-card" style={{ animationDelay: '0.4s' }}>
              <div className="tool-icon">
                <Cpu className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">Machine Learning</h3>
              <p className="text-gray-300 text-sm sm:text-base">Continuous learning from legal precedents and cases</p>
            </div>
            
            <div className="tool-card" style={{ animationDelay: '0.6s' }}>
              <div className="tool-icon">
                <Database className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">Data Processing</h3>
              <p className="text-gray-300 text-sm sm:text-base">Efficient processing of large legal datasets</p>
            </div>
            
            <div className="tool-card" style={{ animationDelay: '0.8s' }}>
              <div className="tool-icon">
                <Code2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-judicial-gold" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">Smart Automation</h3>
              <p className="text-gray-300 text-sm sm:text-base">Automated legal document processing and analysis</p>
            </div>
          </div>
        </div>

        {/* Ready to Transform Section */}
        <div className="mt-16 sm:mt-20 md:mt-24 text-center">
          <div className="bg-judicial-navy/30 backdrop-blur-sm border border-judicial-gold/20 rounded-2xl p-6 sm:p-8 md:p-12 max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Ready to <span className="text-gradient-gold">Transform</span> Your Legal Practice?
            </h3>
            <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Join thousands of legal professionals who are already using Dastavez AI to streamline their workflow and achieve better outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-judicial-gold hover:bg-judicial-gold/90 text-judicial-dark transition-transform duration-300 hover:scale-105 w-full sm:w-auto" onClick={() => navigate('/auth')}>
                <Rocket className="mr-2 h-5 w-5" />
                Get Started Today
              </Button>
              <Button size="lg" variant="outline" className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10 transition-transform duration-300 hover:scale-105 w-full sm:w-auto">
                <ArrowRight className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
