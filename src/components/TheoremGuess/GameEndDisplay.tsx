'use client';

import type { GameStats, Theorem } from '@/types';
import { Award, Frown, RotateCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface GameEndDisplayProps {
  isWin: boolean;
  theorem: Theorem;
  guessesTaken: number;
  maxGuesses: number;
  stats: GameStats;
  onPlayAgain: () => void;
  onShare: () => void;
}

export default function GameEndDisplay({
  isWin,
  theorem,
  guessesTaken,
  maxGuesses,
  stats,
  onPlayAgain,
  onShare,
}: GameEndDisplayProps) {
  return (
    <Card
      className="mt-6 text-center shadow-lg border-2 data-[win=true]:border-green-500 data-[win=false]:border-destructive"
      data-win={isWin}
    >
      <CardHeader className="pb-4">
        {isWin ? (
          <Award className="mx-auto h-12 w-12 text-green-500 mb-2" />
        ) : (
          <Frown className="mx-auto h-12 w-12 text-destructive mb-2" />
        )}
        <CardTitle
          className={`text-2xl font-headline ${isWin ? 'text-green-600' : 'text-destructive'}`}
        >
          {isWin ? 'Congratulations!' : 'Better Luck Next Time!'}
        </CardTitle>
        <CardDescription className="text-md">
          {isWin
            ? `You guessed the theorem in ${guessesTaken} ${guessesTaken === 1 ? 'guess' : 'guesses'}.`
            : `You couldn't guess the theorem within ${maxGuesses} guesses.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-lg">
            The theorem was:{' '}
            <strong className="font-semibold text-primary font-headline">{theorem.name}</strong>
          </p>
          <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
            {theorem.proposedBy && (
              <p>
                <strong>Proposed By:</strong> {theorem.proposedBy}
              </p>
            )}
            {theorem.yearProposed && (
              <p>
                <strong>Year Proposed:</strong> {theorem.yearProposed}
              </p>
            )}
            {theorem.provedBy && (
              <p>
                <strong>Proved By:</strong> {theorem.provedBy}
              </p>
            )}
            {theorem.yearProved && (
              <p>
                <strong>Year Proved:</strong> {theorem.yearProved}
              </p>
            )}
            {theorem.subfield && (
              <p>
                <strong>Subfield:</strong> {theorem.subfield}
              </p>
            )}
            {theorem.educationLevel && (
              <p>
                <strong>Education Level:</strong> {theorem.educationLevel}
              </p>
            )}
            {theorem.geographicalRegion && (
              <p>
                <strong>Region:</strong> {theorem.geographicalRegion}
              </p>
            )}
            {theorem.proofTechnique && (
              <p>
                <strong>Proof Technique:</strong> {theorem.proofTechnique}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-md border">
          <h4 className="font-semibold text-md mb-2 text-foreground/80">Your Stats</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            <p>
              <strong className="block text-foreground">Played:</strong> {stats.gamesPlayed}
            </p>
            <p>
              <strong className="block text-foreground">Win %:</strong>{' '}
              {stats.gamesPlayed > 0 ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(0) : 0}%
            </p>
            <p>
              <strong className="block text-foreground">Streak:</strong> {stats.currentStreak}
            </p>
            <p className="sm:col-span-1">
              <strong className="block text-foreground">Max Streak:</strong> {stats.maxStreak}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
        <Button onClick={onPlayAgain} variant="outline" className="w-full sm:w-auto">
          <RotateCcw size={18} className="mr-2" /> Play Again
        </Button>
        <Button
          onClick={onShare}
          className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Share2 size={18} className="mr-2" /> Share Result
        </Button>
      </CardFooter>
    </Card>
  );
}
