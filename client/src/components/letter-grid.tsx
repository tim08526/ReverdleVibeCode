import { useCallback, useEffect } from "react";
import { useGameContext } from "@/lib/game-context";
import { cn } from "@/lib/utils";

export default function LetterGrid() {
  const { 
    grid, 
    currentRow, 
    selectRow, 
    updateTile, 
    checkRow,
    completedRows
  } = useGameContext();

  const handleTileClick = (row: number, col: number) => {
    selectRow(row);
  };

  // Function to handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (currentRow === null) return;
    
    // Handle letter input
    if (e.key.match(/^[a-zA-Z]$/) && e.key.length === 1) {
      // Find the first empty column in the current row
      for (let col = 0; col < 5; col++) {
        if (grid[currentRow][col].letter === "") {
          updateTile(currentRow, col, e.key.toUpperCase());
          break;
        }
      }
    }
    // Handle backspace
    else if (e.key === "Backspace") {
      // Find the last filled column in the current row
      for (let col = 4; col >= 0; col--) {
        if (grid[currentRow][col].letter !== "") {
          updateTile(currentRow, col, "");
          break;
        }
      }
    }
    // Handle enter to check row
    else if (e.key === "Enter") {
      checkRow(currentRow);
    }
  }, [currentRow, grid, updateTile, checkRow]);

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div id="grid-container" className="grid grid-cols-5 gap-2 mb-6">
      {grid.map((row, rowIndex) => (
        row.map((tile, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={cn(
              "tile aspect-square flex items-center justify-center text-2xl font-bold rounded transition-all duration-300",
              currentRow === rowIndex && !completedRows[rowIndex]
                ? "border-4 border-primary"
                : "border-2 border-border",
              tile.status === "empty" ? "" : "filled",
              tile.status === "correct" ? "bg-[#6aaa64] border-[#6aaa64] text-white" : "",
              tile.status === "present" ? "bg-[#c9b458] border-[#c9b458] text-white" : "",
              tile.status === "absent" ? "bg-[#787c7e] border-[#787c7e] text-white" : ""
            )}
            onClick={() => handleTileClick(rowIndex, colIndex)}
            data-row={rowIndex}
            data-col={colIndex}
          >
            {tile.letter}
          </div>
        ))
      ))}
    </div>
  );
}
