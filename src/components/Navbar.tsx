import { Menu, X, Search, Sun, Moon, User, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import LoginIcon from "./LoginIcon";
import { useTheme } from "./ThemeProvider";
import { useLocation, Link, useNavigate } from "react-router-dom";
import JusticeIcon from "./JusticeIcon";
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandGroup } from "./ui/command";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  // Check login state
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('jwt'));
  }, [location.pathname]);

  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Scroll tracking — never resets to false on route change; reads actual scroll position
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // On route change: close mobile menu and sync scroll state immediately
  useEffect(() => {
    setIsMenuOpen(false);
    // Use rAF so the new page has rendered before we read scrollY
    requestAnimationFrame(() => {
      setScrolled(window.scrollY > 10);
    });
  }, [location.pathname]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

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
  ];

  const handleSelect = (value: string) => {
    setSearchOpen(false);
    setSearchValue("");
    const option = searchOptions.find(opt => opt.value === value);
    if (!option) return;
    if (option.path.startsWith("#")) {
      document.querySelector(option.path)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(option.path);
    }
  };

  // Helper for active link styling
  const navLinkClass = (path: string) =>
    cn(
      "transition-colors nav-link font-body-premium text-sm",
      location.pathname === path
        ? "text-[var(--accent-primary)] font-semibold"
        : "text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
    );

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 dastavez-header-nav",
        scrolled ? "is-sticky py-1" : "py-2"
      )}
    >
      <div className="max-w-screen-2xl mx-auto px-4 flex justify-between items-center">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-3 logo-link shrink-0">
          <div className="relative flex items-center justify-center overflow-visible">
            <JusticeIcon className="w-[32px] h-[32px] md:w-[36px] md:h-[36px] lg:w-[40px] lg:h-[40px]" />
          </div>
          <span
            className="hidden sm:block text-lg sm:text-xl font-bold tracking-tight font-display-premium"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1f242e' }}
          >
            Dastavez AI
            <span className="block text-[10px] font-normal text-[var(--text-muted)] font-body-premium">
              Powered Legal Intelligence
            </span>
          </span>
          <span
            className="sm:hidden text-base font-bold tracking-tight font-display-premium"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1f242e' }}
          >
            Dastavez AI
          </span>
        </Link>

        {/* ── Desktop Navigation (≥lg) ── */}
        <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
          <Link to="/use-cases" className={navLinkClass("/use-cases")}>Use Cases</Link>
          <Link to="/features" className={navLinkClass("/features")}>Features</Link>
          <Link to="/case-studies" className={navLinkClass("/case-studies")}>Case Studies</Link>
          <Link to="/smart-analysis" className={navLinkClass("/smart-analysis")}>Smart Analysis</Link>
          <Link to="/about" className={navLinkClass("/about")}>About</Link>
          <Link to="/contact" className={navLinkClass("/contact")}>Contact</Link>
          <Link to="/blog" className={navLinkClass("/blog")}>Blog</Link>

          {/* Dept Login */}
          <Link
            to="/department"
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-black border border-gray-200 hover:bg-[var(--accent-primary)] hover:text-black hover:border-[var(--accent-primary)] transition-colors btn-nav-cta font-body-premium shadow-sm"
          >
            Dept Login
          </Link>

          {/* Search */}
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 font-body-premium h-8 text-xs"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-3 w-3 mr-1.5" />
            <span className="hidden xl:inline">Search</span>
          </Button>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
            {theme === "light"
              ? <Sun className="sun-icon  text-[var(--accent-primary)]" />
              : <Moon className="moon-icon text-[var(--accent-primary)]" />}
          </button>

          {/* Auth */}
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

        {/* ── Tablet Navigation (md–lg) ── */}
        <div className="hidden md:flex lg:hidden items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm font-medium font-body-premium">
            <Link to="/use-cases" className={navLinkClass("/use-cases")}>Use Cases</Link>
            <Link to="/features" className={navLinkClass("/features")}>Features</Link>
            <Link to="/case-studies" className={navLinkClass("/case-studies")}>Case Studies</Link>
            <Link to="/about" className={navLinkClass("/about")}>About</Link>
          </div>
          <Link
            to="/department"
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-black border border-gray-200 hover:bg-[var(--accent-primary)] hover:text-black hover:border-[var(--accent-primary)] transition-colors btn-nav-cta font-body-premium shadow-sm"
          >
            Dept Login
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 font-body-premium"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
            {theme === "light"
              ? <Sun className="sun-icon  text-[var(--accent-primary)]" />
              : <Moon className="moon-icon text-[var(--accent-primary)]" />}
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

        {/* ── Mobile Hamburger ── */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen
            ? <X className="h-6 w-6 text-[var(--text-primary)]" />
            : <Menu className="h-6 w-6 text-[var(--text-primary)]" />}
        </Button>
      </div>

      {/* ── Mobile Menu — CSS height animation, no DOM mount/unmount ── */}
      <div
        className={cn(
          "md:hidden border-t border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="max-w-screen-2xl mx-auto px-4 flex flex-col space-y-3 pb-4">
          <div className="grid grid-cols-2 gap-2 pt-2 font-body-premium">
            <Link to="/use-cases" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">Use Cases</Link>
            <Link to="/features" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">Features</Link>
            <Link to="/case-studies" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">Case Studies</Link>
            <Link to="/smart-analysis" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">Smart Analysis</Link>
            <Link to="/about" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">About</Link>
            <Link to="/contact" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">Contact</Link>
            <Link to="/blog" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10 text-sm">Blog</Link>
            <Link
              to="/department"
              className="col-span-2 text-center py-2 px-3 rounded-lg bg-white text-black border border-gray-200 hover:bg-[var(--accent-primary)] hover:text-black hover:border-[var(--accent-primary)] transition-colors text-sm btn-nav-cta font-semibold"
            >
              🏛️ Department Login
            </Link>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
            <Button
              variant="outline"
              size="sm"
              className="border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 font-body-premium"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
              {theme === "light"
                ? <Sun className="sun-icon  text-[var(--accent-primary)]" />
                : <Moon className="moon-icon text-[var(--accent-primary)]" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="text-sm text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-[var(--text-primary)] hover:text-red-500 transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="text-sm text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--accent-primary)]/10"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Search Modal ── */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search pages..."
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
