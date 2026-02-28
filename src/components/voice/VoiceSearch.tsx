import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useVoiceCommand } from '../../context/VoiceCommandContext';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
}

interface Props {
  onSearch: (query: string) => Promise<SearchResult[]>;
  placeholder?: string;
}

export function VoiceSearch({ onSearch, placeholder = 'Search or say a voice command...' }: Props) {
  const { status, settings, startListening, stopListening, lastResult } =
    useVoiceCommand();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchHistoryRef = useRef<string[]>([]);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      setError(null);
      try {
        const res = await onSearch(searchQuery.trim());
        setResults(res);
        // Keep search history (max 20)
        searchHistoryRef.current = [
          searchQuery,
          ...searchHistoryRef.current.filter((h) => h !== searchQuery),
        ].slice(0, 20);
      } catch (err) {
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [onSearch]
  );

  // Handle voice command results for search
  useEffect(() => {
    if (!lastResult || !voiceMode) return;

    const transcript = lastResult.transcript.toLowerCase();
    setVoiceMode(false);
    stopListening();

    if (transcript.startsWith('search for ') || transcript.startsWith('search ')) {
      const searchTerm = transcript.replace(/^search for\s+|^search\s+/, '');
      setQuery(searchTerm);
      performSearch(searchTerm);
    } else if (transcript === 'clear search' || transcript === 'clear') {
      setQuery('');
      setResults([]);
    } else if (transcript === 'search again') {
      setVoiceMode(true);
      startListening();
    } else if (transcript.startsWith('open first') || transcript === 'open first result') {
      if (results.length > 0) {
        window.location.href = results[0].url;
      }
    } else if (transcript.startsWith('open ')) {
      const indexStr = transcript.replace('open ', '');
      const ordinals: Record<string, number> = {
        first: 0, second: 1, third: 2, fourth: 3, fifth: 4,
        '1st': 0, '2nd': 1, '3rd': 2, '4th': 3, '5th': 4,
      };
      const idx = ordinals[indexStr];
      if (idx !== undefined && results[idx]) {
        window.location.href = results[idx].url;
      }
    } else {
      // Treat anything else as a search query
      setQuery(transcript);
      performSearch(transcript);
    }
  }, [lastResult, voiceMode, results, performSearch, startListening, stopListening]);

  const handleVoiceSearch = () => {
    if (status === 'listening') {
      stopListening();
      setVoiceMode(false);
    } else {
      setVoiceMode(true);
      startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch(query);
    } else if (e.key === 'Escape') {
      setQuery('');
      setResults([]);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full">
      {/* Search input */}
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          {isSearching ? (
            <svg
              className="h-4 w-4 animate-spin text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={voiceMode && status === 'listening' ? 'Listening...' : placeholder}
          aria-label="Search"
          className={`block w-full rounded-lg border py-2.5 pl-10 pr-12 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 ${
            voiceMode && status === 'listening'
              ? 'border-green-400 bg-green-50 focus:ring-green-400 dark:bg-green-900/20'
              : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          }`}
        />

        {settings.enabled && (
          <button
            onClick={handleVoiceSearch}
            aria-label={
              voiceMode && status === 'listening'
                ? 'Stop voice search'
                : 'Start voice search'
            }
            className={`absolute right-2 rounded-md p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              voiceMode && status === 'listening'
                ? 'animate-pulse text-red-500 hover:text-red-700'
                : 'text-gray-400 hover:text-blue-600'
            }`}
          >
            🎤
          </button>
        )}
      </div>

      {/* Voice listening indicator */}
      {voiceMode && status === 'listening' && (
        <div
          className="mt-1 rounded-md bg-green-50 p-2 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-300"
          role="status"
          aria-live="polite"
        >
          Listening... Say your search query, "clear search", or "open first result"
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="mt-1 rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <ul role="listbox" aria-label="Search results">
            {results.map((result, index) => (
              <li key={result.id} role="option" aria-selected={false}>
                <a
                  href={result.url}
                  className="flex flex-col gap-0.5 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {result.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {result.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {settings.enabled && (
            <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-700">
              <p className="text-xs text-gray-400">
                Say "open first result" or "open second result" to navigate
              </p>
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {!isSearching && query && results.length === 0 && !error && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
