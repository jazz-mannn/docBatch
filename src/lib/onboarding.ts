const TUTORIAL_STORAGE_KEY = 'docbatch:tutorial-seen:v1';

export function hasSeenTutorial(storage: Pick<Storage, 'getItem'> = window.localStorage): boolean {
  try {
    return storage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markTutorialSeen(storage: Pick<Storage, 'setItem'> = window.localStorage): void {
  try {
    storage.setItem(TUTORIAL_STORAGE_KEY, 'true');
  } catch {
    // The tutorial remains usable when storage is blocked.
  }
}

export function resetTutorialState(storage: Pick<Storage, 'removeItem'> = window.localStorage): void {
  try {
    storage.removeItem(TUTORIAL_STORAGE_KEY);
  } catch {
    // Ignore storage restrictions.
  }
}
