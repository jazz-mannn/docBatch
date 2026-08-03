import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './components/GeneratorEnhancements.css';
import './components/EditorInteractions.css';
import './components/LandingEnhancements.css';
import './components/WebsiteTheme.css';
import './components/OrangeMinimal.css';
import './components/StudioContrast.css';
import './components/TutorialReadability.css';
import './components/SourceDropFeedback.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
