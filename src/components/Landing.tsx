import { useMemo } from 'react';

interface LandingProps {
  onStart: () => void;
}

const steps = [
  ['01', 'Add your source files', 'Upload one approved PDF template and a CSV or Excel spreadsheet.'],
  ['02', 'Place dynamic content', 'Add spreadsheet fields, reusable text, signatures, and logos to the document.'],
  ['03', 'Review every variation', 'Preview different spreadsheet rows before generating the complete batch.'],
  ['04', 'Download the results', 'Create one named PDF per row and receive the complete batch as a ZIP archive.'],
];

const audiences = [
  ['Universities and schools', 'Certificates, admission letters, result notices, student confirmations, and graduation documents.'],
  ['Training providers', 'Course certificates, attendance records, completion letters, and participant credentials.'],
  ['HR and operations teams', 'Employee letters, onboarding documents, internal notices, and repeated administrative forms.'],
  ['Events and organizations', 'Invitations, access passes, membership documents, acknowledgements, and branded credentials.'],
];

const capabilities = [
  'CSV and Excel data',
  'Custom output filenames',
  'Signatures and logos',
  'Automatic font matching',
  'Drag-to-delete editing',
  'ZIP batch export',
];

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
    <main>
      <section className="hero section-shell launch-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="eyebrow">Bulk document automation for the web</div>
        <h1>Create hundreds of personalized PDFs from one template.</h1>
        <p className="hero-copy">
          DocBatch turns a PDF template and spreadsheet into a complete, professionally named document batch. Place the fields once, review the result, and generate every PDF in one workflow.
        </p>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={onStart}>Start creating</button>
          <button className="secondary-button" type="button" onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}>
            See the workflow
          </button>
        </div>
        <div className="trust-row" aria-label="Product capabilities">
          <span>No account required</span>
          <span>Up to 500 PDFs per batch</span>
          <span>Files stay in your browser</span>
        </div>
      </section>

      <section className="section-shell product-preview launch-preview" aria-label="Synthetic DocBatch preview">
        <div className="preview-sidebar">
          <div className="preview-brand-mark">DB</div>
          <span className="preview-step active">Source files</span>
          <span className="preview-step active">Document fields</span>
          <span className="preview-step">Export batch</span>
          <div className="preview-status">
            <span>Ready</span>
            <strong>128 documents</strong>
          </div>
        </div>
        <div className="preview-document">
          <div className="document-mark">CERTIFICATE OF COMPLETION</div>
          <p>This credential is issued to</p>
          <strong>{syntheticCredential.recipient}</strong>
          <p>for completing Document Automation Fundamentals</p>
          <div className="preview-line" />
          <small>Credential {syntheticCredential.credential}</small>
        </div>
        <div className="preview-data">
          <span>Recipient</span>
          <strong>{syntheticCredential.recipient}</strong>
          <span>Programme</span>
          <strong>Document Automation Fundamentals</strong>
          <span>Credential ID</span>
          <strong>{syntheticCredential.credential}</strong>
          <button type="button" onClick={onStart}>Open this workflow</button>
        </div>
      </section>

      <section className="section-shell capability-strip" aria-label="DocBatch capabilities">
        {capabilities.map((capability) => <span key={capability}>{capability}</span>)}
      </section>

      <section className="section-shell audience-section">
        <div className="audience-heading">
          <div className="eyebrow">Built for repeated document workflows</div>
          <h2>One approved design. Hundreds of accurate documents.</h2>
          <p>DocBatch is designed for teams that repeatedly issue the same document layout with different recipient details.</p>
        </div>
        <div className="audience-grid">
          {audiences.map(([title, description]) => (
            <article className="audience-card" key={title}>
              <span className="audience-icon" aria-hidden="true">✦</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell feature-section" id="workflow">
        <div>
          <div className="eyebrow">A focused four-step workflow</div>
          <h2>Document production without repetitive manual editing.</h2>
          <p>Every control is organized around preparing, reviewing, and exporting a reliable batch.</p>
        </div>
        <div className="step-grid">
          {steps.map(([number, title, description]) => (
            <article className="step-card" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell privacy-section">
        <div>
          <div className="eyebrow">Privacy-first processing</div>
          <h2>Your document content stays on your device.</h2>
        </div>
        <div>
          <p>Templates, spreadsheet records, signatures, logos, generated PDFs, and ZIP creation are handled inside the browser session.</p>
          <div className="privacy-points">
            <span>No document upload server</span>
            <span>No customer account required</span>
            <span>Refresh to clear the working session</span>
          </div>
        </div>
      </section>

      <section className="section-shell final-cta">
        <div className="cta-orbit" aria-hidden="true" />
        <div className="eyebrow">Ready to generate</div>
        <h2>Build your first document batch.</h2>
        <p>Add one PDF template and one spreadsheet with up to 500 records.</p>
        <button className="primary-button" type="button" onClick={onStart}>Open DocBatch Studio</button>
      </section>
    </main>
  );
}
