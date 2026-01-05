import { useSyncExternalStore } from 'react';

// Get keyboard shortcut based on platform (avoids hydration mismatch)
function getKeyboardShortcut() {
  if (typeof window === 'undefined') return null;
  const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
  return isMac ? '⌘K' : 'Ctrl+K';
}

/**
 * Hook to get platform-aware keyboard shortcut.
 * Returns '⌘K' on Mac/iOS and 'Ctrl+K' on other platforms.
 * Returns null during SSR to avoid hydration mismatch.
 */
export function useKeyboardShortcut() {
  return useSyncExternalStore(
    () => () => {}, // No subscription needed, value doesn't change
    getKeyboardShortcut, // Client snapshot
    () => null // Server snapshot (null to avoid hydration mismatch)
  );
}

