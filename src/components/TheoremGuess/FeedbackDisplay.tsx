'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import type {
  GuessFeedback,
  PropertyComparisonState,
  Theorem,
  TheoremPropertiesFeedback,
  YearComparisonState,
} from '@/types';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  GitCompareArrows,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PropertyFeedbackItemProps {
  label: string;
  guessedValue?: string | number;
  state: PropertyComparisonState | YearComparisonState;
  targetValue?: string | number;
}

const PropertyFeedbackItem: React.FC<PropertyFeedbackItemProps> = ({
  label,
  guessedValue,
  state,
}) => {
  let IconComponent;
  let iconColor = 'text-muted-foreground';
  let title = '';

  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const displayValue =
    guessedValue !== undefined && guessedValue !== null ? String(guessedValue) : 'N/A';

  useEffect(() => {
    if (textRef.current) {
      if (displayValue !== 'N/A') {
        setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
      } else {
        setIsTruncated(false);
      }
    }
  }, [displayValue]);

  switch (state) {
    case 'correct':
      IconComponent = CheckCircle2;
      iconColor = 'text-green-500';
      title = 'Correct';
      break;
    case 'incorrect':
      IconComponent = XCircle;
      iconColor = 'text-red-500';
      title = 'Incorrect';
      break;
    case 'partial':
      IconComponent = GitCompareArrows;
      iconColor = 'text-yellow-500';
      title = 'Partial Match: Some elements are correct';
      break;
    case 'target_higher':
      IconComponent = ArrowUpCircle;
      iconColor = 'text-yellow-500';
      title =
        label === 'Year Proposed' || label === 'Year Proved'
          ? 'Target year is later (same century)'
          : 'Target is higher';
      break;
    case 'target_lower':
      IconComponent = ArrowDownCircle;
      iconColor = 'text-yellow-500';
      title =
        label === 'Year Proposed' || label === 'Year Proved'
          ? 'Target year is earlier (same century)'
          : 'Target is lower';
      break;
    case 'target_much_higher':
      IconComponent = ArrowUpCircle;
      iconColor = 'text-red-500';
      title =
        label === 'Year Proposed' || label === 'Year Proved'
          ? 'Target year is much later (different century or era)'
          : 'Target is much higher';
      break;
    case 'target_much_lower':
      IconComponent = ArrowDownCircle;
      iconColor = 'text-red-500';
      title =
        label === 'Year Proposed' || label === 'Year Proved'
          ? 'Target year is much earlier (different century or era)'
          : 'Target is much lower';
      break;
    case 'not_applicable':
    default:
      IconComponent = HelpCircle;
      iconColor = 'text-muted-foreground';
      title = 'Not applicable or guess not recognized';
      break;
  }

  const valueSpan = (
    <span ref={textRef} className="text-foreground truncate max-w-[100px] sm:max-w-[120px]">
      {displayValue}
    </span>
  );

  const iconVisual = <IconComponent size={18} className={cn(iconColor, 'flex-shrink-0')} />;

  return (
    <div className="flex items-center justify-between text-sm py-1 px-2 rounded-md bg-background border border-transparent hover:border-muted">
      <span className="font-medium text-foreground/80">{label}:</span>
      <div className="flex items-center gap-2">
        {isTruncated && displayValue !== 'N/A' ? (
          <Tooltip>
            <TooltipTrigger asChild>{valueSpan}</TooltipTrigger>
            <TooltipContent>
              <p>{displayValue}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          valueSpan
        )}

        {state &&
        (((label === 'Year Proposed' || label === 'Year Proved') && state.startsWith('target_')) ||
          state === 'partial') ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center">{iconVisual}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          iconVisual && React.cloneElement(iconVisual, { title: title })
        )}
      </div>
    </div>
  );
};

interface FeedbackDisplayProps {
  guesses: GuessFeedback[];
  maxGuesses: number;
  targetTheorem: Theorem;
  duplicateGuessToHighlight: string | null;
}

export default function FeedbackDisplay({
  guesses,
  maxGuesses,
  targetTheorem,
  duplicateGuessToHighlight,
}: FeedbackDisplayProps) {
  const rowsToDisplay = Array.from({ length: maxGuesses }).map((_, i) => guesses[i] || null);

  const normalizeForCompare = (str: string = '') =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s\/,-]/g, '')
      .trim();

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-3 my-6">
        {rowsToDisplay.map((guessFeedback, rowIndex) => {
          if (!guessFeedback) {
            return (
              <div
                key={rowIndex}
                className="p-2 border border-dashed border-muted rounded-md bg-muted/20 min-h-[4rem] flex items-center justify-center"
              >
                <span className="text-muted-foreground text-xs italic">Attempt {rowIndex + 1}</span>
              </div>
            );
          }

          const { propertiesFeedback, guessString } = guessFeedback;
          const normalizedTargetName =
            targetTheorem && targetTheorem.name ? normalizeForCompare(targetTheorem.name) : '';
          const isCorrectGuess =
            propertiesFeedback && normalizeForCompare(guessString) === normalizedTargetName;

          const isHighlightedDuplicate =
            duplicateGuessToHighlight &&
            normalizeForCompare(guessString) === normalizeForCompare(duplicateGuessToHighlight);

          return (
            <Card
              key={rowIndex}
              className={cn(
                'overflow-hidden shadow-md border-muted/50',
                isHighlightedDuplicate && 'ring-2 ring-destructive border-destructive'
              )}
              data-guess-correct={isCorrectGuess}
            >
              <CardHeader className="p-3 bg-muted/25 border-b border-muted/50">
                <CardTitle className="text-sm font-semibold">
                  Attempt {rowIndex + 1}:{' '}
                  <span className="font-normal italic text-foreground/80 truncate">
                    {guessString}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {propertiesFeedback && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 pt-2 border-t border-muted/30 mt-2">
                    <PropertyFeedbackItem
                      label="Proposed By"
                      guessedValue={
                        propertiesFeedback.guessedTheoremName
                          ? propertiesFeedback.proposedByGuessed
                          : undefined
                      }
                      state={propertiesFeedback.proposedByState}
                      targetValue={propertiesFeedback.proposedByCorrect}
                    />
                    <PropertyFeedbackItem
                      label="Proved By"
                      guessedValue={
                        propertiesFeedback.guessedTheoremName
                          ? propertiesFeedback.provedByGuessed
                          : undefined
                      }
                      state={propertiesFeedback.provedByState}
                      targetValue={propertiesFeedback.provedByCorrect}
                    />
                    <PropertyFeedbackItem
                      label="Year Proposed"
                      guessedValue={
                        propertiesFeedback.guessedTheoremName
                          ? propertiesFeedback.yearProposedGuessed
                          : undefined
                      }
                      state={propertiesFeedback.yearProposedState}
                      targetValue={propertiesFeedback.yearProposedCorrect}
                    />
                    <PropertyFeedbackItem
                      label="Year Proved"
                      guessedValue={
                        propertiesFeedback.guessedTheoremName
                          ? propertiesFeedback.yearProvedGuessed
                          : undefined
                      }
                      state={propertiesFeedback.yearProvedState}
                      targetValue={propertiesFeedback.yearProvedCorrect}
                    />
                    <PropertyFeedbackItem
                      label="Subfield"
                      guessedValue={
                        propertiesFeedback.guessedTheoremName
                          ? propertiesFeedback.subfieldGuessed
                          : undefined
                      }
                      state={propertiesFeedback.subfieldState}
                      targetValue={propertiesFeedback.subfieldCorrect}
                    />
                    <PropertyFeedbackItem
                      label="Education Level"
                      guessedValue={
                        propertiesFeedback.guessedTheoremName
                          ? propertiesFeedback.educationLevelGuessed
                          : undefined
                      }
                      state={propertiesFeedback.educationLevelState}
                      targetValue={propertiesFeedback.educationLevelCorrect}
                    />
                    <PropertyFeedbackItem
                      label="Geographical Region"
                      guessedValue={
                        propertiesFeedback.guessedTheoremName
                          ? propertiesFeedback.geographicalRegionGuessed
                          : undefined
                      }
                      state={propertiesFeedback.geographicalRegionState}
                      targetValue={propertiesFeedback.geographicalRegionCorrect}
                    />
                    <PropertyFeedbackItem
                      label="Proof Technique"
                      guessedValue={
                        propertiesFeedback.guessedTheoremName
                          ? propertiesFeedback.proofTechniqueGuessed
                          : undefined
                      }
                      state={propertiesFeedback.proofTechniqueState}
                      targetValue={propertiesFeedback.proofTechniqueCorrect}
                    />
                  </div>
                )}
                {propertiesFeedback &&
                  !propertiesFeedback.guessedTheoremName &&
                  propertiesFeedback.subfieldState === 'not_applicable' && (
                    <p className="text-xs text-muted-foreground italic text-center pt-1">
                      Guessed theorem not recognized for detailed property comparison.
                    </p>
                  )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
