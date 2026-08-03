interface HeaderProps {
  inGenerator: boolean;
  onNavigate: (view: 'home' | 'generator') => void;
  onOpenTutorial: () => void;
}

export function Header({ inGenerator, onNavigate, onOpenTutorial }: HeaderProps) {
  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={() => onNavigate('home')}>
        <img src="/logo.svg" alt="" width="38" height="38" />
        <span>
          <strong>DocBatch</strong>
          <small>PDF automation</small>
        </span>
      </button>
      <nav aria-label="Primary navigation">
        <button type="button" onClick={() => onNavigate('home')}>Home</button>
        <button type="button" onClick={onOpenTutorial}>How it works</button>
        <a href="https://github.com/Rash-Au/docBatch" target="_blank" rel="noreferrer">GitHub</a>
        <button className="nav-cta" type="button" onClick={() => onNavigate('generator')}>
          {inGenerator ? 'New batch' : 'Open studio'}
        </button>
      </nav>
    </header>
  );
}
