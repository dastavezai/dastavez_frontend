import { Scale, Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react";
import AIAssistantIcon from "./AIAssistantIcon";
import Blog from "@/pages/Blog";

export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-judicial-dark mt-24 pt-16 pb-8 text-sm border-t border-gray-200 dark:border-judicial-gold/10 light:border-judicial-navy/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Scale className="h-6 w-6 text-judicial-gold" />
              <span className="text-lg font-semibold">
                <span className="text-judicial-gold">Dastavez</span> AI
              </span>
            </div>
            <p className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 max-w-xs">
              Advanced AI-powered legal assistance, case analysis, and criminal precedent exploration.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 hover:text-judicial-gold">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-judicial-gold">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-judicial-gold">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Links Column */}
          <div>
            <h3 className="font-medium text-judicial-gold mb-4">Products</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <AIAssistantIcon />
                <a href="#" className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 hover:text-judicial-gold">AI Legal Assistant</a>
              </li>
              <li><a href="#" className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 hover:text-judicial-gold">Case Analyzer</a></li>
              <li><a href="#" className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 hover:text-judicial-gold">Document Summarizer</a></li>
              <li><a href="#" className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 hover:text-judicial-gold">Precedent Explorer</a></li>
              <li><a href="#" className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 hover:text-judicial-gold">Legal Research</a></li>
            </ul>
          </div>
          
          {/* Links Column */}
          <div>
            <h3 className="font-medium text-judicial-gold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 hover:text-judicial-gold">Documentation</a></li>
              <li><a href="#" className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 hover:text-judicial-gold">API Reference</a></li>
              <li><a href="#" className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 hover:text-judicial-gold">Legal Database</a></li>
              <li><a href="#" className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 hover:text-judicial-gold">Case Studies</a></li>
              <li><a href="/blog" className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60 hover:text-judicial-gold">Blog</a></li>
               
            </ul>
          </div>
          
          {/* Contact Column */}
          <div>
            <h3 className="font-medium text-judicial-gold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-judicial-gold mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60"> Patna, Bihar, India</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-judicial-gold mr-2" />
                <span className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-judicial-gold mr-2" />
                <span className="text-gray-400 dark:text-gray-400 light:text-judicial-navy/60">info@dastavezai.org</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-judicial-blue/30 dark:border-judicial-blue/30 light:border-judicial-navy/20 mt-12 pt-8 text-center text-gray-500 dark:text-gray-500 light:text-judicial-navy/40">
          <p>&copy; {new Date().getFullYear()} Dastavez AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
