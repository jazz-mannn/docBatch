import { useEffect, useState } from 'react';
import './Tutorial.css';

interface TutorialProps {
  open: boolean;
  onClose: () => void;
  onOpenGenerator: () => void;
}

const tutorialSteps = [
  {
    title: 'Add your source files',
    body: 'Start with one PDF template and one CSV or Excel spreadsheet. Each spreadsheet row becomes one generated document.',
    points: ['PDF template: one file, up to 8 MB', 'Spreadsheet: one file, up to 5 MB', 'Up to 500 spreadsheet rows per batch'],
  },
  {
    title: 'Let DocBatch match the font',
    body: 'DocBatch silently analyses the embedded text styles in the PDF and chooses the nearest compatible standard PDF font for new fields.',
    points: ['The original PDF text is not selected or converted', 'New fields inherit the detected family, weight, style, and size', 'You can change every text setting manually'],
  },
  {
    title: 'Add dynamic and reusable text',
    body: 'Choose a spreadsheet column for values that change in every row, or add custom text that remains the same throughout the batch.',
    points: ['Up to 20 positioned text fields', 'Custom text is limited to 200 characters per field', 'Repeated fields are translucent and clearly labelled in the editor'],
  },
  {
    title: 'Replace, move, or delete content',
    body: 'White cover blocks can hide existing PDF content before a new field is drawn. Drag any element to reposition it or move it onto the delete zone.',
    points: ['Delete buttons remain available in the settings panel', 'Adjust field width and cover width together', 'Editor transparency does not affect the exported PDF'],
  },
  {
    title: 'Add signatures and logos',
    body: 'Upload transparent PNG or JPEG images and place them anywhere on the template. Each image appears in every generated PDF.',
    points: ['2 MB maximum per image', '4096 × 4096 pixels maximum', 'Up to four images total and two per image type'],
  },
  {
    title: 'Choose a professional PDF font',
    body: 'Use Times Roman, Helvetica, or Courier with regular, bold, normal, and italic variations.',
    points: ['Times Roman for classic certificates', 'Helvetica for modern professional documents', 'Courier for formal monospaced layouts'],
  },
  {
    title: 'Control every output filename',
    body: 'Combine fixed text with spreadsheet tokens so each PDF receives a useful, row-specific filename.',
    points: ['Example: Certificate - {Certificate Number}', 'Use {row} for a numbered sequence', 'Duplicate names receive safe numeric suffixes'],
  },
  {
    title: 'Review and generate',
    body: 'Switch between spreadsheet records to verify placement, then generate the batch and download one ZIP archive.',
    points: ['Files remain inside the browser session', 'No document content is stored by DocBatch', 'Start over to clear the current working session'],
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
              Open DocBatch Studio
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
