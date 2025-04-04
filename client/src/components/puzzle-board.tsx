import { useGameContext } from "@/lib/game-context";
import HintRow from "./hint-row";
import LetterGrid from "./letter-grid";

export default function PuzzleBoard() {
  const { puzzle } = useGameContext();

  if (!puzzle) return null;

  return (
    <div id="puzzle-board" className="w-full">
      {/* Hints section */}
      <div className="hints-container mb-4">
        <div className="mb-2">
          <h2 className="text-lg font-semibold">Hints</h2>
        </div>
        
        {puzzle.hints.map((hint) => (
          <HintRow 
            key={hint.id} 
            hint={hint}
          />
        ))}
      </div>

      {/* Grid container */}
      <LetterGrid />
    </div>
  );
}
