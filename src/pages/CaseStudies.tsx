import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
    <div className="min-h-screen bg-white dark:bg-judicial-dark relative overflow-hidden transition-colors duration-300">
      <Navbar />
      
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
                className="text-4xl font-bold text-black dark:text-white sm:text-5xl md:text-6xl"
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
              className="mt-3 max-w-md mx-auto text-base text-gray-600 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
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
                  duration: 0.2, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className="bg-white dark:bg-judicial-navy backdrop-blur-md rounded-lg p-6 border border-gray-200 dark:border-white/10 hover:border-judicial-gold hover:shadow-[0_0_25px_rgba(234,179,8,0.25)] transition-all duration-300 hover:duration-0 cursor-pointer hover-card-group"
              >
                <div className="flex items-start justify-between">
                  <div className="hover-card-icon text-4xl mb-4 w-fit">
                    {study.icon}
                  </div>
                  <span className="text-sm text-judicial-gold bg-amber-500/10 px-3 py-1 rounded-full">
                    {study.industry}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-black dark:text-white mb-2 font-serif-legal">
                  {study.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {study.description}
                </p>
              </motion.div>
            ))}
          </div>
	 
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CaseStudies; 
