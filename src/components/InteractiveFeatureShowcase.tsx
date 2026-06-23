import React, { useState, useEffect } from "react";
import { ArrowRight, Shield, Home, Briefcase, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Finding {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  description: string;
}

interface Preset {
  segment: string;
  rating: string;
  ratingType: "low" | "medium" | "high";
  findings: Finding[];
}

const presets: Record<"constitutional" | "rent" | "noncompete", Preset> = {
  constitutional: {
    segment: "The Petitioner claims that unequal municipal fund distribution for heritage zones violates Article 14 due to arbitrary classification.",
    rating: "Strong Rebuttal",
    ratingType: "low",
    findings: [
      {
        type: "success",
        title: "Reasonable Classification Met",
        description: "Heritage conservation has a rational nexus to cultural preservation objectives."
      },
      {
        type: "success",
        title: "Intelligible Differentia Sustained",
        description: "Regional financial allocations are valid if based on public interest objectives."
      }
    ]
  },
  rent: {
    segment: "The Tenant sublet premises without consent. The Landlord claims repossession and penal rent as liquidated damages.",
    rating: "Modest Rebuttal",
    ratingType: "medium",
    findings: [
      {
        type: "danger",
        title: "No Forfeiture Notice Served",
        description: "Under Sec 111(g) Transfer of Property Act, a formal quit notice is mandatory."
      },
      {
        type: "warning",
        title: "Liquidated Damages Contested",
        description: "Arbitrary penal rent without proof of actual loss violates Contract Act Section 74."
      }
    ]
  },
  noncompete: {
    segment: "The Employer seeks an injunction to enforce a 12-month post-employment non-compete clause against the employee.",
    rating: "Complete Defeat (Void)",
    ratingType: "high",
    findings: [
      {
        type: "danger",
        title: "Restraint of Trade (Section 27 Void)",
        description: "Post-employment non-competes are void in India under Contract Act Section 27."
      },
      {
        type: "success",
        title: "Severability Defense Valid",
        description: "The invalid non-compete covenant can be isolated from the rest of the agreement."
      }
    ]
  }
};

export function InteractiveFeatureShowcase() {
  const [activeTab, setActiveTab] = useState<"constitutional" | "rent" | "noncompete">("constitutional");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const getRatingBadgeClass = (ratingType: "low" | "medium" | "high") => {
    switch (ratingType) {
      case "low":
        return "bg-[rgba(214,171,85,0.12)] text-[#d6ab55] border border-[#d6ab55]/20 dark:bg-[#d6ab55]/10 dark:text-[#d6ab55] dark:border-[#d6ab55]/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30";
      case "high":
        return "bg-red-500/10 text-red-600 border border-red-500/20 dark:text-red-400 dark:border-red-500/30";
    }
  };

  const getFindingStyles = (type: "success" | "warning" | "danger" | "info") => {
    switch (type) {
      case "success":
        return {
          card: "bg-green-50/70 border-l-green-500 text-green-900 hover:bg-green-100/70 dark:bg-[#0b1c11] dark:border-l-[#22c55e] dark:text-[#22c55e] dark:hover:bg-[#0d2a1d]/90",
          icon: "text-green-600 dark:text-[#22c55e]"
        };
      case "warning":
        return {
          card: "bg-yellow-50/70 border-l-yellow-500 text-yellow-900 hover:bg-yellow-100/70 dark:bg-[#20150b] dark:border-l-[#eab308] dark:text-[#eab308] dark:hover:bg-[#2b1f13]/90",
          icon: "text-yellow-600 dark:text-[#eab308]"
        };
      case "danger":
        return {
          card: "bg-red-50/70 border-l-red-500 text-red-900 hover:bg-red-100/70 dark:bg-[#200b0b] dark:border-l-[#ef4444] dark:text-[#ef4444] dark:hover:bg-[#2d1212]/90",
          icon: "text-red-600 dark:text-[#ef4444]"
        };
      case "info":
      default:
        return {
          card: "bg-blue-50/70 border-l-blue-500 text-blue-900 hover:bg-blue-100/70 dark:bg-slate-900/40 dark:border-l-blue-600 dark:text-blue-100 dark:hover:bg-slate-900/60",
          icon: "text-blue-600 dark:text-blue-400"
        };
    }
  };

  return (
    <section className="py-20 bg-[var(--bg-primary)] transition-colors duration-300" id="interactive-features">
      <div className="container mx-auto px-4 font-body-premium">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-3 py-1.5 rounded-full mb-3 inline-block">
            Interactive Rebuttal Sandbox
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif-legal mb-4 text-[var(--text-primary)]">
            Dastavez <span className="text-[var(--accent-primary)]">Counter Studio</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-base">
            Experience our powerful legal AI tools through interactive demos. Click any of the three topics below to automatically run our precedent-mapping algorithms and view outlines.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
            <button
              onClick={() => setActiveTab("constitutional")}
              className={`w-full p-4 text-left rounded-xl border-t border-r border-b border-l-[6px] transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-3.5 ${
                activeTab === "constitutional"
                  ? "bg-green-100 border-l-green-600 border-t-slate-200 border-r-slate-200 border-b-slate-200 text-green-900 shadow-md dark:bg-[#0d2a1d] dark:border-l-[#22c55e] dark:border-t-transparent dark:border-r-transparent dark:border-b-transparent dark:text-[#22c55e]"
                  : "bg-green-50/50 border-l-green-500 border-t-slate-200 border-r-slate-200 border-b-slate-200 text-green-900/90 hover:bg-green-100/70 dark:bg-[#061c12] dark:border-l-[#22c55e]/70 dark:border-t-transparent dark:border-r-transparent dark:border-b-transparent dark:text-[#22c55e]/90"
              }`}
            >
              <Shield className="h-5 w-5 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium leading-snug">
                <strong className="font-bold">Constitutional Law</strong> – Scan state Article 14 challenges.
              </p>
            </button>

            <button
              onClick={() => setActiveTab("rent")}
              className={`w-full p-4 text-left rounded-xl border-t border-r border-b border-l-[6px] transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-3.5 ${
                activeTab === "rent"
                  ? "bg-yellow-100 border-l-yellow-600 border-t-slate-200 border-r-slate-200 border-b-slate-200 text-yellow-900 shadow-md dark:bg-[#221a0f] dark:border-l-[#eab308] dark:border-t-transparent dark:border-r-transparent dark:border-b-transparent dark:text-[#eab308]"
                  : "bg-yellow-50/50 border-l-yellow-500 border-t-slate-200 border-r-slate-200 border-b-slate-200 text-yellow-900/90 hover:bg-yellow-100/70 dark:bg-[#131008] dark:border-l-[#eab308]/70 dark:border-t-transparent dark:border-r-transparent dark:border-b-transparent dark:text-[#eab308]/90"
              }`}
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium leading-snug">
                <strong className="font-bold">Rent Breach</strong> – Audit notices & repossession forfeiture.
              </p>
            </button>

            <button
              onClick={() => setActiveTab("noncompete")}
              className={`w-full p-4 text-left rounded-xl border-t border-r border-b border-l-[6px] transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-3.5 ${
                activeTab === "noncompete"
                  ? "bg-red-100 border-l-red-600 border-t-slate-200 border-r-slate-200 border-b-slate-200 text-red-900 shadow-md dark:bg-[#2c1212] dark:border-l-[#ef4444] dark:border-t-transparent dark:border-r-transparent dark:border-b-transparent dark:text-[#ef4444]"
                  : "bg-red-50/50 border-l-red-500 border-t-slate-200 border-r-slate-200 border-b-slate-200 text-red-900/90 hover:bg-red-100/70 dark:bg-[#180b0b] dark:border-l-[#ef4444]/70 dark:border-t-transparent dark:border-r-transparent dark:border-b-transparent dark:text-[#ef4444]/90"
              }`}
            >
              <Briefcase className="h-5 w-5 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium leading-snug">
                <strong className="font-bold">Non-Compete</strong> – Audit restraint covenants under Section 27.
              </p>
            </button>
          </div>

          <div className="lg:col-span-7 flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden h-[440px] shadow-lg relative">
            <div className="flex items-center justify-between px-5 py-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[var(--text-primary)]">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--accent-primary)] dark:text-slate-350 flex-shrink-0" />
                <span>AI Rebuttal Outline & Citations (Auto-Generated)</span>
              </div>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-[var(--accent-primary)]/20 border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
              )}
            </div>

            <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
                  <div className="w-8 h-8 border-3 border-[var(--accent-primary)]/20 border-t-[var(--accent-primary)] rounded-full animate-spin mb-3"></div>
                  <p className="text-xs font-mono">Running precedent-mapping algorithms...</p>
                </div>
              ) : (
                <>
                  <div className="bg-[var(--bg-secondary)] border-l-4 border-[var(--accent-primary)] rounded-r-lg p-4 shadow-sm dark:bg-slate-900/40 dark:border-l-[#d6ab55]">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                      Document Segment Under Review
                    </span>
                    <div className="text-xs sm:text-sm italic text-[var(--text-secondary)] leading-relaxed">
                      "{presets[activeTab].segment}"
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-[var(--bg-secondary)] p-3 px-4 rounded-lg border border-[var(--border-color)]">
                    <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">Rebuttal Strength Rating</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getRatingBadgeClass(presets[activeTab].ratingType)}`}>
                      {presets[activeTab].rating}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {presets[activeTab].findings.map((finding, idx) => {
                      const styles = getFindingStyles(finding.type);
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 p-3.5 rounded-lg border-l-4 transition-all duration-300 transform hover:scale-[1.02] ${styles.card}`}
                        >
                          <Info className={`h-4.5 w-4.5 mt-0.5 flex-shrink-0 ${styles.icon}`} />
                          <div className="text-xs leading-relaxed">
                            <strong className="font-bold">{finding.title}</strong> – {finding.description}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] flex justify-end">
              <Link to="/chat">
                <Button size="sm" className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white gap-1 text-xs">
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
