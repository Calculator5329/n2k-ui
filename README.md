# N2K Toolbox

Comprehensive web-based tools and utilities for Number to Knock Off competition management and equation solving.

## What It Is

N2K Toolbox is a React-based frontend application providing a suite of tools for the Number to Knock Off (N2K) mathematical competition. It includes board/dice generation, equation solving, difficulty calculation, and tournament management features. The toolbox generates random or patterned number boards with dice rolls, solves mathematical equations, and manages competitive tournaments with player rankings.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS
- **Backend Integration**: Python (Main.py, funcs.py) for difficulty calculations and solver logic
- **UI Framework**: React Hooks

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Run linting:**
   ```bash
   npm run lint
   ```

## Features

### Board & Dice Generation
- **Random Board Mode**: Generate targets between 1-600 with configurable parameters
- **Pattern Board Mode**: Create boards based on multiples (e.g., multiples of 6)
- **Dice Selection**: Choose from 2-10 dice or select from predefined dice lists

### Equation Solver
- Solves mathematical expressions with three dice values and a target number
- Supports basic operations: addition, subtraction, multiplication, division
- Calculates efficiency scores based on difficulty metrics

### Competition Manager
- Generate tournaments with 4, 8, 16, or 32 players
- Create multiple rounds with different boards
- Track player scores and rankings
- Export competition data

### Board Difficulty System
- Calculates difficulty scores for generated boards
- Based on dice combinations, exponents, and operations
- Uses precomputed difficulty database

### Saved Items
- Save favorite boards for later use
- Save entire competitions for reference
- In-memory storage of saved items

## Key Components

- `BoardDisplay.tsx` - Renders number boards and competition brackets
- `Toolbox.tsx` - Main unified interface with all tools
- `solverUtils.ts` - Equation solving algorithm
- `difficultyUtils.ts` - Difficulty scoring calculations
- `competitionUtils.ts` - Tournament generation and management

## Configuration

The toolbox loads difficulty data from a CSV file on startup. Ensure `difficulties.csv` is available in the application's root directory for full functionality.

## Development

The project uses TypeScript for type safety and Vite for fast development builds with Hot Module Replacement (HMR).

```bash
# Development with HMR
npm run dev

# Production build with type checking
npm run build

# Preview production build locally
npm run preview
```
