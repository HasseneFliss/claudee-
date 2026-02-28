/**
 * Voice Command API Routes
 *
 * Provides server-side endpoints for:
 * - Recording voice analytics events
 * - Retrieving analytics summaries (admin only)
 * - Managing user voice settings (persisted to DB rather than localStorage)
 *
 * These are Express-style route handlers that can be mounted on any
 * Express/Fastify/Next.js API layer.
 */

import type { Request, Response } from 'express';
import { VoiceAnalyticsEntry, VoiceSettings, DEFAULT_VOICE_SETTINGS } from '../types/voice';

// ---------------------------------------------------------------------------
// In-memory store (replace with DB integration in production)
// ---------------------------------------------------------------------------

const analyticsStore: VoiceAnalyticsEntry[] = [];
const userSettingsStore: Map<string, VoiceSettings> = new Map();
const MAX_ANALYTICS_RECORDS = 100_000;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isValidAnalyticsEntry(body: unknown): body is VoiceAnalyticsEntry {
  if (!body || typeof body !== 'object') return false;
  const e = body as Record<string, unknown>;
  return (
    typeof e.commandId === 'string' &&
    typeof e.phrase === 'string' &&
    typeof e.action === 'string' &&
    typeof e.success === 'boolean' &&
    typeof e.confidence === 'number' &&
    typeof e.timestamp === 'string'
  );
}

function isValidSettings(body: unknown): body is Partial<VoiceSettings> {
  if (!body || typeof body !== 'object') return false;
  const s = body as Record<string, unknown>;
  const allowed: Array<keyof VoiceSettings> = [
    'enabled', 'wakePhrase', 'language', 'continuousListening',
    'audioFeedback', 'visualFeedback', 'sensitivity',
  ];
  return Object.keys(s).every((k) => allowed.includes(k as keyof VoiceSettings));
}

function getUserId(req: Request): string | null {
  // Assumes JWT middleware has set req.user
  return (req as Request & { user?: { id: string } }).user?.id ?? null;
}

function requireAdmin(req: Request, res: Response): boolean {
  const user = (req as Request & { user?: { id: string; role: string } }).user;
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// POST /api/voice/analytics
// Records a single voice command analytics event
// ---------------------------------------------------------------------------

export async function recordVoiceAnalytics(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!isValidAnalyticsEntry(req.body)) {
    res.status(400).json({ error: 'Invalid analytics entry payload' });
    return;
  }

  const entry: VoiceAnalyticsEntry = {
    ...(req.body as VoiceAnalyticsEntry),
    userId,
    // Always use server timestamp to prevent client-side manipulation
    timestamp: new Date().toISOString(),
  };

  analyticsStore.push(entry);

  // Trim oldest records when limit is exceeded
  if (analyticsStore.length > MAX_ANALYTICS_RECORDS) {
    analyticsStore.splice(0, analyticsStore.length - MAX_ANALYTICS_RECORDS);
  }

  res.status(201).json({ recorded: true });
}

// ---------------------------------------------------------------------------
// GET /api/voice/analytics/summary?days=30
// Returns aggregated summary — admin only
// ---------------------------------------------------------------------------

export async function getVoiceAnalyticsSummary(req: Request, res: Response): Promise<void> {
  if (!requireAdmin(req, res)) return;

  const days = Math.min(Math.max(parseInt(String(req.query.days ?? '30'), 10) || 30, 1), 365);
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  const entries = analyticsStore.filter((e) => e.timestamp >= sinceISO);
  const total = entries.length;
  const successCount = entries.filter((e) => e.success).length;
  const successRate = total > 0 ? successCount / total : 0;

  // Popular commands
  const cmdCounts: Record<string, number> = {};
  for (const e of entries.filter((e) => e.success)) {
    cmdCounts[e.phrase] = (cmdCounts[e.phrase] ?? 0) + 1;
  }
  const popularCommands = Object.entries(cmdCounts)
    .map(([command, count]) => ({ command, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Error patterns
  const errCounts: Record<string, number> = {};
  for (const e of entries.filter((e) => !e.success)) {
    errCounts[e.phrase] = (errCounts[e.phrase] ?? 0) + 1;
  }
  const errorPatterns = Object.entries(errCounts)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Active users
  const activeUsers = new Set(entries.map((e) => e.userId).filter(Boolean)).size;

  // Daily usage
  const dailyCounts: Record<string, number> = {};
  for (const e of entries) {
    const date = e.timestamp.slice(0, 10);
    dailyCounts[date] = (dailyCounts[date] ?? 0) + 1;
  }
  const dailyUsage = Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    totalCommands: total,
    successRate,
    popularCommands,
    errorPatterns,
    activeUsers,
    dailyUsage,
  });
}

// ---------------------------------------------------------------------------
// GET /api/voice/settings
// Returns voice settings for the authenticated user
// ---------------------------------------------------------------------------

export async function getVoiceSettings(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const settings = userSettingsStore.get(userId) ?? DEFAULT_VOICE_SETTINGS;
  res.json(settings);
}

// ---------------------------------------------------------------------------
// PUT /api/voice/settings
// Updates voice settings for the authenticated user
// ---------------------------------------------------------------------------

export async function updateVoiceSettings(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!isValidSettings(req.body)) {
    res.status(400).json({ error: 'Invalid settings payload' });
    return;
  }

  const current = userSettingsStore.get(userId) ?? DEFAULT_VOICE_SETTINGS;
  const updated: VoiceSettings = { ...current, ...(req.body as Partial<VoiceSettings>) };

  // Validate sensitivity range
  if (updated.sensitivity < 0 || updated.sensitivity > 1) {
    res.status(400).json({ error: 'Sensitivity must be between 0 and 1' });
    return;
  }

  userSettingsStore.set(userId, updated);
  res.json(updated);
}

// ---------------------------------------------------------------------------
// DELETE /api/voice/analytics — admin only
// Clears all stored analytics (use with caution)
// ---------------------------------------------------------------------------

export async function clearVoiceAnalytics(req: Request, res: Response): Promise<void> {
  if (!requireAdmin(req, res)) return;

  const count = analyticsStore.length;
  analyticsStore.splice(0, analyticsStore.length);
  res.json({ cleared: count });
}
