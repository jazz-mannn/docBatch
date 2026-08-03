interface LandingProps {
  onStart: () => void;
}

const steps = [
  ['1', 'Upload a template', 'Choose the PDF that will be personalized.'],
  ['2', 'Add spreadsheet data', 'Use CSV or Excel with one row per document.'],
  ['3', 'Place fields', 'Drag names, dates, numbers, and other columns onto the page.'],
  ['4', 'Export the batch', 'Download every generated PDF inside one ZIP file.'],
];

export function Landing({ onStart }: LandingProps) {
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
          <a className="secondary-button" href="/sample-data.csv" download>Download sample CSV</a>
        </div>
        <div className="trust-row" aria-label="Product characteristics">
          <span>Local processing</span>
          <span>No account required</span>
          <span>CSV and Excel</span>
          <span>ZIP export</span>
        </div>
      </section>

      <section className="section-shell product-preview" aria-label="Product preview">
        <div className="preview-sidebar">
          <span className="preview-step active">1. Files</span>
          <span className="preview-step active">2. Fields</span>
          <span className="preview-step">3. Export</span>
        </div>
        <div className="preview-document">
          <div className="document-mark">CERTIFICATE</div>
          <p>This certificate is presented to</p>
          <strong>Alex Morgan</strong>
          <p>for completing Document Automation</p>
          <div className="preview-line" />
        </div>
        <div className="preview-data">
          <span>Name</span>
          <strong>Alex Morgan</strong>
          <span>Course</span>
          <strong>Document Automation</strong>
          <span>Date</span>
          <strong>3 August 2026</strong>
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
        <p>Use a PDF template and a spreadsheet containing up to 500 records.</p>
        <button className="primary-button" type="button" onClick={onStart}>Open DocBatch</button>
      </section>
    </main>
  );
}
