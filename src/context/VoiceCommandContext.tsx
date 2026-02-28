import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BUILT_IN_NAVIGATION_COMMANDS,
  DEFAULT_VOICE_SETTINGS,
  VoiceCommand,
  VoiceCommandContextValue,
  VoiceCommandResult,
  VoiceSettings,
} from '../types/voice';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { voiceAnalyticsService } from '../services/voiceAnalyticsService';

const STORAGE_KEY_SETTINGS = 'voice_settings';
const STORAGE_KEY_CUSTOM = 'voice_custom_commands';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage might be unavailable
  }
}

const VoiceCommandContext = createContext<VoiceCommandContextValue | null>(null);

export function VoiceCommandProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<VoiceSettings>(() =>
    loadFromStorage(STORAGE_KEY_SETTINGS, DEFAULT_VOICE_SETTINGS)
  );
  const [customCommands, setCustomCommands] = useState<VoiceCommand[]>(() =>
    loadFromStorage(STORAGE_KEY_CUSTOM, [])
  );
  const [lastResult, setLastResult] = useState<VoiceCommandResult | null>(null);

  const allCommands = useMemo(
    () => [...BUILT_IN_NAVIGATION_COMMANDS, ...customCommands],
    [customCommands]
  );

  const handleResult = useCallback(
    (result: VoiceCommandResult) => {
      setLastResult(result);
      voiceAnalyticsService.record({
        commandId: result.matchedCommand?.id ?? 'unknown',
        phrase: result.transcript,
        action: result.action ?? 'UNRECOGNIZED',
        success: Boolean(result.matchedCommand),
        confidence: result.confidence,
        timestamp: new Date().toISOString(),
      });
    },
    []
  );

  const { status, isSupported, startListening, stopListening } =
    useVoiceRecognition(allCommands, settings, handleResult);

  // Persist settings changes
  useEffect(() => {
    saveToStorage(STORAGE_KEY_SETTINGS, settings);
  }, [settings]);

  // Persist custom commands changes
  useEffect(() => {
    saveToStorage(STORAGE_KEY_CUSTOM, customCommands);
  }, [customCommands]);

  const updateSettings = useCallback((updates: Partial<VoiceSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const addCustomCommand = useCallback(
    (command: Omit<VoiceCommand, 'id' | 'isCustom' | 'createdAt'>) => {
      const newCommand: VoiceCommand = {
        ...command,
        id: `custom-${Date.now()}`,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      setCustomCommands((prev) => [...prev, newCommand]);
    },
    []
  );

  const removeCustomCommand = useCallback((id: string) => {
    setCustomCommands((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCustomCommand = useCallback(
    (id: string, updates: Partial<VoiceCommand>) => {
      setCustomCommands((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    []
  );

  const value = useMemo<VoiceCommandContextValue>(
    () => ({
      status,
      isSupported,
      settings,
      customCommands,
      lastResult,
      startListening,
      stopListening,
      updateSettings,
      addCustomCommand,
      removeCustomCommand,
      updateCustomCommand,
    }),
    [
      status,
      isSupported,
      settings,
      customCommands,
      lastResult,
      startListening,
      stopListening,
      updateSettings,
      addCustomCommand,
      removeCustomCommand,
      updateCustomCommand,
    ]
  );

  return (
    <VoiceCommandContext.Provider value={value}>
      {children}
    </VoiceCommandContext.Provider>
  );
}

export function useVoiceCommand(): VoiceCommandContextValue {
  const ctx = useContext(VoiceCommandContext);
  if (!ctx) {
    throw new Error('useVoiceCommand must be used within a VoiceCommandProvider');
  }
  return ctx;
}
