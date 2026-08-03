import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from 'react';
import {
  classifySourceFile,
  formatBytes,
  routeSourceFileDrop,
  validateFileSelection,
  type SourceFileKind,
  type UploadPolicy,
} from '../lib/fileUpload';
import './FileDropZone.css';

interface FileDropZoneProps {
  title: string;
  accept: string;
  emptyMessage: string;
  fileName?: string;
  policy: UploadPolicy;
  onFile: (file: File) => void | Promise<void>;
  onError: (message: string) => void;
}

type AcceptedSourceKind = Exclude<SourceFileKind, 'unsupported'>;

interface DropSubscriber {
  acceptFile: (file: File) => Promise<void>;
  reportError: (message: string) => void;
}

const dropSubscribers = new Map<AcceptedSourceKind, DropSubscriber>();

function kindForPolicy(policy: UploadPolicy): AcceptedSourceKind {
  return policy.extensions.includes('pdf') ? 'pdf' : 'spreadsheet';
}

function filesFromDrop(event: DragEvent<HTMLDivElement>): File[] {
  const itemFiles = Array.from(event.dataTransfer.items ?? [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));

  return itemFiles.length > 0
    ? itemFiles
    : Array.from(event.dataTransfer.files ?? []);
}

async function dispatchDroppedFiles(files: readonly File[], fallbackError: (message: string) => void) {
  const routed = routeSourceFileDrop(files);
  if (!routed.ok) {
    fallbackError(routed.message);
    return;
  }

  const tasks: Promise<void>[] = [];

  if (routed.pdf) {
    const subscriber = dropSubscribers.get('pdf');
    if (!subscriber) {
      fallbackError('The PDF template slot is not available. Refresh the page and try again.');
      return;
    }
    tasks.push(subscriber.acceptFile(routed.pdf));
  }

  if (routed.spreadsheet) {
    const subscriber = dropSubscribers.get('spreadsheet');
    if (!subscriber) {
      fallbackError('The spreadsheet slot is not available. Refresh the page and try again.');
      return;
    }
    tasks.push(subscriber.acceptFile(routed.spreadsheet));
  }

  await Promise.all(tasks);
}

export function FileDropZone({
  title,
  accept,
  emptyMessage,
  fileName,
  policy,
  onFile,
  onError,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState('');
  const sourceKind = kindForPolicy(policy);

  async function processSingleFile(file: File) {
    const result = validateFileSelection([file], policy);
    if (!result.ok) {
      setFeedback('');
      onError(result.message);
      return;
    }

    try {
      onError('');
      setFeedback(`${sourceKind === 'pdf' ? 'PDF template' : 'Spreadsheet'} detected. Reading “${file.name}”…`);
      await onFile(result.file);
      setFeedback(`${sourceKind === 'pdf' ? 'PDF template' : 'Spreadsheet'} added successfully.`);
    } catch (caught) {
      setFeedback('');
      onError(caught instanceof Error ? caught.message : `Unable to add the ${policy.label}.`);
    }
  }

  useEffect(() => {
    const subscriber: DropSubscriber = {
      acceptFile: processSingleFile,
      reportError: onError,
    };
    dropSubscribers.set(sourceKind, subscriber);

    return () => {
      if (dropSubscribers.get(sourceKind) === subscriber) {
        dropSubscribers.delete(sourceKind);
      }
    };
  });

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const result = validateFileSelection(files, policy);

    if (!result.ok) {
      setFeedback('');
      onError(result.message);
    } else {
      void processSingleFile(result.file);
    }

    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = filesFromDrop(event);
    void dispatchDroppedFiles(files, (message) => {
      setFeedback('');
      onError(message);
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  const detectedFileKind = fileName
    ? classifySourceFile({ name: fileName, size: 0 })
    : null;

  return (
    <div
      className={`file-drop-zone${isDragging ? ' dragging' : ''}${fileName ? ' has-file' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`${title}. ${emptyMessage}`}
      onClick={() => inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDragEnter={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDragging(false);
        }
      }}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInput}
        tabIndex={-1}
        aria-hidden="true"
      />
      <span className="drop-zone-title">{title}</span>
      <strong>{fileName ?? emptyMessage}</strong>
      <span className="drop-zone-limit">
        {policy.maxFiles} file maximum · {formatBytes(policy.maxBytes)} limit
      </span>
      {feedback ? (
        <span className="drop-zone-feedback" role="status" aria-live="polite">{feedback}</span>
      ) : null}
      {fileName && detectedFileKind !== sourceKind ? (
        <span className="drop-zone-feedback error" role="alert">
          This file does not match the {policy.label} slot.
        </span>
      ) : null}
    </div>
  );
}
