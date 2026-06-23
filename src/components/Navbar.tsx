import { Menu, X, Search, Sun, Moon, User, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import LoginIcon from "./LoginIcon";
import { useTheme } from "./ThemeProvider";
import { useLocation, Link, useNavigate } from "react-router-dom";
import JusticeIcon from "./JusticeIcon";
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandGroup } from "./ui/command";

const JusticeScalesIcon = () => (
  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-judicial-navy p-1 rounded-sm border border-judicial-gold">
    <div className="w-full h-full relative">
      {/* Top bar */}
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 sm:w-6 h-0.5 bg-judicial-gold" />
      
      {/* Center pole */}
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-4 sm:h-6 bg-judicial-gold" />
      
      {/* Scales */}
      <div className="absolute top-2 w-full flex justify-between px-1">
        <div className="w-2 sm:w-3 h-0.5 bg-judicial-gold transform rotate-[-8deg]" />
        <div className="w-2 sm:w-3 h-0.5 bg-judicial-gold transform rotate-[8deg]" />
      </div>
      
      {/* Scale dishes */}
      <div className="absolute top-[10px] sm:top-[14px] w-full flex justify-between px-0.5">
        <div className="w-1.5 sm:w-2 h-0.5 bg-judicial-gold" />
        <div className="w-1.5 sm:w-2 h-0.5 bg-judicial-gold" />
      </div>
    </div>
  </div>
);

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('lastLoginEmail');
    setIsLoggedIn(false);
    navigate('/');
  };

  

  // Search options
  const searchOptions = [
    { label: "Use Cases", value: "use-cases", path: "/use-cases" },
    { label: "Features", value: "features", path: "/features" },
    { label: "Case Studies", value: "case-studies", path: "/case-studies" },
    { label: "Smart Analysis", value: "smart-analysis", path: "/smart-analysis" },
    { label: "About", value: "about", path: "/about" },
    { label: "Contact", value: "contact", path: "/contact" },
    { label: "Blog", value: "blog", path: "/blog" },
    { label: "Terms & Conditions", value: "terms-and-conditions", path: "/terms-and-conditions" },
    { label: "Privacy Policy", value: "privacy-policy", path: "/privacy-policy" },
    { label: "Disclaimer", value: "disclaimer", path: "/disclaimer" },
    { label: "Cookie Policy", value: "cookie-policy", path: "/cookie-policy" },
  ];

  const handleSelect = (value) => {
    setSearchOpen(false);
    setSearchValue("");
    const option = searchOptions.find(opt => opt.value === value);
    if (!option) return;
    if (option.path.startsWith("#")) {
      const el = document.querySelector(option.path);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(option.path);
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 dastavez-header-nav",
        scrolled ? "is-sticky py-1" : "py-2"
      )}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-4 logo-link">
          <div className="relative flex items-center justify-center overflow-visible">
            <JusticeIcon className="w-[42px] h-[42px] md:w-[48px] md:h-[48px] lg:w-[56px] lg:h-[56px]" />
          </div>
          <div className="hidden sm:block">
            <span 
              className="text-xl sm:text-2xl font-bold tracking-tight font-display-premium"
              style={{ color: theme === 'dark' ? '#ffffff' : '#1f242e' }}
            >
              Dastavez AI
              <span className="block text-[10px] font-normal text-[var(--text-muted)] font-body-premium">Powered Legal Intelligence</span>
            </span>
          </div>
          <div className="sm:hidden">
            <span 
              className="text-lg font-bold tracking-tight font-display-premium"
              style={{ color: theme === 'dark' ? '#ffffff' : '#1f242e' }}
            >
              Dastavez AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 font-body-premium">
          <Link to="/use-cases" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Use Cases</Link>
          <Link to="/features" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Features</Link>
          {location.pathname !== '/chat' ? (
            <div className="relative flex flex-col items-center">
              <Link to="/case-studies" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Case Studies</Link>
              {/* Icon/highlight here, only if not on /chat */}
              <span className="absolute top-6 left-1/2 -translate-x-1/2">
                {/* If you have a custom icon/highlight, put it here. If not, remove this span. */}
              </span>
            </div>
          ) : (
            <Link to="/case-studies" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Case Studies</Link>
          )}
          <Link to="/smart-analysis" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Smart Analysis</Link>

          <Link to="/about" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">About</Link>
          <Link to="/contact" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Contact</Link>
          <Link to="/blog" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Blog</Link>

          {/* Department Login */}
          <Link
            to="/department"
            className="px-3 py-1.5 rounded-md text-sm font-semibold bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-all duration-200 btn-nav-cta font-body-premium"
          >
            Dept Login
          </Link>

          <Button variant="outline" size="sm" className="border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 font-body-premium" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden xl:inline">Search</span>
          </Button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Sun className="sun-icon text-[var(--accent-primary)]" />
            ) : (
              <Moon className="moon-icon text-[var(--accent-primary)]" />
            )}
          </button>
          

          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 font-body-premium"
              >
                <User className="h-4 w-4 mr-2" />
                <span className="hidden xl:inline">Profile</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-[var(--accent-primary)] hover:bg-red-500/10 font-body-premium"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <LoginIcon />
          )}
        </div>

        {/* Tablet Navigation - Simplified */}
        <div className="hidden md:flex lg:hidden items-center space-x-4">
          <div className="flex items-center space-x-3 text-sm font-medium font-body-premium">
            <Link to="/use-cases" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Use Cases</Link>
            <Link to="/features" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Features</Link>
            <Link to="/case-studies" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Case Studies</Link>
            <Link to="/smart-analysis" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Smart Analysis</Link>
            <Link to="/about" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">About</Link>
            <Link to="/contact" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Contact</Link>
            <Link to="/blog" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors nav-link">Blog</Link>
          </div>

          {/* Department Login (tablet) */}
          <Link
            to="/department"
            className="px-3 py-1.5 rounded-md text-sm font-semibold bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-all duration-200 btn-nav-cta font-body-premium"
          >
            Dept Login
          </Link>

          <Button variant="outline" size="sm" className="border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 font-body-premium" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Sun className="sun-icon text-[var(--accent-primary)]" />
            ) : (
              <Moon className="moon-icon text-[var(--accent-primary)]" />
            )}
          </button>

          {isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              className="border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 font-body-premium"
            >
              <User className="h-4 w-4" />
            </Button>
          ) : (
            <LoginIcon />
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6 text-[var(--text-primary)]" /> : <Menu className="h-6 w-6 text-[var(--text-primary)]" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[var(--bg-secondary)] border-t border-[var(--border-color)] w-full overflow-hidden">
          <div className="container mx-auto px-4 flex flex-col space-y-3 pb-4">
            <div className="grid grid-cols-2 gap-2 pt-2 font-body-premium">
              <Link to="/use-cases" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">Use Cases</Link>
              <Link to="/features" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">Features</Link>
              <Link to="/case-studies" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">Case Studies</Link>
              <Link to="/smart-analysis" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">Smart Analysis</Link>
              <Link to="/about" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">About</Link>
              <Link to="/contact" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">Contact</Link>
              <Link to="/blog" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">Blog</Link>
              {/* Department Login (mobile) */}
              <Link
                to="/department"
                className="col-span-2 text-center py-2 px-3 rounded-lg bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold hover:opacity-90 transition-all duration-200 text-sm btn-nav-cta"
              >
                🏛️ Department Login
              </Link>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
              <Button variant="outline" size="sm" className="border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 font-body-premium" onClick={() => setSearchOpen(true)}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Sun className="sun-icon text-[var(--accent-primary)]" />
                ) : (
                  <Moon className="moon-icon text-[var(--accent-primary)]" />
                )}
              </button>
            </div>
            
            {isLoggedIn ? (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-judicial-gold/20">
                <Link to="/profile" className="text-sm text-slate-900 dark:text-white hover:text-judicial-gold dark:hover:text-judicial-gold transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-judicial-gold/10 dark:hover:bg-judicial-gold/20">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-black dark:text-white hover:text-judicial-gold transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-judicial-gold/20">
                <Link to="/auth" className="text-sm text-slate-900 dark:text-white hover:text-judicial-gold dark:hover:text-judicial-gold transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-judicial-gold/10 dark:hover:bg-judicial-gold/20">
                  <LogIn className="h-4 w-4" />
                  Log in
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Modal */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search..."
          value={searchValue}
          onValueChange={setSearchValue}
          autoFocus
        />
        <CommandList>
          <CommandGroup heading="Navigate">
            {searchOptions.map(option => (
              <CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)}>
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </nav>
  );
}
