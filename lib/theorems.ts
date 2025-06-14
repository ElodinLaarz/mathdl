export interface Theorem {
  id: string;
  name: string;
  proposedBy?: string;
  provedBy?: string;
  yearProposed?: number;
  yearProved?: number;
  subfield?: string;
  educationLevel?: 'Elementary' | 'Undergraduate' | 'Graduate' | 'Modern Research';
  geographicalRegion?: string;
  proofTechnique?: string;
}

// A small list of theorems for the game
export const THEOREMS: Theorem[] = [
  {
    id: 'pythagorean',
    name: 'Pythagorean Theorem',
    proposedBy: 'Pythagoras',
    provedBy: 'Pythagoras', // Historically attributed, exact proof details are complex
    yearProposed: -530, // Approximate date of Pythagoras
    yearProved: -530, // Assuming discovery and initial proofs around the same time
    subfield: 'Geometry',
    educationLevel: 'Elementary',
    geographicalRegion: 'Ancient Greece',
    proofTechnique: 'Geometric Algebra',
  },
  {
    id: 'fermat_last',
    name: "Fermat's Last Theorem",
    proposedBy: 'Pierre de Fermat',
    provedBy: 'Andrew Wiles',
    yearProposed: 1637,
    yearProved: 1994,
    subfield: 'Number Theory',
    educationLevel: 'Graduate',
    geographicalRegion: 'France / United Kingdom',
    proofTechnique: 'Modular Elliptic Curves',
  },
  {
    id: 'goedel_incompleteness_1',
    name: "Gödel's First Incompleteness Theorem",
    proposedBy: 'Kurt Gödel',
    provedBy: 'Kurt Gödel',
    yearProposed: 1931,
    yearProved: 1931,
    subfield: 'Logic',
    educationLevel: 'Graduate',
    geographicalRegion: 'Austria / United States', // Worked in both
    proofTechnique: 'Diagonalization',
  },
  {
    id: 'central_limit',
    name: 'Central Limit Theorem',
    proposedBy: 'Abraham de Moivre', // Early version for binomial distribution
    provedBy: 'Pierre-Simon Laplace', // More general form
    yearProposed: 1733,
    yearProved: 1810,
    subfield: 'Probability',
    educationLevel: 'Undergraduate',
    geographicalRegion: 'France / United Kingdom',
    proofTechnique: 'Characteristic Functions',
  },
  {
    id: 'fundamental_calculus',
    name: 'Fundamental Theorem of Calculus',
    proposedBy: 'Isaac Newton / Gottfried Wilhelm Leibniz', // Co-discoverers
    provedBy: 'Isaac Newton / Gottfried Wilhelm Leibniz',
    yearProposed: 1670, // Approximate, developed over late 17th century
    yearProved: 1670,
    subfield: 'Analysis',
    educationLevel: 'Undergraduate',
    geographicalRegion: 'United Kingdom / Germany',
    proofTechnique: 'Limit Processes',
  },
  {
    id: 'pigeonhole_principle',
    name: 'Pigeonhole Principle',
    proposedBy: 'Johann Peter Gustav Lejeune Dirichlet', // Formalized it
    provedBy: 'Johann Peter Gustav Lejeune Dirichlet',
    yearProposed: 1834,
    yearProved: 1834,
    subfield: 'Combinatorics',
    educationLevel: 'Elementary',
    geographicalRegion: 'Germany',
    proofTechnique: 'Proof by Contradiction',
  },
  {
    id: 'bayes_theorem',
    name: "Bayes' Theorem",
    proposedBy: 'Thomas Bayes', // Manuscript read posthumously
    provedBy: 'Pierre-Simon Laplace', // Independently developed and popularized
    yearProposed: 1763, // Bayes' paper published
    yearProved: 1812, // Laplace's work
    subfield: 'Probability',
    educationLevel: 'Undergraduate',
    geographicalRegion: 'United Kingdom / France',
    proofTechnique: 'Conditional Probability',
  },
  {
    id: 'chinese_remainder_theorem',
    name: 'Chinese Remainder Theorem',
    proposedBy: 'Sun Tzu',
    provedBy: 'Sun Tzu', // Ancient origins
    yearProposed: 300, // Approximate, from Sun Tzu Suan Ching
    yearProved: 300,
    subfield: 'Number Theory',
    educationLevel: 'Undergraduate',
    geographicalRegion: 'Ancient China',
    proofTechnique: 'Constructive Algorithm',
  },
  {
    id: 'four_color_theorem',
    name: 'Four Color Theorem',
    proposedBy: 'Francis Guthrie', // Conjectured
    provedBy: 'Kenneth Appel / Wolfgang Haken',
    yearProposed: 1852,
    yearProved: 1976,
    subfield: 'Graph Theory',
    educationLevel: 'Graduate',
    geographicalRegion: 'United Kingdom / United States',
    proofTechnique: 'Computer-Assisted Proof',
  },
  {
    id: 'noether_theorem',
    name: "Noether's Theorem",
    proposedBy: 'Emmy Noether',
    provedBy: 'Emmy Noether',
    yearProposed: 1915, // Submitted
    yearProved: 1918, // Published
    subfield: 'Abstract Algebra / Theoretical Physics',
    educationLevel: 'Graduate',
    geographicalRegion: 'Germany',
    proofTechnique: 'Variational Symmetry',
  },
];

export const getTheoremOfTheDay = (): Theorem => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  return THEOREMS[dayOfYear % THEOREMS.length];
};
