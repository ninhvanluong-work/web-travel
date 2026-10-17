import { Loader2, Search, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeSearchKeyword, SEARCH_KEYWORD_MAX_LENGTH } from '@/lib/text-normalize';
import { cn } from '@/lib/utils';

interface AdminSearchInputProps {
  /** Committed keyword owned by the parent (normalized). Changing it externally (e.g. "Clear all") resets the input. */
  value: string | undefined;
  /** Called with the normalized keyword (`undefined` when empty) after debounce, on Enter, or on clear. */
  onSearch: (keyword: string | undefined) => void;
  placeholder: string;
  /** Accessible name; defaults to the placeholder */
  label?: string;
  isSearching?: boolean;
  delay?: number;
  className?: string;
}

/**
 * Shared search box for admin list pages.
 * - Live search with debounce (default 400ms) — no extra click needed
 * - Enter submits immediately (native <form role="search">), Escape clears
 * - Ignores IME composition (macOS / mobile Vietnamese input) until the word is committed
 * - Only emits normalized keywords (trim, NFC, collapsed spaces, max length), never whitespace-only
 */
export function AdminSearchInput({
  value,
  onSearch,
  placeholder,
  label,
  isSearching = false,
  delay = 400,
  className,
}: AdminSearchInputProps) {
  const { t } = useTranslation('common');
  const [text, setText] = useState(value ?? '');
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastEmittedRef = useRef<string | undefined>(value || undefined);

  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  const emit = useCallback((next: string | undefined) => {
    clearTimeout(timerRef.current);
    if (next === lastEmittedRef.current) return;
    lastEmittedRef.current = next;
    onSearchRef.current(next);
  }, []);

  // External reset (e.g. "Clear all filters"): ignore echoes of our own emits
  useEffect(() => {
    const external = value || undefined;
    if (external === lastEmittedRef.current) return;
    lastEmittedRef.current = external;
    setText(external ?? '');
  }, [value]);

  // Debounced live search; paused while the IME is composing a character
  useEffect(() => {
    if (isComposing) return undefined;
    timerRef.current = setTimeout(() => emit(normalizeSearchKeyword(text)), delay);
    return () => clearTimeout(timerRef.current);
  }, [text, isComposing, delay, emit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    emit(normalizeSearchKeyword(text));
  };

  const handleClear = () => {
    setText('');
    emit(undefined);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && text) {
      e.preventDefault();
      handleClear();
    }
  };

  const spinner = isSearching ? (
    <span role="status" aria-label={t('searchInput.searching')} className="flex">
      <Loader2 size={16} className="animate-spin text-brand-500" />
    </span>
  ) : null;

  const clearButton = text ? (
    <button
      type="button"
      onClick={handleClear}
      aria-label={t('searchInput.clear')}
      className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:hover:bg-white/10"
    >
      <X size={14} />
    </button>
  ) : null;

  return (
    <form role="search" onSubmit={handleSubmit} className={cn('relative flex-1 max-w-sm', className)}>
      <Search
        size={18}
        aria-hidden
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="search"
        name="q"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        maxLength={SEARCH_KEYWORD_MAX_LENGTH}
        aria-label={label ?? placeholder}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={(e) => {
          setIsComposing(false);
          setText(e.currentTarget.value);
        }}
        className="w-full h-11 pl-11 pr-16 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 outline-none transition-colors focus-visible:border-brand-300 focus-visible:ring-4 focus-visible:ring-brand-500/20 [&::-webkit-search-cancel-button]:hidden dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-gray-500"
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {spinner}
        {clearButton}
      </div>
    </form>
  );
}
