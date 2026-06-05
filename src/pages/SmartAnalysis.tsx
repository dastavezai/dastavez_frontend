import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import StarField from "@/components/StarField";
import { motion } from "framer-motion";
import { Brain, Zap, Cpu, Database, Code2, ArrowRight, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SmartAnalysis = () => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
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
                <Button 
                  size="lg" 
                  className="bg-judicial-gold hover:bg-judicial-gold/90 text-judicial-dark"
                  onClick={() => navigate("/chat")}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10"
                  onClick={() => setExpanded(!expanded)}
                >
                  Learn More
                  {expanded ? (
                    <ChevronDown className="ml-2 h-5 w-5" />
                  ) : (
                    <ChevronRight className="ml-2 h-5 w-5" />
                  )}
                </Button>
              </div>
            </motion.div>
          </section>

          {/* Expanded Details Section */}
          {expanded && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-16"
            >
              <div className="bg-judicial-navy/30 rounded-lg p-8 border border-judicial-gold/20">
                <h2 className="text-3xl font-bold mb-8 text-judicial-gold">Deep Dive: Smart Analysis Technology</h2>
                
                <div className="space-y-8">
                  {/* Advanced Features */}
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Advanced Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-judicial-navy/50 p-4 rounded-lg border border-judicial-gold/10">
                        <h4 className="font-semibold text-judicial-gold mb-2">Case Law Analysis</h4>
                        <p className="text-gray-400">
                          Our system analyzes hundreds of thousands of case law documents from multiple jurisdictions to identify relevant precedents and legal principles specific to your case. It understands judicial reasoning patterns, identifies similar fact patterns, evaluates the strength of precedents based on citation frequency and recency, and highlights landmark decisions that may impact your legal strategy. The system cross-references cases across different jurisdictions to provide comprehensive legal coverage and identifies trends in judicial interpretation over time.
                        </p>
                      </div>
                      <div className="bg-judicial-navy/50 p-4 rounded-lg border border-judicial-gold/10">
                        <h4 className="font-semibold text-judicial-gold mb-2">Statute Interpretation</h4>
                        <p className="text-gray-400">
                          Advanced algorithms interpret statutes and regulations with remarkable accuracy, providing comprehensive legal context and cross-references to related laws. The system analyzes legislative intent, identifies ambiguities in legal language, tracks amendments and updates to ensure current compliance, and provides historical context on how statutes have been interpreted by courts. It automatically flags conflicting provisions and highlights provisions that have been subject to litigation or regulatory scrutiny.
                        </p>
                      </div>
                      <div className="bg-judicial-navy/50 p-4 rounded-lg border border-judicial-gold/10">
                        <h4 className="font-semibold text-judicial-gold mb-2">Legal Document Processing</h4>
                        <p className="text-gray-400">
                          Extract key information from contracts, briefs, motions, and legal documents with high accuracy using our trained deep learning models. The system identifies critical clauses, obligations, dates, parties, and potential risks automatically. It classifies document types, summarizes key provisions, extracts definitions and governing law clauses, and highlights any unusual or potentially problematic language. Our models have been trained on millions of legal documents and understand legal terminology, structure, and conventions.
                        </p>
                      </div>
                      <div className="bg-judicial-navy/50 p-4 rounded-lg border border-judicial-gold/10">
                        <h4 className="font-semibold text-judicial-gold mb-2">Risk Assessment</h4>
                        <p className="text-gray-400">
                          Evaluate potential legal risks and outcomes based on historical data, similar case analyses, and predictive modeling. The system analyzes relevant precedents to estimate potential litigation outcomes, identifies high-risk provisions in contracts, and flags regulatory compliance issues. It provides quantified risk assessments based on comparable cases, success rates in similar situations, and expert analysis. The system continuously learns from new cases and legal developments to improve risk predictions.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Real-World Use Cases</h3>
                    <ul className="space-y-4 text-gray-400">
                      <li className="flex items-start gap-3">
                        <span className="text-judicial-gold font-bold">•</span>
                        <div>
                          <strong className="text-white">Contract Review:</strong> Automatically identify critical clauses, financial obligations, liability limitations, and potential issues in contracts. Our system can flag unusual terms, compare against standard contract templates, identify risks, and summarize key provisions in seconds rather than hours. It helps ensure compliance with company policies and regulatory requirements while reducing manual review time by up to 80%.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-judicial-gold font-bold">•</span>
                        <div>
                          <strong className="text-white">Due Diligence:</strong> Accelerate due diligence processes by rapidly analyzing large document sets during M&A transactions. The system can process thousands of documents, extract relevant information, identify material issues, highlight regulatory compliance concerns, and provide comprehensive summaries. This dramatically reduces timelines from weeks to days and helps identify risks that might be missed in manual reviews.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-judicial-gold font-bold">•</span>
                        <div>
                          <strong className="text-white">Legal Research:</strong> Find relevant cases and legal authorities faster than traditional research methods. Our AI searches through comprehensive legal databases, identifies on-point precedents, evaluates the weight and relevance of authorities, and provides citations with context. It understands legal relationships and can connect disparate concepts to find creative legal arguments and solutions.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-judicial-gold font-bold">•</span>
                        <div>
                          <strong className="text-white">Litigation Support:</strong> Build stronger arguments with comprehensive precedent analysis and legal research. The system helps attorneys identify the strongest legal authorities, understand opposing counsel's likely arguments, assess case viability early, and develop litigation strategy based on predictive analytics. It supports motion writing, brief preparation, and trial strategy development with detailed legal analysis.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-judicial-gold font-bold">•</span>
                        <div>
                          <strong className="text-white">Compliance Monitoring:</strong> Stay updated with regulatory changes and ensure compliance automatically across your organization. The system monitors new legislation, regulatory guidance, court decisions, and industry standards relevant to your business. It alerts you to compliance risks, suggests remediation steps, tracks internal compliance status, and maintains audit trails for regulatory reporting.
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Technical Details */}
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Technical Excellence</h3>
                    <p className="text-gray-400 mb-6">
                      Our Smart Analysis platform is built on cutting-edge machine learning technologies, advanced natural language processing, and deep legal domain expertise. We combine state-of-the-art transformer models with specialized legal knowledge to deliver unprecedented accuracy and reliability in legal analysis and document processing.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-judicial-navy/50 p-4 rounded-lg border border-judicial-gold/10">
                        <h4 className="font-semibold text-judicial-gold mb-2">99.2% Accuracy</h4>
                        <p className="text-gray-400 text-sm">
                          Industry-leading accuracy in legal document analysis, classification, and information extraction. Our models have been trained and validated on millions of legal documents across different practice areas and jurisdictions. We continuously validate accuracy against expert human review and maintain the highest standards for legal AI systems.
                        </p>
                      </div>
                      <div className="bg-judicial-navy/50 p-4 rounded-lg border border-judicial-gold/10">
                        <h4 className="font-semibold text-judicial-gold mb-2">Real-Time Processing</h4>
                        <p className="text-gray-400 text-sm">
                          Analyze documents and generate insights in real-time, not batch processing. Our optimized infrastructure processes documents instantly, allowing lawyers to get answers immediately. Whether analyzing a single contract or thousands of documents, results are available in seconds to minutes, dramatically improving productivity and decision-making speed.
                        </p>
                      </div>
                      <div className="bg-judicial-navy/50 p-4 rounded-lg border border-judicial-gold/10">
                        <h4 className="font-semibold text-judicial-gold mb-2">Continuous Learning</h4>
                        <p className="text-gray-400 text-sm">
                          Our models improve continuously as new legal data becomes available, including new case law, statutes, and regulations. We monitor legal developments worldwide and update our knowledge base regularly. Your usage patterns help us refine our models while maintaining strict confidentiality and security standards.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Getting Started */}
                  <div className="bg-judicial-gold/10 border border-judicial-gold/30 p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold mb-4 text-judicial-gold">Ready to Get Started?</h3>
                    <p className="text-gray-300 mb-6">
                      Experience the power of Smart Analysis with our interactive AI Legal Assistant. Upload your documents, ask questions, and get instant legal insights. Our platform is designed for legal professionals of all levels, from solopreneurs to large law firms. Start with a single document or upload your entire case files to see how much time you can save on legal research, document analysis, and case preparation. Our AI-powered assistant works 24/7 to help you get the answers you need faster than ever before.
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-judicial-gold hover:bg-judicial-gold/90 text-judicial-dark"
                      onClick={() => navigate("/chat")}
                    >
                      Launch AI Legal Assistant
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SmartAnalysis; 