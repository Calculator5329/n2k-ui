/**
 * Board generation utilities
 * Ported from funcs.py
 */

/**
 * Generate a random board with 36 unique numbers from 1 to highestNum
 */
export function generateRandomBoard(highestNum: number = 999): number[] {
  const boardNums: number[] = [];
  
  while (boardNums.length < 36) {
    const nextNum = Math.floor(Math.random() * highestNum) + 1;
    if (!boardNums.includes(nextNum)) {
      boardNums.push(nextNum);
    }
  }
  
  boardNums.sort((a, b) => a - b);
  return boardNums;
}

/**
 * Generate a pattern board with arithmetic progressions
 * @param multiple - Array of 1, 2, or 3 multiples defining the pattern
 * @param startingNumber - The starting number of the pattern
 */
export function generatePatternBoard(
  multiple: number[] = [6],
  startingNumber: number = 6
): number[] {
  const boardList: number[] = [];
  
  if (multiple.length === 1) {
    for (let i = 0; i < 36; i++) {
      boardList.push(startingNumber + i * multiple[0]);
    }
  } else if (multiple.length === 2) {
    for (let i = 0; i < 18; i++) {
      boardList.push(startingNumber + i * multiple[0] + i * multiple[1]);
      boardList.push(startingNumber + i * multiple[0] + i * multiple[1] + multiple[0]);
    }
  } else if (multiple.length === 3) {
    for (let i = 0; i < 12; i++) {
      const base = startingNumber + i * multiple[0] + i * multiple[1] + i * multiple[2];
      boardList.push(base);
      boardList.push(base + multiple[0]);
      boardList.push(base + multiple[0] + multiple[1]);
    }
  }
  
  return boardList;
}

/**
 * Sum all elements in a list
 */
export function sumList(inputList: number[]): number {
  return inputList.reduce((sum, val) => sum + val, 0);
}

/**
 * Count occurrences of x in the list
 */
export function amountOfXInList(x: number, inputList: number[]): number {
  return inputList.filter(item => item === x).length;
}

/**
 * Print a board as a 6x6 grid (returns string for display)
 */
export function formatBoard(numList: number[]): string {
  const rows: string[] = [];
  for (let i = 0; i < 6; i++) {
    const row = numList.slice(i * 6, (i + 1) * 6).join('\t');
    rows.push(row);
  }
  return rows.join('\n');
}

/**
 * Get min and max values from a board
 */
export function getBoardRange(board: number[]): { min: number; max: number } {
  return {
    min: Math.min(...board),
    max: Math.max(...board)
  };
}

