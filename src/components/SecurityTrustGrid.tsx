import React from "react";
import { ShieldAlert, ServerCrash, FileDown, Lock } from "lucide-react";

export function SecurityTrustGrid() {
  const cards = [
    {
      icon: <Lock className="h-6 w-6 text-judicial-gold" />,
      title: "Bank-Grade Privacy",
      description: "All uploaded documents and chat histories are protected with AES-256 encryption. Your proprietary files remain strictly yours."
    },
    {
      icon: <ShieldAlert className="h-6 w-6 text-judicial-gold" />,
      title: "Isolated Training Sandbox",
      description: "Dastavez AI keeps your records fully sandboxed. We never train public base models on your queries or client data."
    },
    {
      icon: <FileDown className="h-6 w-6 text-judicial-gold" />,
      title: "Instant PDF & Word Exports",
      description: "Once your drafts are refined, export them instantly in clean DOCX or PDF format, formatted perfectly for court filing."
    }
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-judicial-navy/10 border-t border-gray-200/60 dark:border-judicial-gold/10 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif-legal mb-4 text-gray-900 dark:text-white">
            Enterprise Security. <span className="text-judicial-gold">Legal Confidence.</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
            Protecting private client information is a legal duty. Dastavez AI holds compliance and encryption to institutional standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-judicial-navy/25 border border-gray-200/80 dark:border-judicial-gold/10 p-6 sm:p-8 rounded-xl shadow-sm hover:border-judicial-gold/30 hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-judicial-gold/10 flex items-center justify-center mb-5 group-hover:bg-judicial-gold/20 transition-colors">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-judicial-gold transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
