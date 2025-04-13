import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGameContext } from "@/lib/game-context";
import GameHeader from "@/components/game-header";
import PuzzleBoard from "@/components/puzzle-board";
import Keyboard from "@/components/keyboard";
import HelpModal from "@/components/help-modal";
import StatsModal from "@/components/stats-modal";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Check } from "lucide-react";

export default function Game() {
  const { toast } = useToast();
  const { 
    isLoading, 
    error, 
    resetGame, 
    checkAllRows,
    gameCompleted
  } = useGameContext();

  useEffect(() => {
    // Show welcome toast
    toast({
      title: "Welcome to Reverdle!",
      description: "Complete the puzzle by filling each row with the word that matches its hint!",
      duration: 5000,
    });
  }, [toast]);

  useEffect(() => {
    if (gameCompleted) {
      toast({
        title: "Congratulations!",
        description: "You've successfully completed the puzzle!",
        variant: "success",
      });
    }
  }, [gameCompleted, toast]);

  const handleCheckAllRows = async () => {
    const allCorrect = await checkAllRows();
    
    if (!allCorrect) {
      toast({
        title: "Keep trying!",
        description: "Some rows are still incorrect. Check the hints and try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-foreground">Loading puzzle...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Puzzle</h1>
        <p className="text-muted-foreground mb-6 text-center">{error}</p>
        <Button onClick={() => window.location.reload()}>Reload Page</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <GameHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-4 py-6">
        <PuzzleBoard />
        
        <div id="game-message" className="rounded-lg bg-muted py-2 px-4 text-center mb-6 w-full">
          <p>Complete the puzzle by filling each row with the word that matches its hint!</p>
        </div>
        
        <Keyboard />
        
        <div className="w-full flex justify-between mt-6">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={resetGame}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          
          <Button 
            className="flex items-center gap-2 bg-[#6aaa64] hover:bg-[#569b51] text-white"
            onClick={handleCheckAllRows}
          >
            <Check className="h-4 w-4" />
            Check Answers
          </Button>
        </div>
      </main>
      
      <HelpModal />
      <StatsModal />
    </div>
  );
}
