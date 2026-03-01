/**
 * Competition generation utilities
 * Ported from Main2.py
 */

import { generateRandomBoard, generatePatternBoard, sumList } from './boardUtils';
import { extensiveDiceList } from './diceUtils';
import { calculateBoardDifficulties, possibleScorePercentage } from './difficultyUtils';

// Player count configurations
export const roundsMap: Record<number, number> = { 32: 31, 16: 15, 8: 7, 4: 4 };
export const boardsMap: Record<number, number> = { 32: 6, 16: 3, 8: 2, 4: 1 };

export interface DiceRollPair {
  player1: number[];
  player2: number[];
}

export interface BoardDiceData {
  diceRollPairs: DiceRollPair[];
  scores: { player1: number[]; player2: number[] };
  percentiles: { player1: number[]; player2: number[] };
}

export interface CompetitionData {
  playerCount: number;
  roundCount: number;
  boardCount: number;
  dicePerBoard: number;
  extraDice: number;
  boards: number[][];
  boardRanges: { min: number; max: number }[];
  boardDiceData: BoardDiceData[];
  boardDifficulties: number[][];
}

/**
 * Generate similar scoring dice rolls for a board
 * Ensures balanced difficulty between players
 * @param boardDifficulties - Array of expected scores for each dice combination
 * @param numRounds - Number of dice roll pairs to generate
 * @param variation - 0-100, controls how spread out the percentile selection is
 *                    0 = very similar (top 5% only), 100 = high variation (up to top 70%)
 */
export function generateSimilarScoringDiceRolls(
  boardDifficulties: number[],
  numRounds: number,
  variation: number = 0
): BoardDiceData {
  // Sort scores to find top percentiles
  const sortedScores = boardDifficulties
    .map((score, index) => ({ index, score }))
    .sort((a, b) => b.score - a.score);
  
  // Variation affects how different the two players' dice can be
  // At variation 0: both players get similar dice (same percentile bracket)
  // At variation 100: one player can get top 5% dice, the other can get bottom 50%
  const variationFactor = Math.max(0, Math.min(100, variation)) / 100;
  
  const totalDice = boardDifficulties.length;
  
  const p1Scores: number[] = [];
  const p2Scores: number[] = [];
  const p1Percentiles: number[] = [];
  const p2Percentiles: number[] = [];
  const diceRollPairs: DiceRollPair[] = [];
  const selectedPairs = new Set<string>();
  
  while (diceRollPairs.length < numRounds) {
    let pos: number;
    let secondPos: number;
    
    if (variationFactor < 0.1) {
      // Low variation: both players get similar dice from top percentiles
      const maxPercentile = 0.15; // Top 15%
      pos = Math.floor(Math.random() * totalDice * maxPercentile);
      secondPos = Math.min(pos + 1, totalDice - 1);
    } else {
      // Higher variation: players can get very different dice
      // The "advantaged" player gets good dice (top 0-30%)
      // The "disadvantaged" player gets worse dice based on variation
      
      // Advantaged player: top 5-30% (better dice overall, but still some variety)
      const advantagedMaxPercentile = 0.05 + (0.25 * variationFactor); // 5% -> 30%
      const advantagedPos = Math.floor(Math.random() * totalDice * advantagedMaxPercentile);
      
      // Disadvantaged player: the gap increases dramatically with variation
      // At 50% variation: gap of ~15-25% percentile difference
      // At 100% variation: gap of ~30-60% percentile difference  
      const minGapPercentile = 0.15 * variationFactor; // 0% -> 15%
      const maxGapPercentile = 0.60 * variationFactor; // 0% -> 60%
      const gapPercentile = minGapPercentile + Math.random() * (maxGapPercentile - minGapPercentile);
      
      const disadvantagedPos = Math.min(
        Math.floor(advantagedPos + totalDice * gapPercentile),
        totalDice - 1
      );
      
      // Alternate who gets the advantage
      if (diceRollPairs.length % 2 === 0) {
        pos = advantagedPos;
        secondPos = disadvantagedPos;
      } else {
        pos = disadvantagedPos;
        secondPos = advantagedPos;
      }
    }
    
    // Record scores and percentiles
    // pos = Player 1's dice position, secondPos = Player 2's dice position
    const firstRollIndex = sortedScores[pos].index;
    const secondRollIndex = sortedScores[secondPos].index;
    
    p1Scores.push(Math.round(sortedScores[pos].score));
    p1Percentiles.push(100 * pos / sortedScores.length);
    
    p2Scores.push(Math.round(sortedScores[secondPos].score));
    p2Percentiles.push(100 * secondPos / sortedScores.length);
    
    // Create pair key to check for duplicates
    const pairKey = `${firstRollIndex}-${secondRollIndex}`;
    
    if (!selectedPairs.has(pairKey)) {
      diceRollPairs.push({
        player1: [...extensiveDiceList[firstRollIndex]],
        player2: [...extensiveDiceList[secondRollIndex]]
      });
      selectedPairs.add(pairKey);
    }
  }
  
  return {
    diceRollPairs,
    scores: { player1: p1Scores, player2: p2Scores },
    percentiles: { player1: p1Percentiles, player2: p2Percentiles }
  };
}

/**
 * Generate a full competition with boards and dice rolls
 * @param playerCount - Number of players (4, 8, 16, or 32)
 * @param variation - 0-100, controls dice roll variation (0=similar, 100=high variation)
 */
export function generateCompetition(playerCount: number, variation: number = 0): CompetitionData {
  // Validate player count
  if (![4, 8, 16, 32].includes(playerCount)) {
    throw new Error('Player count must be 4, 8, 16, or 32');
  }
  
  const roundCount = roundsMap[playerCount];
  const boardCount = boardsMap[playerCount];
  const diceCount = Math.floor(roundCount / boardCount);
  
  // Calculate extra dice for last board if rounds don't divide evenly
  let extraDice = 0;
  if (roundCount % boardCount !== 0) {
    extraDice = roundCount - (diceCount * boardCount);
  }
  
  // Generate board ranges
  const boardRanges: { min: number; max: number }[] = [];
  for (let i = 0; i < boardCount; i++) {
    const range = Math.round(Math.random() * 550 + 72);
    boardRanges.push({ min: 1, max: range });
  }
  
  // Generate boards (mix of random and pattern)
  const boards: number[][] = [];
  
  // Calculate pattern board count (0-50% of total, minimum 1 if more than 2 boards)
  let patternBoardCount = Math.round(Math.random() * 0.49 * boardCount);
  if (boardCount > 2 && patternBoardCount < 1) {
    patternBoardCount = 1;
  }
  
  // Generate random boards
  for (let i = 0; i < boardCount - patternBoardCount; i++) {
    boards.push(generateRandomBoard(boardRanges[i].max));
  }
  
  // Generate pattern boards
  for (let i = 0; i < patternBoardCount; i++) {
    const boardIndex = boardCount - patternBoardCount + i;
    const multipleCount = Math.round(Math.random() * 3 - 0.51) + 1;
    const multiple = Math.round(boardRanges[boardIndex].max / 36);
    const startingNumber = Math.round(Math.random() * 20);
    
    const multipleList: number[] = [];
    
    if (multipleCount === 1) {
      multipleList.push(multiple);
      boards.push(generatePatternBoard(multipleList, startingNumber));
    } else if (multipleCount === 2) {
      multipleList.push(Math.round((Math.random() * 2 - 0.5) * multiple * 2));
      multipleList.push(multiple * 2 - multipleList[0]);
      boards.push(generatePatternBoard(multipleList, startingNumber));
    } else if (multipleCount === 3) {
      multipleList.push(Math.round((Math.random() * 2 - 0.5) * multiple * 3));
      multipleList.push(Math.round((Math.random() * 2 - 0.5) * multiple * 3));
      multipleList.push(multiple * 3 - sumList(multipleList));
      
      // Ensure no negative numbers
      let mostNegative = 0;
      for (const m of multipleList) {
        if (m < 0) mostNegative += m;
      }
      const adjustedStart = startingNumber - mostNegative;
      
      boards.push(generatePatternBoard(multipleList, adjustedStart));
    }
  }
  
  // Update board ranges with actual min/max
  for (let i = 0; i < boards.length; i++) {
    boardRanges[i] = {
      min: Math.min(...boards[i]),
      max: Math.max(...boards[i])
    };
  }
  
  // Calculate difficulties for each board
  const boardDifficulties: number[][] = [];
  for (const board of boards) {
    boardDifficulties.push(calculateBoardDifficulties(board));
  }
  
  // Generate dice rolls for each board
  const boardDiceData: BoardDiceData[] = [];
  for (let i = 0; i < boards.length; i++) {
    const numRounds = i === boards.length - 1 ? diceCount + extraDice : diceCount;
    const data = generateSimilarScoringDiceRolls(boardDifficulties[i], numRounds, variation);
    boardDiceData.push(data);
  }
  
  return {
    playerCount,
    roundCount,
    boardCount,
    dicePerBoard: diceCount,
    extraDice,
    boards,
    boardRanges,
    boardDiceData,
    boardDifficulties
  };
}

/**
 * Generate a competition summary as a formatted object
 */
export function generateCompetitionSummary(competition: CompetitionData): {
  overview: string;
  boardRanges: string;
  expectedScores: string;
  percentiles: string;
  possiblePercentages: string;
} {
  const { playerCount, roundCount, boardCount, boards, boardRanges, boardDiceData } = competition;
  
  // Overview
  const overview = `Competition with ${playerCount} players, ${roundCount} rounds across ${boardCount} boards`;
  
  // Board ranges
  const rangesStr = boardRanges
    .map((r, i) => `Board ${i + 1}: ${r.min}-${r.max}`)
    .join(', ');
  
  // Expected scores
  let scoresStr = '';
  for (let i = 0; i < boards.length; i++) {
    scoresStr += `Board ${i + 1}:\n`;
    scoresStr += `  Player 1: ${boardDiceData[i].scores.player1.join(', ')}\n`;
    scoresStr += `  Player 2: ${boardDiceData[i].scores.player2.join(', ')}\n`;
  }
  
  // Percentiles
  let percentilesStr = '';
  for (let i = 0; i < boards.length; i++) {
    percentilesStr += `Board ${i + 1}:\n`;
    percentilesStr += `  Player 1: ${boardDiceData[i].percentiles.player1.map(p => p.toFixed(1) + '%').join(', ')}\n`;
    percentilesStr += `  Player 2: ${boardDiceData[i].percentiles.player2.map(p => p.toFixed(1) + '%').join(', ')}\n`;
  }
  
  // Possible percentages
  let possibleStr = '';
  for (let i = 0; i < boards.length; i++) {
    possibleStr += `Board ${i + 1}:\n`;
    const p1Possibles = boardDiceData[i].diceRollPairs.map(pair => 
      possibleScorePercentage(boards[i], pair.player1).toFixed(1) + '%'
    );
    const p2Possibles = boardDiceData[i].diceRollPairs.map(pair => 
      possibleScorePercentage(boards[i], pair.player2).toFixed(1) + '%'
    );
    possibleStr += `  Player 1: ${p1Possibles.join(', ')}\n`;
    possibleStr += `  Player 2: ${p2Possibles.join(', ')}\n`;
  }
  
  return {
    overview,
    boardRanges: rangesStr,
    expectedScores: scoresStr,
    percentiles: percentilesStr,
    possiblePercentages: possibleStr
  };
}

/**
 * Format dice for display
 */
export function formatDice(dice: number[]): string {
  return dice.join(', ');
}

