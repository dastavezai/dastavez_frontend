import React from "react";
import { ShieldCheck, FileCheck2, Timer } from "lucide-react";

export function StatsBanner() {
  const stats = [
    {
      icon: <FileCheck2 className="h-6 w-6 text-judicial-gold" />,
      value: "50,000+",
      label: "Documents Drafted",
      desc: "Court-ready contracts, deeds & templates"
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-judicial-gold" />,
      value: "99.2%",
      label: "Accuracy Rate",
      desc: "Verified legal clause compliance"
    },
    {
      icon: <Timer className="h-6 w-6 text-judicial-gold" />,
      value: "60+",
      label: "Hours Saved / Mo",
      desc: "Average time saved per legal professional"
    }
  ];

  return (
    <section className="py-12 bg-gray-50/50 dark:bg-judicial-navy/10 border-y border-gray-200/60 dark:border-judicial-gold/10 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-6 bg-white dark:bg-judicial-navy/20 rounded-xl border border-gray-100 dark:border-judicial-gold/5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex-shrink-0 p-3 bg-judicial-gold/10 rounded-lg">
                {stat.icon}
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-judicial-gold uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
