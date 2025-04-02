import { useState } from "react";
import { useGameContext } from "@/lib/game-context";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import HintRow from "./hint-row";
import LetterGrid from "./letter-grid";

export default function PuzzleBoard() {
  const { puzzle } = useGameContext();
  const [showAllHints, setShowAllHints] = useState<boolean>(false);

  if (!puzzle) return null;

  return (
    <div id="puzzle-board" className="w-full">
      {/* Hints section */}
      <div className="hints-container mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Hints</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllHints(!showAllHints)}
            className="text-sm rounded-full flex items-center gap-1"
          >
            {showAllHints ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide All
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show All
              </>
            )}
          </Button>
        </div>
        
        {puzzle.hints.map((hint) => (
          <HintRow 
            key={hint.id} 
            hint={hint} 
            showAll={showAllHints}
          />
        ))}
      </div>

      {/* Grid container */}
      <LetterGrid />
    </div>
  );
}
