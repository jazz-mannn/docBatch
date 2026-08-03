import { useCallback, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Generator } from './components/Generator';
import { Header } from './components/Header';
import { Landing } from './components/Landing';
import { Tutorial } from './components/Tutorial';
import { hasSeenTutorial, markTutorialSeen } from './lib/onboarding';

function App() {
  const [view, setView] = useState<'home' | 'generator'>('home');
  const [tutorialOpen, setTutorialOpen] = useState(() => !hasSeenTutorial());

  const closeTutorial = useCallback(() => {
    markTutorialSeen();
    setTutorialOpen(false);
  }, []);

  return (
    <div className="app-shell">
      <Header
        inGenerator={view === 'generator'}
        onNavigate={setView}
        onOpenTutorial={() => setTutorialOpen(true)}
      />
      {view === 'home' ? <Landing onStart={() => setView('generator')} /> : <Generator />}
      <footer className="site-footer">
        <span>© 2026 DocBatch</span>
        <span>Private browser-based document automation.</span>
      </footer>
      <Tutorial
        open={tutorialOpen}
        onClose={closeTutorial}
        onOpenGenerator={() => setView('generator')}
      />
      <Analytics />
    </div>
  );
}

export default App;
