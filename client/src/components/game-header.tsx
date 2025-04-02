import { useState } from "react";
import { useGameContext } from "@/lib/game-context";
import { 
  HelpCircle, 
  BarChart4, 
  Moon,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpModal } from "@/components/help-modal";
import { StatsModal } from "@/components/stats-modal";

export default function GameHeader() {
  const { darkMode, setDarkMode } = useGameContext();
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);

  return (
    <>
      <header className="w-full flex justify-between items-center p-4 border-b border-border">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => setShowHelp(true)}
        >
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
        
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide">PUZZLE GRID</h1>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full ml-2"
            onClick={() => setShowStats(true)}
          >
            <BarChart4 className="h-5 w-5" />
            <span className="sr-only">Statistics</span>
          </Button>
        </div>
      </header>

      {showHelp && <HelpModal open={showHelp} onOpenChange={setShowHelp} />}
      {showStats && <StatsModal open={showStats} onOpenChange={setShowStats} />}
    </>
  );
}
