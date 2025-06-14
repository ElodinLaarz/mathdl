# MathDL - Theorem Guesser

A daily guessing game for math theorems, inspired by Wordle. Each day, players try to guess a theorem based on hints and feedback about various properties such as the year, mathematician, subfield, and more.

## Features

- Daily theorem challenge
- Hints based on properties like year, mathematician, and subfield
- Streak tracking and statistics
- Mobile-friendly design with dark/light mode support

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS & Radix UI components
- GenKit AI integration for hints
- LocalStorage for data persistence

## Development

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Getting Started

1. Clone the repository

```bash
git clone https://github.com/yourusername/mathdl.git
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
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

### Code Formatting

The project uses Prettier for code formatting. Files are automatically formatted on commit using Husky and lint-staged.

To format all files manually:

```bash
npm run format
# or
./run-format.sh
```

To check for formatting issues without making changes:

```bash
npm run format:check
```

### AI Integration

For working with the AI hint system:

```bash
npm run genkit:dev
# or
npm run genkit:watch
```

## Building for Production

```bash
npm run build
npm run start
```

## License

See the [LICENSE](LICENSE) file for details.
