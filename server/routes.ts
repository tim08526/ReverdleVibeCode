import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // API routes
  app.get("/api/puzzle", async (req, res) => {
    try {
      const activePuzzle = await storage.getActivePuzzle();
      
      if (!activePuzzle) {
        return res.status(404).json({ message: "No active puzzle found" });
      }
      
      // Return puzzle without answers for security
      const safeHints = activePuzzle.hints.map(hint => ({
        id: hint.id,
        rowIndex: hint.rowIndex,
        text: hint.text
      }));
      
      return res.json({
        id: activePuzzle.id,
        name: activePuzzle.name,
        hints: safeHints
      });
    } catch (error) {
      console.error("Error fetching puzzle:", error);
      return res.status(500).json({ message: "Failed to fetch puzzle" });
    }
  });
  
  // Check row answer endpoint
  const checkRowSchema = z.object({
    rowIndex: z.number().min(0).max(4),
    guess: z.string().length(5)
  });
  
  app.post("/api/check-row", async (req, res) => {
    try {
      const validation = checkRowSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validation.error.errors 
        });
      }
      
      const { rowIndex, guess } = validation.data;
      const activePuzzle = await storage.getActivePuzzle();
      
      if (!activePuzzle) {
        return res.status(404).json({ message: "No active puzzle found" });
      }
      
      const targetHint = activePuzzle.hints.find(hint => hint.rowIndex === rowIndex);
      
      if (!targetHint) {
        return res.status(404).json({ message: "Hint not found for row" });
      }

      // Get the solution word (from the last row)
      const solutionHint = activePuzzle.hints[activePuzzle.hints.length - 1];
      const solution = solutionHint.answer.toUpperCase();
      
      const correctAnswer = targetHint.answer.toUpperCase();
      const userGuess = guess.toUpperCase();
      
      const isCorrect = userGuess === correctAnswer;
      
      // Create result with letter-by-letter feedback
      // Special case: for the last row, compare against itself (solution)
      // For other rows, compare against the solution for Wordle-style colors
      const result = Array(5).fill(null).map((_, index) => {
        // Last row is always the solution and all letters should be correct
        if (rowIndex === activePuzzle.hints.length - 1) {
          return { letter: userGuess[index], status: userGuess[index] === correctAnswer[index] ? "correct" : "absent" };
        } 
        
        // For all other rows, we check if the letter matches the solution
        if (userGuess[index] === solution[index]) {
          return { letter: userGuess[index], status: "correct" };
        } else if (solution.includes(userGuess[index])) {
          return { letter: userGuess[index], status: "present" };
        } else {
          return { letter: userGuess[index], status: "absent" };
        }
      });
      
      return res.json({
        isCorrect,
        result
      });
    } catch (error) {
      console.error("Error checking row:", error);
      return res.status(500).json({ message: "Failed to check row" });
    }
  });

  return httpServer;
}
