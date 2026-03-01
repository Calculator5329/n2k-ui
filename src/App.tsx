import { Toolbox } from './components';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>N2K Toolbox</h1>
        <p className="subtitle">Number to Knock Off - Competition Tools</p>
      </header>

      <main className="main-content">
        <Toolbox />
      </main>

      <footer className="app-footer">
        <p>N2K Toolbox v2.0</p>
      </footer>
    </div>
  );
}

export default App;
