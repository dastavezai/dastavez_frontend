import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9 rounded-lg border border-judicial-gold/20 bg-judicial-navy/50 hover:bg-judicial-gold/10 hover:border-judicial-gold/40 transition-all duration-300 flex items-center justify-center"
    >
      {theme === "light" ? (
        <Sun className="h-4 w-4 text-judicial-gold transition-all" />
      ) : (
        <Moon className="h-4 w-4 text-judicial-gold transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}