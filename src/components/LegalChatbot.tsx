import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, RefreshCw, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import JusticeIcon from "./JusticeIcon";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
}

// ==========================================
// FAQ QUESTIONS & ANSWERS
// ==========================================
const FAQ_ITEMS = [
  {
    question: "What is Dastavez AI and how does it help Advocates?",
    answer: "Dastavez AI is a premium AI-powered legal intelligence platform. It automates drafting, case analysis, and counter-rebuttal generation, reducing turnaround times from days to hours by leveraging models trained on active statutes and legal precedents."
  },
  {
    question: "What is the difference between a Rent Agreement and a Lease Agreement under Indian Law?",
    answer: "Under the Transfer of Property Act, 1882, a Rent Agreement is typically a short-term license (usually 11 months) to avoid strict tenancy protection laws. A Lease Agreement transfers a property interest, is for longer durations (1+ year), and requires mandatory registration and stamp duty payment."
  },
  {
    question: "How does the Counter Studio sandbox analyze opponent pleadings?",
    answer: "The Counter Studio sandbox parses opponent plaints or claims, identifies key legal grounds, and instantly drafts counter-arguments paired with relevant constitutional/civil precedents (such as Article 14, 19, and 21 jurisprudence)."
  }
];

export function LegalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "Welcome to Dastavez AI Legal Assistant! Select one of the common questions below or ask about our platform to get instant legal information:"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleQuestionSelect = (questionText: string, answerText: string) => {
    if (isTyping) return;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      text: questionText
    };
    setMessages(prev => [...prev, userMsg]);

    // Show typing indicator
    setIsTyping(true);

    // Simulate reply after 1000ms
    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        type: "bot",
        text: answerText
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        text: "Welcome to Dastavez AI Legal Assistant! Select one of the common questions below or ask about our platform to get instant legal information:"
      }
    ]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans-premium select-none">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border cursor-pointer",
            "bg-judicial-gold text-black border-judicial-gold/20 hover:shadow-judicial-gold/30 hover:shadow-lg"
          )}
          aria-label="Open Legal Chatbot"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={cn(
            "w-[360px] sm:w-[390px] h-[580px] max-sm:bottom-4 max-sm:right-4 max-sm:w-[calc(100vw-32px)] max-sm:h-[calc(100vh-80px)] rounded-2xl border flex flex-col shadow-2xl overflow-hidden transition-all duration-300",
            theme === "dark" 
              ? "bg-[#0b0f19]/98 border-judicial-gold/20 text-gray-200 shadow-judicial-gold/5" 
              : "bg-white/98 border-gray-200 text-gray-800 shadow-gray-250"
          )}
          style={{ backdropFilter: "blur(16px)" }}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-judicial-navy to-slate-900 border-b border-gray-200/50 dark:border-judicial-gold/15 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <JusticeIcon className="w-8 h-8" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  Dastavez Law Assistant
                </div>
                <div className="text-[10px] text-gray-300 font-medium">Instant Legal Information</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleReset}
                className="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                title="Restart Chat"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                aria-label="Close Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 select-text">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-2 max-w-[85%]",
                  msg.type === "user" ? "self-end flex-row-reverse" : "self-start"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0",
                  msg.type === "user" 
                    ? "bg-judicial-gold text-black" 
                    : "bg-slate-800 text-judicial-gold border border-judicial-gold/20"
                )}>
                  {msg.type === "user" ? <User className="w-3 h-3" /> : "AI"}
                </div>
                
                {/* Bubble */}
                <div
                  className={cn(
                    "rounded-2xl p-3 text-xs leading-relaxed transition-all duration-200",
                    msg.type === "user"
                      ? "bg-judicial-gold text-black rounded-tr-none font-medium"
                      : theme === "dark"
                        ? "bg-slate-800/80 border border-slate-700/50 text-gray-200 rounded-tl-none"
                        : "bg-gray-100 border border-gray-200 text-gray-800 rounded-tl-none"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-2 self-start max-w-[85%]">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-800 text-judicial-gold border border-judicial-gold/20 shrink-0">
                  AI
                </div>
                <div
                  className={cn(
                    "rounded-2xl p-3 rounded-tl-none flex items-center gap-1.5",
                    theme === "dark" ? "bg-slate-800/80 border border-slate-700/50" : "bg-gray-100 border border-gray-200"
                  )}
                >
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Question Pills (Horizontally Scrollable Row above input bar) */}
          <div className="px-3 py-2 bg-gray-50/50 dark:bg-black/20 border-t border-gray-200/50 dark:border-slate-800/40">
            <div className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1 px-1">Suggested Questions</div>
            <div className="flex overflow-x-auto whitespace-nowrap gap-1.5 scrollbar-none pb-1">
              {FAQ_ITEMS.map((item, idx) => {
                const hasBeenAsked = messages.some(m => m.type === "user" && m.text === item.question);
                if (hasBeenAsked) return null;

                return (
                  <button
                    key={idx}
                    onClick={() => handleQuestionSelect(item.question, item.answer)}
                    disabled={isTyping}
                    className={cn(
                      "inline-block text-left px-2.5 py-1.5 rounded-full text-[10px] font-medium border transition-all duration-200 cursor-pointer shrink-0",
                      isTyping 
                        ? "opacity-50 cursor-not-allowed" 
                        : theme === "dark"
                          ? "bg-slate-900/60 border-slate-800 hover:border-judicial-gold/40 hover:bg-slate-900 text-gray-300 hover:text-white"
                          : "bg-white border-gray-200 hover:border-judicial-gold hover:bg-gray-50 text-gray-600 hover:text-black"
                    )}
                  >
                    {item.question}
                  </button>
                );
              })}
            </div>
          </div>


          {/* Disclaimer Footer */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-black/60 border-t border-gray-200/50 dark:border-slate-800/50 text-[9px] text-gray-400 dark:text-gray-500 text-center select-none font-medium">
            Disclaimer: AI response is for educational/informational purposes.
          </div>
        </div>
      )}
    </div>
  );
}
