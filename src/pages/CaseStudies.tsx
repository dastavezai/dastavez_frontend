import React from 'react';
import { motion } from 'framer-motion';
import StarField from "@/components/StarField";

const CaseStudies = () => {
  const caseStudies = [
    {
      title: "Corporate Law Success",
      description: "How a Fortune 500 company reduced legal research time using our AI-powered analysis tools.",
      icon: "🏢",
      industry: "Corporate Law"
    },
    {
      title: "Criminal Defense Breakthrough",
      description: "A criminal defense firm used our predictive analytics to identify key precedents, leading to a favorable verdict.",
      icon: "⚖️",
      industry: "Criminal Law"
    },
    {
      title: "Family Law Innovation",
      description: "Streamlined case management and document analysis helped a family law practice handle more cases efficiently.",
      icon: "👨‍👩‍👧‍👦",
      industry: "Family Law"
    },
    {
      title: "Intellectual Property Victory",
      description: "Our AI tools helped identify critical patent precedents, leading to a successful IP litigation case.",
      icon: "💡",
      industry: "IP Law"
    },
    {
      title: "Real Estate Efficiency",
      description: "A real estate law firm automated document review, significantly reducing processing time.",
      icon: "🏠",
      industry: "Real Estate Law"
    },
    {
      title: "Immigration Law Transformation",
      description: "Automated case analysis and document processing revolutionized an immigration law practice.",
      icon: "🌍",
      industry: "Immigration Law"
    }
  ];

  return (
    <div className="min-h-screen bg-judicial-dark relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center items-center gap-2">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                className="text-4xl font-bold text-white sm:text-5xl md:text-6xl"
              >
                Case
              </motion.h1>
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                className="text-judicial-gold text-4xl font-bold sm:text-5xl md:text-6xl"
              >
                Studies
              </motion.span>
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8,
                delay: 0.4,
                type: "spring",
                stiffness: 100
              }}
              className="mt-3 max-w-md mx-auto text-base text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            >
              Discover how legal professionals are transforming their practice with our AI solutions
            </motion.p>
          </motion.div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((study, index) => (
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
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 215, 0, 0.2)"
                }}
                className="bg-judicial-navy/70 backdrop-blur-md rounded-lg p-6 border border-judicial-gold/20 hover:border-judicial-gold/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <motion.div 
                    className="text-4xl mb-4"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {study.icon}
                  </motion.div>
                  <span className="text-sm text-judicial-gold bg-judicial-gold/10 px-3 py-1 rounded-full">
                    {study.industry}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  {study.title}
                </h3>
                <p className="text-gray-400">
                  {study.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudies; 