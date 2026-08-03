import { useEffect, useState } from 'react';
import './Tutorial.css';

interface TutorialProps {
  open: boolean;
  onClose: () => void;
  onOpenGenerator: () => void;
}

const tutorialSteps = [
  {
    title: 'Add the two source files',
    body: 'Drop one PDF template and one CSV or Excel spreadsheet. The app accepts two active files per session, with separate size limits for performance.',
    points: ['PDF template: one file, up to 8 MB', 'Spreadsheet: one file, up to 5 MB', 'Spreadsheet batches: up to 500 rows'],
  },
  {
    title: 'Place spreadsheet and custom text fields',
    body: 'Add any spreadsheet column to the page, or add text that should appear on every generated document.',
    points: ['Up to 20 positioned fields', 'Custom text limited to 200 characters per field', 'Drag fields directly over the PDF preview'],
  },
  {
    title: 'Cover and replace existing PDF text',
    body: 'New fields use a white cover block by default. The block uses the selected field width to hide the original PDF content before drawing the new text.',
    points: ['Adjust the field and cover width together', 'Change font, alignment, size, and colour', 'Turn the white cover off when the original background should remain visible'],
  },
  {
    title: 'Build the output file names',
    body: 'Use ordinary text together with spreadsheet tokens. Each token is replaced with the value from that row.',
    points: ['Example: Document Automation - {Certificate Number}', 'Use {row} for a numbered sequence', 'Duplicate names receive safe numeric suffixes'],
  },
  {
    title: 'Preview and export',
    body: 'Switch between spreadsheet records to check placement. When ready, generate all PDFs and download one ZIP archive.',
    points: ['Files remain in the browser session', 'No uploaded document is stored by the app', 'Reset the session to clear the current files and fields'],
  },
];

export function Tutorial({ open, onClose, onOpenGenerator }: TutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const step = tutorialSteps[stepIndex];
  const finalStep = stepIndex === tutorialSteps.length - 1;

  return (
    <div className="tutorial-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="tutorial-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="tutorial-progress" aria-label={`Tutorial step ${stepIndex + 1} of ${tutorialSteps.length}`}>
          {tutorialSteps.map((item, index) => (
            <span className={index <= stepIndex ? 'active' : ''} key={item.title} />
          ))}
        </div>

        <div className="tutorial-step-label">Step {stepIndex + 1} of {tutorialSteps.length}</div>
        <h2 id="tutorial-title">{step.title}</h2>
        <p>{step.body}</p>
        <ul>
          {step.points.map((point) => <li key={point}>{point}</li>)}
        </ul>

        <div className="tutorial-actions">
          <button
            className="secondary-button"
            type="button"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
          >
            Back
          </button>
          {finalStep ? (
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                onClose();
                onOpenGenerator();
              }}
            >
              Start a batch
            </button>
          ) : (
            <button
              className="primary-button"
              type="button"
              onClick={() => setStepIndex((current) => Math.min(tutorialSteps.length - 1, current + 1))}
            >
              Next
            </button>
          )}
        </div>

        <button className="tutorial-close" type="button" aria-label="Close tutorial" onClick={onClose}>×</button>
      </section>
    </div>
  );
}
