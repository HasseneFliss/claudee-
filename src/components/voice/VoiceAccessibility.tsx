import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useVoiceCommand } from '../../context/VoiceCommandContext';

interface AccessibilitySettings {
  highContrast: boolean;
  screenReaderMode: boolean;
  verboseFeedback: boolean;
  confirmationSounds: boolean;
  errorSounds: boolean;
  announcePageChanges: boolean;
}

const DEFAULT_A11Y_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  screenReaderMode: false,
  verboseFeedback: true,
  confirmationSounds: true,
  errorSounds: true,
  announcePageChanges: true,
};

const STORAGE_KEY = 'voice_a11y_settings';

function loadA11ySettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_A11Y_SETTINGS, ...JSON.parse(raw) } : DEFAULT_A11Y_SETTINGS;
  } catch {
    return DEFAULT_A11Y_SETTINGS;
  }
}

function describeCurrentPage(): string {
  const heading = document.querySelector('h1')?.textContent ?? document.title;
  const paragraphs = Array.from(document.querySelectorAll('p')).slice(0, 2);
  const summary = paragraphs.map((p) => p.textContent?.slice(0, 100)).join('. ');
  return `Page: ${heading}. ${summary}`;
}

interface LiveRegionProps {
  message: string | null;
  politeness?: 'polite' | 'assertive';
}

function LiveRegion({ message, politeness = 'polite' }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`relative ml-4 inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function VoiceAccessibility() {
  const {
    settings: voiceSettings,
    status,
    lastResult,
    startListening,
    stopListening,
  } = useVoiceCommand();

  const [a11ySettings, setA11ySettings] = useState<AccessibilitySettings>(
    loadA11ySettings
  );
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const announcementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist a11y settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(a11ySettings));
    } catch {}
  }, [a11ySettings]);

  // Apply high contrast to document
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', a11ySettings.highContrast);
    return () => {
      document.documentElement.classList.remove('high-contrast');
    };
  }, [a11ySettings.highContrast]);

  const updateA11y = useCallback(
    (key: keyof AccessibilitySettings, value: boolean) => {
      setA11ySettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const announce = useCallback(
    (message: string, assertive = false) => {
      setAnnouncement(message);
      if (announcementTimerRef.current) clearTimeout(announcementTimerRef.current);
      announcementTimerRef.current = setTimeout(
        () => setAnnouncement(null),
        assertive ? 1000 : 3000
      );
    },
    []
  );

  const speak = useCallback(
    (text: string, interrupt = false) => {
      if (!voiceSettings.audioFeedback || !window.speechSynthesis) return;
      if (interrupt) window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voiceSettings.language;
      u.rate = a11ySettings.verboseFeedback ? 1.0 : 1.2;
      window.speechSynthesis.speak(u);
    },
    [voiceSettings.audioFeedback, voiceSettings.language, a11ySettings.verboseFeedback]
  );

  // Handle accessibility-specific voice commands
  useEffect(() => {
    if (!lastResult || !isVoiceActive) return;

    const transcript = lastResult.transcript.toLowerCase().trim();
    setIsVoiceActive(false);
    stopListening();

    if (transcript === 'describe page' || transcript === 'read page') {
      const description = describeCurrentPage();
      speak(description, true);
      announce(description);
      return;
    }

    if (transcript === 'read headings') {
      const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
        .map((h) => h.textContent)
        .filter(Boolean)
        .join('. ');
      speak(headings || 'No headings found', true);
      announce(headings || 'No headings found');
      return;
    }

    if (transcript === 'read links') {
      const links = Array.from(document.querySelectorAll('a'))
        .slice(0, 10)
        .map((a) => a.textContent)
        .filter(Boolean)
        .join(', ');
      speak(links || 'No links found', true);
      announce(links || 'No links found');
      return;
    }

    if (transcript === 'stop reading') {
      window.speechSynthesis?.cancel();
      announce('Reading stopped');
      return;
    }

    if (
      transcript === 'enable high contrast' ||
      transcript === 'high contrast on'
    ) {
      updateA11y('highContrast', true);
      speak('High contrast mode enabled');
      announce('High contrast mode enabled');
      return;
    }

    if (
      transcript === 'disable high contrast' ||
      transcript === 'high contrast off'
    ) {
      updateA11y('highContrast', false);
      speak('High contrast mode disabled');
      announce('High contrast mode disabled');
      return;
    }

    announce(`Command not recognized: ${transcript}`);
  }, [lastResult, isVoiceActive, stopListening, speak, announce, updateA11y]);

  // Announce page changes if enabled
  useEffect(() => {
    if (!a11ySettings.announcePageChanges) return;
    const title = document.title;
    if (title) {
      announce(`Navigated to ${title}`);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (announcementTimerRef.current) clearTimeout(announcementTimerRef.current);
      document.documentElement.classList.remove('high-contrast');
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Screen reader live region */}
      <LiveRegion message={announcement} politeness="polite" />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Voice Accessibility
        </h2>
        {voiceSettings.enabled && (
          <button
            onClick={() => {
              if (isVoiceActive && status === 'listening') {
                stopListening();
                setIsVoiceActive(false);
              } else {
                setIsVoiceActive(true);
                startListening();
              }
            }}
            aria-label={
              isVoiceActive && status === 'listening'
                ? 'Stop accessibility voice commands'
                : 'Start accessibility voice commands'
            }
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isVoiceActive && status === 'listening'
                ? 'animate-pulse bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            🎤
            <span>
              {isVoiceActive && status === 'listening'
                ? 'Listening...'
                : 'Voice Accessibility'}
            </span>
          </button>
        )}
      </div>

      {/* Voice commands for accessibility */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Accessibility Voice Commands
        </h3>
        <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
          {[
            ['Describe page', 'Reads a summary of the current page'],
            ['Read headings', 'Lists all page headings'],
            ['Read links', 'Lists the first 10 links on the page'],
            ['Stop reading', 'Stops text-to-speech'],
            ['Enable high contrast', 'Activates high contrast mode'],
            ['Disable high contrast', 'Deactivates high contrast mode'],
          ].map(([cmd, desc]) => (
            <li key={cmd} className="flex items-start gap-2">
              <span className="mt-0.5 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-xs font-mono text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                "{cmd}"
              </span>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Accessibility Settings */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
          Accessibility Settings
        </h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <ToggleRow
            label="High Contrast Mode"
            description="Increases contrast for better readability"
            value={a11ySettings.highContrast}
            onChange={(v) => updateA11y('highContrast', v)}
          />
          <ToggleRow
            label="Screen Reader Mode"
            description="Enhanced compatibility with screen reader software"
            value={a11ySettings.screenReaderMode}
            onChange={(v) => updateA11y('screenReaderMode', v)}
          />
          <ToggleRow
            label="Verbose Audio Feedback"
            description="Slower, more detailed speech responses"
            value={a11ySettings.verboseFeedback}
            onChange={(v) => updateA11y('verboseFeedback', v)}
          />
          <ToggleRow
            label="Confirmation Sounds"
            description="Play a sound when commands succeed"
            value={a11ySettings.confirmationSounds}
            onChange={(v) => updateA11y('confirmationSounds', v)}
          />
          <ToggleRow
            label="Error Sounds"
            description="Play a sound when commands fail"
            value={a11ySettings.errorSounds}
            onChange={(v) => updateA11y('errorSounds', v)}
          />
          <ToggleRow
            label="Announce Page Changes"
            description="Automatically read page title on navigation"
            value={a11ySettings.announcePageChanges}
            onChange={(v) => updateA11y('announcePageChanges', v)}
          />
        </div>
      </div>

      {/* WCAG compliance note */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-800 dark:bg-blue-900/20">
        <h4 className="mb-1 font-medium text-blue-900 dark:text-blue-200">
          WCAG 2.1 Compliance
        </h4>
        <p className="text-blue-700 dark:text-blue-300">
          Voice features are designed to complement, not replace, standard accessibility
          tools. All actions are accessible via keyboard and screen readers. Voice
          commands provide an additional input modality per WCAG 2.1 guideline 1.3.1.
        </p>
      </div>
    </div>
  );
}
