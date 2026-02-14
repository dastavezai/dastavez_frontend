import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeatureCards } from "@/components/FeatureCards";
import { CaseAnalysis } from "@/components/CaseAnalysis";
import { TestimonialSection } from "@/components/TestimonialSection";
import { Footer } from "@/components/Footer";
import { Quote, Star } from "lucide-react";
import StarField from "@/components/StarField";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-judicial-dark transition-colors duration-300">
      <StarField />
      <Navbar />
      
      {/* NyayGuru-like Hero with CTA and badges */}
      <section className="relative">
        <HeroSection />
        {/* <div className="container mx-auto px-4 -mt-6 md:-mt-10">
          <div className="mx-auto max-w-3xl text-center bg-judicial-navy/40 dark:bg-judicial-navy/40 light:bg-white/60 border border-judicial-gold/20 rounded-2xl p-4 md:p-6 backdrop-blur">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-300 light:text-judicial-navy/70 mb-3">
              <span className="px-2 py-1 rounded bg-judicial-navy/60 dark:bg-judicial-navy/60 light:bg-judicial-navy/20 border border-judicial-gold/20">Ask Your Legal Query</span>
              <span className="px-2 py-1 rounded bg-judicial-navy/60 dark:bg-judicial-navy/60 light:bg-judicial-navy/20 border border-judicial-gold/20">Be Specific</span>
              <span className="px-2 py-1 rounded bg-judicial-navy/60 dark:bg-judicial-navy/60 light:bg-judicial-navy/20 border border-judicial-gold/20">Ask in Any Language</span>
              <span className="px-2 py-1 rounded bg-judicial-navy/60 dark:bg-judicial-navy/60 light:bg-judicial-navy/20 border border-judicial-gold/20">Upload PDFs</span>
              <span className="px-2 py-1 rounded bg-judicial-navy/60 dark:bg-judicial-navy/60 light:bg-judicial-navy/20 border border-judicial-gold/20">Find Case Laws</span>
              <span className="px-2 py-1 rounded bg-judicial-navy/60 dark:bg-judicial-navy/60 light:bg-judicial-navy/20 border border-judicial-gold/20">Legal Draftings</span>
              <span className="px-2 py-1 rounded bg-judicial-gold text-judicial-dark font-semibold">It’s Free!</span>
            </div>
            <Link to="/chat" className="inline-block px-5 py-3 rounded-lg bg-judicial-gold text-judicial-dark font-semibold hover:bg-judicial-lightGold transition-colors">
              Start Chatting
            </Link>
          </div> */}
        {/* </div> */}
      </section>
      
      <FeatureCards />
      
      {/* Demo Section */}
      <div className="py-16 bg-judicial-navy/30 dark:bg-judicial-navy/30 light:bg-judicial-navy/10" id="cases">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See <span className="text-judicial-gold">Dastavez AI</span> in Action
            </h2>
            <p className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 max-w-2xl mx-auto">
              Experience our powerful legal AI tools through interactive demos of our core features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="animate-fade-in stagger-1">
              
            </div>
            
            <div className="animate-fade-in stagger-2">
              <CaseAnalysis />
            </div>
          </div>
        </div>
      </div>

      {/* Trusted by Legal Professionals Section */}
      <div className="py-16 md:py-20 relative overflow-hidden bg-white dark:bg-judicial-dark light:bg-white transition-colors duration-300">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          {/* Dark mode background */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-judicial-gold/5 dark:bg-judicial-gold/5 rounded-full blur-3xl dark:block hidden"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-judicial-blue/10 dark:bg-judicial-blue/10 rounded-full blur-3xl dark:block hidden"></div>
          
          {/* Light mode background */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-judicial-gold/10 light:bg-judicial-gold/10 rounded-full blur-3xl light:block hidden"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-judicial-blue/5 light:bg-judicial-blue/5 rounded-full blur-3xl light:block hidden"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-hero dark:text-judicial-gold light:text-judicial-navy">Trusted by</span>{' '}
              <span className="text-judicial-gold dark:text-judicial-gold light:text-judicial-navy">Legal Professionals</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 light:text-gray-600 max-w-2xl mx-auto">
              See what attorneys and legal teams are saying about Dastavez AI Oracle's impact on their practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="trusted-card" style={{ animationDelay: '0.2s' }}>
              <div className="trusted-content">
                <div className="trusted-icon-container">
                  <Quote className="h-8 w-8 text-judicial-gold trusted-icon" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 light:text-gray-700 mb-6 trusted-text">
                  "Dastavez AI has completely transformed our legal research process. We've reduced preparation time by 60% while discovering more relevant precedents for our cases."
                </p>
                <div className="trusted-footer">
                  <div className="trusted-author">
                    <h4 className="font-semibold text-gray-900 dark:text-white light:text-gray-900">Priyanshu Singh</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 light:text-gray-600">Senior Partner, Richardson & Associates</p>
                  </div>
                  <div className="trusted-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-judicial-gold fill-current star-icon" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="trusted-card" style={{ animationDelay: '0.4s' }}>
              <div className="trusted-content">
                <div className="trusted-icon-container">
                  <Quote className="h-8 w-8 text-judicial-gold trusted-icon" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 light:text-gray-700 mb-6 trusted-text">
                  "In high-stakes property and civil matters, documentation quality cannot be compromised. Dastavez AI delivers structured, court-ready drafts that align with procedural standards and significantly reduce turnaround time"
                </p>
                <div className="trusted-footer">
                  <div className="trusted-author">
                    <h4 className="font-semibold text-gray-900 dark:text-white light:text-gray-900">Rishav Prakash</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 light:text-gray-600">Managing Partner, Chen & Associates</p>
                  </div>
                  <div className="trusted-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-judicial-gold fill-current star-icon" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="trusted-card" style={{ animationDelay: '0.6s' }}>
              <div className="trusted-content">
                <div className="trusted-icon-container">
                  <Quote className="h-8 w-8 text-judicial-gold trusted-icon" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 light:text-gray-700 mb-6 trusted-text">
                  "For lease agreements and commercial property documentation, the platform provides clear clause organization and ready-to-edit drafts. It has improved our firm’s efficiency in handling client documentation."
                </p>
                <div className="trusted-footer">
                  <div className="trusted-author">
                    <h4 className="font-semibold text-gray-900 dark:text-white light:text-gray-900">Fahim Ahmed</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 light:text-gray-600">Legal Director, Rodriguez Law Group</p>
                  </div>
                  <div className="trusted-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-judicial-gold fill-current star-icon" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>
          {`
            .trusted-card {
              background: rgba(30, 41, 59, 0.7);
              backdrop-filter: blur(8px);
              border-radius: 1.5rem;
              padding: 2rem;
              position: relative;
              overflow: hidden;
              transform-style: preserve-3d;
              perspective: 1000px;
              border: 1px solid rgba(255, 215, 0, 0.2);
              animation: trustedFloat 5s ease-in-out infinite;
              transition: all 0.3s ease;
            }
            
            .light .trusted-card {
              background: rgba(255, 255, 255, 0.8);
              border: 1px solid rgba(255, 215, 0, 0.3);
            }
            
            .trusted-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: radial-gradient(circle at top left, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
              z-index: -1;
              animation: gradientPulse 4s ease-in-out infinite;
            }
            
            .light .trusted-card::before {
              background: radial-gradient(circle at top left, rgba(255, 215, 0, 0.05) 0%, transparent 70%);
            }
            
            .trusted-content {
              position: relative;
              z-index: 1;
              transform-style: preserve-3d;
            }
            
            .trusted-icon-container {
              width: 60px;
              height: 60px;
              background: rgba(255, 215, 0, 0.1);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1.5rem;
              transform-style: preserve-3d;
              animation: iconContainerFloat 3s ease-in-out infinite;
              transition: all 0.3s ease;
            }
            
            .light .trusted-icon-container {
              background: rgba(255, 215, 0, 0.15);
            }
            
            .trusted-icon {
              animation: iconSpin 3s ease-in-out infinite;
              transform-style: preserve-3d;
            }
            
            .trusted-text {
              transition: all 0.3s ease;
              transform-style: preserve-3d;
            }
            
            .trusted-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 1.5rem;
              transform-style: preserve-3d;
            }
            
            .trusted-author {
              transform-style: preserve-3d;
            }
            
            .trusted-stars {
              display: flex;
              gap: 0.25rem;
              transform-style: preserve-3d;
            }
            
            .star-icon {
              transition: all 0.3s ease;
              transform-style: preserve-3d;
            }
            
            .trusted-card:hover {
              transform: translateY(-5px) rotateX(2deg) rotateY(2deg);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15),
                          0 0 15px rgba(255, 215, 0, 0.1);
              border-color: rgba(255, 215, 0, 0.35);
            }
            
            .light .trusted-card:hover {
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08),
                          0 0 15px rgba(255, 215, 0, 0.1);
              border-color: rgba(255, 215, 0, 0.4);
            }
            
            .trusted-card:hover .trusted-icon {
              transform: rotateY(90deg) scale(1.1);
              color: #FFD700;
            }
            
            .trusted-card:hover .trusted-text {
              transform: translateZ(5px);
              text-shadow: 0 0 8px rgba(255, 215, 0, 0.1);
            }
            
            .light .trusted-card:hover .trusted-text {
              text-shadow: 0 0 8px rgba(255, 215, 0, 0.08);
            }
            
            .trusted-card:hover .trusted-author h4 {
              transform: translateZ(8px);
              text-shadow: 0 0 8px rgba(255, 215, 0, 0.2);
            }
            
            .light .trusted-card:hover .trusted-author h4 {
              text-shadow: 0 0 8px rgba(255, 215, 0, 0.15);
            }
            
            .trusted-card:hover .star-icon {
              transform: translateZ(3px) scale(1.1);
              animation: starPulse 1s ease-in-out infinite;
            }
            
            @keyframes trustedFloat {
              0%, 100% {
                transform: translateY(0) rotateX(0deg) rotateY(0deg);
              }
              25% {
                transform: translateY(-8px) rotateX(2deg) rotateY(2deg);
              }
              50% {
                transform: translateY(0) rotateX(0deg) rotateY(0deg);
              }
              75% {
                transform: translateY(8px) rotateX(-2deg) rotateY(-2deg);
              }
            }
            
            @keyframes iconContainerFloat {
              0%, 100% {
                transform: translateY(0) rotateX(0deg);
              }
              50% {
                transform: translateY(-5px) rotateX(10deg);
              }
            }
            
            @keyframes iconSpin {
              0%, 100% {
                transform: rotate(0deg) scale(1);
              }
              50% {
                transform: rotate(180deg) scale(1.1);
              }
            }
            
            @keyframes gradientPulse {
              0%, 100% {
                opacity: 0.5;
                transform: scale(1);
              }
              50% {
                opacity: 0.8;
                transform: scale(1.1);
              }
            }
            
            @keyframes starPulse {
              0%, 100% {
                transform: scale(1) translateZ(5px);
                opacity: 1;
              }
              50% {
                transform: scale(1.2) translateZ(10px);
                opacity: 0.8;
              }
            }
          `}
        </style>
      </div>
      
      <TestimonialSection />
      
      <Footer />
    </div>
  );
};

export default Index;
