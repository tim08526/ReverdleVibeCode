import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface HelpModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">How to Play</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <ul className="list-disc pl-5 space-y-2">
            <li>Reverse the wordle! </li>
            <li>Each row corresponds to a 5-letter word that matches the given hint.</li>
            <li>Focus on one row at a time by clicking on a tile.</li>
            <li>Complete all five rows to solve the puzzle!</li>
            <li>Use the check answer button to check individual rows.</li>
          </ul>
          
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-2">Examples</h3>
            <div className="flex gap-2 mb-2">
              <div className="aspect-square w-10 flex items-center justify-center text-xl font-bold rounded bg-[#6aaa64] text-white">G</div>
              <div className="aspect-square w-10 flex items-center justify-center text-xl font-bold rounded bg-[#787c7e] text-white">R</div>
              <div className="aspect-square w-10 flex items-center justify-center text-xl font-bold rounded bg-[#787c7e] text-white">E</div>
              <div className="aspect-square w-10 flex items-center justify-center text-xl font-bold rounded bg-[#787c7e] text-white">E</div>
              <div className="aspect-square w-10 flex items-center justify-center text-xl font-bold rounded bg-[#787c7e] text-white">N</div>
            </div>
            <p className="text-sm mb-4">The letter G is correct. The other letters are not in the solution word.</p>
            
            <div className="flex gap-2">
              <div className="aspect-square w-10 flex items-center justify-center text-xl font-bold rounded bg-[#787c7e] text-white">F</div>
              <div className="aspect-square w-10 flex items-center justify-center text-xl font-bold rounded bg-[#c9b458] text-white">L</div>
              <div className="aspect-square w-10 flex items-center justify-center text-xl font-bold rounded bg-[#787c7e] text-white">U</div>
              <div className="aspect-square w-10 flex items-center justify-center text-xl font-bold rounded bg-[#787c7e] text-white">T</div>
              <div className="aspect-square w-10 flex items-center justify-center text-xl font-bold rounded bg-[#787c7e] text-white">E</div>
            </div>
            <p className="text-sm">The letter L is in the solution word but in the wrong position.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default HelpModal;
