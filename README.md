# MathDL - Theorem Guesser

[![Format Check](https://github.com/ElodinLaarz/mathdl/actions/workflows/format.yml/badge.svg)](https://github.com/ElodinLaarz/mathdl/actions/workflows/format.yml)
[![Security Check](https://github.com/ElodinLaarz/mathdl/actions/workflows/security.yml/badge.svg)](https://github.com/ElodinLaarz/mathdl/actions/workflows/security.yml)

A daily guessing game for mathematical theorems, inspired by Wordle. Each day, players try to guess the theorem of the day by entering theorem names and receiving detailed feedback about various properties.

## Features

- **Daily Theorem Challenge**: A new theorem to guess each day, deterministically selected based on the date
- **Rich Feedback System**: Detailed comparison feedback showing:
  - Theorem name match
  - Proposed by (mathematician who proposed it)
  - Proved by (mathematician who proved it)
  - Year proposed and year proved (with directional hints)
  - Mathematical subfield
  - Education level (Elementary, Undergraduate, Graduate, Modern Research)
  - Geographical region
  - Proof technique
- **Game Statistics**: Track wins, losses, current streak, and guess distribution
- **Hint System**: Optional hints available during gameplay
- **Persistent Progress**: Game state and statistics saved locally
- **Responsive Design**: Mobile-friendly interface with dark/light mode support
- **Limited Attempts**: Maximum of 10 guesses per day

## How to Play

1. **Daily Challenge**: Each day features a new theorem to guess
2. **Make a Guess**: Type a theorem name in the search box and select from the dropdown
3. **Analyze Feedback**: Each guess provides detailed feedback:
   - 🟢 **Green**: Correct match
   - 🟡 **Yellow**: Partially correct or close
   - 🔴 **Red**: Incorrect
4. **Use Hints**: Get optional hints if you're stuck
5. **Win Condition**: Guess the correct theorem within 10 attempts
6. **Statistics**: Track your performance over time

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: React hooks with localStorage persistence
- **Build Tools**: Turbopack for fast development
- **Code Quality**: ESLint, Prettier, Husky for git hooks
- **Data**: Static theorem database with deterministic daily selection

## Development

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Getting Started

1. Clone the repository

```bash
git clone https://github.com/ElodinLaarz/mathdl.git
cd mathdl
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Start the development server

```bash
npm run dev
# This runs: next dev --turbopack
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Code Formatting

The project uses Prettier for code formatting. Files are automatically formatted on commit using Husky and lint-staged.

To format all files manually:

```bash
npm run format
# or
./scripts/run-format.sh
```

To check for formatting issues without making changes:

```bash
npm run format:check
```

## How It Works

- **Daily Selection**: The theorem of the day is deterministically selected using a hash of the current date, ensuring all players get the same theorem
- **Local Storage**: Game progress, statistics, and settings are persisted in the browser's localStorage
- **Feedback Algorithm**: Each guess is compared against the target theorem across multiple properties:
  - Exact matches for categorical properties (subfield, education level, etc.)
  - Directional feedback for numerical properties (years)
  - Partial matches for overlapping regions or related fields
- **Reset Logic**: Game state automatically resets at midnight for the new daily challenge

## Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main game page
├── components/             # React components
│   ├── TheoremGuess/      # Game-specific components
│   │   ├── FeedbackDisplay.tsx
│   │   ├── GameEndDisplay.tsx
│   │   ├── Header.tsx
│   │   ├── HintDisplay.tsx
│   │   └── TheoremCombobox.tsx
│   ├── ui/                # Reusable UI components (Radix UI)
│   ├── ThemeProvider.tsx  # Theme context provider
│   └── ThemeToggle.tsx    # Dark/light mode toggle
├── context/               # React contexts
│   └── AuthContext.tsx    # Authentication context
├── hooks/                 # Custom React hooks
│   ├── use-mobile.tsx     # Mobile detection hook
│   └── use-toast.ts       # Toast notifications
├── lib/                   # Utility libraries
│   ├── theorems.ts        # Theorem data and game logic
│   └── utils.ts           # General utilities
└── types/                 # TypeScript type definitions
    └── index.ts           # Game-related types
```

## License

See the [LICENSE](LICENSE) file for details.
