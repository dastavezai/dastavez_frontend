
import { MessageSquare, FileText, Scale, Search, Brain, FileQuestion, FileCheck, AlertTriangle, BarChart2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  iconColorClass: string;
}

function FeatureCard({ icon, title, description, color, iconColorClass }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-judicial-navy/30 backdrop-blur-sm border border-gray-200 dark:border-judicial-gold/10 rounded-xl p-5 sm:p-6 hover:border-judicial-gold/30 hover:shadow-md transition-all group h-full shadow-sm">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${color}`}>
        <span className={`${iconColorClass} transition-colors duration-300`}>
          {icon}
        </span>
      </div>
      <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-900 dark:text-white group-hover:text-judicial-gold transition-colors">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">{description}</p>
    </div>
  );
}

export function FeatureCards() {
  const features = [
    {
      icon: <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: "AI Legal Assistant",
      description: "Get immediate answers to legal questions with our advanced AI trained on case law and legal statutes.",
      color: "bg-blue-100 dark:bg-blue-500/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/40",
      iconColorClass: "text-blue-600 dark:text-white"
    },
    {
      icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: "Document Analysis",
      description: "Extract key information from legal documents, contracts, and filings with AI-powered summarization.",
      color: "bg-green-100 dark:bg-green-500/30 group-hover:bg-green-200 dark:group-hover:bg-green-500/40",
      iconColorClass: "text-green-600 dark:text-white"
    },
    {
      icon: <Search className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: "Precedent Research",
      description: "Find relevant case precedents that match your current case details with semantic search.",
      color: "bg-purple-100 dark:bg-purple-500/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/40",
      iconColorClass: "text-purple-600 dark:text-white"
    },
    {
      icon: <Scale className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: "Case Prediction",
      description: "Get probability assessments for different case outcomes based on historical data and similar cases.",
      color: "bg-amber-100 dark:bg-amber-500/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-500/40",
      iconColorClass: "text-amber-600 dark:text-white"
    },
    {
      icon: <FileCheck className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: "Statute Compliance",
      description: "Verify compliance with relevant laws and regulations for your specific legal jurisdiction.",
      color: "bg-teal-100 dark:bg-teal-500/30 group-hover:bg-teal-200 dark:group-hover:bg-teal-500/40",
      iconColorClass: "text-teal-600 dark:text-white"
    },
    {
      icon: <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: "Risk Assessment",
      description: "Identify potential legal risks and vulnerabilities in your case strategy or legal documents.",
      color: "bg-red-100 dark:bg-red-500/30 group-hover:bg-red-200 dark:group-hover:bg-red-500/40",
      iconColorClass: "text-red-600 dark:text-white"
    },
    {
      icon: <Brain className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: "Strategic Insights",
      description: "Receive AI-generated strategic recommendations based on comprehensive case analysis.",
      color: "bg-indigo-100 dark:bg-indigo-500/30 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/40",
      iconColorClass: "text-indigo-600 dark:text-white"
    },
    {
      icon: <BarChart2 className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: "Analytics Dashboard",
      description: "Visualize case data, outcomes, and predictions through an intuitive analytics dashboard.",
      color: "bg-cyan-100 dark:bg-cyan-500/30 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-500/40",
      iconColorClass: "text-cyan-600 dark:text-white"
    }
  ];

  return (
    <div className="py-12 sm:py-16 bg-gray-50 dark:bg-transparent transition-colors duration-300" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Powerful <span className="text-judicial-gold">AI-Driven</span> Legal Tools
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-4 sm:px-0">
            Our suite of intelligent tools helps legal professionals streamline research,
            build stronger cases, and gain valuable insights through advanced AI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              iconColorClass={feature.iconColorClass}
            />
          ))}
        </div>

        <div className="text-center mt-10 sm:mt-12">
          <Button size="lg" className="bg-judicial-gold hover:bg-judicial-gold/90 text-judicial-dark font-semibold transition-transform duration-300 hover:scale-105">
            Explore All Features
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
