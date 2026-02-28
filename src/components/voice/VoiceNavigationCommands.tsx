import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useVoiceCommand } from '../../context/VoiceCommandContext';
import { BUILT_IN_NAVIGATION_COMMANDS } from '../../types/voice';
import { VoiceStatusIndicator } from './VoiceStatusIndicator';

interface NavigationAction {
  type: 'NAVIGATE' | 'SHOW_HELP' | 'SCROLL' | 'FOCUS_SEARCH' | 'LOGOUT';
  payload?: string;
}

function parseAction(action: string): NavigationAction | null {
  if (action.startsWith('NAVIGATE:')) {
    return { type: 'NAVIGATE', payload: action.slice('NAVIGATE:'.length) };
  }
  if (action.startsWith('SCROLL:')) {
    return { type: 'SCROLL', payload: action.slice('SCROLL:'.length) };
  }
  if (action === 'SHOW_HELP') return { type: 'SHOW_HELP' };
  if (action === 'FOCUS_SEARCH') return { type: 'FOCUS_SEARCH' };
  if (action === 'LOGOUT') return { type: 'LOGOUT' };
  return null;
}

interface Props {
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
}

export function VoiceNavigationCommands({ onNavigate, onLogout }: Props) {
  const { status, settings, lastResult, startListening, stopListening } =
    useVoiceCommand();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 3000);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!settings.audioFeedback || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings.language;
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    },
    [settings.audioFeedback, settings.language]
  );

  // Handle voice command results
  useEffect(() => {
    if (!lastResult) return;

    if (!lastResult.matchedCommand) {
      showFeedback(`Command not recognized: "${lastResult.transcript}"`);
      speak('Command not recognized');
      return;
    }

    const parsed = parseAction(lastResult.matchedCommand.action);
    if (!parsed) return;

    switch (parsed.type) {
      case 'NAVIGATE': {
        const path = parsed.payload ?? '/';
        if (path === 'BACK') {
          window.history.back();
          showFeedback('Navigating back');
          speak('Going back');
        } else if (path === 'FORWARD') {
          window.history.forward();
          showFeedback('Navigating forward');
          speak('Going forward');
        } else {
          onNavigate?.(path);
          showFeedback(`Navigating to ${path}`);
          speak(`Navigating to ${lastResult.matchedCommand.description}`);
        }
        break;
      }
      case 'SHOW_HELP':
        setShowHelp(true);
        speak(
          'Available commands: ' +
            BUILT_IN_NAVIGATION_COMMANDS.map((c) => c.phrase).join(', ')
        );
        showFeedback('Showing available commands');
        break;
      case 'SCROLL':
        if (parsed.payload === 'UP') {
          window.scrollBy({ top: -300, behavior: 'smooth' });
          showFeedback('Scrolling up');
        } else {
          window.scrollBy({ top: 300, behavior: 'smooth' });
          showFeedback('Scrolling down');
        }
        break;
      case 'FOCUS_SEARCH': {
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]'
        );
        searchInput?.focus();
        showFeedback('Search activated');
        speak('Search activated');
        break;
      }
      case 'LOGOUT':
        onLogout?.();
        speak('Logging out');
        showFeedback('Logging out...');
        break;
    }
  }, [lastResult, onNavigate, onLogout, showFeedback, speak]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  if (!settings.enabled) return null;

  return (
    <>
      {/* Floating mic button */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
        aria-label="Voice command controls"
      >
        {feedback && settings.visualFeedback && (
          <div
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg"
            role="status"
            aria-live="polite"
          >
            {feedback}
          </div>
        )}

        <VoiceStatusIndicator status={status} className="rounded-full bg-white px-3 py-1 shadow" />

        <button
          onClick={status === 'listening' ? stopListening : startListening}
          aria-label={status === 'listening' ? 'Stop voice commands' : 'Start voice commands'}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg transition-all focus:outline-none focus:ring-4 ${
            status === 'listening'
              ? 'animate-pulse bg-red-500 text-white focus:ring-red-300'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300'
          }`}
        >
          {status === 'listening' ? '⏹' : '🎤'}
        </button>
      </div>

      {/* Help overlay */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Voice command help"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Voice Commands
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                aria-label="Close help"
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Say <strong>"{settings.wakePhrase}"</strong> then one of these commands:
            </p>
            <ul className="space-y-2">
              {BUILT_IN_NAVIGATION_COMMANDS.map((cmd) => (
                <li
                  key={cmd.id}
                  className="flex items-start gap-3 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span className="mt-0.5 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-mono font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    "{cmd.phrase}"
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {cmd.description}
                    {cmd.aliases && cmd.aliases.length > 0 && (
                      <span className="ml-1 text-xs text-gray-400">
                        (also: {cmd.aliases.join(', ')})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
