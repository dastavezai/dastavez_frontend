import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import StarField from "@/components/StarField";
import AIAssistant3D from "@/components/AIAssistant3D";

const Features = () => {
  const features = [
    {
      title: "AI-Powered Legal Analysis",
      description: "Get instant legal insights and analysis powered by advanced AI algorithms.",
      icon: "⚖️"
    },
    {
      title: "Case Prediction",
      description: "Predict case outcomes with high accuracy using historical data and AI models.",
      icon: "🔮"
    },
    {
      title: "Document Analysis",
      description: "Upload and analyze legal documents with our intelligent document processing system.",
      icon: "📄"
    },
    {
      title: "Legal Research",
      description: "Access comprehensive legal research tools and databases in one place.",
      icon: "🔍"
    },
    {
      title: "Real-time Updates",
      description: "Stay updated with the latest legal developments and case law changes.",
      icon: "🔄"
    },
    {
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security and encryption.",
      icon: "🔒"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-judicial-dark relative overflow-hidden transition-colors duration-300">
      <StarField />
      <Navbar />
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold text-black dark:text-white sm:text-5xl md:text-6xl">
              Our <span className="text-judicial-gold">Features</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-600 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover the powerful features that make our platform the ultimate legal AI assistant
            </p>
          </motion.div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.01,
                  y: -2,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 215, 0, 0.1)"
                }}
                className="bg-judicial-navy/70 backdrop-blur-md rounded-lg p-6 border border-judicial-gold/20 hover:border-judicial-gold/50 transition-all duration-300"
              >
                <div className="text-4xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* AI Assistant Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16"
          >
            
	    {/* <Footer /> */}
          </motion.div>

        </div>
        </div>

      <Footer />
    </div>
  );
};

export default Features; 
