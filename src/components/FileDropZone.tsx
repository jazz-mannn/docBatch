import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from 'react';
import {
  formatBytes,
  validateFileSelection,
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

  async function processFiles(files: readonly File[]) {
    const result = validateFileSelection(files, policy);
    if (!result.ok) {
      onError(result.message);
      return;
    }

    await onFile(result.file);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    void processFiles(files);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    void processFiles(Array.from(event.dataTransfer.files));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

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
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
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
    </div>
  );
}
