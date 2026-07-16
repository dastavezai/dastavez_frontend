import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, RefreshCw, Send, Calendar, PhoneCall, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { useLocation } from "react-router-dom";
import JusticeIcon from "./JusticeIcon";

interface Message {
  id: string;
  type: "user" | "bot" | "summary" | "system";
  text: string;
  options?: string[];
  recommendedServiceId?: number;
}

interface Lead {
  service: string;
  fullName: string;
  phone: string;
  email: string;
  jurisdiction: string;
  requirementSummary: string;
  createdAt: string;
}

const SERVICES = [
  { id: 1, name: "Legal Document Drafting", desc: "Dastavez AI can assist with drafting professional legal documents tailored to your requirements." },
  { id: 2, name: "Business & Startup Registration", desc: "Dastavez AI can assist with company registration, startup setup, and compliance requirements." },
  { id: 3, name: "Contracts & Agreements", desc: "Dastavez AI can assist with preparing and reviewing contracts and agreements." },
  { id: 4, name: "Trademark & Intellectual Property", desc: "Dastavez AI can assist with protecting your intellectual property." },
  { id: 5, name: "Legal Consultation", desc: "Dastavez AI can connect you with the appropriate legal professional." },
  { id: 6, name: "Not Sure – Help Me Choose", desc: "I'm here to help guide you to the right service." }
];

// Receptionist Avatar
const CustomAvatar = () => (
  <div className="relative w-7 h-7 rounded-full flex items-center justify-center bg-black border border-judicial-gold/45 shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.15)] select-none">
    <img src="/favicon.svg" className="w-5 h-5 object-contain" alt="Dastavez Logo" />
    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-black animate-pulse" />
  </div>
);

export function LegalChatbot() {
  const location = useLocation();
  const currentPath = location.pathname;

  const allowedPaths = [
    "/",
    "/use-cases",
    "/features",
    "/case-studies",
    "/smart-analysis",
    "/about",
    "/contact",
    "/terms-and-conditions",
    "/privacy-policy",
    "/disclaimer",
    "/cookie-policy"
  ];

  const isAllowed = allowedPaths.includes(currentPath) || currentPath === "/blog" || currentPath.startsWith("/blog/");

  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Receptionist States
  const [stage, setStage] = useState<"welcome" | "escalation_prompt" | "service_details" | "lead_collection" | "completed">("welcome");
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  
  // Backup state for escalation recovery
  const [preEscalationState, setPreEscalationState] = useState<{
    stage: "welcome" | "escalation_prompt" | "service_details" | "lead_collection" | "completed";
    serviceId: number | null;
    questionIdx: number;
    answers: { [key: string]: string };
  } | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "Welcome to Dastavez AI.\n\nI'm Dastavez Help, your virtual legal receptionist.\n\nI'm here to help you find the right legal solution and connect you with the appropriate service.\n\nPlease select the service you need today."
    }
  ]);

  const scrollToBottom = () => {
    try {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (e) {
      console.warn("[Dastavez Help] Smooth scroll failed, trying fallback:", e);
      try {
        messagesEndRef.current?.scrollIntoView();
      } catch (err) {
        // ignore fallback error
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  // Escalate checking helper
  const checkEscalation = (text: string): boolean => {
    const query = text.toLowerCase();
    const keywords = [
      "draft a document",
      "draft document",
      "review a contract",
      "review contract",
      "explain a legal concept",
      "explain legal",
      "legal research",
      "research legal",
      "analyze a legal document",
      "analyze document",
      "analyze legal"
    ];
    return keywords.some(keyword => query.includes(keyword));
  };

  // Bot response helper with typing simulation
  const addBotMessage = (text: string, options?: string[], delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          type: "bot",
          text,
          options
        }
      ]);
    }, delay);
  };

  // Validation
  const validatePhone = (phone: string): boolean => {
    const regex = /^\+?[0-9\s-]{10,15}$/;
    return regex.test(phone.replace(/\s+/g, ""));
  };

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Restart receptionist flow
  const handleReset = () => {
    setStage("welcome");
    setServiceId(null);
    setQuestionIdx(0);
    setAnswers({});
    setIsTyping(false);
    setInputText("");
    setPreEscalationState(null);
    setMessages([
      {
        id: "welcome",
        type: "bot",
        text: "Welcome to Dastavez AI.\n\nI'm Dastavez Help, your virtual legal receptionist.\n\nI'm here to help you find the right legal solution and connect you with the appropriate service.\n\nPlease select the service you need today."
      }
    ]);
  };

  // Welcome Service Option select
  const handleServiceSelect = (id: number) => {
    if (isTyping) return;
    const service = SERVICES.find(s => s.id === id);
    if (!service) return;

    // Display user selection
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: "user",
        text: service.name
      }
    ]);

    setServiceId(id);
    setStage("service_details");
    setQuestionIdx(0);

    // Initial service explanation & first question
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let firstQuestion = "";
      let options: string[] | undefined = undefined;

      switch (id) {
        case 1: // Drafting
          firstQuestion = "What type of document do you need?";
          break;
        case 2: // Business
          firstQuestion = "What type of business are you starting?";
          options = ["Private Limited", "LLP", "One Person Company", "Partnership", "Sole Proprietorship", "Other"];
          break;
        case 3: // Contracts
          firstQuestion = "What type of contract or agreement do you need?";
          break;
        case 4: // Trademark
          firstQuestion = "Do you need Trademark, Copyright, Patent, or other IP assistance?";
          options = ["Trademark", "Copyright", "Patent", "Other"];
          break;
        case 5: // Consultation
          firstQuestion = "What category best describes your issue?";
          options = ["Corporate Law", "Property Law", "Employment Law", "Family Law", "Consumer Dispute", "Other"];
          break;
        case 6: // Help Me Choose
          firstQuestion = "Please briefly describe what you need help with.";
          break;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `bot-expl-${Date.now()}`,
          type: "bot",
          text: service.desc
        },
        {
          id: `bot-q-${Date.now()}`,
          type: "bot",
          text: firstQuestion,
          options
        }
      ]);
    }, 800);
  };

  // Core dialog handling
  const handleUserResponse = (text: string) => {
    if (!text.trim() || isTyping) return;

    // Add User Bubble
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: "user",
        text
      }
    ]);

    // Check Escalation
    if (checkEscalation(text)) {
      setPreEscalationState({
        stage,
        serviceId,
        questionIdx,
        answers
      });
      setStage("escalation_prompt");
      addBotMessage(
        "I can connect you with Dastavez AI's Legal Assistant for more detailed assistance.",
        ["Continue with Legal Assistant", "Continue with Dastavez Help"],
        800
      );
      return;
    }

    // Step Processing
    if (stage === "service_details" && serviceId !== null) {
      processServiceResponse(text);
    } else if (stage === "lead_collection") {
      processLeadResponse(text);
    } else if (stage === "escalation_prompt") {
      processEscalationResponse(text);
    }
  };

  // Escalation flow choices
  const processEscalationResponse = (choice: string) => {
    if (choice.toLowerCase().includes("assistant")) {
      addBotMessage("Redirecting you to our Advanced AI Legal Assistant...", undefined, 600);
      setTimeout(() => {
        window.location.href = "/chat";
      }, 1500);
    } else {
      // Restore pre-escalation state
      if (preEscalationState) {
        setStage(preEscalationState.stage);
        setServiceId(preEscalationState.serviceId);
        setQuestionIdx(preEscalationState.questionIdx);
        setAnswers(preEscalationState.answers);
        setPreEscalationState(null);
        addBotMessage("Understood. Let's resume your receptionist booking. What was your previous requirement details?", undefined, 800);
      } else {
        handleReset();
      }
    }
  };

  // Service Step State Machine
  const processServiceResponse = (response: string) => {
    const nextAnswers = { ...answers };
    
    switch (serviceId) {
      case 1: // Document Drafting
        if (questionIdx === 0) {
          nextAnswers.docType = response;
          setAnswers(nextAnswers);
          setQuestionIdx(1);
          addBotMessage("Which state or jurisdiction does this relate to?");
        } else if (questionIdx === 1) {
          nextAnswers.jurisdiction = response;
          setAnswers(nextAnswers);
          setQuestionIdx(2);
          addBotMessage("Please briefly describe your requirements.");
        } else if (questionIdx === 2) {
          nextAnswers.reqDetails = response;
          setAnswers(nextAnswers);
          // Transition to Leads
          setStage("lead_collection");
          setQuestionIdx(0);
          addBotMessage("To proceed, may I have your Full Name?");
        }
        break;

      case 2: // Business Registration
        if (questionIdx === 0) {
          nextAnswers.businessType = response;
          setAnswers(nextAnswers);
          setQuestionIdx(1);
          addBotMessage("What registration or compliance assistance do you need?");
        } else if (questionIdx === 1) {
          nextAnswers.regAssistance = response;
          setAnswers(nextAnswers);
          setQuestionIdx(2);
          addBotMessage("Which state or jurisdiction is involved?");
        } else if (questionIdx === 2) {
          nextAnswers.jurisdiction = response;
          setAnswers(nextAnswers);
          // Transition to Leads
          setStage("lead_collection");
          setQuestionIdx(0);
          addBotMessage("To proceed, may I have your Full Name?");
        }
        break;

      case 3: // Contracts & Agreements
        if (questionIdx === 0) {
          nextAnswers.contractType = response;
          setAnswers(nextAnswers);
          setQuestionIdx(1);
          addBotMessage("Who are the parties involved?");
        } else if (questionIdx === 1) {
          nextAnswers.parties = response;
          setAnswers(nextAnswers);
          setQuestionIdx(2);
          addBotMessage("Please briefly describe your requirements.");
        } else if (questionIdx === 2) {
          nextAnswers.reqDetails = response;
          setAnswers(nextAnswers);
          // Transition to Leads
          setStage("lead_collection");
          setQuestionIdx(0);
          addBotMessage("To proceed, may I have your Full Name?");
        }
        break;

      case 4: // Trademark & IP
        if (questionIdx === 0) {
          nextAnswers.ipType = response;
          setAnswers(nextAnswers);
          setQuestionIdx(1);
          addBotMessage("What is the name of the brand, business, product, or creative work?");
        } else if (questionIdx === 1) {
          nextAnswers.brandName = response;
          setAnswers(nextAnswers);
          setQuestionIdx(2);
          addBotMessage("Which jurisdiction is involved?");
        } else if (questionIdx === 2) {
          nextAnswers.jurisdiction = response;
          setAnswers(nextAnswers);
          // Transition to Leads
          setStage("lead_collection");
          setQuestionIdx(0);
          addBotMessage("To proceed, may I have your Full Name?");
        }
        break;

      case 5: // Consultation
        if (questionIdx === 0) {
          nextAnswers.issueCategory = response;
          setAnswers(nextAnswers);
          setQuestionIdx(1);
          addBotMessage("How urgent is the matter?", ["Immediate", "Within 24 Hours", "This Week", "Not Urgent"]);
        } else if (questionIdx === 1) {
          nextAnswers.urgency = response;
          setAnswers(nextAnswers);
          setQuestionIdx(2);
          addBotMessage("Which state or jurisdiction does it relate to?");
        } else if (questionIdx === 2) {
          nextAnswers.jurisdiction = response;
          setAnswers(nextAnswers);
          // Transition to Leads
          setStage("lead_collection");
          setQuestionIdx(0);
          addBotMessage("To proceed, may I have your Full Name?");
        }
        break;

      case 6: // Help Me Choose
        if (questionIdx === 0) {
          nextAnswers.helpText = response;
          setAnswers(nextAnswers);
          setQuestionIdx(1);
          addBotMessage("Which state or jurisdiction is involved?");
        } else if (questionIdx === 1) {
          nextAnswers.jurisdiction = response;
          setAnswers(nextAnswers);
          
          // AI Recommendation Logic based on Keywords
          const query = (nextAnswers.helpText || "").toLowerCase();
          let recId = 5; // Default to Legal Consultation
          
          if (query.includes("draft") || query.includes("create") || query.includes("write") || query.includes("make")) {
            recId = 1;
          } else if (query.includes("register") || query.includes("incorporate") || query.includes("company") || query.includes("startup") || query.includes("llp")) {
            recId = 2;
          } else if (query.includes("contract") || query.includes("agreement") || query.includes("nda") || query.includes("lease")) {
            recId = 3;
          } else if (query.includes("trademark") || query.includes("copyright") || query.includes("patent") || query.includes("brand")) {
            recId = 4;
          }

          const recommendedService = SERVICES.find(s => s.id === recId)?.name || "Legal Consultation";
          setQuestionIdx(2);
          addBotMessage(
            `Based on your description, I recommend our **${recommendedService}** service. Shall we proceed with this?`,
            ["Yes, proceed", "No, see other options"]
          );
        } else if (questionIdx === 2) {
          if (response.toLowerCase().includes("yes")) {
            // Determine recommended ID
            const query = (nextAnswers.helpText || "").toLowerCase();
            let recId = 5;
            if (query.includes("draft") || query.includes("create") || query.includes("write")) recId = 1;
            else if (query.includes("register") || query.includes("incorporate") || query.includes("company") || query.includes("startup")) recId = 2;
            else if (query.includes("contract") || query.includes("agreement") || query.includes("nda")) recId = 3;
            else if (query.includes("trademark") || query.includes("copyright") || query.includes("patent")) recId = 4;

            // Map answers
            nextAnswers.reqDetails = nextAnswers.helpText;
            setAnswers(nextAnswers);
            setServiceId(recId);

            // Transition to Leads
            setStage("lead_collection");
            setQuestionIdx(0);
            addBotMessage("Great choice. To proceed, may I have your Full Name?");
          } else {
            // See other options
            setStage("welcome");
            setServiceId(null);
            setQuestionIdx(0);
            addBotMessage("Please select from our available services:", SERVICES.filter(s => s.id !== 6).map(s => s.name));
          }
        }
        break;
    }
  };

  // Lead capture validation steps
  const processLeadResponse = (response: string) => {
    const nextAnswers = { ...answers };

    if (questionIdx === 0) {
      nextAnswers.fullName = response;
      setAnswers(nextAnswers);
      setQuestionIdx(1);
      addBotMessage(`Thank you, ${response}. What is your Phone Number?`);
    } else if (questionIdx === 1) {
      if (!validatePhone(response)) {
        addBotMessage("That phone number doesn't seem valid. Please enter a valid number (e.g. 10 digits):");
        return;
      }
      nextAnswers.phone = response;
      setAnswers(nextAnswers);
      setQuestionIdx(2);
      addBotMessage("And your Email Address?");
    } else if (questionIdx === 2) {
      if (!validateEmail(response)) {
        addBotMessage("That email address doesn't seem valid. Please enter a valid email address:");
        return;
      }
      nextAnswers.email = response;
      const finalAnswers = { ...nextAnswers, email: response };
      setAnswers(finalAnswers);
      
      // Save Lead & Complete
      saveLeadData(finalAnswers);
    }
  };

  // Storage / Completion trigger
  const saveLeadData = async (finalAnswers: { [key: string]: string }) => {
    setIsTyping(true);
    
    // Construct requirement summary text
    let reqSummary = "";
    const sName = SERVICES.find(s => s.id === serviceId)?.name || "General";
    
    if (serviceId === 1) {
      reqSummary = `Wants document drafting for: "${finalAnswers.docType}". Details: "${finalAnswers.reqDetails}"`;
    } else if (serviceId === 2) {
      reqSummary = `Starting business: "${finalAnswers.businessType}". Assistance needed: "${finalAnswers.regAssistance}"`;
    } else if (serviceId === 3) {
      reqSummary = `Preparing contract: "${finalAnswers.contractType}". Parties: "${finalAnswers.parties}". Details: "${finalAnswers.reqDetails}"`;
    } else if (serviceId === 4) {
      reqSummary = `IP type: "${finalAnswers.ipType}". Brand name: "${finalAnswers.brandName}"`;
    } else if (serviceId === 5) {
      reqSummary = `Consultation issue: "${finalAnswers.issueCategory}". Urgency: "${finalAnswers.urgency}"`;
    } else {
      reqSummary = `Unsure category help. Description: "${finalAnswers.helpText}"`;
    }

    const leadObject: Lead = {
      service: sName,
      fullName: finalAnswers.fullName || "",
      phone: finalAnswers.phone || "",
      email: finalAnswers.email || "",
      jurisdiction: finalAnswers.jurisdiction || "N/A",
      requirementSummary: reqSummary,
      createdAt: new Date().toISOString()
    };

    // Attempt Server Sync
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadObject)
      });
      console.log("[Dastavez Help] Lead API post status:", response.status);
    } catch (e) {
      console.warn("[Dastavez Help] Backend unreachable. Saving lead locally as backup.");
      // Save locally
      try {
        const stored = localStorage.getItem("dastavez_offline_leads");
        const list = stored ? JSON.parse(stored) : [];
        list.push(leadObject);
        localStorage.setItem("dastavez_offline_leads", JSON.stringify(list));
      } catch (err) {
        console.error("[Dastavez Help] Storage write failed:", err);
      }
    }

    // Success Screen
    setTimeout(() => {
      setIsTyping(false);
      setStage("completed");
      setMessages(prev => [
        ...prev,
        {
          id: `summary-${Date.now()}`,
          type: "summary",
          text: "" // handled customly in message renderer
        }
      ]);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleUserResponse(inputText);
      setInputText("");
    }
  };

  if (!isAllowed) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans-premium select-none">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => {
            console.log("[Dastavez Help] Opening receptionist chatbot.");
            setIsOpen(true);
          }}
          className={cn(
            "p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border cursor-pointer",
            "bg-[#0d0f17] text-judicial-gold border-judicial-gold/30 hover:shadow-judicial-gold/25 hover:shadow-lg"
          )}
          aria-label="Open Dastavez Help"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={cn(
            "w-[370px] sm:w-[400px] h-[600px] max-sm:bottom-4 max-sm:right-4 max-sm:w-[calc(100vw-32px)] max-sm:h-[calc(100vh-80px)] rounded-2xl border flex flex-col shadow-2xl overflow-hidden transition-all duration-300",
            theme === 'dark' 
              ? "bg-[#07090e]/98 border-judicial-gold/20 text-gray-200 shadow-judicial-gold/5" 
              : "bg-white border-gray-200 text-gray-800 shadow-lg"
          )}
          style={{ backdropFilter: "blur(16px)" }}
        >
          {/* Header */}
          <div className={cn(
            "p-4 flex items-center justify-between select-none",
            theme === 'dark' 
              ? "bg-gradient-to-r from-[#0d0f17] to-slate-950 border-b border-judicial-gold/15" 
              : "bg-gray-50 border-b border-gray-200"
          )}>
            <div className="flex items-center gap-2.5">
              <CustomAvatar />
              <div>
                <div className={cn(
                  "font-bold text-sm flex items-center gap-1.5 font-display-premium",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}>
                  Dastavez Help
                </div>
                <div className={cn(
                  "text-[10px] font-medium",
                  theme === 'dark' ? "text-gray-400" : "text-gray-500"
                )}>
                  Virtual Legal Receptionist
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleReset}
                className={cn(
                  "p-1.5 rounded transition-colors cursor-pointer border-none bg-transparent",
                  theme === 'dark' ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-900"
                )}
                title="Restart Request"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className={cn(
                  "p-1.5 rounded transition-colors cursor-pointer border-none bg-transparent",
                  theme === 'dark' ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-900"
                )}
                aria-label="Close Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-gray-800 select-text">
            {messages.map((msg) => {
              if (msg.type === "summary") {
                const sName = SERVICES.find(s => s.id === serviceId)?.name || "General";
                let reqSummary = "";
                if (serviceId === 1) {
                  reqSummary = `Drafting: ${answers.docType}. Requirements: ${answers.reqDetails}`;
                } else if (serviceId === 2) {
                  reqSummary = `Business setup: ${answers.businessType}. Scope: ${answers.regAssistance}`;
                } else if (serviceId === 3) {
                  reqSummary = `Contract: ${answers.contractType}. Parties: ${answers.parties}. Details: ${answers.reqDetails}`;
                } else if (serviceId === 4) {
                  reqSummary = `IP protect: ${answers.ipType} of brand "${answers.brandName}"`;
                } else if (serviceId === 5) {
                  reqSummary = `Consultation issue: ${answers.issueCategory}. Urgency: ${answers.urgency}`;
                } else {
                  reqSummary = `Help choose. Description: ${answers.helpText}`;
                }

                return (
                  <div key={msg.id} className="w-full space-y-4 self-center max-w-[95%]">
                    {/* Summary Card */}
                    <div className={cn(
                      "rounded-2xl p-5 border shadow-lg space-y-3 font-body-premium",
                      theme === 'dark' ? "border-judicial-gold/25 bg-[#0a0c12]/90" : "border-gray-200 bg-gray-50"
                    )}>
                      <div className="text-center font-bold text-xs uppercase tracking-widest text-judicial-gold border-b border-judicial-gold/15 pb-2">
                        Client Summary
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className={cn("flex justify-between gap-2 border-b py-1", theme === 'dark' ? "border-white/5" : "border-gray-200")}>
                          <span className={theme === 'dark' ? "text-gray-400 font-medium" : "text-gray-500 font-medium"}>Name:</span>
                          <span className={cn("font-semibold text-right", theme === 'dark' ? "text-white" : "text-gray-900")}>{answers.fullName}</span>
                        </div>
                        <div className={cn("flex justify-between gap-2 border-b py-1", theme === 'dark' ? "border-white/5" : "border-gray-200")}>
                          <span className={theme === 'dark' ? "text-gray-400 font-medium" : "text-gray-500 font-medium"}>Selected Service:</span>
                          <span className={cn("font-semibold text-right", theme === 'dark' ? "text-white" : "text-gray-900")}>{sName}</span>
                        </div>
                        <div className={cn("flex justify-between gap-2 border-b py-1", theme === 'dark' ? "border-white/5" : "border-gray-200")}>
                          <span className={theme === 'dark' ? "text-gray-400 font-medium" : "text-gray-500 font-medium"}>State/Jurisdiction:</span>
                          <span className={cn("font-semibold text-right", theme === 'dark' ? "text-white" : "text-gray-900")}>{answers.jurisdiction || "N/A"}</span>
                        </div>
                        <div className={cn("flex flex-col gap-1 border-b py-1", theme === 'dark' ? "border-white/5" : "border-gray-200")}>
                          <span className={theme === 'dark' ? "text-gray-400 font-medium" : "text-gray-500 font-medium"}>Requirement Summary:</span>
                          <span className={cn("text-[11px] leading-normal", theme === 'dark' ? "text-gray-300" : "text-gray-700")}>{reqSummary}</span>
                        </div>
                        <div className="flex flex-col gap-1 py-1">
                          <span className={theme === 'dark' ? "text-gray-400 font-medium" : "text-gray-500 font-medium"}>Contact Details:</span>
                          <span className="text-judicial-gold font-semibold">{answers.phone} | {answers.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CustomAvatar />
                      <div className={cn(
                        "rounded-2xl p-3 rounded-tl-none text-xs leading-relaxed",
                        theme === 'dark' ? "bg-slate-900 border border-slate-800/50 text-gray-200" : "bg-gray-100 border border-gray-200 text-gray-800"
                      )}>
                        Thank you for sharing your requirements. Our team will review your details and assist you with the next steps.
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 pt-2 max-w-[280px] mx-auto">
                      <button 
                        onClick={() => {
                          window.location.href = "/contact";
                        }}
                        className="w-full py-2 px-4 rounded-xl border border-judicial-gold bg-judicial-gold/10 hover:bg-judicial-gold hover:text-black font-semibold text-xs tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Schedule Consultation
                      </button>
                      <button 
                        onClick={() => {
                          alert("Callback request registered. Our support team will dial you shortly!");
                        }}
                        className={cn(
                          "w-full py-2 px-4 rounded-xl border font-semibold text-xs tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5",
                          theme === 'dark' ? "border-white/20 bg-white/5 hover:bg-white/10 text-gray-300" : "border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700"
                        )}
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-gray-400" />
                        Request Callback
                      </button>
                      <button 
                        onClick={handleReset}
                        className={cn(
                          "w-full py-2 px-4 rounded-xl border bg-transparent font-semibold text-xs tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5",
                          theme === 'dark' ? "border-white/10 text-gray-400 hover:text-white" : "border-gray-200 text-gray-500 hover:text-gray-800"
                        )}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Start New Request
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-start gap-2 max-w-[85%]",
                    msg.type === "user" ? "self-end flex-row-reverse" : "self-start"
                  )}
                >
                  {/* Avatar */}
                  {msg.type !== "user" && <CustomAvatar />}
                  
                  {/* Bubble */}
                  <div className="flex flex-col gap-2">
                    <div
                      className={cn(
                        "rounded-2xl p-3 text-xs leading-relaxed transition-all duration-200 shadow-sm",
                        msg.type === "user"
                          ? "bg-judicial-gold text-black rounded-tr-none font-semibold"
                          : (theme === 'dark' ? "bg-slate-900 border border-slate-800/80 text-gray-200 rounded-tl-none" : "bg-gray-100 border border-gray-200/80 text-gray-800 rounded-tl-none")
                      )}
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {msg.text}
                    </div>

                    {/* Inline options */}
                    {msg.options && msg.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1 max-w-[280px]">
                        {msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleUserResponse(opt)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all duration-200 cursor-pointer shadow-sm",
                              theme === 'dark' ? "border-judicial-gold/25 bg-slate-950 text-judicial-gold hover:bg-judicial-gold hover:text-black" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-950"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Initial Welcome Cards */}
            {stage === "welcome" && !isTyping && (
              <div className="grid grid-cols-1 gap-2 pt-2 max-w-[290px] self-center w-full">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleServiceSelect(s.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between group shadow-md",
                      theme === 'dark' ? "border-white/5 bg-slate-900/60 hover:bg-[#0c0e15]" : "border-gray-200 bg-gray-50 hover:bg-white"
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className={cn(
                        "text-[11px] font-bold transition-colors group-hover:text-judicial-gold",
                        theme === 'dark' ? "text-white" : "text-gray-900"
                      )}>{s.name}</span>
                      <span className={cn(
                        "text-[9px] max-w-[220px] leading-snug line-clamp-1",
                        theme === 'dark' ? "text-gray-400" : "text-gray-500"
                      )}>{s.desc}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-judicial-gold group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}

            {isTyping && (
              <div className="flex items-start gap-2 self-start max-w-[85%]">
                <CustomAvatar />
                <div className={cn(
                  "rounded-2xl p-3 rounded-tl-none flex items-center gap-1.5 border",
                  theme === 'dark' ? "bg-slate-900 border-slate-800/80" : "bg-gray-100 border-gray-200/80"
                )}>
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Text Input Area */}
          <div className={cn(
            "p-3 flex gap-2 items-center border-t",
            theme === 'dark' ? "bg-[#07090e] border-judicial-gold/15" : "bg-gray-50 border-gray-200"
          )}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={stage === "welcome" || stage === "completed" || isTyping}
              placeholder={
                stage === "welcome" 
                  ? "Select a service above..." 
                  : stage === "completed"
                    ? "Inquiry completed."
                    : "Type your response..."
              }
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-xs outline-none border transition-all duration-200",
                theme === 'dark' 
                  ? "bg-slate-950 border-slate-900 text-white placeholder-slate-600 focus:border-judicial-gold/45" 
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-judicial-gold/45",
                (stage === "welcome" || stage === "completed") && "opacity-50 cursor-not-allowed"
              )}
            />
            <button
              onClick={() => {
                handleUserResponse(inputText);
                setInputText("");
              }}
              disabled={!inputText.trim() || isTyping || stage === "welcome" || stage === "completed"}
              className={cn(
                "p-2 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer border-none shrink-0",
                !inputText.trim() || isTyping || stage === "welcome" || stage === "completed"
                  ? (theme === 'dark' ? "bg-slate-950 text-gray-600 cursor-not-allowed border border-white/5" : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200")
                  : "bg-judicial-gold text-black hover:scale-105 shadow-sm"
              )}
              title="Send Message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Disclaimer Footer */}
          <div className={cn(
            "px-4 py-2 border-t text-[9px] text-center select-none font-medium",
            theme === 'dark' ? "bg-[#05060b] border-judicial-gold/15 text-gray-500" : "bg-gray-100 border-gray-200 text-gray-500"
          )}>
            Disclaimer: Dastavez Help provides virtual assistance, not definitive legal counsel.
          </div>
        </div>
      )}
    </div>
  );
}