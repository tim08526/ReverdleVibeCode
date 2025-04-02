import { useCallback, useEffect } from "react";
import { useGameContext } from "@/lib/game-context";
import { cn } from "@/lib/utils";

export default function LetterGrid() {
  const { 
    grid, 
    currentRow,
    currentCol,
    selectCell, 
    updateTile, 
    checkRow,
    completedRows,
    findNextEmptyCell,
    puzzle
  } = useGameContext();

  const handleTileClick = (row: number, col: number) => {
    selectCell(row, col);
  };

  // Function to determine cell color based on row and column
  const getCellColor = (rowIndex: number, colIndex: number) => {
    const tile = grid[rowIndex][colIndex];
    
    // If the tile already has a status, use that
    if (tile.status === "correct") return "bg-[#6aaa64] border-[#6aaa64] text-white";
    if (tile.status === "present") return "bg-[#c9b458] border-[#c9b458] text-white";
    if (tile.status === "absent") return "bg-[#787c7e] border-[#787c7e] text-white";
    
    // If the row is the last row (solution), give it a special appearance
    if (puzzle?.hints && rowIndex === puzzle.hints.length - 1) {
      return "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-800";
    }
    
    // Otherwise, customize by row
    switch (rowIndex) {
      case 0: 
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50";
      case 1: 
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50";
      case 2: 
        return "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50";
      case 3: 
        return "bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800/50";
      default:
        return "bg-muted border-muted-foreground/30";
    }
  };

  // Function to handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Handle letter input
    if (e.key.match(/^[a-zA-Z]$/) && e.key.length === 1) {
      // If a cell is selected, use that cell
      if (currentRow !== null && currentCol !== null && !completedRows[currentRow]) {
        updateTile(currentRow, currentCol, e.key.toUpperCase());
        
        // Auto-advance to next column in the same row if possible
        if (currentCol < 4) {
          selectCell(currentRow, currentCol + 1);
        }
      } 
      // Otherwise find the first empty cell
      else {
        const nextEmptyCell = findNextEmptyCell();
        if (nextEmptyCell) {
          const [row, col] = nextEmptyCell;
          updateTile(row, col, e.key.toUpperCase());
          
          // Auto-advance to next column in the same row if possible
          if (col < 4) {
            selectCell(row, col + 1);
          }
        }
      }
    }
    // Handle backspace
    else if (e.key === "Backspace") {
      // If a cell is selected, clear that cell
      if (currentRow !== null && currentCol !== null && !completedRows[currentRow]) {
        updateTile(currentRow, currentCol, "");
        
        // Move to previous column if possible
        if (currentCol > 0) {
          selectCell(currentRow, currentCol - 1);
        }
      } 
      // Otherwise find the last filled cell
      else {
        for (let row = 0; row < 5; row++) {
          if (!completedRows[row]) {
            for (let col = 4; col >= 0; col--) {
              if (grid[row][col].letter !== "") {
                updateTile(row, col, "");
                selectCell(row, col);
                break;
              }
            }
            break;
          }
        }
      }
    }
    // Handle enter to check row
    else if (e.key === "Enter") {
      // Check the current row if it's complete
      if (currentRow !== null && !completedRows[currentRow]) {
        checkRow(currentRow);
      }
      // Otherwise find a completed row to check
      else {
        for (let row = 0; row < 5; row++) {
          if (!completedRows[row] && grid[row].every(tile => tile.letter !== "")) {
            checkRow(row);
            break;
          }
        }
      }
    }
  }, [currentRow, currentCol, grid, updateTile, checkRow, completedRows, findNextEmptyCell, selectCell]);

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
              "tile aspect-square flex items-center justify-center text-2xl font-bold rounded transition-all duration-300 cursor-pointer",
              currentRow === rowIndex && currentCol === colIndex && !completedRows[rowIndex]
                ? "border-4 border-primary"
                : "border-2",
              tile.letter !== "" ? "filled" : "",
              (tile.status === "correct" || tile.status === "present" || tile.status === "absent") 
                ? "" // Let the status colors handle it
                : getCellColor(rowIndex, colIndex), // Apply color by row when no status set
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
