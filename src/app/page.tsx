'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  GameStats,
  GuessFeedback,
  GuessWord,
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

  useEffect(() => {
    setIsMounted(true);
    const dailyTheorem = getTheoremOfTheDay();
    setTheorem(dailyTheorem);

    const storedStats = localStorage.getItem('theoremGuessStats');
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }

    const lastPlayedTheoremId = localStorage.getItem('lastPlayedTheoremId');
    const lastPlayDate = localStorage.getItem('lastPlayDate');
    const todayStr = new Date().toDateString();

    if (lastPlayedTheoremId !== dailyTheorem.id || lastPlayDate !== todayStr) {
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
      const savedGuesses = JSON.parse(localStorage.getItem('todaysGuesses') || '[]');
      const savedAttempt = parseInt(localStorage.getItem('todaysAttempt') || '0', 10);
      const savedGameState =
        (localStorage.getItem('todaysGameState') as 'playing' | 'won' | 'lost') || 'playing';
      const savedHintUsed = localStorage.getItem('todaysHintUsed') === 'true';
      const savedRevealedHint = localStorage.getItem('todaysRevealedHint') || null;

      setGuesses(savedGuesses);
      setCurrentAttempt(savedAttempt);
      setGameState(savedGameState);
      setHintUsedToday(savedHintUsed);
      if (savedHintUsed && savedRevealedHint) {
        setRevealedHintMessage(savedRevealedHint);
      }
    }
    localStorage.setItem('lastPlayedTheoremId', dailyTheorem.id);
    localStorage.setItem('lastPlayDate', todayStr);
  }, []);

  useEffect(() => {
    if (!isMounted || gameState === 'loading') return;
    localStorage.setItem('theoremGuessStats', JSON.stringify(stats));
    localStorage.setItem('todaysGuesses', JSON.stringify(guesses));
    localStorage.setItem('todaysAttempt', currentAttempt.toString());
    localStorage.setItem('todaysGameState', gameState);
    localStorage.setItem('todaysHintUsed', String(hintUsedToday));
    if (revealedHintMessage) {
      localStorage.setItem('todaysRevealedHint', revealedHintMessage);
    } else {
      localStorage.removeItem('todaysRevealedHint');
    }
  }, [stats, guesses, currentAttempt, gameState, isMounted, hintUsedToday, revealedHintMessage]);

  useEffect(() => {
    if (duplicateGuessToHighlight) {
      const timer = setTimeout(() => {
        setDuplicateGuessToHighlight(null);
      }, 3000); // Highlight for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [duplicateGuessToHighlight]);

  const updateStatsOnGameEnd = useCallback((win: boolean, numGuesses?: number) => {
    setStats(prevStats => {
      const newGamesPlayed = prevStats.gamesPlayed + 1;
      const newGamesWon = win ? prevStats.gamesWon + 1 : prevStats.gamesWon;
      const newCurrentStreak = win ? prevStats.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(prevStats.maxStreak, newCurrentStreak);

      const newGuessesDistribution = { ...prevStats.guesses };
      if (win && numGuesses !== undefined) {
        newGuessesDistribution[numGuesses] = (newGuessesDistribution[numGuesses] || 0) + 1;
      }

      return {
        gamesPlayed: newGamesPlayed,
        gamesWon: newGamesWon,
        currentStreak: newCurrentStreak,
        maxStreak: newMaxStreak,
        guesses: newGuessesDistribution,
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
      const wordFeedback: GuessWord[] = [{ word: guessStr, state: 'empty' }]; // All words are neutral

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
        words: wordFeedback,
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

    let latestRecognizedGuessFeedback: TheoremPropertiesFeedback | undefined = undefined;
    for (let i = guesses.length - 1; i >= 0; i--) {
      const guess = guesses[i];
      if (guess.propertiesFeedback && guess.propertiesFeedback.guessedTheoremName) {
        latestRecognizedGuessFeedback = guess.propertiesFeedback;
        break;
      }
    }

    const candidateHints: { property: string; value: string | number }[] = [];

    if (
      theorem.proposedBy &&
      (!latestRecognizedGuessFeedback ||
        latestRecognizedGuessFeedback.proposedByState !== 'correct')
    ) {
      candidateHints.push({ property: 'Proposed By', value: theorem.proposedBy });
    }
    if (
      theorem.provedBy &&
      (!latestRecognizedGuessFeedback || latestRecognizedGuessFeedback.provedByState !== 'correct')
    ) {
      candidateHints.push({ property: 'Proved By', value: theorem.provedBy });
    }
    if (
      theorem.yearProposed !== undefined &&
      (!latestRecognizedGuessFeedback ||
        latestRecognizedGuessFeedback.yearProposedState !== 'correct')
    ) {
      candidateHints.push({ property: 'Year Proposed', value: theorem.yearProposed });
    }
    if (
      theorem.yearProved !== undefined &&
      (!latestRecognizedGuessFeedback ||
        latestRecognizedGuessFeedback.yearProvedState !== 'correct')
    ) {
      candidateHints.push({ property: 'Year Proved', value: theorem.yearProved });
    }
    if (
      theorem.subfield &&
      (!latestRecognizedGuessFeedback || latestRecognizedGuessFeedback.subfieldState !== 'correct')
    ) {
      candidateHints.push({ property: 'Subfield', value: theorem.subfield });
    }
    if (
      theorem.educationLevel &&
      (!latestRecognizedGuessFeedback ||
        latestRecognizedGuessFeedback.educationLevelState !== 'correct')
    ) {
      candidateHints.push({ property: 'Education Level', value: theorem.educationLevel });
    }
    if (
      theorem.geographicalRegion &&
      (!latestRecognizedGuessFeedback ||
        latestRecognizedGuessFeedback.geographicalRegionState !== 'correct')
    ) {
      candidateHints.push({ property: 'Geographical Region', value: theorem.geographicalRegion });
    }
    if (
      theorem.proofTechnique &&
      (!latestRecognizedGuessFeedback ||
        latestRecognizedGuessFeedback.proofTechniqueState !== 'correct')
    ) {
      candidateHints.push({ property: 'Proof Technique', value: theorem.proofTechnique });
    }

    if (candidateHints.length === 0) {
      setRevealedHintMessage(
        'No more specific hints available, or all properties already guessed correctly!'
      );
    } else {
      const randomHint = candidateHints[Math.floor(Math.random() * candidateHints.length)];
      setRevealedHintMessage(`Hint: The ${randomHint.property} is ${randomHint.value}.`);
    }
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
              maxGuesses={MAX_GUESSES}
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
