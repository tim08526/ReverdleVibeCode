import { useGameContext } from "@/lib/game-context";
import { Check, Delete } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Keyboard() {
  const {
    currentRow,
    currentCol,
    grid,
    updateTile,
    checkRow,
    selectCell,
    findNextEmptyCell,
    checkAllRows,
    completedRows,
  } = useGameContext();

  // Define keyboard rows
  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
  ];

  // Function to find key status based on current grid state
  const getKeyStatus = (key: string) => {
    if (key === "ENTER" || key === "BACKSPACE") return "";

    // Track status of each letter in the grid
    let status = "";

    // Check if the key is in the grid and its status
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const tile = grid[row][col];
        if (tile.letter === key) {
          // Prioritize statuses: correct > present > absent
          if (tile.status === "correct") {
            return "correct";
          } else if (tile.status === "present" && status !== "correct") {
            status = "present";
          } else if (
            tile.status === "absent" &&
            status !== "correct" &&
            status !== "present"
          ) {
            status = "absent";
          }
        }
      }
    }

    return status;
  };

  const handleKeyClick = (key: string) => {
    if (key === "BACKSPACE") {
      // If a cell is selected, clear that cell
      if (
        currentRow !== null &&
        currentCol !== null &&
        !completedRows[currentRow]
      ) {
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
    } else if (key === "ENTER") {
      // Check the current row if it's complete
      if (currentRow !== null && !completedRows[currentRow]) {
        checkRow(currentRow);
      }
      // Otherwise find a completed row to check
      else {
        for (let row = 0; row < 5; row++) {
          if (
            !completedRows[row] &&
            grid[row].every((tile) => tile.letter !== "")
          ) {
            checkRow(row);
            break;
          }
        }
      }
    } else {
      // If a cell is selected, use that cell
      if (
        currentRow !== null &&
        currentCol !== null &&
        !completedRows[currentRow]
      ) {
        updateTile(currentRow, currentCol, key);

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
          updateTile(row, col, key);

          // Auto-advance to next column in the same row if possible
          if (col < 4) {
            selectCell(row, col + 1);
          }
        }
      }
      // Check puzzle if all row are filled
      if (completedRows.every((row) => row)) {
        checkAllRows();
      }
    }
  };

  return (
    <div id="keyboard" className="w-full max-w-md">
      {keyboardRows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={cn(
            "flex justify-center gap-1 mb-2",
            rowIndex === 1 && "px-2", // Middle row indent
          )}
        >
          {row.map((key) => (
            <button
              key={key}
              className={cn(
                "key uppercase rounded font-bold transition-colors h-14",
                key === "ENTER" || key === "BACKSPACE"
                  ? "px-3 bg-muted-foreground hover:bg-foreground/80 text-muted"
                  : "flex-1 min-w-[2rem] bg-muted hover:bg-muted/80",
                getKeyStatus(key) === "correct" &&
                  "bg-[#6aaa64] border-[#6aaa64] text-white hover:bg-[#569b51]",
                getKeyStatus(key) === "present" &&
                  "bg-[#c9b458] border-[#c9b458] text-white hover:bg-[#b8a346]",
                getKeyStatus(key) === "absent" &&
                  "bg-[#787c7e] border-[#787c7e] text-white hover:bg-[#676a6c]",
              )}
              onClick={() => handleKeyClick(key)}
              data-key={key}
            >
              {key === "ENTER" ? (
                <span className="flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Enter
                </span>
              ) : key === "BACKSPACE" ? (
                <Delete className="h-4 w-4" />
              ) : (
                key
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
