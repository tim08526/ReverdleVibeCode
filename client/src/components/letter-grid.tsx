import { useCallback, useEffect, useState } from "react";
import { useGameContext } from "@/lib/game-context";
import { cn } from "@/lib/utils";
import "@/lib/animations.css";

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
  
  // Track which cells have animation
  const [animatingTile, setAnimatingTile] = useState<[number, number] | null>(null);
  
  // Animation buffer to prevent overlapping animations
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTileClick = (row: number, col: number) => {
    // Don't process clicks while animation is running
    if (isAnimating) return;
    
    // If the tile already has a letter and we're clicking on it,
    // let's add the pop animation for visual feedback
    if (grid[row][col].letter !== "") {
      // Mark as animating to prevent overlapping animations
      setIsAnimating(true);
      
      // Trigger animation
      setAnimatingTile([row, col]);
      
      // Remove animation after it completes
      setTimeout(() => {
        setAnimatingTile(null);
        setIsAnimating(false);
      }, 200);
    }
    
    selectCell(row, col);
  };

  // Function to determine cell color based on the correct solution
  const getCellColor = (rowIndex: number, colIndex: number) => {
    const tile = grid[rowIndex][colIndex];
    
    // Last row (solution row) - all correct since it's the solution
    if (puzzle?.hints && rowIndex === puzzle.hints.length - 1) {
      return "bg-[#6aaa64] border-[#6aaa64]";
    }
    
    // Get the correct solution for checking (from the last row)
    if (!puzzle?.hints) return "bg-muted border-muted-foreground/30";
    
    const lastRowHint = puzzle.hints[puzzle.hints.length - 1];
    const solution = lastRowHint.answer.toUpperCase();
    
    // Get the answer for current row
    const currentRowHint = puzzle.hints[rowIndex];
    const currentAnswer = currentRowHint.answer.toUpperCase();

    // For each position, determine if the letter in the answer would be
    // correct, present, or absent when compared to the final solution
    if (currentAnswer[colIndex] === solution[colIndex]) {
      // Letter is in correct position compared to solution
      return "bg-[#6aaa64] border-[#6aaa64]";
    } else if (solution.includes(currentAnswer[colIndex])) {
      // Letter is present in solution but in wrong position
      return "bg-[#c9b458] border-[#c9b458]";
    } else {
      // Letter is not in solution
      return "bg-[#787c7e] border-[#787c7e]";
    }
  };

  // Function to handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Handle letter input
    if (e.key.match(/^[a-zA-Z]$/) && e.key.length === 1 && !isAnimating) {
      // If animation is in progress, ignore this input to prevent overlapping animations
      
      // If a cell is selected, use that cell
      if (currentRow !== null && currentCol !== null && !completedRows[currentRow]) {
        // Mark as animating to prevent new keystrokes
        setIsAnimating(true);
        
        updateTile(currentRow, currentCol, e.key.toUpperCase());
        
        // Trigger animation on the tile
        setAnimatingTile([currentRow, currentCol]);
        
        // Remove animation after it completes and allow next input
        setTimeout(() => {
          setAnimatingTile(null);
          setIsAnimating(false);
        }, 200); // Animation takes 150ms
        
        // Auto-advance to next column after a short delay to allow animation to complete
        setTimeout(() => {
          if (currentCol < 4) {
            selectCell(currentRow, currentCol + 1);
          }
        }, 100); // Move cursor after animation is mostly done
      } 
      // Otherwise find the first empty cell
      else {
        const nextEmptyCell = findNextEmptyCell();
        if (nextEmptyCell) {
          const [row, col] = nextEmptyCell;
          
          // Mark as animating to prevent new keystrokes
          setIsAnimating(true);
          
          updateTile(row, col, e.key.toUpperCase());
          
          // Trigger animation on the tile
          setAnimatingTile([row, col]);
          
          // Remove animation after it completes and allow next input
          setTimeout(() => {
            setAnimatingTile(null);
            setIsAnimating(false);
          }, 200); // Animation takes 150ms
          
          // Auto-advance to next column after a short delay
          setTimeout(() => {
            if (col < 4) {
              selectCell(row, col + 1);
            }
          }, 100); // Move cursor after animation is mostly done
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
  }, [currentRow, currentCol, grid, updateTile, checkRow, completedRows, findNextEmptyCell, selectCell, setAnimatingTile, isAnimating, setIsAnimating]);

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
              tile.status === "absent" ? "bg-[#787c7e] border-[#787c7e] text-white" : "",
              // Add animation when a tile is being updated
              animatingTile && animatingTile[0] === rowIndex && animatingTile[1] === colIndex ? "animate-pop" : ""
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