import { VoiceAnalyticsEntry, VoiceAnalyticsSummary } from '../types/voice';

const STORAGE_KEY = 'voice_analytics';
const MAX_ENTRIES = 1000;

class VoiceAnalyticsService {
  private entries: VoiceAnalyticsEntry[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.entries = JSON.parse(raw) as VoiceAnalyticsEntry[];
      }
    } catch {
      this.entries = [];
    }
  }

  private persist(): void {
    try {
      // Keep only last MAX_ENTRIES to prevent unbounded storage growth
      if (this.entries.length > MAX_ENTRIES) {
        this.entries = this.entries.slice(-MAX_ENTRIES);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      // Storage might be full or unavailable
    }
  }

  record(entry: VoiceAnalyticsEntry): void {
    this.entries.push(entry);
    this.persist();
  }

  getEntries(sinceDate?: Date): VoiceAnalyticsEntry[] {
    if (!sinceDate) return [...this.entries];
    const since = sinceDate.toISOString();
    return this.entries.filter((e) => e.timestamp >= since);
  }

  getSummary(days = 30): VoiceAnalyticsSummary {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const entries = this.getEntries(since);

    const totalCommands = entries.length;
    const successCount = entries.filter((e) => e.success).length;
    const successRate = totalCommands > 0 ? successCount / totalCommands : 0;

    // Popular commands
    const commandCounts: Record<string, number> = {};
    for (const e of entries.filter((e) => e.success)) {
      commandCounts[e.phrase] = (commandCounts[e.phrase] ?? 0) + 1;
    }
    const popularCommands = Object.entries(commandCounts)
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Error patterns (failed recognitions)
    const errorCounts: Record<string, number> = {};
    for (const e of entries.filter((e) => !e.success)) {
      errorCounts[e.phrase] = (errorCounts[e.phrase] ?? 0) + 1;
    }
    const errorPatterns = Object.entries(errorCounts)
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Active users
    const uniqueUsers = new Set(entries.map((e) => e.userId).filter(Boolean)).size;

    // Daily usage for chart
    const dailyCounts: Record<string, number> = {};
    for (const e of entries) {
      const date = e.timestamp.slice(0, 10);
      dailyCounts[date] = (dailyCounts[date] ?? 0) + 1;
    }
    const dailyUsage = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalCommands,
      successRate,
      popularCommands,
      errorPatterns,
      activeUsers: uniqueUsers,
      dailyUsage,
    };
  }

  clearAll(): void {
    this.entries = [];
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const voiceAnalyticsService = new VoiceAnalyticsService();
