/**
 * Board display component - shows a 6x6 grid
 */

import React from 'react';

interface BoardDisplayProps {
  board: number[];
  title?: string;
  highlightedNumbers?: Set<number>;
  onNumberClick?: (num: number, index: number) => void;
}

export const BoardDisplay: React.FC<BoardDisplayProps> = ({
  board,
  title,
  highlightedNumbers,
  onNumberClick
}) => {
  if (board.length !== 36) {
    return <div className="board-error">Board must have 36 numbers</div>;
  }

  const min = Math.min(...board);
  const max = Math.max(...board);

  return (
    <div className="board-container">
      {title && <h3 className="board-title">{title}</h3>}
      <div className="board-info">
        Range: {min} - {max}
      </div>
      <div className="board-grid">
        {board.map((num, index) => (
          <div
            key={index}
            className={`board-cell ${highlightedNumbers?.has(num) ? 'highlighted' : ''}`}
            onClick={() => onNumberClick?.(num, index)}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
};

interface BoardListDisplayProps {
  board: number[];
}

export const BoardListDisplay: React.FC<BoardListDisplayProps> = ({ board }) => {
  return (
    <div className="board-list">
      <code>[{board.join(', ')}]</code>
      <button
        className="copy-btn"
        onClick={() => navigator.clipboard.writeText(`[${board.join(', ')}]`)}
      >
        Copy
      </button>
    </div>
  );
};

export default BoardDisplay;

