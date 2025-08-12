import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface CaseAnalysisProps {
  title: string;
  caseNumber: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

const CaseAnalysis3D: React.FC<CaseAnalysisProps> = ({
  title,
  caseNumber,
  summary,
  strengths,
  weaknesses
}) => {
  const [activeTab, setActiveTab] = useState('analysis');

  return (
    <div className="relative perspective-1000">
      {/* Header Section with 3D Effect */}
      <div className="relative preserve-3d mb-6" style={{
        animation: 'float3D 4s ease-in-out infinite'
      }}>
        <div className="flex items-center gap-3 hover:transform hover:scale-105 transition-transform duration-300">
          <div className="relative preserve-3d" style={{ animation: 'rotate3D 6s ease-in-out infinite' }}>
            <FileText className="h-6 w-6 text-judicial-gold" />
            <div className="absolute inset-0 bg-judicial-gold/20 blur-lg -z-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-judicial-gold/80">{caseNumber}</p>
          </div>
        </div>
      </div>

      {/* Tabs with 3D Hover Effect */}
      <div className="flex gap-2 mb-6">
        {['Analysis', 'Precedents', 'Outcomes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-6 py-3 rounded-lg transition-all duration-300 preserve-3d hover:transform hover:translate-y-[-4px] ${
              activeTab === tab.toLowerCase()
                ? 'bg-judicial-gold/20 text-judicial-gold shadow-lg'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
            }`}
            style={{
              transform: activeTab === tab.toLowerCase() ? 'translateZ(10px) rotateX(5deg)' : 'translateZ(0)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div className="space-y-8">
        <div className="bg-gray-800/30 rounded-lg p-6 backdrop-blur-sm border border-judicial-gold/10 preserve-3d hover:transform hover:translate-y-[-4px] transition-transform duration-300">
          <h3 className="text-xl font-semibold mb-4 text-white">Case Summary</h3>
          <p className="text-gray-300">{summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths Section */}
          <div className="bg-gray-800/30 rounded-lg p-6 backdrop-blur-sm border border-green-500/10 preserve-3d hover:transform hover:translate-y-[-4px] hover:rotate-y-3 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="preserve-3d" style={{ animation: 'spin3D 4s ease-in-out infinite' }}>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Case Strengths</h3>
            </div>
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-500/80">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses Section */}
          <div className="bg-gray-800/30 rounded-lg p-6 backdrop-blur-sm border border-yellow-500/10 preserve-3d hover:transform hover:translate-y-[-4px] hover:rotate-y-3 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="preserve-3d" style={{ animation: 'spin3D 4s ease-in-out infinite' }}>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Case Weaknesses</h3>
            </div>
            <ul className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-yellow-500/80">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .preserve-3d {
          transform-style: preserve-3d;
        }
        
        @keyframes float3D {
          0%, 100% {
            transform: translateY(0) rotateX(0deg);
          }
          50% {
            transform: translateY(-10px) rotateX(5deg);
          }
        }
        
        @keyframes rotate3D {
          0%, 100% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(180deg);
          }
        }
        
        @keyframes spin3D {
          0%, 100% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(180deg);
          }
        }
      `}</style>
    </div>
  );
};

export default CaseAnalysis3D; 