import { describe, expect, it } from 'vitest';
import { getCentury, normalizeString, processGuess } from './game-logic';
import type { Theorem } from './theorems';

// Mock data for testing
const mockTheorems: Theorem[] = [
  {
    id: '1',
    name: 'Pythagorean Theorem',
    proposedBy: 'Pythagoras',
    yearProposed: -530,
    subfield: 'Geometry',
    educationLevel: 'High School',
    geographicalRegion: 'Greece',
    proofTechnique: 'Geometric proof',
  },
  {
    id: '2',
    name: "Fermat's Last Theorem",
    proposedBy: 'Fermat',
    provedBy: 'Andrew Wiles',
    yearProposed: 1637,
    yearProved: 1994,
    subfield: 'Number Theory',
    educationLevel: 'Graduate',
    geographicalRegion: 'France / UK',
    proofTechnique: 'Proof by contradiction',
  },
  {
    id: '3',
    name: 'Prime Number Theorem',
    proposedBy: 'Gauss / Legendre',
    provedBy: 'Hadamard / de la Vallée Poussin',
    yearProposed: 1790,
    yearProved: 1896,
    subfield: 'Number Theory',
    educationLevel: 'Undergraduate',
    geographicalRegion: 'Germany / France',
    proofTechnique: 'Complex Analysis',
  },
];

const theoremOfTheDay = mockTheorems[1]; // Fermat's Last Theorem

describe('Game Logic Utilities', () => {
  describe('normalizeString', () => {
    it('should convert to lowercase', () => {
      expect(normalizeString('TeStInG')).toBe('testing');
    });

    it('should remove special characters except spaces, slashes, commas, and hyphens', () => {
      expect(normalizeString('Th!s-is_a/test, string.')).toBe('ths-is a/test, string');
    });

    it('should trim leading/trailing whitespace', () => {
      expect(normalizeString('  padded string  ')).toBe('padded string');
    });

    it('should handle empty strings', () => {
      expect(normalizeString()).toBe('');
      expect(normalizeString('')).toBe('');
    });
  });

  describe('getCentury', () => {
    it('should correctly calculate AD centuries', () => {
      expect(getCentury(1637)).toBe(17);
      expect(getCentury(1994)).toBe(20);
      expect(getCentury(2000)).toBe(20);
      expect(getCentury(2001)).toBe(21);
    });

    it('should correctly calculate BC centuries', () => {
      expect(getCentury(-530)).toBe(-6);
      expect(getCentury(-1)).toBe(-1);
    });

    it('should handle year 0', () => {
      expect(getCentury(0)).toBe(0);
    });

    it('should return NaN for undefined or invalid input', () => {
      expect(getCentury(undefined)).toBeNaN();
    });
  });

  describe('processGuess', () => {
    it('should return correct feedback for a correct guess', () => {
      const guess = "Fermat's Last Theorem";
      const feedback = processGuess(guess, theoremOfTheDay, mockTheorems);
      expect(feedback.guessedTheoremName).toBe(guess);
      expect(feedback.propertiesFeedback.proposedByState).toBe('correct');
      expect(feedback.propertiesFeedback.provedByState).toBe('correct');
      expect(feedback.propertiesFeedback.yearProposedState).toBe('correct');
    });

    it('should return partial feedback for a partially correct guess', () => {
      const guess = 'Prime Number Theorem'; // Guessed theorem
      const feedback = processGuess(guess, theoremOfTheDay, mockTheorems);

      expect(feedback.guessedTheoremName).toBe(guess);
      // Subfield is the same
      expect(feedback.propertiesFeedback.subfieldState).toBe('correct');
      // Region has partial overlap ('France')
      expect(feedback.propertiesFeedback.geographicalRegionState).toBe('partial');
      // Proposed by has partial overlap ('Gauss' is not in 'Fermat')
      expect(feedback.propertiesFeedback.proposedByState).toBe('incorrect');
    });

    it('should handle year comparisons correctly', () => {
      const guess = 'Pythagorean Theorem'; // Guessed theorem
      const feedback = processGuess(guess, theoremOfTheDay, mockTheorems);

      // Guessed year (-530) is much lower than target (1637)
      expect(feedback.propertiesFeedback.yearProposedState).toBe('target_much_higher');
    });

    it('should handle unrecognized guesses', () => {
      const guess = 'An Unknown Theorem';
      const feedback = processGuess(guess, theoremOfTheDay, mockTheorems);

      expect(feedback.guessedTheoremName).toBe(guess);
      expect(feedback.propertiesFeedback.proposedByState).toBe('not_applicable');
      expect(feedback.propertiesFeedback.subfieldState).toBe('not_applicable');
    });
  });
});
