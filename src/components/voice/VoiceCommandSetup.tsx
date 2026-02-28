import React, { useCallback, useEffect, useState } from 'react';
import { useVoiceCommand } from '../../context/VoiceCommandContext';
import { VoiceStatusIndicator } from './VoiceStatusIndicator';

type SetupStep = 'permissions' | 'configure' | 'test' | 'done';

export function VoiceCommandSetup() {
  const {
    status,
    isSupported,
    settings,
    updateSettings,
    startListening,
    stopListening,
    lastResult,
  } = useVoiceCommand();

  const [step, setStep] = useState<SetupStep>('permissions');
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [testTranscript, setTestTranscript] = useState('');

  // Check existing microphone permission
  useEffect(() => {
    navigator.permissions
      ?.query({ name: 'microphone' as PermissionName })
      .then((result) => {
        setPermissionState(result.state);
        result.addEventListener('change', () => setPermissionState(result.state));
      })
      .catch(() => setPermissionState(null));
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissionState('granted');
      setStep('configure');
    } catch {
      setPermissionState('denied');
    }
  }, [isSupported]);

  // Update test transcript from last result
  useEffect(() => {
    if (lastResult && step === 'test') {
      setTestTranscript(lastResult.transcript);
      stopListening();
    }
  }, [lastResult, step, stopListening]);

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 dark:bg-yellow-900/20" role="alert">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
          Voice Commands Not Supported
        </h3>
        <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
          Your browser does not support the Web Speech API. Please use Chrome, Edge, or
          Safari to enable voice commands.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Voice Command Setup
        </h2>
        <VoiceStatusIndicator status={status} />
      </div>

      {/* Step indicator */}
      <ol className="flex items-center space-x-4 text-sm">
        {(['permissions', 'configure', 'test', 'done'] as SetupStep[]).map(
          (s, idx) => (
            <li
              key={s}
              className={`flex items-center ${
                s === step
                  ? 'font-semibold text-blue-600 dark:text-blue-400'
                  : idx < (['permissions', 'configure', 'test', 'done'] as SetupStep[]).indexOf(step)
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400'
              }`}
            >
              <span className="mr-1">{idx + 1}.</span>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </li>
          )
        )}
      </ol>

      {/* Step: Permissions */}
      {step === 'permissions' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Microphone Access
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Voice commands require microphone access. Your audio is processed locally
            and never stored on our servers.
          </p>
          {permissionState === 'denied' && (
            <div
              className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300"
              role="alert"
            >
              Microphone access was denied. Please allow microphone access in your
              browser settings and reload this page.
            </div>
          )}
          {permissionState === 'granted' ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                ✓ Microphone access granted
              </span>
              <button
                onClick={() => setStep('configure')}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Continue
              </button>
            </div>
          ) : (
            <button
              onClick={requestPermission}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Allow Microphone Access
            </button>
          )}
        </div>
      )}

      {/* Step: Configure */}
      {step === 'configure' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Configure Voice Commands
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="wakePhrase"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Wake Phrase
              </label>
              <input
                id="wakePhrase"
                type="text"
                value={settings.wakePhrase}
                onChange={(e) => updateSettings({ wakePhrase: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. Hey App"
              />
              <p className="mt-1 text-xs text-gray-500">
                Say this phrase to activate voice commands
              </p>
            </div>

            <div>
              <label
                htmlFor="language"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Language
              </label>
              <select
                id="language"
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="es-ES">Spanish</option>
                <option value="it-IT">Italian</option>
                <option value="ja-JP">Japanese</option>
                <option value="zh-CN">Chinese (Simplified)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Audio Feedback
                </label>
                <p className="text-xs text-gray-500">Play sounds on recognition</p>
              </div>
              <button
                role="switch"
                aria-checked={settings.audioFeedback}
                onClick={() =>
                  updateSettings({ audioFeedback: !settings.audioFeedback })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  settings.audioFeedback ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    settings.audioFeedback ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Visual Feedback
                </label>
                <p className="text-xs text-gray-500">Show on-screen recognition feedback</p>
              </div>
              <button
                role="switch"
                aria-checked={settings.visualFeedback}
                onClick={() =>
                  updateSettings({ visualFeedback: !settings.visualFeedback })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  settings.visualFeedback ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    settings.visualFeedback ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setStep('permissions')}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Back
            </button>
            <button
              onClick={() => setStep('test')}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Test Voice
            </button>
          </div>
        </div>
      )}

      {/* Step: Test */}
      {step === 'test' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Test Your Voice
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Click the button and say a command such as{' '}
            <strong>"{settings.wakePhrase} go home"</strong>.
          </p>
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={status === 'listening' ? stopListening : startListening}
              aria-label={status === 'listening' ? 'Stop listening' : 'Start voice test'}
              className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl shadow-md transition-all focus:outline-none focus:ring-4 ${
                status === 'listening'
                  ? 'animate-pulse bg-red-500 text-white focus:ring-red-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300'
              }`}
            >
              🎤
            </button>
            <VoiceStatusIndicator status={status} />
            {testTranscript && (
              <div className="w-full rounded-md bg-gray-100 p-3 dark:bg-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Heard:
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  "{testTranscript}"
                </p>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setStep('configure')}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Back
            </button>
            <button
              onClick={() => {
                updateSettings({ enabled: true });
                setStep('done');
              }}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Enable Voice Commands
            </button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
          <div className="text-center">
            <div className="mb-3 text-4xl">✅</div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Voice Commands Enabled!
            </h3>
            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
              Say <strong>"{settings.wakePhrase}"</strong> followed by a command to
              control the application hands-free. Say <strong>"help"</strong> for a list
              of available commands.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
