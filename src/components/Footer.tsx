import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react";
import AIAssistantIcon from "./AIAssistantIcon";
import { Link } from "react-router-dom";
import JusticeIcon from "./JusticeIcon";

export function Footer() {
  return (
    <footer className="footer font-body-premium">
      <div className="container footer-grid">
        {/* Brand Column */}
        <div className="footer-col">
          <div className="footer-logo">
            <JusticeIcon size={24} />
            <span className="logo-text font-serif-legal font-bold">
              Dastavez <span className="logo-accent">AI</span>
            </span>
          </div>
          <p className="footer-desc">
            State-of-the-art legal artificial intelligence, case law discovery, and rebuttal building systems.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        {/* Legal Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">Legal</h4>
          <ul className="footer-links">
            <li><Link to="/terms-and-conditions" className="footer-link">Terms & Conditions</Link></li>
            <li><Link to="/privacy-policy" className="footer-link">Privacy Policy</Link></li>
            <li><Link to="/disclaimer" className="footer-link">Disclaimer</Link></li>
            <li><Link to="/cookie-policy" className="footer-link">Cookie Policy</Link></li>
          </ul>
        </div>

        {/* Products Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">Platform</h4>
          <ul className="footer-links">
            <li className="flex items-center space-x-2">
              <AIAssistantIcon />
              <Link to="/chat" className="footer-link">AI Legal Assistant</Link>
            </li>
            <li><Link to="/about" className="footer-link">About</Link></li>
            <li><Link to="/use-cases" className="footer-link">Use Cases</Link></li>
            <li><Link to="/features" className="footer-link">Features</Link></li>
            <li><Link to="/smart-analysis" className="footer-link">Smart Analysis</Link></li>
            <li><Link to="/case-studies" className="footer-link">Case Studies</Link></li>
            <li><Link to="/blog" className="footer-link">Blog</Link></li>
            <li><Link to="/contact" className="footer-link">Contact</Link></li>
          </ul>
        </div>
        
        {/* Contact Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">Contact</h4>
          <ul className="footer-links space-y-2">
            <li className="flex items-start">
              <MapPin className="h-5 w-5 text-[var(--accent-primary)] mr-2 mt-0.5 flex-shrink-0" />
              <span className="footer-link leading-tight">Patna, Bihar, India</span>
            </li>
            <li className="flex items-center">
              <Phone className="h-5 w-5 text-[var(--accent-primary)] mr-2" />
              <a href="tel:+918210607476" className="footer-link">+91 8210607476</a>
            </li>
            <li className="flex items-center">
              <Mail className="h-5 w-5 text-[var(--accent-primary)] mr-2" />
              <span className="footer-link">info@dastavezai.org</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container footer-bottom">
        <span>&copy; {new Date().getFullYear()} Doclair Dastavez AI Solution Private Limited. All rights reserved.</span>
        <span>Patna, Bihar, India</span>
      </div>
    </footer>
  );
}
