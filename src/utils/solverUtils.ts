/**
 * Equation solver and difficulty calculator
 * Ported from funcs.py
 */

import { dePower, cycleDice } from './diceUtils';

// Operator constants
export const OPERATORS = {
  ADD: 1,
  SUB: 2,
  MUL: 3,
  DIV: 4
};

// Maximum exponents for each dice value
const maxExponents: number[] = [1, 1, 12, 7, 6, 6, 10, 5, 4, 4, 7, 3, 7, 3, 3, 3, 3, 3, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];

// Power range for difficulty calculation
const powRange: number[] = [13, 8, 7, 7, 11, 6, 5, 5, 7, 3, 7, 3, 3, 3, 3, 3, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];

/**
 * Convert operator number to string
 */
export function operatorToString(num: number): string {
  switch (num) {
    case 1: return ' + ';
    case 2: return ' - ';
    case 3: return ' × ';
    case 4: return ' ÷ ';
    default: return ' ';
  }
}

/**
 * Convert operator string to number
 */
export function stringToOperator(str: string): number {
  const cleaned = str.trim();
  switch (cleaned) {
    case '+': return 1;
    case '-': return 2;
    case '*':
    case '×': return 3;
    case '/':
    case '÷': return 4;
    default: return 0;
  }
}

/**
 * Calculate the result of an equation
 */
export function calculateEquation(n1: number, n2: number, n3: number, o1: number, o2: number): number | null {
  let result: number;
  
  // Handle multiplication and division with proper order of operations
  if (o1 === 1) { // First op is +
    if (o2 === 1) result = n1 + n2 + n3;
    else if (o2 === 2) result = n1 + n2 - n3;
    else if (o2 === 3) result = n1 + n2 * n3;
    else if (o2 === 4) result = n1 + n2 / n3;
    else return null;
  } else if (o1 === 2) { // First op is -
    if (o2 === 1) result = n1 - n2 + n3;
    else if (o2 === 2) result = n1 - n2 - n3;
    else if (o2 === 3) result = n1 - n2 * n3;
    else if (o2 === 4) result = n1 - n2 / n3;
    else return null;
  } else if (o1 === 3) { // First op is *
    if (o2 === 1) result = n1 * n2 + n3;
    else if (o2 === 2) result = n1 * n2 - n3;
    else if (o2 === 3) result = n1 * n2 * n3;
    else if (o2 === 4) result = n1 * n2 / n3;
    else return null;
  } else if (o1 === 4) { // First op is /
    if (o2 === 1) result = n1 / n2 + n3;
    else if (o2 === 2) result = n1 / n2 - n3;
    else if (o2 === 3) result = n1 / n2 * n3;
    else if (o2 === 4) result = n1 / n2 / n3;
    else return null;
  } else {
    return null;
  }
  
  return result;
}

/**
 * Calculate difficulty of an equation
 * Input: [d1, d2, d3, p1, p2, p3, o1, o2, total]
 */
export function difficultyOfEquation(inputList: number[]): number {
  const [d1, d2, d3, p1, p2, p3, o1, o2, total] = inputList;
  
  // Generate dice powers
  const dicePowers: number[][] = [];
  for (const d of [d1, d2, d3]) {
    const powers: number[] = [];
    const maxPow = powRange[d] || 3;
    for (let i = 0; i < maxPow; i++) {
      powers.push(Math.pow(d, i));
    }
    dicePowers.push(powers);
  }
  
  // Calculate distances to total
  const listOfDistances: number[] = [];
  for (const powers of dicePowers) {
    for (const power of powers) {
      listOfDistances.push(Math.abs(power - total));
    }
  }
  
  const shortestDistance = Math.min(...listOfDistances);
  
  // Count zero and one powers
  const zeroPowers = [p1, p2, p3].filter(p => p === 0).length;
  const onePowers = [p1, p2, p3].filter(p => p === 1).length;
  
  // Equation values
  const equationValues = [Math.pow(d1, p1), Math.pow(d2, p2), Math.pow(d3, p3)];
  
  // Find largest equation value
  const largestNum = Math.max(...equationValues);
  const largestNumDist = Math.abs(largestNum - total);
  
  // Calculate smallest multiplier
  let smallestMultiplier = 0;
  
  if (o1 === 3) {
    if (equationValues[0] >= equationValues[1]) {
      smallestMultiplier = equationValues[1] + Math.sqrt(equationValues[0]) / 5;
    } else {
      smallestMultiplier = equationValues[0] + Math.sqrt(equationValues[1]) / 5;
    }
  }
  
  if (o2 === 3) {
    if (equationValues[1] >= equationValues[2]) {
      smallestMultiplier = equationValues[2] + Math.sqrt(equationValues[1]) / 5;
    } else {
      smallestMultiplier = equationValues[1] + Math.sqrt(equationValues[2]) / 5;
    }
  }
  
  smallestMultiplier = Math.max(smallestMultiplier, -1.2);
  
  // Calculate difficulty
  let newDifficulty = 4 + 
    Math.sqrt(total) / 15 + 
    shortestDistance / 12 - 
    zeroPowers / 0.75 - 
    onePowers / 1.25 + 
    Math.sqrt(largestNum) / 16 + 
    largestNumDist / 9 + 
    smallestMultiplier / 2;
  
  if (newDifficulty < 3.2) {
    newDifficulty = 3.2;
  }
  
  return Math.round(newDifficulty * 50) / 100;
}

/**
 * Find the easiest solution for a given dice roll and target number
 * Returns: [d1, d2, d3, p1, p2, p3, o1, o2, total] or empty array if no solution
 */
export function easiestSolution(inputList: number[]): number[] {
  const dice1 = dePower(inputList[0]);
  const dice2 = dePower(inputList[1]);
  const dice3 = dePower(inputList[2]);
  const total = inputList[3];
  
  let smallestDifficulty = Infinity;
  let easiestEquation: number[] = [];
  
  // Try all 6 permutations of dice
  for (let i = 0; i < 6; i++) {
    const [d1, d2, d3] = cycleDice(dice1, dice2, dice3, i);
    
    const maxP1 = maxExponents[d1] || 3;
    const maxP2 = maxExponents[d2] || 3;
    const maxP3 = maxExponents[d3] || 3;
    
    // Try all combinations of powers and operators
    for (let p1 = 0; p1 <= maxP1; p1++) {
      for (let p2 = 0; p2 <= maxP2; p2++) {
        for (let p3 = 0; p3 <= maxP3; p3++) {
          for (let o1 = 1; o1 <= 4; o1++) {
            for (let o2 = 1; o2 <= 4; o2++) {
              const result = calculateEquation(
                Math.pow(d1, p1),
                Math.pow(d2, p2),
                Math.pow(d3, p3),
                o1,
                o2
              );
              
              if (result === total) {
                const difficulty = difficultyOfEquation([d1, d2, d3, p1, p2, p3, o1, o2, total]);
                if (difficulty < smallestDifficulty) {
                  smallestDifficulty = difficulty;
                  easiestEquation = [d1, d2, d3, p1, p2, p3, o1, o2, total];
                }
              }
            }
          }
        }
      }
    }
  }
  
  return easiestEquation;
}

/**
 * Format a solution as a readable string
 */
export function formatSolution(solution: number[]): string {
  if (solution.length === 0) return 'No solution found';
  
  const [d1, d2, d3, p1, p2, p3, o1, o2, total] = solution;
  
  const formatTerm = (d: number, p: number): string => {
    if (p === 0) return '1';
    if (p === 1) return `${d}`;
    return `${d}^${p}`;
  };
  
  return `${formatTerm(d1, p1)}${operatorToString(o1)}${formatTerm(d2, p2)}${operatorToString(o2)}${formatTerm(d3, p3)} = ${total}`;
}

export interface SolutionResult {
  solution: number[];
  difficulty: number;
  formatted: string;
}

/**
 * Solve and return full result
 */
export function solve(dice: number[], target: number): SolutionResult {
  const solution = easiestSolution([...dice, target]);
  
  if (solution.length === 0) {
    return {
      solution: [],
      difficulty: -1,
      formatted: 'No solution found'
    };
  }
  
  return {
    solution,
    difficulty: difficultyOfEquation(solution),
    formatted: formatSolution(solution)
  };
}

