import { useMemo } from 'react';

interface LandingProps {
  onStart: () => void;
}

const steps = [
  ['01', 'Add', 'One PDF. One spreadsheet.'],
  ['02', 'Place', 'Drop in text, signatures, and logos.'],
  ['03', 'Export', 'Download the whole batch as a ZIP.'],
];

const useCases = ['Certificates', 'Letters', 'Invitations', 'Badges', 'Receipts'];

function createSyntheticCredential() {
  const values = new Uint16Array(2);
  crypto.getRandomValues(values);
  const recipientCode = `R-${String(values[0] % 10000).padStart(4, '0')}`;
  const credentialCode = `DB-${(values[1] % 0xffff).toString(16).toUpperCase().padStart(4, '0')}`;

  return {
    recipient: `Recipient ${recipientCode}`,
    credential: credentialCode,
  };
}

export function Landing({ onStart }: LandingProps) {
  const syntheticCredential = useMemo(createSyntheticCredential, []);

  return (
    <main className="minimal-home">
      <section className="hero section-shell launch-hero minimal-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="eyebrow">Documents, multiplied.</div>
        <h1>One template. Every document.</h1>
        <p className="hero-copy">
          Add a PDF and spreadsheet. Place fields once. Download the finished batch.
        </p>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={onStart}>Create a batch</button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See how
          </button>
        </div>
        <div className="trust-row" aria-label="Product facts">
          <span>Up to 500 PDFs</span>
          <span>No account</span>
          <span>Browser processing</span>
        </div>
      </section>

      <section className="section-shell product-preview minimal-preview" aria-label="Synthetic DocBatch preview">
        <div className="batch-rail">
          <span className="batch-kicker">Batch</span>
          <strong>128</strong>
          <small>PDFs queued</small>
          <div className="rail-line" aria-hidden="true" />
          <span className="rail-state active">Template</span>
          <span className="rail-state active">Data</span>
          <span className="rail-state">Export</span>
        </div>

        <div className="preview-document minimal-document">
          <div className="document-mark">CERTIFICATE</div>
          <p>Presented to</p>
          <strong>{syntheticCredential.recipient}</strong>
          <p>for completing Document Automation</p>
          <div className="preview-line" />
          <small>{syntheticCredential.credential}</small>
        </div>

        <div className="batch-output">
          <span>Output</span>
          <strong>{'{Recipient}'} - {'{Credential}'}</strong>
          <div className="output-pulse" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <small>128 unique filenames</small>
          <button type="button" onClick={onStart}>Open studio</button>
        </div>
      </section>

      <section className="section-shell use-case-ribbon" aria-label="Common document types">
        {useCases.map((item) => <span key={item}>{item}</span>)}
      </section>

      <section className="section-shell minimal-workflow" id="workflow">
        <div className="workflow-intro">
          <div className="eyebrow">Simple by design</div>
          <h2>Three moves. Done.</h2>
        </div>
        <div className="minimal-step-grid">
          {steps.map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell privacy-line">
        <span className="privacy-dot" aria-hidden="true" />
        <p>Your files stay in this browser session.</p>
      </section>

      <section className="section-shell minimal-final">
        <div>
          <span>Ready when you are.</span>
          <h2>Make the batch.</h2>
        </div>
        <button className="primary-button" type="button" onClick={onStart}>Open DocBatch</button>
      </section>
    </main>
  );
}
