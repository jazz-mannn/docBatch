import { useMemo } from 'react';

interface LandingProps {
  onStart: () => void;
}

const steps = [
  ['1', 'Upload a template', 'Choose the PDF that will be personalized.'],
  ['2', 'Add spreadsheet data', 'Use CSV or Excel with one row per document.'],
  ['3', 'Place and edit fields', 'Drag spreadsheet values or custom text onto the page.'],
  ['4', 'Export the batch', 'Download every generated PDF inside one ZIP file.'],
];

const audiences = [
  ['Universities and schools', 'Generate certificates, admission letters, result notices, student confirmations, and event documents.'],
  ['Training providers', 'Produce course certificates, attendance records, completion letters, and participant badges.'],
  ['HR and operations teams', 'Prepare employee letters, onboarding packs, internal notices, and repeated forms.'],
  ['Events and organizations', 'Create invitations, passes, membership documents, acknowledgements, and branded credentials.'],
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
      <section className="hero section-shell">
        <div className="eyebrow">Private browser-based document automation</div>
        <h1>Turn one template into hundreds of finished PDFs.</h1>
        <p className="hero-copy">
          Upload a PDF and a spreadsheet. Position the fields once. DocBatch generates a personalized document for every row without uploading your files to an application server.
        </p>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={onStart}>Create a batch</button>
        </div>
        <div className="trust-row" aria-label="Product characteristics">
          <span>Local processing</span>
          <span>No account required</span>
          <span>CSV and Excel</span>
          <span>ZIP export</span>
        </div>
      </section>

      <section className="section-shell product-preview" aria-label="Synthetic product preview">
        <div className="preview-sidebar">
          <span className="preview-step active">1. Files</span>
          <span className="preview-step active">2. Fields</span>
          <span className="preview-step">3. Export</span>
        </div>
        <div className="preview-document">
          <div className="document-mark">CREDENTIAL</div>
          <p>This credential is issued to</p>
          <strong>{syntheticCredential.recipient}</strong>
          <p>for completing Batch Automation Fundamentals</p>
          <div className="preview-line" />
        </div>
        <div className="preview-data">
          <span>Recipient</span>
          <strong>{syntheticCredential.recipient}</strong>
          <span>Programme</span>
          <strong>Batch Automation Fundamentals</strong>
          <span>Credential ID</span>
          <strong>{syntheticCredential.credential}</strong>
        </div>
      </section>

      <section className="section-shell audience-section">
        <div className="audience-heading">
          <div className="eyebrow">Useful across repeated document workflows</div>
          <h2>Designed for institutions and teams that generate documents at scale.</h2>
          <p>DocBatch is especially useful where one approved layout must be issued to many recipients with different details.</p>
        </div>
        <div className="audience-grid">
          {audiences.map(([title, description]) => (
            <article className="audience-card" key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell feature-section">
        <div>
          <div className="eyebrow">A complete first workflow</div>
          <h2>Built for repeat documents, not design software.</h2>
          <p>DocBatch focuses on the part that usually wastes time: repeating the same edits for every recipient.</p>
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
          <div className="eyebrow">Privacy by architecture</div>
          <h2>Your files remain in the browser.</h2>
        </div>
        <p>
          The MVP uses browser memory for templates, spreadsheet rows, PDF generation, and ZIP creation. Refreshing or closing the page clears the working session.
        </p>
      </section>

      <section className="section-shell final-cta">
        <h2>Generate the first batch.</h2>
        <p>Use one PDF template and one spreadsheet containing up to 500 records.</p>
        <button className="primary-button" type="button" onClick={onStart}>Open DocBatch</button>
      </section>
    </main>
  );
}
