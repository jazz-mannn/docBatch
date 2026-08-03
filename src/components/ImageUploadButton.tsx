import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import type { ImageRole } from '../types';

interface ImageUploadButtonProps {
  role: ImageRole;
  disabled?: boolean;
  onFile: (file: File, role: ImageRole) => void | Promise<void>;
  onError: (message: string) => void;
}

export function ImageUploadButton({
  role,
  disabled = false,
  onFile,
  onError,
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function processFiles(files: readonly File[]) {
    if (files.length !== 1) {
      onError(`Add one ${role} image at a time.`);
      return;
    }
    void onFile(files[0], role);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    processFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    if (!disabled) processFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <button
      className={`image-upload-button ${dragging ? 'dragging' : ''}`}
      type="button"
      disabled={disabled}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) event.dataTransfer.dropEffect = 'copy';
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,.png,.jpg,.jpeg"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleInput}
      />
      <span>{role === 'signature' ? 'Add signature' : 'Add logo'}</span>
      <small>PNG or JPEG · 2 MB maximum</small>
    </button>
  );
}
