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
  
  // Track which cells are currently animating with a Map for better control
  const [animatingTiles, setAnimatingTiles] = useState<Map<string, boolean>>(new Map());

  const handleTileClick = (row: number, col: number) => {
    // If the tile already has a letter and we're clicking on it,
    // let's add the pop animation for visual feedback
    if (grid[row][col].letter !== "") {
      // Add animation to this tile
      setAnimatingTiles(prev => {
        const newMap = new Map(prev);
        newMap.set(`${row}-${col}`, true);
        return newMap;
      });
      
      // Remove animation after it completes
      setTimeout(() => {
        setAnimatingTiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(`${row}-${col}`);
          return newMap;
        });
      }, 100); // Animation duration
    }
    
    // Always select the cell immediately
    selectCell(row, col);
  };

  // Function to determine cell color based on the correct solution
  const getCellColor = (rowIndex: number, colIndex: number) => {
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
    if (e.key.match(/^[a-zA-Z]$/) && e.key.length === 1) {
      // If a cell is selected, use that cell
      if (currentRow !== null && currentCol !== null && !completedRows[currentRow]) {
        const cellKey = `${currentRow}-${currentCol}`;
        
        // Update the tile with the new letter
        updateTile(currentRow, currentCol, e.key.toUpperCase());
        
        // Add animation to this tile
        setAnimatingTiles(prev => {
          const newMap = new Map(prev);
          newMap.set(cellKey, true);
          return newMap;
        });
        
        // Remove animation after it completes
        setTimeout(() => {
          setAnimatingTiles(prev => {
            const newMap = new Map(prev);
            newMap.delete(cellKey);
            return newMap;
          });
        }, 100); // Animation duration
        
        // Immediately move to next column or next row
        if (currentCol < 4) {
          // Move to next column in the same row
          selectCell(currentRow, currentCol + 1);
        } else if (currentRow < 4 && !completedRows[currentRow + 1]) {
          // Move to the first column of the next row if we're at the end of a row
          selectCell(currentRow + 1, 0);
        }
      } 
      // Otherwise find the first empty cell
      else {
        const nextEmptyCell = findNextEmptyCell();
        if (nextEmptyCell) {
          const [row, col] = nextEmptyCell;
          const cellKey = `${row}-${col}`;
          
          // Update the tile with the new letter
          updateTile(row, col, e.key.toUpperCase());
          
          // Add animation to this tile
          setAnimatingTiles(prev => {
            const newMap = new Map(prev);
            newMap.set(cellKey, true);
            return newMap;
          });
          
          // Remove animation after it completes
          setTimeout(() => {
            setAnimatingTiles(prev => {
              const newMap = new Map(prev);
              newMap.delete(cellKey);
              return newMap;
            });
          }, 100); // Animation duration
          
          // Immediately move to next column or next row
          if (col < 4) {
            // Move to next column in the same row
            selectCell(row, col + 1);
          } else if (row < 4 && !completedRows[row + 1]) {
            // Move to the first column of the next row if we're at the end of a row
            selectCell(row + 1, 0);
          }
        }
      }
    }
    // Handle backspace
    else if (e.key === "Backspace") {
      // If a cell is selected, clear that cell
      if (currentRow !== null && currentCol !== null && !completedRows[currentRow]) {
        // First clear the current cell
        updateTile(currentRow, currentCol, "");
        
        // If we're at the first column of the row
        if (currentCol === 0 && currentRow > 0) {
          // Move to the last column of the previous row (if it's not completed)
          if (!completedRows[currentRow - 1]) {
            selectCell(currentRow - 1, 4);
          } else {
            // Stay in current position if previous row is completed
            selectCell(currentRow, currentCol);
          }
        }
        // Otherwise move to previous column
        else if (currentCol > 0) {
          selectCell(currentRow, currentCol - 1);
        }
      } 
      // If no cell is selected, find the last filled cell
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
    // Handle arrow key navigation
    else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      // Only handle arrow keys if we have a selected cell
      if (currentRow !== null && currentCol !== null) {
        let newRow = currentRow;
        let newCol = currentCol;
        
        switch (e.key) {
          case "ArrowUp":
            // Move up one row if possible
            if (currentRow > 0) {
              newRow = currentRow - 1;
            }
            break;
          case "ArrowDown":
            // Move down one row if possible
            if (currentRow < 4) {
              newRow = currentRow + 1;
            }
            break;
          case "ArrowLeft":
            // Move left one column if possible
            if (currentCol > 0) {
              newCol = currentCol - 1;
            } 
            // Wrap to the end of the previous row if at the start of a row
            else if (currentRow > 0) {
              newRow = currentRow - 1;
              newCol = 4;
            }
            break;
          case "ArrowRight":
            // Move right one column if possible
            if (currentCol < 4) {
              newCol = currentCol + 1;
            } 
            // Wrap to the start of the next row if at the end of a row
            else if (currentRow < 4) {
              newRow = currentRow + 1;
              newCol = 0;
            }
            break;
        }
        
        // Don't move to completed rows
        if (completedRows[newRow]) {
          return;
        }
        
        // Apply the new cell selection
        if (newRow !== currentRow || newCol !== currentCol) {
          selectCell(newRow, newCol);
        }
      } 
      // If no cell is selected, select the first empty cell
      else {
        const nextEmptyCell = findNextEmptyCell();
        if (nextEmptyCell) {
          const [row, col] = nextEmptyCell;
          selectCell(row, col);
        }
      }
      
      // Prevent arrow keys from scrolling the page
      e.preventDefault();
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
                ? "border-4 border-primary ring-2 ring-primary/40 ring-offset-1"
                : "border-2",
              tile.letter !== "" ? "filled" : "text-transparent", // Make empty letters transparent
              (tile.status === "correct" || tile.status === "present" || tile.status === "absent") 
                ? "" // Let the status colors handle it
                : getCellColor(rowIndex, colIndex), // Apply color by row when no status set
              tile.status === "correct" ? "bg-[#6aaa64] border-[#6aaa64] text-white" : "",
              tile.status === "present" ? "bg-[#c9b458] border-[#c9b458] text-white" : "",
              tile.status === "absent" ? "bg-[#787c7e] border-[#787c7e] text-white" : "",
              // Add animation when a tile is being updated
              animatingTiles.has(`${rowIndex}-${colIndex}`) ? "animate-pop" : ""
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