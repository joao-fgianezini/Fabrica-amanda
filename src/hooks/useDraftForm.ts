import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Auto-saves form data to localStorage so it survives tab switches,
 * page reloads, or accidental navigation away. On mount, if a draft
 * exists, it is automatically restored — no user action needed.
 *
 * @param key  Unique storage key (e.g. "vehicle-form-draft")
 * @param data The current form data (used for auto-save)
 * @param enabled Whether auto-save is active (default true)
 * @returns { restoredData, clearDraft, hasDraft } — restoredData is the
 *          draft loaded on mount (null if none), clearDraft removes it.
 */
export function useDraftForm<T>(key: string, data: T, enabled: boolean = true) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSaveRef = useRef(true);
  const [restoredData, setRestoredData] = useState<T | null>(null);

  const isEmpty = (obj: unknown): boolean => {
    if (!obj || typeof obj !== 'object') return true;
    const values = Object.values(obj as Record<string, unknown>);
    return values.every((v) => v === '' || v === null || v === undefined || v === 'available');
  };

  // On mount: load draft. Skip the first save cycle so we don't
  // overwrite the draft with the initial empty state.
  useEffect(() => {
    skipSaveRef.current = true;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'data' in parsed) {
        const draft = parsed.data as T;
        if (!isEmpty(draft)) {
          setRestoredData(draft);
        }
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Debounced save — skipped on the first cycle after mount
  useEffect(() => {
    if (!enabled) return;
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        if (!isEmpty(data)) {
          localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
        } else {
          localStorage.removeItem(key);
        }
      } catch {
        // ignore
      }
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, data, enabled]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }, [key]);

  const hasDraft = useCallback(() => {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }, [key]);

  return { restoredData, clearDraft, hasDraft };
}
