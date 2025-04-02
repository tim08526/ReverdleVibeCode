import { useState } from "react";
import { useGameContext } from "@/lib/game-context";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Hint } from "@/lib/game-context";

interface HintRowProps {
  hint: Hint;
  showAll: boolean;
}

export default function HintRow({ hint, showAll }: HintRowProps) {
  const [showHint, setShowHint] = useState(false);
  const { currentRow, selectRow, completedRows } = useGameContext();
  
  const isActive = currentRow === hint.rowIndex;
  const isCompleted = completedRows[hint.rowIndex];
  
  const handleClick = () => {
    selectRow(hint.rowIndex);
  };
  
  return (
    <div 
      className={cn(
        "hint-row mb-2 p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors",
        isActive ? "bg-blue-100 dark:bg-blue-900" : "bg-muted",
        isCompleted ? "bg-green-100 dark:bg-green-900" : ""
      )}
      onClick={handleClick}
      data-row={hint.rowIndex}
    >
      <span className="hint-number font-bold">{hint.rowIndex + 1}:</span>
      <p className="hint-text flex-1 ml-2 text-sm">{hint.text}</p>
      <Button
        variant="ghost"
        size="sm"
        className="hint-toggle text-xs px-2 py-1 rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          setShowHint(!showHint);
        }}
      >
        {showHint || showAll ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
