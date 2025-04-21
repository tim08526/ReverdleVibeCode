import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";

// Define types for the game state
export type TileStatus = "empty" | "filled" | "correct" | "present" | "absent";

export interface Tile {
  letter: string;
  status: TileStatus;
}

export interface Hint {
  id: number;
  rowIndex: number;
  text: string;
  answer: string;
}

export interface PuzzleData {
  id: number;
  name: string;
  hints: Hint[];
}

interface GameContextProps {
  puzzle: PuzzleData | null;
  isLoading: boolean;
  error: string | null;
  grid: Tile[][];
  currentRow: number | null;
  currentCol: number | null;
  completedRows: boolean[];
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  selectCell: (rowIndex: number, colIndex: number) => void;
  updateTile: (row: number, col: number, letter: string) => void;
  checkedRows: boolean[];
  checkRow: (rowIndex: number) => Promise<boolean>;
  isRowComplete: (rowIndex: number) => boolean;
  resetGame: () => void;
  checkAllRows: () => Promise<boolean>;
  gameCompleted: boolean;
  findNextEmptyCell: () => [number, number] | null;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [grid, setGrid] = useState<Tile[][]>(
    Array(5).fill(null).map(() => 
      Array(5).fill(null).map(() => ({ letter: "", status: "empty" }))
    )
  );
  const [currentRow, setCurrentRow] = useState<number | null>(null);
  const [currentCol, setCurrentCol] = useState<number | null>(null);
  const [completedRows, setCompletedRows] = useState<boolean[]>(Array(5).fill(false));

  const [checkedRows, setCheckedRows] = useState<boolean[]>(Array(5).fill(false));
  const [darkMode, setDarkMode] = useState<boolean>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);

  // Fetch puzzle data on component mount
  useEffect(() => {
    const fetchPuzzle = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/puzzle", {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch puzzle: ${response.statusText}`);
        }
        
        const puzzleData = await response.json();
        setPuzzle(puzzleData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPuzzle();
  }, []);

  // Apply dark mode based on state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Check if all rows are completed
  useEffect(() => {
    if (completedRows.every(status => status === true) && puzzle) {
      setGameCompleted(true);
    }
  }, [completedRows, puzzle]);

  function selectCell(rowIndex: number, colIndex: number) {
    // Don't allow selection of completed rows
    if (completedRows[rowIndex]) return;
    
    setCurrentRow(rowIndex);
    setCurrentCol(colIndex);
  }
  
  function findNextEmptyCell(): [number, number] | null {
    // Find the first empty cell in the grid
    for (let row = 0; row < 5; row++) {
      if (!completedRows[row]) {
        for (let col = 0; col < 5; col++) {
          if (grid[row][col].letter === "") {
            return [row, col];
          }
        }
      }
    }
    return null;
  }

  function updateTile(rowIndex: number, colIndex: number, letter: string) {
    if (completedRows[rowIndex]) return; // Don't update completed rows
    
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[rowIndex] = [...newGrid[rowIndex]];
      newGrid[rowIndex][colIndex] = {
        letter,
        status: letter ? "filled" : "empty"
      };
      return newGrid;
    });
  }

  function isRowComplete(rowIndex: number) {
    return grid[rowIndex].every(tile => tile.letter !== "");
  }

  async function checkRow(rowIndex: number): Promise<boolean> {
    if (completedRows[rowIndex] || !isRowComplete(rowIndex)) return false;
    
    try {
      const rowWord = grid[rowIndex].map(tile => tile.letter).join('');
      
      const response = await apiRequest("POST", "/api/check-row", {
        rowIndex,
        guess: rowWord
      });
      
      const data = await response.json();
      
      // Don't update the grid with color results - leave the background colors as they are
      // Just update letters if needed for consistency
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        newGrid[rowIndex] = [...newGrid[rowIndex]];
        
        data.result.forEach((result: {letter: string, status: TileStatus}, index: number) => {
          // Keep the same tile but ensure the letter is correct
          newGrid[rowIndex][index] = {
            ...newGrid[rowIndex][index],
            letter: result.letter,
            // Don't change the status - keep the pre-colored status
          };
        });
        
        return newGrid;
      });
      
      // If the row is correct, mark it as completed
      if (data.isCorrect) {
        // Apply a small delay before marking as completed
        // This gives time for any visual animations to complete
        setTimeout(() => {
          setCompletedRows(prev => {
            const newStatus = [...prev];
            newStatus[rowIndex] = true;
            return newStatus;
          });
          
          // If we've completed all rows except the last one, add a small delay
          // then check if we should reveal the final answer row
          const allRowsExceptLast = completedRows.slice(0, 4).every(status => status === true);
          if (allRowsExceptLast && rowIndex === 4) {
            setTimeout(() => {
              setGameCompleted(true);
            }, 500);
          }
          
          // Select the first cell in the next incomplete row if available
          if (rowIndex < 4 && !completedRows[rowIndex + 1]) {
            selectCell(rowIndex + 1, 0);
          }
        }, 300);
      } else {
        setTimeout(() => {
          setCheckedRows(prev => {
            const newStatus = [...prev];
            newStatus[rowIndex] = true;
            return newStatus;
          });
        }, 300);

        setCheckedRows(prev => {
          const newStatus = [...prev];
          newStatus[rowIndex] = false;
          return newStatus;
        });
      }
      
      return data.isCorrect;
    } catch (error) {
      console.error("Error checking row:", error);
      return false;
    }
  }

  async function checkAllRows(): Promise<boolean> {
    if (!puzzle) return false;
    
    let allCorrect = true;
    
    // Check each row that is filled but not completed
    for (let row = 0; row < 5; row++) {
      if (!completedRows[row] && isRowComplete(row)) {
        const isCorrect = await checkRow(row);
        if (!isCorrect) {
          allCorrect = false;
        }
      } else if (!completedRows[row]) {
        allCorrect = false;
      }
    }
    
    return allCorrect;
  }

  function resetGame() {
    // Reset the grid
    setGrid(
      Array(5).fill(null).map(() => 
        Array(5).fill(null).map(() => ({ letter: "", status: "empty" }))
      )
    );
    
    // Reset game state
    setCurrentRow(null);
    setCurrentCol(null);
    setCompletedRows(Array(5).fill(false));
    setGameCompleted(false);
  }

  const value = {
    puzzle,
    isLoading,
    error,
    grid,
    currentRow,
    currentCol,
    completedRows,
    darkMode,
    setDarkMode,
    selectCell,
    updateTile,
    checkedRows,
    checkRow,
    isRowComplete,
    resetGame,
    checkAllRows,
    gameCompleted,
    findNextEmptyCell,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}
