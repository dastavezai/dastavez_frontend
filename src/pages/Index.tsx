import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeatureCards } from "@/components/FeatureCards";
import { CaseAnalysis } from "@/components/CaseAnalysis";
import { TestimonialSection } from "@/components/TestimonialSection";
import { Footer } from "@/components/Footer";
import { Quote, Star } from "lucide-react";
import StarField from "@/components/StarField";

const Index = () => {
  return (
    <div className="min-h-screen bg-judicial-dark">
      <StarField />
      <Navbar />
      
      <HeroSection />
      
      <FeatureCards />
      
      {/* Demo Section */}
      <div className="py-16 bg-judicial-navy/30" id="cases">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See <span className="text-judicial-gold">Dastavez AI</span> in Action
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
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
      <div className="py-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-judicial-gold/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-judicial-blue/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-gold">Trusted by</span>{' '}
              <span className="text-white">Legal Professionals</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See what attorneys and legal teams are saying about Dastavez AI Oracle's impact on their practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="testimonial-card" style={{ animationDelay: '0.2s' }}>
              <div className="testimonial-content">
                <div className="testimonial-icon-container">
                  <Quote className="h-8 w-8 text-judicial-gold testimonial-icon" />
                </div>
                <p className="text-gray-300 mb-6 testimonial-text">
                  "Dastavez AI has completely transformed our legal research process. We've reduced preparation time by 60% while discovering more relevant precedents for our cases."
                </p>
                <div className="testimonial-footer">
                  <div className="testimonial-author">
                    <h4 className="font-semibold text-white">Priyanshu Singh</h4>
                    <p className="text-sm text-gray-400">Senior Partner, Richardson & Associates</p>
                  </div>
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-judicial-gold fill-current star-icon" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="testimonial-card" style={{ animationDelay: '0.4s' }}>
              <div className="testimonial-content">
                <div className="testimonial-icon-container">
                  <Quote className="h-8 w-8 text-judicial-gold testimonial-icon" />
                </div>
                <p className="text-gray-300 mb-6 testimonial-text">
                  "The AI-powered case analysis has been a game-changer for our firm. We're now able to identify key patterns and precedents that we would have otherwise missed."
                </p>
                <div className="testimonial-footer">
                  <div className="testimonial-author">
                    <h4 className="font-semibold text-white">Rishav Prakash</h4>
                    <p className="text-sm text-gray-400">Managing Partner, Chen & Associates</p>
                  </div>
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-judicial-gold fill-current star-icon" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="testimonial-card" style={{ animationDelay: '0.6s' }}>
              <div className="testimonial-content">
                <div className="testimonial-icon-container">
                  <Quote className="h-8 w-8 text-judicial-gold testimonial-icon" />
                </div>
                <p className="text-gray-300 mb-6 testimonial-text">
                  "The predictive analytics feature has helped us make more informed decisions about case strategy. It's like having an expert consultant available 24/7."
                </p>
                <div className="testimonial-footer">
                  <div className="testimonial-author">
                    <h4 className="font-semibold text-white">Fahim Ahmed</h4>
                    <p className="text-sm text-gray-400">Legal Director, Rodriguez Law Group</p>
                  </div>
                  <div className="testimonial-stars">
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
            .testimonial-card {
              background: rgba(30, 41, 59, 0.7);
              backdrop-filter: blur(8px);
              border-radius: 1.5rem;
              padding: 2rem;
              position: relative;
              overflow: hidden;
              transform-style: preserve-3d;
              perspective: 1000px;
              border: 1px solid rgba(255, 215, 0, 0.2);
              animation: testimonialFloat 5s ease-in-out infinite;
            }
            
            .testimonial-card::before {
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
            
            .testimonial-content {
              position: relative;
              z-index: 1;
              transform-style: preserve-3d;
            }
            
            .testimonial-icon-container {
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
            }
            
            .testimonial-icon {
              animation: iconSpin 3s ease-in-out infinite;
              transform-style: preserve-3d;
            }
            
            .testimonial-text {
              transition: all 0.3s ease;
              transform-style: preserve-3d;
            }
            
            .testimonial-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 1.5rem;
              transform-style: preserve-3d;
            }
            
            .testimonial-author {
              transform-style: preserve-3d;
            }
            
            .testimonial-stars {
              display: flex;
              gap: 0.25rem;
              transform-style: preserve-3d;
            }
            
            .star-icon {
              transition: all 0.3s ease;
              transform-style: preserve-3d;
            }
            
            .testimonial-card:hover {
              transform: translateY(-10px) rotateX(5deg) rotateY(5deg);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
                          0 0 30px rgba(255, 215, 0, 0.2);
              border-color: rgba(255, 215, 0, 0.5);
            }
            
            .testimonial-card:hover .testimonial-icon {
              transform: rotateY(180deg) scale(1.2);
              color: #FFD700;
            }
            
            .testimonial-card:hover .testimonial-text {
              transform: translateZ(10px);
              text-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
            }
            
            .testimonial-card:hover .testimonial-author h4 {
              transform: translateZ(15px);
              text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            }
            
            .testimonial-card:hover .star-icon {
              transform: translateZ(5px) scale(1.2);
              animation: starPulse 1s ease-in-out infinite;
            }
            
            @keyframes testimonialFloat {
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
