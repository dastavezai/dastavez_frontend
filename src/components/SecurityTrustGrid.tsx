import React from "react";
import { ShieldAlert, ServerCrash, FileDown, Lock } from "lucide-react";

export function SecurityTrustGrid() {
  const cards = [
    {
      icon: <Lock className="h-6 w-6 text-[var(--accent-primary)]" />,
      title: "Bank-Grade Privacy",
      description: "All uploaded documents and chat histories are protected with AES-256 encryption. Your proprietary files remain strictly yours."
    },
    {
      icon: <ShieldAlert className="h-6 w-6 text-[var(--accent-primary)]" />,
      title: "Isolated Training Sandbox",
      description: "Dastavez AI keeps your records fully sandboxed. We never train public base models on your queries or client data."
    },
    {
      icon: <FileDown className="h-6 w-6 text-[var(--accent-primary)]" />,
      title: "Instant PDF & Word Exports",
      description: "Once your drafts are refined, export them instantly in clean DOCX or PDF format, formatted perfectly for court filing."
    }
  ];

  return (
    <section className="py-16 bg-[var(--bg-primary)] border-t border-[var(--border-color)] transition-colors duration-300">
      {/* Style block for gold border animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes goldBorderAnimationSecurity {
          0%, 100% {
            border-color: var(--border-color);
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }
          50% {
            border-color: rgba(214, 171, 85, 0.95);
            box-shadow: 0 0 16px rgba(214, 171, 85, 0.35);
          }
        }
        
        .gold-animate-hover-security {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .gold-animate-hover-security:hover {
          animation: goldBorderAnimationSecurity 2s infinite ease-in-out;
          transform: translateY(-4px);
        }
      `}} />

      <div className="container mx-auto px-4 font-body-premium">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif-legal mb-4 text-[var(--text-primary)]">
            Enterprise Security. <span className="text-[var(--accent-primary)]">Legal Confidence.</span>
          </h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto text-sm sm:text-base">
            Protecting private client information is a legal duty. Dastavez AI holds compliance and encryption to institutional standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] p-6 sm:p-8 rounded-xl shadow-sm transition-all duration-300 group cursor-pointer gold-animate-hover-security"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--accent-primary)]/20 transition-colors">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 font-serif-legal">
                {card.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
