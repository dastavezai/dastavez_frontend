import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import StarField from "@/components/StarField";
import { motion } from "framer-motion";
import { Brain, Zap, Cpu, Database, Code2, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SmartAnalysis = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-judicial-dark transition-colors duration-300">
      <StarField />
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl font-bold mb-6 text-black dark:text-white sm:text-5xl md:text-6xl">
              Smart <span className="text-judicial-gold">Analysis</span>
            </h1>
          
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Advanced AI-powered legal analysis that transforms complex legal data into actionable insights.
              </p>
            </motion.div>
          </section>

          {/* Features Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-6 rounded-lg border border-judicial-gold/20 bg-judicial-navy/30 hover:bg-judicial-navy/50 transition-colors"
            >
              <Brain className="w-12 h-12 text-judicial-gold mb-4" />
              <h3 className="text-xl font-semibold mb-2">Natural Language Processing</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced NLP algorithms understand and analyze legal documents with human-like comprehension.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="p-6 rounded-lg border border-judicial-gold/20 bg-judicial-navy/30 hover:bg-judicial-navy/50 transition-colors"
            >
              <Zap className="w-12 h-12 text-judicial-gold mb-4" />
              <h3 className="text-xl font-semibold mb-2">Pattern Recognition</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Identify key patterns and trends across case law, statutes, and legal precedents.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="p-6 rounded-lg border border-judicial-gold/20 bg-judicial-navy/30 hover:bg-judicial-navy/50 transition-colors"
            >
              <Cpu className="w-12 h-12 text-judicial-gold mb-4" />
              <h3 className="text-xl font-semibold mb-2">Machine Learning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Continuously learns from legal data to improve analysis accuracy and relevance.
              </p>
            </motion.div>
          </section>

          {/* Detailed Explanation */}
          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-judicial-navy/30 rounded-lg p-8 border border-judicial-gold/20"
            >
              <h2 className="text-2xl font-bold mb-6 text-judicial-gold">How It Works</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-judicial-gold/20">
                    <Database className="w-6 h-6 text-judicial-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Data Collection</h3>
                    <p className="text-gray-400">
                      Our system aggregates legal data from multiple sources including case law databases, statutes, and legal documents.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-judicial-gold/20">
                    <Code2 className="w-6 h-6 text-judicial-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Analysis Process</h3>
                    <p className="text-gray-400">
                      Advanced algorithms process the data to identify relevant patterns, relationships, and insights.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-judicial-gold/20">
                    <Brain className="w-6 h-6 text-judicial-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Insight Generation</h3>
                    <p className="text-gray-400">
                      The system generates actionable insights and recommendations based on the analyzed data.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <h2 className="text-2xl font-bold mb-6">Ready to Experience Smart Analysis?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Transform your legal practice with our advanced AI-powered analysis tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-judicial-gold hover:bg-judicial-gold/90 text-judicial-dark">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10">
                  Learn More
                </Button>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SmartAnalysis; 