'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  GameStats,
  GuessFeedback,
  PropertyComparisonState,
  TheoremPropertiesFeedback,
  YearComparisonState,
} from '@/types';
import { HelpCircle, Send } from 'lucide-react';
import FeedbackDisplay from '@/components/TheoremGuess/FeedbackDisplay';
import GameEndDisplay from '@/components/TheoremGuess/GameEndDisplay';
import Header from '@/components/TheoremGuess/Header';
import HintDisplay from '@/components/TheoremGuess/HintDisplay';
import { TheoremCombobox } from '@/components/TheoremGuess/TheoremCombobox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSecureLocalStorageItem, isGuessFeedback, safeParseJSON } from '@/lib/security';
import { getTheoremOfTheDay, THEOREMS, type Theorem } from '@/lib/theorems';
import { useToast } from '@/hooks/use-toast';

const MAX_GUESSES = 10;

const normalizeString = (str: string = '') =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s\/,-]/g, '')
    .trim();

export default function HomePage() {
  const [theorem, setTheorem] = useState<Theorem | null>(null);
  const [guesses, setGuesses] = useState<GuessFeedback[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'won' | 'lost'>('loading');
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guesses: {},
  });
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTheoremForGuess, setSelectedTheoremForGuess] = useState<string | undefined>(
    undefined
  );
  const [hintUsedToday, setHintUsedToday] = useState(false);
  const [revealedHintMessage, setRevealedHintMessage] = useState<string | null>(null);
  const [duplicateGuessToHighlight, setDuplicateGuessToHighlight] = useState<string | null>(null);

  // Type guard for GameStats
  const isValidGameStats = (value: unknown): value is GameStats => {
    if (typeof value !== 'object' || value === null) return false;
    const stats = value as Record<string, unknown>;
    return (
      typeof stats.gamesPlayed === 'number' &&
      typeof stats.gamesWon === 'number' &&
      typeof stats.currentStreak === 'number' &&
      typeof stats.maxStreak === 'number' &&
      typeof stats.guesses === 'object' &&
      stats.guesses !== null &&
      Object.values(stats.guesses as Record<string, unknown>).every(v => typeof v === 'number')
    );
  };

  // Load game state from localStorage on mount
  useEffect(() => {
    const loadGameState = () => {
      setIsMounted(true);
      const dailyTheorem = getTheoremOfTheDay();
      setTheorem(dailyTheorem);

      // Load and validate stats
      const storedStats = localStorage.getItem('theoremGuessStats');
      if (storedStats) {
        const defaultStats: GameStats = {
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          maxStreak: 0,
          guesses: {},
        };
        const parsedStats = safeParseJSON(storedStats, defaultStats, isValidGameStats);
        setStats(parsedStats);
      }

      const lastPlayedTheoremId = localStorage.getItem('lastPlayedTheoremId');
      const lastPlayDate = localStorage.getItem('lastPlayDate');
      const todayStr = new Date().toDateString();

      // Check if we need to reset the game state for a new day
      if (lastPlayedTheoremId !== dailyTheorem.id || lastPlayDate !== todayStr) {
        // Reset game state for a new day
        localStorage.setItem('todaysGuesses', '[]');
        localStorage.setItem('todaysAttempt', '0');
        localStorage.setItem('todaysGameState', 'playing');
        localStorage.setItem('todaysHintUsed', 'false');
        localStorage.removeItem('todaysRevealedHint');

        setGuesses([]);
        setCurrentAttempt(0);
        setGameState('playing');
        setHintUsedToday(false);
        setRevealedHintMessage(null);
        setSelectedTheoremForGuess(undefined);
        setDuplicateGuessToHighlight(null);
      } else {
        // Load existing game state with proper type safety
        const savedGuesses =
          getSecureLocalStorageItem<GuessFeedback[]>(
            'todaysGuesses',
            (value): value is GuessFeedback[] =>
              Array.isArray(value) && value.every(isGuessFeedback)
          ) || [];

        const savedAttempt = Math.max(
          0,
          Math.min(MAX_GUESSES, parseInt(localStorage.getItem('todaysAttempt') || '0', 10) || 0)
        );

        const savedGameState =
          getSecureLocalStorageItem<'playing' | 'won' | 'lost'>(
            'todaysGameState',
            (val): val is 'playing' | 'won' | 'lost' =>
              val === 'playing' || val === 'won' || val === 'lost'
          ) || 'playing';

        const savedHintUsed = localStorage.getItem('todaysHintUsed') === 'true';
        const savedRevealedHint = localStorage.getItem('todaysRevealedHint');

        setGuesses(savedGuesses);
        setCurrentAttempt(savedAttempt);
        setGameState(savedGameState);
        setHintUsedToday(savedHintUsed);

        if (savedHintUsed && savedRevealedHint) {
          setRevealedHintMessage(savedRevealedHint);
        }
      }

      // Update last played info
      localStorage.setItem('lastPlayedTheoremId', dailyTheorem.id);
      localStorage.setItem('lastPlayDate', todayStr);
    };

    loadGameState();
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (!isMounted || gameState === 'loading') return;

    try {
      // Only save valid stats
      if (isValidGameStats(stats)) {
        localStorage.setItem('theoremGuessStats', JSON.stringify(stats));
      }

      // Only save valid guesses
      if (isValidGameStats(guesses)) {
        localStorage.setItem('todaysGuesses', JSON.stringify(guesses));
      }

      // Ensure currentAttempt is within bounds
      const safeCurrentAttempt = Math.max(0, Math.min(MAX_GUESSES, currentAttempt));
      localStorage.setItem('todaysAttempt', safeCurrentAttempt.toString());

      // Ensure gameState is valid
      const safeGameState = ['playing', 'won', 'lost'].includes(gameState) ? gameState : 'playing';
      localStorage.setItem('todaysGameState', safeGameState);

      // Save hint state
      localStorage.setItem('todaysHintUsed', String(!!hintUsedToday));

      // Save revealed hint message if it exists
      if (revealedHintMessage && typeof revealedHintMessage === 'string') {
        localStorage.setItem('todaysRevealedHint', revealedHintMessage);
      } else {
        localStorage.removeItem('todaysRevealedHint');
      }
    } catch {
      toast({
        title: 'Error saving game state',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  }, [
    stats,
    guesses,
    currentAttempt,
    gameState,
    isMounted,
    hintUsedToday,
    revealedHintMessage,
    toast,
  ]);

  useEffect(() => {
    if (duplicateGuessToHighlight) {
      const timer = setTimeout(() => {
        setDuplicateGuessToHighlight(null);
      }, 3000); // Highlight for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [duplicateGuessToHighlight]);

  /**
   * Updates game statistics when a game ends
   * @param win Whether the game was won
   * @param numGuesses Number of guesses made (only used when game is won)
   */
  const updateStatsOnGameEnd = useCallback((win: boolean, numGuesses?: number) => {
    setStats((prevStats: GameStats) => {
      // Calculate basic stats
      const newGamesPlayed = prevStats.gamesPlayed + 1;
      const newGamesWon = win ? prevStats.gamesWon + 1 : prevStats.gamesWon;
      const newCurrentStreak = win ? prevStats.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(prevStats.maxStreak, newCurrentStreak);

      // Create a Map for guess distribution to prevent prototype pollution
      const guessDistribution = new Map<number, number>();

      // Initialize the distribution with all possible guess counts (1 to MAX_GUESSES)
      for (let i = 1; i <= MAX_GUESSES; i++) {
        guessDistribution.set(i, 0);
      }

      // Load existing guess counts from previous stats
      Object.entries(prevStats.guesses).forEach(([key, value]) => {
        const guessCount = parseInt(key, 10);
        if (Number.isInteger(guessCount) && guessCount > 0 && guessCount <= MAX_GUESSES) {
          guessDistribution.set(guessCount, value);
        }
      });

      // If the game was won, update the guess count for this win
      if (win && typeof numGuesses === 'number' && numGuesses > 0 && numGuesses <= MAX_GUESSES) {
        const currentCount = guessDistribution.get(numGuesses) || 0;
        guessDistribution.set(numGuesses, currentCount + 1);
      }

      // Convert Map back to object for storage
      const guesses: Record<number, number> = Object.fromEntries(
        [...guessDistribution].filter(
          ([guessNum, count]) =>
            typeof guessNum === 'number' &&
            Number.isInteger(guessNum) &&
            guessNum > 0 &&
            guessNum <= MAX_GUESSES &&
            typeof count === 'number' &&
            Number.isInteger(count) &&
            count > 0
        )
      );

      return {
        gamesPlayed: newGamesPlayed,
        gamesWon: newGamesWon,
        currentStreak: newCurrentStreak,
        maxStreak: newMaxStreak,
        guesses,
      };
    });
  }, []);

  const getCentury = (yearInput?: number): number => {
    const year = Number(yearInput);
    if (yearInput === undefined || isNaN(year)) return NaN;
    if (year === 0) return 0;
    const absYear = Math.abs(year);
    const century = Math.floor((absYear - 1) / 100) + 1;
    return year < 0 ? -century : century;
  };

  const processGuess = useCallback(
    (guessStr: string, targetTheorem: Theorem, allTheorems: Theorem[]): GuessFeedback => {
      let propertiesFeedbackResult: TheoremPropertiesFeedback;
      const guessedTheorem = allTheorems.find(
        t => normalizeString(t.name) === normalizeString(guessStr)
      );

      const createPropertyState = (
        gValInput?: string | number,
        tValInput?: string | number,
        isPotentiallyMultiValue: boolean = false
      ): PropertyComparisonState => {
        const normalizeItemForComparison = (item: string) =>
          item
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .trim();

        const gNorm = gValInput !== undefined ? String(gValInput).trim() : undefined;
        const tNorm = tValInput !== undefined ? String(tValInput).trim() : undefined;

        const gNormClean = gNorm !== undefined ? normalizeString(gNorm) : undefined;
        const tNormClean = tNorm !== undefined ? normalizeString(tNorm) : undefined;

        if (gNormClean === undefined && tNormClean === undefined) return 'not_applicable';
        if (gNormClean === undefined || tNormClean === undefined) return 'not_applicable';

        if (gNormClean === tNormClean) return 'correct';

        if (isPotentiallyMultiValue && gNorm && tNorm) {
          const delimiters = /\s*\/\s*|\s*,\s*/g;

          const gItems = gNorm
            .split(delimiters)
            .map(s => normalizeItemForComparison(s.trim()))
            .filter(s => s.length > 0);
          const tItems = tNorm
            .split(delimiters)
            .map(s => normalizeItemForComparison(s.trim()))
            .filter(s => s.length > 0);

          const intersection = gItems.filter(item => tItems.includes(item));

          if (intersection.length > 0) {
            return 'partial';
          }
        }
        return 'incorrect';
      };

      const createYearState = (gValInput?: number, tValInput?: number): YearComparisonState => {
        const gVal = Number(gValInput);
        const tVal = Number(tValInput);

        if (gValInput === undefined && tValInput === undefined) return 'not_applicable';
        if (gValInput === undefined || tValInput === undefined || isNaN(gVal) || isNaN(tVal)) {
          return 'not_applicable';
        }
        if (gVal === tVal) return 'correct';

        const targetCentury = getCentury(tVal);
        const guessedCentury = getCentury(gVal);

        const targetIsBC = tVal < 0;
        const guessedIsBC = gVal < 0;

        if (targetIsBC !== guessedIsBC) {
          return tVal > gVal ? 'target_much_higher' : 'target_much_lower';
        }

        if (targetCentury === guessedCentury) {
          return tVal > gVal ? 'target_higher' : 'target_lower';
        } else {
          return tVal > gVal ? 'target_much_higher' : 'target_much_lower';
        }
      };

      if (guessedTheorem) {
        propertiesFeedbackResult = {
          guessedTheoremName: guessedTheorem.name,

          proposedByGuessed: guessedTheorem.proposedBy,
          proposedByCorrect: targetTheorem.proposedBy,
          proposedByState: createPropertyState(
            guessedTheorem.proposedBy,
            targetTheorem.proposedBy,
            true
          ),

          provedByGuessed: guessedTheorem.provedBy,
          provedByCorrect: targetTheorem.provedBy,
          provedByState: createPropertyState(guessedTheorem.provedBy, targetTheorem.provedBy, true),

          yearProposedGuessed: guessedTheorem.yearProposed,
          yearProposedCorrect: targetTheorem.yearProposed,
          yearProposedState: createYearState(
            guessedTheorem.yearProposed,
            targetTheorem.yearProposed
          ),

          yearProvedGuessed: guessedTheorem.yearProved,
          yearProvedCorrect: targetTheorem.yearProved,
          yearProvedState: createYearState(guessedTheorem.yearProved, targetTheorem.yearProved),

          subfieldGuessed: guessedTheorem.subfield,
          subfieldCorrect: targetTheorem.subfield,
          subfieldState: createPropertyState(guessedTheorem.subfield, targetTheorem.subfield),

          educationLevelGuessed: guessedTheorem.educationLevel,
          educationLevelCorrect: targetTheorem.educationLevel,
          educationLevelState: createPropertyState(
            guessedTheorem.educationLevel,
            targetTheorem.educationLevel
          ),

          geographicalRegionGuessed: guessedTheorem.geographicalRegion,
          geographicalRegionCorrect: targetTheorem.geographicalRegion,
          geographicalRegionState: createPropertyState(
            guessedTheorem.geographicalRegion,
            targetTheorem.geographicalRegion,
            true
          ),

          proofTechniqueGuessed: guessedTheorem.proofTechnique,
          proofTechniqueCorrect: targetTheorem.proofTechnique,
          proofTechniqueState: createPropertyState(
            guessedTheorem.proofTechnique,
            targetTheorem.proofTechnique
          ),
        };
      } else {
        propertiesFeedbackResult = {
          proposedByState: 'not_applicable',
          provedByState: 'not_applicable',
          yearProposedState: 'not_applicable',
          yearProvedState: 'not_applicable',
          subfieldState: 'not_applicable',
          educationLevelState: 'not_applicable',
          geographicalRegionState: 'not_applicable',
          proofTechniqueState: 'not_applicable',

          proposedByCorrect: targetTheorem.proposedBy,
          provedByCorrect: targetTheorem.provedBy,
          yearProposedCorrect: targetTheorem.yearProposed,
          yearProvedCorrect: targetTheorem.yearProved,
          subfieldCorrect: targetTheorem.subfield,
          educationLevelCorrect: targetTheorem.educationLevel,
          geographicalRegionCorrect: targetTheorem.geographicalRegion,
          proofTechniqueCorrect: targetTheorem.proofTechnique,
        };
      }

      return {
        guessedTheoremName: targetTheorem.name,
        propertiesFeedback: propertiesFeedbackResult,
        guessString: guessStr,
      };
    },
    []
  );

  const handleGuessSubmit = useCallback(
    (guessStr: string) => {
      if (gameState !== 'playing' || currentAttempt >= MAX_GUESSES || !theorem) return;

      const feedback = processGuess(guessStr, theorem, THEOREMS);
      const newGuesses = [...guesses, feedback];
      setGuesses(newGuesses);

      const normalizedGuessStr = normalizeString(guessStr);
      const normalizedTargetName = normalizeString(theorem.name);

      if (normalizedGuessStr === normalizedTargetName) {
        setGameState('won');
        toast({ title: 'Correct!', description: 'You guessed the theorem!', duration: 3000 });
        updateStatsOnGameEnd(true, currentAttempt + 1);
      } else if (currentAttempt + 1 >= MAX_GUESSES) {
        setGameState('lost');
        toast({
          title: 'Game Over',
          description: `The theorem was: ${theorem.name}`,
          variant: 'destructive',
          duration: 5000,
        });
        updateStatsOnGameEnd(false);
      } else {
        toast({
          title: 'Incorrect Guess',
          description: 'Check the property feedback and try again.',
          duration: 2000,
        });
      }
      setCurrentAttempt(prev => prev + 1);
    },
    [gameState, currentAttempt, theorem, processGuess, guesses, toast, updateStatsOnGameEnd]
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTheoremForGuess) return;

    const normalizedCurrentGuess = normalizeString(selectedTheoremForGuess);
    const isDuplicate = guesses.some(
      g => normalizeString(g.guessString) === normalizedCurrentGuess
    );

    if (isDuplicate) {
      toast({
        title: 'Already Guessed!',
        description: `You've already tried "${selectedTheoremForGuess}".`,
        variant: 'destructive',
        duration: 3000,
      });
      setDuplicateGuessToHighlight(selectedTheoremForGuess);
      setSelectedTheoremForGuess(undefined); // Clear the combobox
      return;
    }

    handleGuessSubmit(selectedTheoremForGuess);
    setSelectedTheoremForGuess(undefined); // Clear the combobox selection after submit
  };

  const handlePlayAgain = () => {
    const newTheorem = getTheoremOfTheDay();
    setTheorem(newTheorem);
    setGuesses([]);
    setCurrentAttempt(0);
    setGameState('playing');
    setHintUsedToday(false);
    setRevealedHintMessage(null);
    setSelectedTheoremForGuess(undefined);
    setDuplicateGuessToHighlight(null);
    localStorage.setItem('lastPlayedTheoremId', newTheorem.id);
    localStorage.setItem('lastPlayDate', new Date().toDateString());
    localStorage.setItem('todaysGuesses', '[]');
    localStorage.setItem('todaysAttempt', '0');
    localStorage.setItem('todaysGameState', 'playing');
    localStorage.setItem('todaysHintUsed', 'false');
    localStorage.removeItem('todaysRevealedHint');
  };

  const handleShare = () => {
    if (!theorem) return;
    const shareText = `TheoremGuess ${new Date().toLocaleDateString()} - ${gameState === 'won' ? `${currentAttempt}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`}\n\nCan you guess today's theorem? ${window.location.href}`;

    navigator.clipboard
      .writeText(shareText)
      .then(() =>
        toast({
          title: 'Copied to clipboard!',
          description: 'Share your results with friends!',
          duration: 3000,
        })
      )
      .catch(() =>
        toast({
          title: 'Copy failed',
          description: 'Could not copy results.',
          variant: 'destructive',
          duration: 3000,
        })
      );
  };

  const handleRequestHint = useCallback(() => {
    if (hintUsedToday || gameState !== 'playing' || !theorem) return;
    // Look at all properties that have been determined to be green so far and
    // randomly share the correct property from one that has not been learned yet.
    const greenProperties = guesses.filter(
      guess =>
        guess && guess.propertiesFeedback && guess.propertiesFeedback.proposedByState === 'correct'
    );
    const randomGreenProperty = greenProperties[Math.floor(Math.random() * greenProperties.length)];

    setRevealedHintMessage(
      `Hint: The ${randomGreenProperty.propertiesFeedback.proposedByState} is ${randomGreenProperty.propertiesFeedback.proposedByCorrect}.`
    );
    setHintUsedToday(true);
  }, [hintUsedToday, gameState, theorem, guesses]);

  if (gameState === 'loading' || !theorem) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground items-center justify-center">
        <p className="text-xl font-headline">Loading TheoremGuess...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-xl border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary">
              Guess the Theorem!
            </CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              You have {MAX_GUESSES - currentAttempt}{' '}
              {MAX_GUESSES - currentAttempt === 1 ? 'attempt' : 'attempts'} remaining.
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-accent"
                  >
                    <HelpCircle size={18} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline">
                      How to Play TheoremGuess
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Guess the famous mathematical theorem in {MAX_GUESSES} tries.
                    </AlertDialogDescription>
                    <div className="text-sm text-muted-foreground space-y-2 text-left pt-2">
                      <p>
                        Select a theorem from the list. If your guess matches a known theorem,
                        you'll get feedback on its properties.
                      </p>
                      <p className="pt-2">
                        <strong>Property Feedback (if your guess is a recognized theorem):</strong>
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <strong>
                            Proposed By, Proved By, Subfield, Education Level, Geographical Region,
                            Proof Technique:
                          </strong>
                          <br />
                          🟩 Correct (Exact Match).
                          <br />
                          🟨 Partial Match (Some elements overlap, e.g., one of several
                          authors/regions is correct. Applies to Proposed/Proved By and Geographical
                          Region).
                          <br />
                          🟥 Incorrect (No match or no overlap).
                        </li>
                        <li>
                          <strong>Year Proposed, Year Proved:</strong>
                          <br />
                          🟩 Exact Match.
                          <br />
                          🟨 Target year is later (↑) or earlier (↓) but in the same century.
                          <br />
                          🟥 Target year is much later (↑) or much earlier (↓) in a different
                          century or era.
                        </li>
                        <li>
                          N/A (❔) means the property couldn't be compared for your guess (e.g.,
                          guess not in database).
                        </li>
                      </ul>
                      <p className="pt-2">
                        <strong>Hint:</strong> You can use the "Get a Hint" button once per game to
                        reveal a random correct property of the theorem.
                      </p>
                      <p className="pt-2">A new theorem is available each day!</p>
                    </div>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Got it!
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <FeedbackDisplay
              guesses={guesses}
              targetTheorem={theorem}
              duplicateGuessToHighlight={duplicateGuessToHighlight}
            />

            {gameState === 'playing' && (
              <>
                <form onSubmit={handleFormSubmit} className="flex gap-2 items-center my-4">
                  <div className="flex-grow">
                    <TheoremCombobox
                      theorems={THEOREMS}
                      selectedValue={selectedTheoremForGuess}
                      onValueChange={setSelectedTheoremForGuess}
                      disabled={currentAttempt >= MAX_GUESSES || gameState !== 'playing'}
                      placeholder="Select or type to search theorem..."
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      currentAttempt >= MAX_GUESSES ||
                      gameState !== 'playing' ||
                      !selectedTheoremForGuess
                    }
                    aria-label="Submit guess"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Send size={18} className="mr-0 sm:mr-2" />{' '}
                    <span className="hidden sm:inline">Submit</span>
                  </Button>
                </form>
                <HintDisplay
                  onRequestHint={handleRequestHint}
                  hintUsed={hintUsedToday}
                  revealedHint={revealedHintMessage}
                  disabled={
                    currentAttempt >= MAX_GUESSES || gameState !== 'playing' || hintUsedToday
                  }
                />
              </>
            )}

            {gameState !== 'playing' && (
              <GameEndDisplay
                isWin={gameState === 'won'}
                theorem={theorem}
                guessesTaken={currentAttempt}
                maxGuesses={MAX_GUESSES}
                stats={stats}
                onPlayAgain={handlePlayAgain}
                onShare={handleShare}
              />
            )}
          </CardContent>
        </Card>
      </main>
      <footer className="text-center py-6 text-sm text-muted-foreground border-t mt-8">
        TheoremGuess - A Wordle-style game for math enthusiasts. Crafted with 🧠.
      </footer>
    </div>
  );
}
