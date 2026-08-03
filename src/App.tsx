import { useState } from 'react';
import { Generator } from './components/Generator';
import { Header } from './components/Header';
import { Landing } from './components/Landing';

function App() {
  const [view, setView] = useState<'home' | 'generator'>('home');

  return (
    <div className="app-shell">
      <Header inGenerator={view === 'generator'} onNavigate={setView} />
      {view === 'home' ? <Landing onStart={() => setView('generator')} /> : <Generator />}
      <footer className="site-footer">
        <span>© 2026 DocBatch</span>
        <span>Private browser-based document automation.</span>
      </footer>
    </div>
  );
}

export default App;
