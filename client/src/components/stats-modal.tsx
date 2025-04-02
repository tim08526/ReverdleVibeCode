import { useGameContext } from "@/lib/game-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface StatsModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StatsModal({ open, onOpenChange }: StatsModalProps) {
  const { completedRows, resetGame } = useGameContext();
  
  // Count completed rows
  const completedRowCount = completedRows.filter(status => status === true).length;
  const completionPercentage = (completedRowCount / 5) * 100;
  
  const handleNewPuzzle = () => {
    if (onOpenChange) onOpenChange(false);
    resetGame();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Statistics</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-3xl font-bold">{completedRowCount}</p>
            <p className="text-sm">Rows Completed</p>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-3xl font-bold">{completionPercentage.toFixed(0)}%</p>
            <p className="text-sm">Completion</p>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2">Puzzle Status</h3>
        <div className="space-y-2">
          {completedRows.map((isCompleted, index) => (
            <div key={index} className="flex items-center">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-[#6aaa64]" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <p className="ml-2">Row {index + 1}: {isCompleted ? 'Completed' : 'Incomplete'}</p>
            </div>
          ))}
        </div>
        
        <DialogFooter className="mt-6">
          <Button 
            className="w-full bg-[#6aaa64] hover:bg-[#569b51] text-white"
            onClick={handleNewPuzzle}
          >
            New Puzzle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StatsModal;
