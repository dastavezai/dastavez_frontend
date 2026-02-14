
import { MessageSquare, FileText, Scale, Search, Brain, FileQuestion, FileCheck, AlertTriangle, BarChart2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="bg-judicial-navy/30 backdrop-blur-sm border border-judicial-gold/10 rounded-xl p-4 sm:p-6 hover:border-judicial-gold/30 transition-all group h-full">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${color}`}>
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-medium mb-2  group-hover:text-judicial-gold transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{description}</p>
    </div>
  );
}

export function FeatureCards() {
  const features = [
    {
      icon: <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />,
      title: "AI Legal Assistant",
      description: "Get immediate answers to legal questions with our advanced AI trained on case law and legal statutes.",
      color: "bg-blue-500/30 group-hover:bg-blue-500/40"
    },
    {
      icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />,
      title: "Document Analysis",
      description: "Extract key information from legal documents, contracts, and filings with AI-powered summarization.",
      color: "bg-green-500/30 group-hover:bg-green-500/40"
    },
    {
      icon: <Search className="h-5 w-5 sm:h-6 sm:w-6 text-white" />,
      title: "Precedent Research",
      description: "Find relevant case precedents that match your current case details with semantic search.",
      color: "bg-purple-500/30 group-hover:bg-purple-500/40"
    },
    {
      icon: <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-white" />,
      title: "Case Prediction",
      description: "Get probability assessments for different case outcomes based on historical data and similar cases.",
      color: "bg-amber-500/30 group-hover:bg-amber-500/40"
    },
    {
      icon: <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />,
      title: "Statute Compliance",
      description: "Verify compliance with relevant laws and regulations for your specific legal jurisdiction.",
      color: "bg-teal-500/30 group-hover:bg-teal-500/40"
    },
    {
      icon: <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />,
      title: "Risk Assessment",
      description: "Identify potential legal risks and vulnerabilities in your case strategy or legal documents.",
      color: "bg-red-500/30 group-hover:bg-red-500/40"
    },
    {
      icon: <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />,
      title: "Strategic Insights",
      description: "Receive AI-generated strategic recommendations based on comprehensive case analysis.",
      color: "bg-indigo-500/30 group-hover:bg-indigo-500/40"
    },
    {
      icon: <BarChart2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />,
      title: "Analytics Dashboard",
      description: "Visualize case data, outcomes, and predictions through an intuitive analytics dashboard.",
      color: "bg-cyan-500/30 group-hover:bg-cyan-500/40"
    }
  ];
  
  return (
    <div className="py-12 sm:py-16" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Powerful <span className="text-judicial-gold">AI-Driven</span> Legal Tools
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-4 sm:px-0">
            Our suite of intelligent tools helps legal professionals streamline research, 
            build stronger cases, and gain valuable insights through advanced AI.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
            />
          ))}
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <Button size="lg" className="bg-judicial-gold hover:bg-judicial-gold/90 text-judicial-dark transition-transform duration-300 hover:scale-105">
            Explore All Features
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
