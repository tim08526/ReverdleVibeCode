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

  // Function to determine cell color based on row and column to simulate a solved puzzle
  const getCellColor = (rowIndex: number, colIndex: number) => {
    const tile = grid[rowIndex][colIndex];
    
    // If the tile already has a status from user input, use that
    if (tile.status === "correct") return "bg-[#6aaa64] border-[#6aaa64] text-white";
    if (tile.status === "present") return "bg-[#c9b458] border-[#c9b458] text-white";
    if (tile.status === "absent") return "bg-[#787c7e] border-[#787c7e] text-white";
    
    // Otherwise, simulate Wordle-style coloring based on position
    // These patterns create a visually appealing puzzle appearance without spoiling the answers
    
    // Last row (solution row) - all correct
    if (puzzle?.hints && rowIndex === puzzle.hints.length - 1) {
      return "bg-[#6aaa64] border-[#6aaa64]";
    }
    
    // For other rows, create a pattern based on position
    // This simulates what the puzzle will look like when solved
    // without giving away the actual answers
    
    // Pattern differs by row and column to create visual variety
    if (rowIndex === 0) {
      // First row pattern (3 correct, 2 present)
      return colIndex % 2 === 0 ? "bg-[#6aaa64] border-[#6aaa64]" : "bg-[#c9b458] border-[#c9b458]";
    } else if (rowIndex === 1) {
      // Second row pattern (2 correct, 2 present, 1 absent)
      if (colIndex === 0 || colIndex === 3) {
        return "bg-[#6aaa64] border-[#6aaa64]";
      } else if (colIndex === 1 || colIndex === 4) {
        return "bg-[#c9b458] border-[#c9b458]";
      } else {
        return "bg-[#787c7e] border-[#787c7e]";
      }
    } else if (rowIndex === 2) {
      // Third row pattern (1 correct, 3 present, 1 absent)
      if (colIndex === 2) {
        return "bg-[#6aaa64] border-[#6aaa64]";
      } else if (colIndex === 0 || colIndex === 1 || colIndex === 4) {
        return "bg-[#c9b458] border-[#c9b458]";
      } else {
        return "bg-[#787c7e] border-[#787c7e]";
      }
    } else if (rowIndex === 3) {
      // Fourth row pattern (4 correct, 1 absent)
      if (colIndex !== 1) {
        return "bg-[#6aaa64] border-[#6aaa64]";
      } else {
        return "bg-[#787c7e] border-[#787c7e]";
      }
    } else {
      // Default for any other rows
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
              tile.letter !== "" ? "filled" : "text-transparent", // Make empty letters transparent
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
