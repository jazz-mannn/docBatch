interface HeaderProps {
  inGenerator: boolean;
  onNavigate: (view: 'home' | 'generator') => void;
}

export function Header({ inGenerator, onNavigate }: HeaderProps) {
  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={() => onNavigate('home')}>
        <img src="/logo.svg" alt="" width="34" height="34" />
        <span>DocBatch</span>
      </button>
      <nav aria-label="Primary navigation">
        <button type="button" onClick={() => onNavigate('home')}>Overview</button>
        <a href="https://github.com/Rash-Au/docBatch" target="_blank" rel="noreferrer">Repository</a>
        <button className="nav-cta" type="button" onClick={() => onNavigate('generator')}>
          {inGenerator ? 'New batch' : 'Open generator'}
        </button>
      </nav>
    </header>
  );
}
