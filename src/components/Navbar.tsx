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
    { label: "Features", value: "features", path: "/features" },
    { label: "Case Studies", value: "case-studies", path: "/case-studies" },
    { label: "Smart Analysis", value: "smart-analysis", path: "/smart-analysis" },
    { label: "About", value: "about", path: "/about" },
    { label: "Contact", value: "contact", path: "/contact" },
    { label: "Blog", value: "blog", path: "/blog" },
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
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 dark:bg-slate-950/95 backdrop-blur-md py-2 shadow-md border-b border-gray-200 dark:border-judicial-gold/10 text-slate-900 dark:text-white"
          : "bg-transparent py-4 text-white dark:text-white"
      )}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative">
            <JusticeIcon />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl sm:text-2xl font-bold tracking-tight">
              <span className="text-judicial-gold">Dastavez</span>{" "}
              <span className="text-slate-900 dark:text-white">AI</span>
              <span className="block text-xs sm:text-sm font-normal text-slate-500 dark:text-gray-400">Powered Legal Intelligence</span>
            </span>
          </div>
          <div className="sm:hidden">
            <span className="text-lg font-bold tracking-tight">
              <span className="text-judicial-gold">Dastavez</span>{" "}
              <span className="text-black dark:text-white">AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <Link to="/features" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">Features</Link>
          {location.pathname !== '/chat' ? (
            <div className="relative flex flex-col items-center">
              <Link to="/case-studies" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">Case Studies</Link>
              {/* Icon/highlight here, only if not on /chat */}
              <span className="absolute top-6 left-1/2 -translate-x-1/2">
                {/* If you have a custom icon/highlight, put it here. If not, remove this span. */}
              </span>
            </div>
          ) : (
            <Link to="/case-studies" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">Case Studies</Link>
          )}
          <Link to="/smart-analysis" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">Smart Analysis</Link>

          <Link to="/about" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">About</Link>
          <Link to="/contact" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">Contact</Link>
          <Link to="/blog" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">Blog</Link>
          
          <Button variant="outline" size="sm" className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden xl:inline">Search</span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg border border-judicial-gold/30 dark:border-judicial-gold/20 bg-transparent dark:bg-judicial-navy/50 light:bg-white/50 hover:bg-judicial-gold/10 hover:border-judicial-gold/50 transition-all duration-300"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-judicial-gold" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-judicial-gold"/>
            <span className="sr-only">Toggle theme</span>
          </Button>
          

          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10"
              >
                <User className="h-4 w-4 mr-2" />
                <span className="hidden xl:inline">Profile</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-judicial-gold hover:bg-red-500/10"
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
          <div className="flex items-center space-x-3 text-sm font-medium">
            <Link to="/features" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">Features</Link>
            <Link to="/case-studies" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">Case Studies</Link>
            <Link to="/smart-analysis" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">Smart Analysis</Link>
            <Link to="/about" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">About</Link>
            <Link to="/contact" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">Contact</Link>
            <Link to="/blog" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors">Blog</Link>
          </div>

          <Button variant="outline" size="sm" className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg border border-judicial-gold/20 bg-judicial-navy/50 hover:bg-judicial-gold/10 hover:border-judicial-gold/40 transition-all duration-300"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-judicial-gold" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-judicial-gold" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          

          {isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10"
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
          {isMenuOpen ? <X className="h-6 w-6 text-black dark:text-judicial-gold" /> : <Menu className="h-6 w-6 text-black dark:text-judicial-gold" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-judicial-navy border-t border-judicial-gold/20">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link to="/features" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors py-2 px-3 rounded-lg hover:bg-judicial-gold/10">Features</Link>
              <Link to="/case-studies" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors py-2 px-3 rounded-lg hover:bg-judicial-gold/10">Case Studies</Link>
              <Link to="/smart-analysis" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors py-2 px-3 rounded-lg hover:bg-judicial-gold/10">Smart Analysis</Link>
              <Link to="/about" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors py-2 px-3 rounded-lg hover:bg-judicial-gold/10">About</Link>
              <Link to="/contact" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors py-2 px-3 rounded-lg hover:bg-judicial-gold/10">Contact</Link>
              <Link to="/blog" className="text-slate-900 dark:text-white hover:text-judicial-gold transition-colors py-2 px-3 rounded-lg hover:bg-judicial-gold/10">Blog</Link>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-judicial-gold/10 dark:border-judicial-gold/10 light:border-judicial-navy/20">
              <Button variant="outline" size="sm" className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10" onClick={() => setSearchOpen(true)}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-lg border border-judicial-gold/30 dark:border-judicial-gold/20 bg-transparent dark:bg-judicial-navy/50 light:bg-white/50 hover:bg-judicial-gold/10 hover:border-judicial-gold/50 transition-all duration-300"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-judicial-gold" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-judicial-gold" />
                <span className="sr-only">Toggle theme</span>
              </Button>
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
