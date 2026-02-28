import React, { useCallback, useState } from 'react';
import { useVoiceCommand } from '../../context/VoiceCommandContext';
import { BUILT_IN_NAVIGATION_COMMANDS, VoiceCommand } from '../../types/voice';

interface CommandFormData {
  phrase: string;
  aliases: string;
  action: string;
  description: string;
}

const EMPTY_FORM: CommandFormData = {
  phrase: '',
  aliases: '',
  action: '',
  description: '',
};

const AVAILABLE_ACTIONS = [
  { value: 'NAVIGATE:/dashboard', label: 'Navigate to Dashboard' },
  { value: 'NAVIGATE:/profile', label: 'Navigate to Profile' },
  { value: 'NAVIGATE:/settings', label: 'Navigate to Settings' },
  { value: 'NAVIGATE:/notifications', label: 'Navigate to Notifications' },
  { value: 'NAVIGATE:BACK', label: 'Go Back' },
  { value: 'SHOW_HELP', label: 'Show Help' },
  { value: 'FOCUS_SEARCH', label: 'Focus Search' },
  { value: 'SCROLL:UP', label: 'Scroll Up' },
  { value: 'SCROLL:DOWN', label: 'Scroll Down' },
  { value: 'LOGOUT', label: 'Logout' },
];

function validateForm(form: CommandFormData): string | null {
  if (!form.phrase.trim()) return 'Phrase is required';
  if (form.phrase.trim().length < 2) return 'Phrase must be at least 2 characters';
  if (!form.action) return 'Action is required';
  if (!form.description.trim()) return 'Description is required';
  return null;
}

export function VoiceCommandCustomization() {
  const {
    customCommands,
    settings,
    addCustomCommand,
    removeCustomCommand,
    updateCustomCommand,
    startListening,
    stopListening,
    status,
    lastResult,
  } = useVoiceCommand();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CommandFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [listeningForPhrase, setListeningForPhrase] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleFormChange = useCallback(
    (field: keyof CommandFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setFormError(null);
    },
    []
  );

  const handleSave = useCallback(() => {
    const error = validateForm(formData);
    if (error) {
      setFormError(error);
      return;
    }

    const commandData = {
      phrase: formData.phrase.trim().toLowerCase(),
      aliases: formData.aliases
        .split(',')
        .map((a) => a.trim().toLowerCase())
        .filter(Boolean),
      action: formData.action,
      description: formData.description.trim(),
    };

    if (editingId) {
      updateCustomCommand(editingId, commandData);
      setFeedback('Command updated successfully');
    } else {
      addCustomCommand(commandData);
      setFeedback('Custom command added');
    }

    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);

    setTimeout(() => setFeedback(null), 3000);
  }, [formData, editingId, addCustomCommand, updateCustomCommand]);

  const handleEdit = useCallback((cmd: VoiceCommand) => {
    setFormData({
      phrase: cmd.phrase,
      aliases: cmd.aliases?.join(', ') ?? '',
      action: cmd.action,
      description: cmd.description,
    });
    setEditingId(cmd.id);
    setShowForm(true);
    setFormError(null);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
  }, []);

  const handleDeleteCommand = useCallback(
    (id: string) => {
      removeCustomCommand(id);
      setFeedback('Command deleted');
      setTimeout(() => setFeedback(null), 3000);
    },
    [removeCustomCommand]
  );

  // Capture phrase via voice
  const capturePhrase = useCallback(() => {
    if (!settings.enabled) return;
    setListeningForPhrase(true);
    startListening();
  }, [settings.enabled, startListening]);

  // Apply captured phrase
  React.useEffect(() => {
    if (!listeningForPhrase || !lastResult) return;
    setListeningForPhrase(false);
    stopListening();
    handleFormChange('phrase', lastResult.transcript);
  }, [lastResult, listeningForPhrase, stopListening, handleFormChange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Voice Command Customization
        </h2>
        {!showForm && (
          <button
            onClick={() => {
              setFormData(EMPTY_FORM);
              setEditingId(null);
              setFormError(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Add Command
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300"
          role="status"
          aria-live="polite"
        >
          ✓ {feedback}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
            {editingId ? 'Edit Command' : 'New Custom Command'}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trigger Phrase *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.phrase}
                  onChange={(e) => handleFormChange('phrase', e.target.value)}
                  placeholder="e.g. open dashboard"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {settings.enabled && (
                  <button
                    type="button"
                    onClick={capturePhrase}
                    aria-label="Record trigger phrase"
                    className={`flex-shrink-0 rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      listeningForPhrase && status === 'listening'
                        ? 'animate-pulse border-green-400 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400'
                    }`}
                  >
                    🎤
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Aliases (comma-separated)
              </label>
              <input
                type="text"
                value={formData.aliases}
                onChange={(e) => handleFormChange('aliases', e.target.value)}
                placeholder="e.g. show home, go dashboard"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">
                Alternative phrases that trigger the same command
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Action *
              </label>
              <select
                value={formData.action}
                onChange={(e) => handleFormChange('action', e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select an action</option>
                {AVAILABLE_ACTIONS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="e.g. Navigate to the main dashboard"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {formError && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingId ? 'Update' : 'Add'} Command
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Commands List */}
      <div>
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          My Custom Commands ({customCommands.length})
        </h3>
        {customCommands.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No custom commands yet. Add one above to create personalized voice shortcuts.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {customCommands.map((cmd) => (
              <li
                key={cmd.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded bg-purple-100 px-2 py-0.5 text-xs font-mono font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      "{cmd.phrase}"
                    </span>
                    <span className="text-xs text-gray-400">
                      {AVAILABLE_ACTIONS.find((a) => a.value === cmd.action)?.label ?? cmd.action}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {cmd.description}
                  </p>
                  {cmd.aliases && cmd.aliases.length > 0 && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      Also: {cmd.aliases.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cmd)}
                    aria-label={`Edit ${cmd.phrase}`}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteCommand(cmd.id)}
                    aria-label={`Delete ${cmd.phrase}`}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Built-in Commands Reference */}
      <div>
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Built-in Commands ({BUILT_IN_NAVIGATION_COMMANDS.length})
        </h3>
        <ul className="space-y-1">
          {BUILT_IN_NAVIGATION_COMMANDS.map((cmd) => (
            <li
              key={cmd.id}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                "{cmd.phrase}"
              </span>
              <span className="text-gray-500 dark:text-gray-400">{cmd.description}</span>
              <span className="ml-auto text-xs text-gray-400">built-in</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
