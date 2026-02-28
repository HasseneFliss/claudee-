import React, {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useVoiceCommand } from '../../context/VoiceCommandContext';

export interface VoiceFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select';
  voiceAlias?: string[];
  options?: string[]; // For select fields
  required?: boolean;
  validation?: (value: string) => string | null;
}

interface FieldState {
  value: string;
  error: string | null;
  ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
}

interface Props {
  fields: VoiceFormField[];
  onSubmit: (values: Record<string, string>) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

function sanitizeInput(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function findFieldByVoice(
  fields: VoiceFormField[],
  phrase: string
): VoiceFormField | null {
  const normalized = phrase.toLowerCase();
  for (const field of fields) {
    if (normalized.includes(field.label.toLowerCase())) return field;
    if (field.voiceAlias?.some((a) => normalized.includes(a.toLowerCase()))) {
      return field;
    }
  }
  return null;
}

export function VoiceFormInteraction({
  fields,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
}: Props) {
  const { status, settings, startListening, stopListening, lastResult } =
    useVoiceCommand();

  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>(() =>
    Object.fromEntries(
      fields.map((f) => [
        f.id,
        { value: '', error: null, ref: createRef<any>() },
      ])
    )
  );
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((msg: string) => {
    setVoiceFeedback(msg);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setVoiceFeedback(null), 3000);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!settings.audioFeedback || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = settings.language;
      u.rate = 1.1;
      window.speechSynthesis.speak(u);
    },
    [settings.audioFeedback, settings.language]
  );

  const focusField = useCallback(
    (fieldId: string) => {
      setActiveFieldId(fieldId);
      fieldStates[fieldId]?.ref.current?.focus();
    },
    [fieldStates]
  );

  const setFieldValue = useCallback(
    (fieldId: string, value: string) => {
      const field = fields.find((f) => f.id === fieldId);
      const sanitized = field?.type === 'password' ? value : sanitizeInput(value);
      const error = field?.validation?.(sanitized) ?? null;
      setFieldStates((prev) => ({
        ...prev,
        [fieldId]: { ...prev[fieldId], value: sanitized, error },
      }));
    },
    [fields]
  );

  const handleVoiceResult = useCallback(() => {
    if (!lastResult || !voiceMode) return;

    const transcript = lastResult.transcript.toLowerCase().trim();

    // Submit command
    if (transcript === 'submit form' || transcript === 'submit') {
      const values = Object.fromEntries(
        fields.map((f) => [f.id, fieldStates[f.id]?.value ?? ''])
      );
      const hasErrors = fields.some(
        (f) => f.required && !fieldStates[f.id]?.value
      );
      if (hasErrors) {
        showFeedback('Please fill all required fields before submitting');
        speak('Please fill all required fields before submitting');
        return;
      }
      onSubmit(values);
      setVoiceMode(false);
      stopListening();
      return;
    }

    // Cancel
    if (transcript === 'cancel' || transcript === 'cancel form') {
      onCancel?.();
      setVoiceMode(false);
      stopListening();
      return;
    }

    // Next field
    if (transcript === 'next field' || transcript === 'next') {
      const currentIndex = fields.findIndex((f) => f.id === activeFieldId);
      const nextIndex = currentIndex < fields.length - 1 ? currentIndex + 1 : 0;
      focusField(fields[nextIndex].id);
      showFeedback(`Moved to ${fields[nextIndex].label}`);
      speak(`${fields[nextIndex].label}`);
      return;
    }

    // Clear current field
    if (transcript === 'clear field' || transcript === 'clear') {
      if (activeFieldId) {
        setFieldValue(activeFieldId, '');
        showFeedback('Field cleared');
        speak('Field cleared');
      }
      return;
    }

    // "Go to [field name] field"
    const goToMatch = transcript.match(/^go to (.+?) field$/) ??
      transcript.match(/^focus (.+?)$/);
    if (goToMatch) {
      const targetField = findFieldByVoice(fields, goToMatch[1]);
      if (targetField) {
        focusField(targetField.id);
        showFeedback(`Moved to ${targetField.label}`);
        speak(`${targetField.label}`);
        return;
      }
    }

    // "Fill [field] with [value]"
    const fillMatch = transcript.match(/^fill (.+?) with (.+)$/);
    if (fillMatch) {
      const targetField = findFieldByVoice(fields, fillMatch[1]);
      if (targetField) {
        setFieldValue(targetField.id, fillMatch[2]);
        showFeedback(`Set ${targetField.label} to "${fillMatch[2]}"`);
        speak(`${targetField.label} filled`);
        return;
      }
    }

    // "Set [field] to [value]"
    const setMatch = transcript.match(/^set (.+?) to (.+)$/);
    if (setMatch) {
      const targetField = findFieldByVoice(fields, setMatch[1]);
      if (targetField) {
        setFieldValue(targetField.id, setMatch[2]);
        showFeedback(`Set ${targetField.label} to "${setMatch[2]}"`);
        speak(`${targetField.label} set`);
        return;
      }
    }

    // If no command matched and a field is active, treat as input value
    if (activeFieldId) {
      const activeField = fields.find((f) => f.id === activeFieldId);
      if (activeField && activeField.type !== 'password') {
        setFieldValue(activeFieldId, lastResult.transcript);
        showFeedback(`Entered: "${lastResult.transcript}"`);
        return;
      }
    }

    showFeedback(`Command not understood: "${transcript}"`);
    speak('Command not understood');
  }, [
    lastResult,
    voiceMode,
    fields,
    fieldStates,
    activeFieldId,
    onSubmit,
    onCancel,
    setFieldValue,
    focusField,
    showFeedback,
    speak,
    stopListening,
  ]);

  useEffect(() => {
    handleVoiceResult();
  }, [lastResult]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = Object.fromEntries(
      fields.map((f) => [f.id, fieldStates[f.id]?.value ?? ''])
    );
    onSubmit(values);
  };

  return (
    <div className="space-y-4">
      {/* Voice feedback banner */}
      {voiceFeedback && settings.visualFeedback && (
        <div
          className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
          role="status"
          aria-live="polite"
        >
          {voiceFeedback}
        </div>
      )}

      {/* Voice commands hint */}
      {settings.enabled && (
        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
          <strong>Voice commands:</strong> "Fill [field] with [value]", "Next field",
          "Clear field", "Submit form", "Cancel"
          {voiceMode && status === 'listening' && (
            <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
              🎤 Listening...
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {fields.map((field) => {
          const state = fieldStates[field.id];
          const isActive = activeFieldId === field.id;

          return (
            <div key={field.id}>
              <label
                htmlFor={field.id}
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {field.label}
                {field.required && (
                  <span className="ml-1 text-red-500" aria-hidden="true">
                    *
                  </span>
                )}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  id={field.id}
                  ref={state.ref as React.RefObject<HTMLTextAreaElement>}
                  value={state.value}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                  onFocus={() => setActiveFieldId(field.id)}
                  aria-required={field.required}
                  aria-invalid={Boolean(state.error)}
                  aria-describedby={state.error ? `${field.id}-error` : undefined}
                  rows={4}
                  className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                    isActive && voiceMode
                      ? 'border-green-400 focus:ring-green-400'
                      : state.error
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
                  }`}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.id}
                  ref={state.ref as React.RefObject<HTMLSelectElement>}
                  value={state.value}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                  onFocus={() => setActiveFieldId(field.id)}
                  aria-required={field.required}
                  aria-invalid={Boolean(state.error)}
                  className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                    isActive && voiceMode
                      ? 'border-green-400 focus:ring-green-400'
                      : state.error
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select an option</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.id}
                  ref={state.ref as React.RefObject<HTMLInputElement>}
                  type={field.type}
                  value={state.value}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                  onFocus={() => setActiveFieldId(field.id)}
                  aria-required={field.required}
                  aria-invalid={Boolean(state.error)}
                  aria-describedby={state.error ? `${field.id}-error` : undefined}
                  autoComplete={field.type === 'password' ? 'current-password' : undefined}
                  className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                    isActive && voiceMode
                      ? 'border-green-400 ring-1 ring-green-400 focus:ring-green-400'
                      : state.error
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
                  }`}
                />
              )}

              {state.error && (
                <p
                  id={`${field.id}-error`}
                  className="mt-1 text-xs text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {state.error}
                </p>
              )}
            </div>
          );
        })}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            {settings.enabled && (
              <button
                type="button"
                onClick={() => {
                  if (voiceMode && status === 'listening') {
                    stopListening();
                    setVoiceMode(false);
                  } else {
                    setVoiceMode(true);
                    startListening();
                  }
                }}
                aria-label={
                  voiceMode && status === 'listening'
                    ? 'Stop voice input'
                    : 'Start voice input'
                }
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  voiceMode && status === 'listening'
                    ? 'animate-pulse border-green-400 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                🎤
                <span>{voiceMode && status === 'listening' ? 'Listening...' : 'Voice'}</span>
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
