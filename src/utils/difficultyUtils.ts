/**
 * Difficulty data loading and expected score calculations
 * Ported from Main2.py
 */

import { extensiveDiceList, findDiceIndex } from './diceUtils';

// Cached difficulty data matrix
let difficultiesData: number[][] | null = null;
let loadingPromise: Promise<number[][]> | null = null;

/**
 * Load difficulties from CSV file
 */
export async function loadDifficulties(): Promise<number[][]> {
  if (difficultiesData) {
    return difficultiesData;
  }
  
  if (loadingPromise) {
    return loadingPromise;
  }
  
  loadingPromise = (async () => {
    try {
      const response = await fetch('/difficulties.csv');
      const text = await response.text();
      
      const rows = text.trim().split('\n');
      difficultiesData = rows.map(row => 
        row.split(',').map(val => parseFloat(val))
      );
      
      return difficultiesData;
    } catch (error) {
      console.error('Failed to load difficulties:', error);
      throw error;
    }
  })();
  
  return loadingPromise;
}

/**
 * Get difficulty for a specific dice/number combination
 * @param diceIndex - Index in extensiveDiceList
 * @param number - Target number (column index in CSV)
 */
export function getDifficulty(diceIndex: number, number: number): number {
  if (!difficultiesData || diceIndex < 0 || diceIndex >= difficultiesData.length) {
    return -1;
  }
  
  const row = difficultiesData[diceIndex];
  if (number < 0 || number >= row.length) {
    return -1;
  }
  
  return row[number];
}

/**
 * Calculate expected score for a board with given dice
 * Uses 3 methods with weights: M1=10%, M2=70%, M3=20%
 * Ported from Main2.py expected_score()
 */
export function expectedScore(board: number[], dice: number[]): number {
  if (!difficultiesData) {
    console.warn('Difficulties not loaded');
    return 0;
  }
  
  const diceIndex = findDiceIndex(dice);
  if (diceIndex < 0) {
    console.warn('Dice combination not found:', dice);
    return 0;
  }
  
  // Get difficulties for each board number
  const currentDifficulties: number[] = board.map(val => getDifficulty(diceIndex, val));
  
  // Method 1: Expected score by dividing each board value by its difficulty
  let expectedScoreM1 = 0;
  for (let i = 0; i < board.length; i++) {
    if (currentDifficulties[i] > -1) {
      expectedScoreM1 += board[i] / currentDifficulties[i];
    }
  }
  
  // Method 2: Process board from end, respecting time limit of 30
  let expectedScoreM2 = 0;
  let timeLimit = 30;
  const board2 = [...board];
  const difficulties2 = [...currentDifficulties];
  
  while (board2.length > 0 && difficulties2.length > 0) {
    const lastIndex = board2.length - 1;
    const lastDifficulty = difficulties2[lastIndex];
    
    // Check if unsolvable or too difficult
    if (lastDifficulty === -1 || lastDifficulty > 10) {
      board2.pop();
      difficulties2.pop();
    } else if (timeLimit < lastDifficulty) {
      board2.pop();
      difficulties2.pop();
    } else {
      timeLimit -= lastDifficulty;
      expectedScoreM2 += board2[lastIndex];
      board2.pop();
      difficulties2.pop();
    }
  }
  
  // Method 3: Sort by difficulty and solve easiest first
  let expectedScoreM3 = 0;
  const pairedList = board.map((num, i) => ({ num, difficulty: currentDifficulties[i] }));
  const sortedByDifficulty = [...pairedList].sort((a, b) => a.difficulty - b.difficulty);
  
  let time = 30;
  for (const { num, difficulty } of sortedByDifficulty) {
    if (difficulty === -1 || difficulty > 10) {
      continue;
    } else if (time < difficulty) {
      break;
    } else {
      time -= difficulty;
      expectedScoreM3 += num;
    }
  }
  
  // Combine with weights: 10% M1, 70% M2, 20% M3
  const multiplier = 39.48 / 30;
  const totalScore = Math.round(100 * (expectedScoreM1 * 0.1 + expectedScoreM2 * 0.7 + expectedScoreM3 * 0.2)) * multiplier / 100;
  
  return Math.round(100 * totalScore) / 100;
}

/**
 * Calculate what percentage of the board is possible to knock off
 */
export function possibleScorePercentage(board: number[], dice: number[]): number {
  if (!difficultiesData) return 0;
  
  const diceIndex = findDiceIndex(dice);
  if (diceIndex < 0) return 0;
  
  let possibleScore = 0;
  let totalScore = 0;
  
  for (const num of board) {
    totalScore += num;
    const difficulty = getDifficulty(diceIndex, num);
    if (difficulty !== -1) {
      possibleScore += num;
    }
  }
  
  if (totalScore === 0) return 0;
  return Math.round(1000 * possibleScore / totalScore) / 10;
}

/**
 * Calculate board difficulties for all dice combinations
 */
export function calculateBoardDifficulties(board: number[]): number[] {
  if (!difficultiesData) return [];
  
  return extensiveDiceList.map(dice => expectedScore(board, dice));
}

/**
 * Check if difficulties are loaded
 */
export function isDifficultiesLoaded(): boolean {
  return difficultiesData !== null;
}

/**
 * Get the number of dice combinations in the extensive list
 */
export function getDiceListLength(): number {
  return extensiveDiceList.length;
}

