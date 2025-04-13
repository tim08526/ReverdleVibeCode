import {
  users,
  type User,
  type InsertUser,
  puzzles,
  type Puzzle,
  type InsertPuzzle,
  hints,
  type Hint,
  type InsertHint,
  type PuzzleWithHints,
} from "@shared/schema";
import { dailyHints } from "./puzzles";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Puzzle methods
  getPuzzles(): Promise<Puzzle[]>;
  getPuzzle(id: number): Promise<Puzzle | undefined>;
  getActivePuzzle(): Promise<PuzzleWithHints | undefined>;
  createPuzzle(puzzle: InsertPuzzle): Promise<Puzzle>;

  // Hint methods
  getHintsByPuzzleId(puzzleId: number): Promise<Hint[]>;
  createHint(hint: InsertHint): Promise<Hint>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private puzzles: Map<number, Puzzle>;
  private hints: Map<number, Hint>;
  private userId: number;
  private puzzleId: number;
  private hintId: number;

  constructor() {
    this.users = new Map();
    this.puzzles = new Map();
    this.hints = new Map();
    this.userId = 1;
    this.puzzleId = 1;
    this.hintId = 1;

    // Initialize with a default puzzle
    this.initializeDailyPuzzle();
  }

  private initializeDefaultPuzzle() {
    const puzzle: Puzzle = {
      id: this.puzzleId++,
      name: "Default Puzzle",
      active: true,
    };
    this.puzzles.set(puzzle.id, puzzle);

    const defaultHints: { text: string; answer: string }[] = [
      { text: "A color of the rainbow", answer: "GREEN" },
      { text: "Planet closest to the sun", answer: "VENUS" },
      { text: "Bird that can't fly", answer: "KIWIS" },
      { text: "Capital of France", answer: "PARIS" },
      { text: "Lux", answer: "LIGHT" },
    ];

    defaultHints.forEach((hint, index) => {
      const newHint: Hint = {
        id: this.hintId++,
        puzzleId: puzzle.id,
        rowIndex: index,
        text: hint.text,
        answer: hint.answer,
      };
      this.hints.set(newHint.id, newHint);
    });
  }

  private initializeDailyPuzzle() {
    const puzzle: Puzzle = {
      id: this.puzzleId++,
      name: "Daily Puzzle",
      active: true,
    };
    this.puzzles.set(puzzle.id, puzzle);

    const puzzleIndex = new Date().getDay() % dailyHints.length;

    const defaultHints: { text: string; answer: string }[] =
      dailyHints[puzzleIndex];

    defaultHints.forEach((hint, index) => {
      const newHint: Hint = {
        id: this.hintId++,
        puzzleId: puzzle.id,
        rowIndex: index,
        text: hint.text,
        answer: hint.answer,
      };
      this.hints.set(newHint.id, newHint);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Puzzle methods
  async getPuzzles(): Promise<Puzzle[]> {
    return Array.from(this.puzzles.values());
  }

  async getPuzzle(id: number): Promise<Puzzle | undefined> {
    return this.puzzles.get(id);
  }

  async getActivePuzzle(): Promise<PuzzleWithHints | undefined> {
    const activePuzzle = Array.from(this.puzzles.values()).find(
      (puzzle) => puzzle.active,
    );

    if (!activePuzzle) return undefined;

    const puzzleHints = Array.from(this.hints.values())
      .filter((hint) => hint.puzzleId === activePuzzle.id)
      .sort((a, b) => a.rowIndex - b.rowIndex);

    return {
      ...activePuzzle,
      hints: puzzleHints,
    };
  }

  async createPuzzle(insertPuzzle: InsertPuzzle): Promise<Puzzle> {
    const id = this.puzzleId++;
    const puzzle: Puzzle = { ...insertPuzzle, id };
    this.puzzles.set(id, puzzle);
    return puzzle;
  }

  // Hint methods
  async getHintsByPuzzleId(puzzleId: number): Promise<Hint[]> {
    return Array.from(this.hints.values())
      .filter((hint) => hint.puzzleId === puzzleId)
      .sort((a, b) => a.rowIndex - b.rowIndex);
  }

  async createHint(insertHint: InsertHint): Promise<Hint> {
    const id = this.hintId++;
    const hint: Hint = { ...insertHint, id };
    this.hints.set(id, hint);
    return hint;
  }
}

export const storage = new MemStorage();
