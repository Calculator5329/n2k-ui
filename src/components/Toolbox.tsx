/**
 * Unified N2K Toolbox - All tools in one place
 */

import React, { useState, useEffect } from 'react';
import type { CompetitionData, SolutionResult } from '../utils';
import {
  generateRandomBoard,
  generatePatternBoard,
  generateRandomDice,
  normalDiceList,
  extensiveDiceList,
  solve,
  expectedScore,
  loadDifficulties,
  generateCompetition,
  generateCompetitionSummary
} from '../utils';
import { BoardDisplay, BoardListDisplay } from './BoardDisplay';

// Types for saved items
interface SavedBoard {
  id: string;
  name: string;
  board: number[];
  dice: number[];
  createdAt: Date;
}

interface SavedCompetition {
  id: string;
  name: string;
  competition: CompetitionData;
  createdAt: Date;
}

export const Toolbox: React.FC = () => {
  // Data loading state
  const [dataLoaded, setDataLoaded] = useState(false);

  // ===== BOARD & DICE SECTION =====
  const [boardType, setBoardType] = useState<'random' | 'pattern'>('random');
  const [maxRange, setMaxRange] = useState(600);
  const [multiple1, setMultiple1] = useState(6);
  const [multiple2, setMultiple2] = useState(0);
  const [multiple3, setMultiple3] = useState(0);
  const [startingNumber, setStartingNumber] = useState(6);
  const [multipleCount, setMultipleCount] = useState(1);
  
  const [diceMode, setDiceMode] = useState<'random' | 'list'>('random');
  const [minDice, setMinDice] = useState(2);
  const [maxDice, setMaxDice] = useState(10);
  const [lastMaxDice, setLastMaxDice] = useState(20);
  const [listType, setListType] = useState<'normal' | 'extensive'>('normal');
  const [selectedDiceIndex, setSelectedDiceIndex] = useState(0);
  
  const [board, setBoard] = useState<number[]>([]);
  const [dice, setDice] = useState<number[]>([]);
  const [boardDifficulty, setBoardDifficulty] = useState<number | null>(null);

  // ===== EQUATION SOLVER SECTION =====
  const [dice1, setDice1] = useState(2);
  const [dice2, setDice2] = useState(3);
  const [dice3, setDice3] = useState(10);
  const [target, setTarget] = useState(100);
  const [solution, setSolution] = useState<SolutionResult | null>(null);

  // ===== COMPETITION SECTION =====
  const [playerCount, setPlayerCount] = useState<4 | 8 | 16 | 32>(16);
  const [variation, setVariation] = useState(0);
  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [competitionLoading, setCompetitionLoading] = useState(false);
  const [activeBoard, setActiveBoard] = useState(0);

  // ===== SAVED ITEMS (in-memory) =====
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([]);
  const [savedCompetitions, setSavedCompetitions] = useState<SavedCompetition[]>([]);
  const [savedItemsTab, setSavedItemsTab] = useState<'boards' | 'competitions'>('boards');

  // ===== SECTION VISIBILITY =====
  const [openSections, setOpenSections] = useState({
    boardDice: true,
    solver: false,
    competition: false,
    saved: false
  });

  useEffect(() => {
    loadDifficulties()
      .then(() => setDataLoaded(true))
      .catch((err) => console.error('Failed to load difficulties:', err));
  }, []);

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ===== BOARD & DICE HANDLERS =====
  const generateBoardAndDice = () => {
    // Generate board
    let newBoard: number[];
    if (boardType === 'random') {
      newBoard = generateRandomBoard(maxRange);
    } else {
      const multiples: number[] = [multiple1];
      if (multipleCount >= 2) multiples.push(multiple2);
      if (multipleCount >= 3) multiples.push(multiple3);
      newBoard = generatePatternBoard(multiples, startingNumber);
    }
    setBoard(newBoard);

    // Generate dice
    let newDice: number[];
    if (diceMode === 'random') {
      newDice = generateRandomDice(minDice, maxDice, lastMaxDice);
    } else {
      const list = listType === 'normal' ? normalDiceList : extensiveDiceList;
      newDice = [...list[selectedDiceIndex]];
    }
    setDice(newDice);

    // Calculate difficulty if data is loaded
    if (dataLoaded) {
      const expScore = expectedScore(newBoard, newDice);
      setBoardDifficulty(expScore);
    }
  };

  const getRandomFromList = () => {
    const list = listType === 'normal' ? normalDiceList : extensiveDiceList;
    const randomIndex = Math.floor(Math.random() * list.length);
    setSelectedDiceIndex(randomIndex);
  };

  const saveBoardWithName = () => {
    if (board.length === 0 || dice.length === 0) {
      alert('Generate a board and dice first');
      return;
    }
    const name = prompt('Enter a name for this board:');
    if (!name) return;

    const newSaved: SavedBoard = {
      id: Date.now().toString(),
      name,
      board: [...board],
      dice: [...dice],
      createdAt: new Date()
    };
    setSavedBoards(prev => [...prev, newSaved]);
  };

  const loadSavedBoard = (saved: SavedBoard) => {
    setBoard(saved.board);
    setDice(saved.dice);
    if (dataLoaded) {
      setBoardDifficulty(expectedScore(saved.board, saved.dice));
    }
    setOpenSections(prev => ({ ...prev, boardDice: true }));
  };

  const deleteSavedBoard = (id: string) => {
    setSavedBoards(prev => prev.filter(b => b.id !== id));
  };

  // ===== EQUATION SOLVER HANDLERS =====
  const solveEquation = () => {
    const result = solve([dice1, dice2, dice3], target);
    setSolution(result);
  };

  const getDifficultyColor = (diff: number): string => {
    if (diff < 0) return '#888';
    if (diff < 3) return '#22c55e';
    if (diff < 5) return '#84cc16';
    if (diff < 7) return '#eab308';
    if (diff < 10) return '#f97316';
    return '#ef4444';
  };

  // ===== COMPETITION HANDLERS =====
  const generateComp = async () => {
    if (!dataLoaded) {
      alert('Please wait for difficulty data to load');
      return;
    }
    setCompetitionLoading(true);
    await new Promise(resolve => setTimeout(resolve, 50));
    try {
      const comp = generateCompetition(playerCount, variation);
      setCompetition(comp);
      setActiveBoard(0);
    } catch (e) {
      console.error('Error generating competition:', e);
      alert('Error generating competition');
    }
    setCompetitionLoading(false);
  };

  const saveCompetitionWithName = () => {
    if (!competition) {
      alert('Generate a competition first');
      return;
    }
    const name = prompt('Enter a name for this competition:');
    if (!name) return;

    const newSaved: SavedCompetition = {
      id: Date.now().toString(),
      name,
      competition: { ...competition },
      createdAt: new Date()
    };
    setSavedCompetitions(prev => [...prev, newSaved]);
  };

  const loadSavedCompetition = (saved: SavedCompetition) => {
    setCompetition(saved.competition);
    setActiveBoard(0);
    setOpenSections(prev => ({ ...prev, competition: true }));
  };

  const deleteSavedCompetition = (id: string) => {
    setSavedCompetitions(prev => prev.filter(c => c.id !== id));
  };

  const copyBoardData = (boardIndex: number) => {
    if (!competition) return;
    const boardData = competition.boards[boardIndex];
    const diceData = competition.boardDiceData[boardIndex];

    let text = `Board ${boardIndex + 1}\n`;
    text += `[${boardData.join(', ')}]\n\n`;
    text += `Dice Rolls:\n`;
    diceData.diceRollPairs.forEach((pair, i) => {
      text += `Round ${i + 1}: P1 [${pair.player1.join(', ')}] - P2 [${pair.player2.join(', ')}]\n`;
    });
    navigator.clipboard.writeText(text);
  };

  const exportFullCompetition = () => {
    if (!competition) return;
    const summary = generateCompetitionSummary(competition);

    let text = '=== N2K COMPETITION ===\n\n';
    text += summary.overview + '\n\n';
    text += '--- Board Ranges ---\n' + summary.boardRanges + '\n\n';

    for (let i = 0; i < competition.boards.length; i++) {
      text += `=== BOARD ${i + 1} ===\n`;
      text += `[${competition.boards[i].join(', ')}]\n\n`;
      const diceData = competition.boardDiceData[i];
      text += 'Dice Rolls:\n';
      diceData.diceRollPairs.forEach((pair, j) => {
        text += `  Round ${j + 1}:\n`;
        text += `    Player 1: [${pair.player1.join(', ')}]\n`;
        text += `    Player 2: [${pair.player2.join(', ')}]\n`;
      });
      text += '\n';
    }
    text += '--- Expected Scores ---\n' + summary.expectedScores + '\n';
    text += '--- Percentiles ---\n' + summary.percentiles + '\n';

    navigator.clipboard.writeText(text);
    alert('Competition data copied to clipboard!');
  };

  const currentDiceList = listType === 'normal' ? normalDiceList : extensiveDiceList;

  return (
    <div className="toolbox">
      {!dataLoaded && (
        <div className="loading-notice">Loading difficulty data...</div>
      )}

      {/* ===== BOARD & DICE GENERATOR ===== */}
      <section className="toolbox-section">
        <button 
          className="section-header"
          onClick={() => toggleSection('boardDice')}
        >
          <span className="section-icon">{openSections.boardDice ? '▼' : '▶'}</span>
          <h2>Board & Dice Generator</h2>
        </button>
        
        {openSections.boardDice && (
          <div className="section-content">
            {/* Board Options */}
            <div className="subsection">
              <h3>Board Type</h3>
              <div className="board-type-selector">
                <label>
                  <input
                    type="radio"
                    value="random"
                    checked={boardType === 'random'}
                    onChange={() => setBoardType('random')}
                  />
                  Random
                </label>
                <label>
                  <input
                    type="radio"
                    value="pattern"
                    checked={boardType === 'pattern'}
                    onChange={() => setBoardType('pattern')}
                  />
                  Pattern
                </label>
              </div>

              {boardType === 'random' ? (
                <div className="options-panel">
                  <label>
                    Max Number:
                    <input
                      type="number"
                      min={36}
                      max={10000}
                      value={maxRange}
                      onChange={(e) => setMaxRange(parseInt(e.target.value) || 600)}
                    />
                  </label>
                </div>
              ) : (
                <div className="options-panel">
                  <label>
                    Multiples:
                    <select
                      value={multipleCount}
                      onChange={(e) => setMultipleCount(parseInt(e.target.value))}
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </label>
                  <label>
                    Multiple 1:
                    <input
                      type="number"
                      value={multiple1}
                      onChange={(e) => setMultiple1(parseInt(e.target.value) || 0)}
                    />
                  </label>
                  {multipleCount >= 2 && (
                    <label>
                      Multiple 2:
                      <input
                        type="number"
                        value={multiple2}
                        onChange={(e) => setMultiple2(parseInt(e.target.value) || 0)}
                      />
                    </label>
                  )}
                  {multipleCount >= 3 && (
                    <label>
                      Multiple 3:
                      <input
                        type="number"
                        value={multiple3}
                        onChange={(e) => setMultiple3(parseInt(e.target.value) || 0)}
                      />
                    </label>
                  )}
                  <label>
                    Starting Number:
                    <input
                      type="number"
                      value={startingNumber}
                      onChange={(e) => setStartingNumber(parseInt(e.target.value) || 0)}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Dice Options */}
            <div className="subsection">
              <h3>Dice Type</h3>
              <div className="board-type-selector">
                <label>
                  <input
                    type="radio"
                    value="random"
                    checked={diceMode === 'random'}
                    onChange={() => setDiceMode('random')}
                  />
                  Random
                </label>
                <label>
                  <input
                    type="radio"
                    value="list"
                    checked={diceMode === 'list'}
                    onChange={() => setDiceMode('list')}
                  />
                  From List
                </label>
              </div>

              {diceMode === 'random' ? (
                <div className="options-panel">
                  <label>
                    Min Die:
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={minDice}
                      onChange={(e) => setMinDice(parseInt(e.target.value) || 1)}
                    />
                  </label>
                  <label>
                    Max Die (1-2):
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={maxDice}
                      onChange={(e) => setMaxDice(parseInt(e.target.value) || 10)}
                    />
                  </label>
                  <label>
                    Max Die (3):
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={lastMaxDice}
                      onChange={(e) => setLastMaxDice(parseInt(e.target.value) || 20)}
                    />
                  </label>
                </div>
              ) : (
                <div className="options-panel">
                  <label>
                    List:
                    <select
                      value={listType}
                      onChange={(e) => {
                        setListType(e.target.value as 'normal' | 'extensive');
                        setSelectedDiceIndex(0);
                      }}
                    >
                      <option value="normal">Normal ({normalDiceList.length})</option>
                      <option value="extensive">Extensive ({extensiveDiceList.length})</option>
                    </select>
                  </label>
                  <label>
                    Dice:
                    <select
                      value={selectedDiceIndex}
                      onChange={(e) => setSelectedDiceIndex(parseInt(e.target.value))}
                    >
                      {currentDiceList.map((d, i) => (
                        <option key={i} value={i}>[{d.join(', ')}]</option>
                      ))}
                    </select>
                  </label>
                  <button className="secondary-btn" onClick={getRandomFromList}>
                    Random
                  </button>
                </div>
              )}
            </div>

            <button className="generate-btn" onClick={generateBoardAndDice}>
              Generate Board & Dice
            </button>

            {/* Results */}
            {board.length > 0 && (
              <div className="result-section">
                <BoardDisplay board={board} title="Generated Board" />
                <BoardListDisplay board={board} />

                <div className="dice-display">
                  {dice.map((d, i) => (
                    <div key={i} className="die">{d}</div>
                  ))}
                </div>
                <div className="dice-text">
                  Dice: [{dice.join(', ')}]
                  <button
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText(`[${dice.join(', ')}]`)}
                  >
                    Copy
                  </button>
                </div>

                {boardDifficulty !== null && (
                  <div className="difficulty-result">
                    <strong>Expected Score:</strong> {boardDifficulty.toFixed(1)}
                  </div>
                )}

                <button className="secondary-btn save-btn" onClick={saveBoardWithName}>
                  Save Board
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ===== EQUATION SOLVER ===== */}
      <section className="toolbox-section">
        <button 
          className="section-header"
          onClick={() => toggleSection('solver')}
        >
          <span className="section-icon">{openSections.solver ? '▼' : '▶'}</span>
          <h2>Equation Solver</h2>
        </button>
        
        {openSections.solver && (
          <div className="section-content">
            <div className="options-panel horizontal">
              <label>
                Die 1:
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={dice1}
                  onChange={(e) => setDice1(parseInt(e.target.value) || 2)}
                />
              </label>
              <label>
                Die 2:
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={dice2}
                  onChange={(e) => setDice2(parseInt(e.target.value) || 3)}
                />
              </label>
              <label>
                Die 3:
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={dice3}
                  onChange={(e) => setDice3(parseInt(e.target.value) || 10)}
                />
              </label>
              <label>
                Target:
                <input
                  type="number"
                  min={-1000000}
                  max={1000000}
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                />
              </label>
            </div>

            <button className="generate-btn" onClick={solveEquation}>
              Solve
            </button>

            {solution && (
              <div className="result-section">
                <div className="solution-display">
                  <div className="solution-equation">{solution.formatted}</div>
                  {solution.difficulty >= 0 && (
                    <div
                      className="solution-difficulty"
                      style={{ color: getDifficultyColor(solution.difficulty) }}
                    >
                      Difficulty: {solution.difficulty.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ===== COMPETITION GENERATOR ===== */}
      <section className="toolbox-section">
        <button 
          className="section-header"
          onClick={() => toggleSection('competition')}
        >
          <span className="section-icon">{openSections.competition ? '▼' : '▶'}</span>
          <h2>Competition Generator</h2>
        </button>
        
        {openSections.competition && (
          <div className="section-content">
            <div className="options-panel">
              <label>
                Player Count:
                <select
                  value={playerCount}
                  onChange={(e) => setPlayerCount(parseInt(e.target.value) as 4 | 8 | 16 | 32)}
                >
                  <option value={4}>4 Players (4 rounds, 1 board)</option>
                  <option value={8}>8 Players (7 rounds, 2 boards)</option>
                  <option value={16}>16 Players (15 rounds, 3 boards)</option>
                  <option value={32}>32 Players (31 rounds, 6 boards)</option>
                </select>
              </label>

              <div className="variation-control">
                <label>
                  Dice Roll Variation: <strong>{variation}%</strong>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={variation}
                    onChange={(e) => setVariation(parseInt(e.target.value))}
                    className="variation-slider"
                  />
                </label>
                <div className="variation-labels">
                  <span>Tight (similar each round)</span>
                  <span>Wild (big swings)</span>
                </div>
              </div>
            </div>

            <button
              className="generate-btn"
              onClick={generateComp}
              disabled={competitionLoading || !dataLoaded}
            >
              {competitionLoading ? 'Generating...' : 'Generate Competition'}
            </button>

            {competition && (
              <div className="competition-results">
                <div className="competition-overview">
                  <h3>Competition Overview</h3>
                  <p>
                    <strong>{competition.playerCount}</strong> players,
                    <strong> {competition.roundCount}</strong> rounds across
                    <strong> {competition.boardCount}</strong> boards
                  </p>
                  <p>
                    {competition.dicePerBoard} dice rolls per board
                    {competition.extraDice > 0 && ` (+${competition.extraDice} on last board)`}
                  </p>
                  <div className="button-row">
                    <button className="secondary-btn" onClick={exportFullCompetition}>
                      Export Full Competition
                    </button>
                    <button className="secondary-btn" onClick={saveCompetitionWithName}>
                      Save Competition
                    </button>
                  </div>
                </div>

                <div className="board-tabs">
                  {competition.boards.map((_, i) => (
                    <button
                      key={i}
                      className={`board-tab ${activeBoard === i ? 'active' : ''}`}
                      onClick={() => setActiveBoard(i)}
                    >
                      Board {i + 1}
                    </button>
                  ))}
                </div>

                <div className="board-details">
                  <BoardDisplay
                    board={competition.boards[activeBoard]}
                    title={`Board ${activeBoard + 1}`}
                  />

                  <div className="board-range">
                    Range: {competition.boardRanges[activeBoard].min} - {competition.boardRanges[activeBoard].max}
                  </div>

                  <button
                    className="secondary-btn"
                    onClick={() => copyBoardData(activeBoard)}
                  >
                    Copy Board Data
                  </button>

                  <div className="dice-rounds">
                    <h4>Dice Rolls</h4>
                    <div className="rounds-table">
                      <div className="rounds-header">
                        <span>Round</span>
                        <span>Player 1</span>
                        <span>Player 2</span>
                      </div>
                      {competition.boardDiceData[activeBoard].diceRollPairs.map((pair, i) => (
                        <div key={i} className="round-row">
                          <span className="round-num">{i + 1}</span>
                          <span className="dice-cell">[{pair.player1.join(', ')}]</span>
                          <span className="dice-cell">[{pair.player2.join(', ')}]</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="scores-section">
                    <h4>Expected Scores</h4>
                    <div className="scores-grid">
                      <div>
                        <strong>Player 1:</strong>{' '}
                        {competition.boardDiceData[activeBoard].scores.player1.join(', ')}
                      </div>
                      <div>
                        <strong>Player 2:</strong>{' '}
                        {competition.boardDiceData[activeBoard].scores.player2.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="percentiles-section">
                    <h4>Dice Roll Percentiles</h4>
                    <p className="info-text">Lower percentile = easier dice roll for this board</p>
                    <div className="scores-grid">
                      <div>
                        <strong>Player 1:</strong>{' '}
                        {competition.boardDiceData[activeBoard].percentiles.player1
                          .map((p) => p.toFixed(1) + '%')
                          .join(', ')}
                      </div>
                      <div>
                        <strong>Player 2:</strong>{' '}
                        {competition.boardDiceData[activeBoard].percentiles.player2
                          .map((p) => p.toFixed(1) + '%')
                          .join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ===== SAVED ITEMS ===== */}
      <section className="toolbox-section">
        <button 
          className="section-header"
          onClick={() => toggleSection('saved')}
        >
          <span className="section-icon">{openSections.saved ? '▼' : '▶'}</span>
          <h2>Saved Items ({savedBoards.length + savedCompetitions.length})</h2>
        </button>
        
        {openSections.saved && (
          <div className="section-content">
            <div className="saved-tabs">
              <button
                className={`saved-tab ${savedItemsTab === 'boards' ? 'active' : ''}`}
                onClick={() => setSavedItemsTab('boards')}
              >
                Boards ({savedBoards.length})
              </button>
              <button
                className={`saved-tab ${savedItemsTab === 'competitions' ? 'active' : ''}`}
                onClick={() => setSavedItemsTab('competitions')}
              >
                Competitions ({savedCompetitions.length})
              </button>
            </div>

            {savedItemsTab === 'boards' && (
              <div className="saved-list">
                {savedBoards.length === 0 ? (
                  <p className="empty-message">No saved boards yet</p>
                ) : (
                  savedBoards.map((saved) => (
                    <div key={saved.id} className="saved-item">
                      <div className="saved-item-info">
                        <strong>{saved.name}</strong>
                        <span className="saved-item-meta">
                          Range: {Math.min(...saved.board)} - {Math.max(...saved.board)} | 
                          Dice: [{saved.dice.join(', ')}]
                        </span>
                      </div>
                      <div className="saved-item-actions">
                        <button className="secondary-btn" onClick={() => loadSavedBoard(saved)}>
                          Load
                        </button>
                        <button className="danger-btn" onClick={() => deleteSavedBoard(saved.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {savedItemsTab === 'competitions' && (
              <div className="saved-list">
                {savedCompetitions.length === 0 ? (
                  <p className="empty-message">No saved competitions yet</p>
                ) : (
                  savedCompetitions.map((saved) => (
                    <div key={saved.id} className="saved-item">
                      <div className="saved-item-info">
                        <strong>{saved.name}</strong>
                        <span className="saved-item-meta">
                          {saved.competition.playerCount} players | 
                          {saved.competition.boardCount} boards | 
                          {saved.competition.roundCount} rounds
                        </span>
                      </div>
                      <div className="saved-item-actions">
                        <button className="secondary-btn" onClick={() => loadSavedCompetition(saved)}>
                          Load
                        </button>
                        <button className="danger-btn" onClick={() => deleteSavedCompetition(saved.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Toolbox;

