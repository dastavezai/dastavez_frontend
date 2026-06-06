import React, { useState, useEffect } from "react";
import { MessageSquare, FileText, Search, ShieldAlert, Sparkles, HelpCircle, FileCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function InteractiveFeatureShowcase() {
  const [activeTab, setActiveTab] = useState<"draft" | "search" | "analyze">("draft");
  const [typingText, setTypingText] = useState("");

  const draftText = `WHEREAS, the Partners desire to associate themselves as partners in business...
1. NAME OF THE PARTNERSHIP: The firm name shall be Dastavez Partners.
2. PLACE OF BUSINESS: Principal office at New Delhi, India.
3. DURATION: The partnership shall commence on June 6, 2026.`;

  useEffect(() => {
    if (activeTab !== "draft") return;
    setTypingText("");
    let idx = 0;
    const interval = setInterval(() => {
      setTypingText((prev) => prev + draftText.charAt(idx));
      idx++;
      if (idx >= draftText.length) {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <section className="py-20 bg-white dark:bg-transparent transition-colors duration-300" id="interactive-features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold font-serif-legal mb-4 text-gray-900 dark:text-white">
            Everything in <span className="text-judicial-gold">One Platform</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base">
            Why navigate multiple tools? Dastavez AI unites precise drafting, semantic research, and contract analysis in a single workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Tabs Navigation (Left) */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
            <button
              onClick={() => setActiveTab("draft")}
              className={`p-6 text-left rounded-xl border transition-all duration-300 ${
                activeTab === "draft"
                  ? "bg-judicial-gold/5 border-judicial-gold/50 shadow-md translate-x-1"
                  : "bg-transparent border-gray-200 dark:border-judicial-gold/10 hover:border-judicial-gold/30 hover:bg-gray-50/50 dark:hover:bg-judicial-navy/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeTab === "draft" ? "bg-judicial-gold text-judicial-dark" : "bg-gray-100 dark:bg-judicial-navy/30 text-gray-700 dark:text-judicial-gold"}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Drafting Suite</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Generate airtight contracts, affidavits, and deeds tailored to your specifications using real-time templates.
              </p>
            </button>

            <button
              onClick={() => setActiveTab("search")}
              className={`p-6 text-left rounded-xl border transition-all duration-300 ${
                activeTab === "search"
                  ? "bg-judicial-gold/5 border-judicial-gold/50 shadow-md translate-x-1"
                  : "bg-transparent border-gray-200 dark:border-judicial-gold/10 hover:border-judicial-gold/30 hover:bg-gray-50/50 dark:hover:bg-judicial-navy/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeTab === "search" ? "bg-judicial-gold text-judicial-dark" : "bg-gray-100 dark:bg-judicial-navy/30 text-gray-700 dark:text-judicial-gold"}`}>
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Smart Research</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Query thousands of Indian and international legal precedents with semantic search. No exact matching required.
              </p>
            </button>

            <button
              onClick={() => setActiveTab("analyze")}
              className={`p-6 text-left rounded-xl border transition-all duration-300 ${
                activeTab === "analyze"
                  ? "bg-judicial-gold/5 border-judicial-gold/50 shadow-md translate-x-1"
                  : "bg-transparent border-gray-200 dark:border-judicial-gold/10 hover:border-judicial-gold/30 hover:bg-gray-50/50 dark:hover:bg-judicial-navy/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeTab === "analyze" ? "bg-judicial-gold text-judicial-dark" : "bg-gray-100 dark:bg-judicial-navy/30 text-gray-700 dark:text-judicial-gold"}`}>
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Document Analysis</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Upload existing contracts to scan for hidden liabilities, missed clauses, and compliance warning flags.
              </p>
            </button>
          </div>

          {/* Dynamic Mockup View (Right) */}
          <div className="lg:col-span-7 flex flex-col bg-gray-50 dark:bg-judicial-navy/20 border border-gray-200 dark:border-judicial-gold/10 rounded-2xl overflow-hidden min-h-[350px] shadow-inner relative">
            {/* Mockup Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-judicial-dark/60 border-b border-gray-200 dark:border-judicial-gold/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="text-xs text-gray-400 font-mono select-none">dastavez-workspace.ai</div>
              <div className="w-10"></div>
            </div>

            {/* Mockup Content */}
            <div className="flex-1 p-5 font-mono text-sm leading-relaxed overflow-y-auto max-h-[400px]">
              {activeTab === "draft" && (
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-judicial-gold border-b border-judicial-gold/15 pb-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span>AI DRAFT GENERATOR: Partnership Deed</span>
                    </div>
                    <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {typingText}
                      <span className="inline-block w-1.5 h-4 bg-judicial-gold animate-pulse ml-0.5" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className="text-xs px-2.5 py-1 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/20 rounded">✓ Compliant</span>
                    <span className="text-xs px-2.5 py-1 bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/20 rounded">★ Clause Approved</span>
                  </div>
                </div>
              )}

              {activeTab === "search" && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-judicial-dark/80 border border-gray-200 dark:border-judicial-gold/25 p-3.5 rounded-lg shadow-sm flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-judicial-gold flex-shrink-0" />
                    <div className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                      "What is the liability threshold under the Indian Contract Act for service breach?"
                    </div>
                  </div>
                  <div className="bg-judicial-gold/5 border border-judicial-gold/20 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-judicial-gold">
                      <Sparkles className="h-4 w-4" />
                      <span>AI ORACLE RESPONSE</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-normal">
                      Under Section 73 of the Indian Contract Act 1872, compensation is due for any loss which naturally arose in the usual course. Remote and indirect loss is excluded.
                    </p>
                    <div className="border-t border-judicial-gold/10 pt-2 text-[11px] text-gray-500 flex flex-wrap gap-2">
                      <span className="bg-white dark:bg-judicial-dark px-2 py-0.5 rounded border dark:border-judicial-gold/10">Supreme Court Citations [2]</span>
                      <span className="bg-white dark:bg-judicial-dark px-2 py-0.5 rounded border dark:border-judicial-gold/10">Hadley v. Baxendale</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analyze" && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-judicial-gold/25 p-6 rounded-lg text-center bg-white dark:bg-judicial-dark/30">
                    <FileText className="h-8 w-8 text-judicial-gold mx-auto mb-2 opacity-80" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">NDA_Draft_v2.pdf uploaded successfully</p>
                  </div>
                  <div className="space-y-2.5">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">CRITICAL FINDINGS (2)</div>
                    <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/20 rounded-lg">
                      <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-red-700 dark:text-red-300">
                        <strong>Indemnity Cap Missing:</strong> Mutual liability limits are undefined. Recommend inserting a standard liability cap.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/20 rounded-lg">
                      <FileCheck className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-yellow-700 dark:text-yellow-300">
                        <strong>Jurisdiction Clash:</strong> Governing law references two conflicting states. Recommend unifying under Delhi Jurisdiction.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Floating Action */}
            <div className="p-4 bg-white dark:bg-judicial-dark/60 border-t border-gray-200 dark:border-judicial-gold/10 flex justify-end">
              <Link to="/chat">
                <Button size="sm" className="bg-judicial-gold hover:bg-judicial-gold/90 text-judicial-dark gap-1 text-xs">
                  Open Workspace <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
