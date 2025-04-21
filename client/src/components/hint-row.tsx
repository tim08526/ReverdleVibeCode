import { useGameContext } from "@/lib/game-context";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Hint } from "@/lib/game-context";

interface HintRowProps {
  hint: Hint;
}

export default function HintRow({ hint }: HintRowProps) {
  const { currentRow, selectCell, completedRows, findNextEmptyCell } = useGameContext();

  const isActive = currentRow === hint.rowIndex;
  const isCompleted = completedRows[hint.rowIndex];
  
  const handleClick = () => {
    // Find the first empty cell in this row or use the first cell
    const nextEmptyCol = Array(5).findIndex((_,i) => findNextEmptyCell()?.[0] === hint.rowIndex && findNextEmptyCell()?.[1] === i);
    const colToSelect = nextEmptyCol >= 0 ? nextEmptyCol : 0;
    
    // Select the appropriate cell in this row
    selectCell(hint.rowIndex, colToSelect);
  };
  
  return (
    <div 
      className={cn(
        "hint-row mb-2 p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors",
        isActive ? "bg-blue-100 dark:bg-blue-900" : "bg-muted",
        isCompleted ? "bg-green-100 dark:bg-green-900" : "",
      )}
      onClick={handleClick}
      data-row={hint.rowIndex}
    >
      <span className="hint-number font-bold">{hint.rowIndex + 1}:</span>
      <p className="hint-text flex-1 ml-2 text-sm">{hint.text}</p>
    </div>
  );
}
