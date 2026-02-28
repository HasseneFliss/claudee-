export type VoiceCommandStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'error'
  | 'unsupported';

export interface VoiceCommand {
  id: string;
  phrase: string;
  aliases?: string[];
  action: string;
  description: string;
  isCustom?: boolean;
  createdAt?: string;
}

export interface VoiceCommandResult {
  transcript: string;
  confidence: number;
  matchedCommand?: VoiceCommand;
  action?: string;
}

export interface VoiceSettings {
  enabled: boolean;
  wakePhrase: string;
  language: string;
  continuousListening: boolean;
  audioFeedback: boolean;
  visualFeedback: boolean;
  sensitivity: number;
}

export interface VoiceAnalyticsEntry {
  commandId: string;
  phrase: string;
  action: string;
  success: boolean;
  confidence: number;
  timestamp: string;
  userId?: string;
}

export interface VoiceAnalyticsSummary {
  totalCommands: number;
  successRate: number;
  popularCommands: Array<{ command: string; count: number }>;
  errorPatterns: Array<{ phrase: string; count: number }>;
  activeUsers: number;
  dailyUsage: Array<{ date: string; count: number }>;
}

export interface VoiceCommandContextValue {
  status: VoiceCommandStatus;
  isSupported: boolean;
  settings: VoiceSettings;
  customCommands: VoiceCommand[];
  lastResult: VoiceCommandResult | null;
  startListening: () => void;
  stopListening: () => void;
  updateSettings: (settings: Partial<VoiceSettings>) => void;
  addCustomCommand: (command: Omit<VoiceCommand, 'id' | 'isCustom' | 'createdAt'>) => void;
  removeCustomCommand: (id: string) => void;
  updateCustomCommand: (id: string, updates: Partial<VoiceCommand>) => void;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: false,
  wakePhrase: 'hey app',
  language: 'en-US',
  continuousListening: false,
  audioFeedback: true,
  visualFeedback: true,
  sensitivity: 0.7,
};

export const BUILT_IN_NAVIGATION_COMMANDS: VoiceCommand[] = [
  { id: 'nav-home', phrase: 'go home', aliases: ['home', 'go to home'], action: 'NAVIGATE:/dashboard', description: 'Navigate to home dashboard' },
  { id: 'nav-profile', phrase: 'go to profile', aliases: ['open profile', 'show profile'], action: 'NAVIGATE:/profile', description: 'Navigate to profile page' },
  { id: 'nav-settings', phrase: 'go to settings', aliases: ['open settings', 'show settings'], action: 'NAVIGATE:/settings', description: 'Navigate to settings page' },
  { id: 'nav-notifications', phrase: 'show notifications', aliases: ['open notifications', 'notifications'], action: 'NAVIGATE:/notifications', description: 'Open notification center' },
  { id: 'nav-back', phrase: 'go back', aliases: ['back', 'previous page'], action: 'NAVIGATE:BACK', description: 'Go to previous page' },
  { id: 'nav-forward', phrase: 'go forward', aliases: ['forward', 'next page'], action: 'NAVIGATE:FORWARD', description: 'Go to next page' },
  { id: 'cmd-help', phrase: 'help', aliases: ['show help', 'voice help', 'what can i say'], action: 'SHOW_HELP', description: 'Show available voice commands' },
  { id: 'cmd-search', phrase: 'search', aliases: ['find', 'look for', 'search for'], action: 'FOCUS_SEARCH', description: 'Activate search' },
  { id: 'cmd-logout', phrase: 'log out', aliases: ['logout', 'sign out'], action: 'LOGOUT', description: 'Log out of the application' },
  { id: 'cmd-scroll-up', phrase: 'scroll up', aliases: ['go up', 'page up'], action: 'SCROLL:UP', description: 'Scroll page up' },
  { id: 'cmd-scroll-down', phrase: 'scroll down', aliases: ['go down', 'page down'], action: 'SCROLL:DOWN', description: 'Scroll page down' },
];
