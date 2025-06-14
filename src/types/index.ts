export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guesses: { [numGuesses: number]: number };
}

export interface User {
  id: string;
  email: string;
  stats: GameStats;
}

export type WordState = 'correct' | 'present' | 'absent' | 'empty';
export interface GuessWord {
  word: string;
  state: WordState;
}

export type PropertyComparisonState = 'correct' | 'incorrect' | 'partial' | 'not_applicable';
export type YearComparisonState =
  | 'correct'
  | 'target_higher'
  | 'target_lower'
  | 'target_much_higher'
  | 'target_much_lower'
  | 'not_applicable';

export interface TheoremPropertiesFeedback {
  guessedTheoremName?: string;

  proposedByGuessed?: string;
  proposedByCorrect?: string;
  proposedByState: PropertyComparisonState;

  provedByGuessed?: string;
  provedByCorrect?: string;
  provedByState: PropertyComparisonState;

  yearProposedGuessed?: number;
  yearProposedCorrect?: number;
  yearProposedState: YearComparisonState;

  yearProvedGuessed?: number;
  yearProvedCorrect?: number;
  yearProvedState: YearComparisonState;

  subfieldGuessed?: string;
  subfieldCorrect?: string;
  subfieldState: PropertyComparisonState;

  educationLevelGuessed?: string;
  educationLevelCorrect?: string;
  educationLevelState: PropertyComparisonState;

  geographicalRegionGuessed?: string;
  geographicalRegionCorrect?: string;
  geographicalRegionState: PropertyComparisonState;

  proofTechniqueGuessed?: string;
  proofTechniqueCorrect?: string;
  proofTechniqueState: PropertyComparisonState;
}

export interface GuessFeedback {
  guessedTheoremName: string;
  propertiesFeedback: TheoremPropertiesFeedback;
  guessString: string;
}

// Re-export Theorem from theorems.ts to avoid circular dependencies if other types need it.
// However, it's generally better if theorems.ts doesn't import from types/index.ts.
// For now, if Theorem type is needed here, ensure it's a simple re-export or duplicate definition.
// This type is primarily used by the frontend logic.
export type { Theorem } from '@/lib/theorems';
