import type {
  GuessFeedback,
  PropertyComparisonState,
  TheoremPropertiesFeedback,
  YearComparisonState,
} from '@/types';
import type { Theorem } from '@/lib/theorems';

export const normalizeString = (str: string = '') =>
  str
    .toLowerCase()
    // underscores should behave like spaces per tests
    .replace(/_/g, ' ')
    // remove everything except letters/numbers, spaces, slashes, commas, and hyphens
    .replace(/[^a-z0-9\s\/,\-]/g, '')
    // collapse multiple spaces to a single space
    .replace(/\s+/g, ' ')
    .trim();

export const getCentury = (yearInput?: number): number => {
  const year = Number(yearInput);
  if (yearInput === undefined || isNaN(year)) return NaN;
  if (year === 0) return 0;
  const absYear = Math.abs(year);
  const century = Math.floor((absYear - 1) / 100) + 1;
  return year < 0 ? -century : century;
};

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

export const processGuess = (
  guessStr: string,
  targetTheorem: Theorem,
  allTheorems: Theorem[]
): GuessFeedback => {
  let propertiesFeedbackResult: TheoremPropertiesFeedback;
  const guessedTheorem = allTheorems.find(
    t => normalizeString(t.name) === normalizeString(guessStr)
  );

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
      yearProposedState: createYearState(guessedTheorem.yearProposed, targetTheorem.yearProposed),

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
    guessedTheoremName: guessedTheorem?.name ?? guessStr,
    propertiesFeedback: propertiesFeedbackResult,
    guessString: guessStr,
  };
};
