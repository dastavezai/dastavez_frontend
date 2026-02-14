import React from 'react';
import CaseAnalysis3D from '../components/CaseAnalysis4D';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function CaseAnalysisPage() {
  const caseData = {
    title: 'Case Analysis',
    caseNumber: 'Smith v. Johnson (2023)',
    summary: 'Illegal search and seizure case involving warrantless entry of private residence with alleged probable cause.',
    strengths: [
      'Multiple witness testimonies corroborate defendant\'s account',
      'Body camera footage shows potential procedural violations',
      'Similar case precedent in State v. Miller (2020)'
    ],
    weaknesses: [
      'Defendant has prior related conviction',
      'Delayed reporting of incident by 48 hours',
      'Partial consent may have been given for limited search'
    ]
  };

  return (
    <div className="min-h-screen bg-white dark:bg-judicial-dark p-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1" />
          <Button 
            className="bg-judicial-gold hover:bg-judicial-gold/90 text-judicial-dark transition-all duration-300 hover:scale-105"
          >
            <Plus className="mr-2 h-5 w-5" />
            Generate New Analysis
          </Button>
        </div>

        <div className="flex w-full min-h-[600px]">
          <div className="flex-1 mr-6 flex flex-col gap-6">
            <CaseAnalysis3D {...caseData} />
            {/* Additional Features */}
            <div className="bg-gray-800/40 rounded-lg p-4 border border-judicial-gold/10">
              <h3 className="text-lg font-semibold text-judicial-gold mb-2">Case Notes</h3>
              <textarea className="w-full h-24 rounded p-2 bg-gray-900/60 text-gray-200 border border-judicial-gold/20 focus:outline-none focus:ring-2 focus:ring-judicial-gold/40" placeholder="Add your notes here..."></textarea>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-judicial-gold text-judicial-dark px-4 py-2 rounded font-semibold hover:bg-judicial-gold/90 transition">Export PDF</button>
              <button className="bg-gray-700 text-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-600 transition">Download Data</button>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Tags:</span>
              <span className="inline-block bg-judicial-gold/20 text-judicial-gold px-3 py-1 rounded-full text-xs font-medium mr-2">Criminal Law</span>
              <span className="inline-block bg-judicial-gold/20 text-judicial-gold px-3 py-1 rounded-full text-xs font-medium mr-2">Search & Seizure</span>
              <span className="inline-block bg-judicial-gold/20 text-judicial-gold px-3 py-1 rounded-full text-xs font-medium">Precedent</span>
            </div>
          </div>
          <div className="w-1/3">{/* Right side for future content or leave empty */}</div>
        </div>
      </div>
    </div>
  );
} 