import { useCallback, useEffect, useRef, useState } from 'react';
import {
  VoiceCommand,
  VoiceCommandResult,
  VoiceCommandStatus,
  VoiceSettings,
} from '../types/voice';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  onstart: ((event: Event) => void) | null;
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[.,!?]/g, '');
}

function matchCommand(
  transcript: string,
  commands: VoiceCommand[],
  wakePhrase: string
): { command: VoiceCommand | null; transcript: string } {
  const normalized = normalizeText(transcript);

  // Strip wake phrase if present
  const stripped = normalized.startsWith(normalizeText(wakePhrase))
    ? normalized.slice(normalizeText(wakePhrase).length).trim()
    : normalized;

  for (const command of commands) {
    const phrases = [command.phrase, ...(command.aliases ?? [])].map(normalizeText);
    for (const phrase of phrases) {
      if (stripped === phrase || stripped.startsWith(phrase)) {
        return { command, transcript: stripped };
      }
    }
  }
  return { command: null, transcript: stripped };
}

export function useVoiceRecognition(
  commands: VoiceCommand[],
  settings: VoiceSettings,
  onResult: (result: VoiceCommandResult) => void
) {
  const [status, setStatus] = useState<VoiceCommandStatus>('idle');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setIsSupported(Boolean(SpeechRecognitionCtor));
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setStatus('idle');
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setStatus('unsupported');
      return;
    }

    if (!settings.enabled) return;

    stopListening();

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = settings.language;
    recognition.continuous = settings.continuousListening;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setStatus('listening');
      // Auto-stop after 10 seconds of no input
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, 10000);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      clearSilenceTimer();
      setStatus('processing');

      const results = event.results[event.resultIndex];
      let bestTranscript = '';
      let bestConfidence = 0;

      for (let i = 0; i < results.length; i++) {
        const alt = results[i];
        if (alt.confidence > bestConfidence) {
          bestConfidence = alt.confidence;
          bestTranscript = alt.transcript;
        }
      }

      const { command, transcript } = matchCommand(
        bestTranscript,
        commands,
        settings.wakePhrase
      );

      const result: VoiceCommandResult = {
        transcript,
        confidence: bestConfidence,
        matchedCommand: command ?? undefined,
        action: command?.action,
      };

      onResult(result);
      setStatus(settings.continuousListening ? 'listening' : 'idle');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      clearSilenceTimer();
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setStatus('error');
        console.error('Voice recognition error:', event.error);
      } else {
        setStatus('idle');
      }
    };

    recognition.onend = () => {
      clearSilenceTimer();
      if (settings.continuousListening && settings.enabled) {
        // Restart for continuous mode
        setTimeout(() => startListening(), 300);
      } else {
        setStatus('idle');
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      setStatus('error');
      console.error('Failed to start voice recognition:', err);
    }
  }, [commands, settings, onResult, stopListening, clearSilenceTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      recognitionRef.current?.abort();
    };
  }, [clearSilenceTimer]);

  return { status, isSupported, startListening, stopListening };
}
