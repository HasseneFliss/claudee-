import React, { useCallback, useEffect, useState } from 'react';
import { voiceAnalyticsService } from '../../services/voiceAnalyticsService';
import { VoiceAnalyticsSummary } from '../../types/voice';

interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  highlight?: boolean;
}

function MetricCard({ label, value, description, highlight }: MetricCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight
          ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      }`}
    >
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      {description && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{description}</p>
      )}
    </div>
  );
}

interface CommandBarProps {
  label: string;
  count: number;
  maxCount: number;
  isError?: boolean;
}

function CommandBar({ label, count, maxCount, isError }: CommandBarProps) {
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1">
      <span
        className="w-40 truncate text-sm text-gray-700 dark:text-gray-300"
        title={label}
      >
        {label}
      </span>
      <div className="flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full transition-all ${
            isError ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${count} uses`}
        />
      </div>
      <span className="w-8 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
        {count}
      </span>
    </div>
  );
}

function UsageChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (!data.length) {
    return (
      <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        No usage data available for this period
      </p>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1" style={{ height: 80 }}>
      {data.map((point) => {
        const heightPct = (point.count / maxCount) * 100;
        return (
          <div
            key={point.date}
            className="group relative flex-1"
            style={{ height: '100%' }}
          >
            <div
              className="absolute bottom-0 w-full rounded-t bg-blue-400 transition-all group-hover:bg-blue-500 dark:bg-blue-600 dark:group-hover:bg-blue-500"
              style={{ height: `${heightPct}%` }}
              role="img"
              aria-label={`${point.date}: ${point.count} commands`}
            />
            <div className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block dark:bg-gray-600">
              {point.date}: {point.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type DateRange = 7 | 30 | 90;

export function VoiceCommandAdminPanel() {
  const [summary, setSummary] = useState<VoiceAnalyticsSummary | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearConfirming, setIsClearConfirming] = useState(false);

  const loadSummary = useCallback(() => {
    setIsLoading(true);
    // voiceAnalyticsService is synchronous (localStorage-backed)
    const data = voiceAnalyticsService.getSummary(dateRange);
    setSummary(data);
    setIsLoading(false);
  }, [dateRange]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleClearData = useCallback(() => {
    if (!isClearConfirming) {
      setIsClearConfirming(true);
      return;
    }
    voiceAnalyticsService.clearAll();
    setIsClearConfirming(false);
    loadSummary();
  }, [isClearConfirming, loadSummary]);

  const handleCancelClear = useCallback(() => {
    setIsClearConfirming(false);
  }, []);

  const successRatePct = summary ? Math.round(summary.successRate * 100) : 0;
  const maxPopular = summary?.popularCommands[0]?.count ?? 1;
  const maxError = summary?.errorPatterns[0]?.count ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Voice Command Analytics
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor usage, adoption, and error patterns for voice features
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range selector */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
            {([7, 30, 90] as DateRange[]).map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-3 py-1.5 text-sm transition-colors first:rounded-l-lg last:rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dateRange === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                aria-pressed={dateRange === days}
                aria-label={`Last ${days} days`}
              >
                {days}d
              </button>
            ))}
          </div>

          <button
            onClick={loadSummary}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Refresh analytics"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12" role="status" aria-label="Loading analytics">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      )}

      {!isLoading && summary && (
        <>
          {/* Key Metrics */}
          <section aria-labelledby="metrics-heading">
            <h3 id="metrics-heading" className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Key Metrics (Last {dateRange} Days)
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard
                label="Total Commands"
                value={summary.totalCommands.toLocaleString()}
                description="Voice commands processed"
                highlight
              />
              <MetricCard
                label="Success Rate"
                value={`${successRatePct}%`}
                description="Commands recognized correctly"
                highlight={successRatePct >= 80}
              />
              <MetricCard
                label="Active Users"
                value={summary.activeUsers.toLocaleString()}
                description="Unique users using voice"
              />
              <MetricCard
                label="Failed Commands"
                value={(summary.totalCommands - Math.round(summary.totalCommands * summary.successRate)).toLocaleString()}
                description="Unrecognized inputs"
              />
            </div>
          </section>

          {/* Daily Usage Chart */}
          <section
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            aria-labelledby="usage-chart-heading"
          >
            <h3
              id="usage-chart-heading"
              className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Daily Voice Command Usage
            </h3>
            <UsageChart data={summary.dailyUsage} />
            {summary.dailyUsage.length > 0 && (
              <div className="mt-2 flex justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>{summary.dailyUsage[0]?.date}</span>
                <span>{summary.dailyUsage[summary.dailyUsage.length - 1]?.date}</span>
              </div>
            )}
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Popular Commands */}
            <section
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              aria-labelledby="popular-commands-heading"
            >
              <h3
                id="popular-commands-heading"
                className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Most Used Commands
              </h3>
              {summary.popularCommands.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
                  No successful commands yet
                </p>
              ) : (
                <div className="space-y-1">
                  {summary.popularCommands.map((cmd) => (
                    <CommandBar
                      key={cmd.command}
                      label={cmd.command}
                      count={cmd.count}
                      maxCount={maxPopular}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Error Patterns */}
            <section
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              aria-labelledby="error-patterns-heading"
            >
              <h3
                id="error-patterns-heading"
                className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Common Error Patterns
              </h3>
              {summary.errorPatterns.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
                  No error patterns detected
                </p>
              ) : (
                <div className="space-y-1">
                  {summary.errorPatterns.map((err) => (
                    <CommandBar
                      key={err.phrase}
                      label={err.phrase || '(empty)'}
                      count={err.count}
                      maxCount={maxError}
                      isError
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Adoption Insights */}
          <section
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            aria-labelledby="insights-heading"
          >
            <h3
              id="insights-heading"
              className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Adoption Insights
            </h3>

            {summary.totalCommands === 0 ? (
              <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  No voice command usage recorded yet. Consider promoting voice features to users
                  who would benefit from hands-free operation.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {successRatePct < 70 && (
                  <li className="flex items-start gap-2 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                    <span className="mt-0.5 text-red-500" aria-hidden>&#9888;</span>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Success rate is below 70%. Review common error patterns above and consider
                      improving wake phrase sensitivity or command phrasing.
                    </p>
                  </li>
                )}
                {successRatePct >= 70 && successRatePct < 90 && (
                  <li className="flex items-start gap-2 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                    <span className="mt-0.5 text-yellow-500" aria-hidden>&#9432;</span>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Success rate of {successRatePct}% is acceptable but can be improved.
                      Check the top error patterns for opportunities.
                    </p>
                  </li>
                )}
                {successRatePct >= 90 && (
                  <li className="flex items-start gap-2 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                    <span className="mt-0.5 text-green-500" aria-hidden>&#10003;</span>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Excellent success rate of {successRatePct}%! Voice commands are working well.
                    </p>
                  </li>
                )}
                {summary.activeUsers === 0 && summary.totalCommands > 0 && (
                  <li className="flex items-start gap-2 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                    <span className="mt-0.5 text-blue-500" aria-hidden>&#9432;</span>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Voice commands are being used but user attribution is not enabled.
                      Enable user tracking in voice settings to gain user-level insights.
                    </p>
                  </li>
                )}
              </ul>
            )}
          </section>

          {/* Danger Zone */}
          <section
            className="rounded-lg border border-red-200 bg-white p-4 dark:border-red-900 dark:bg-gray-800"
            aria-labelledby="danger-zone-heading"
          >
            <h3
              id="danger-zone-heading"
              className="mb-2 text-sm font-medium text-red-600 dark:text-red-400"
            >
              Danger Zone
            </h3>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Clear all stored voice analytics data. This action cannot be undone.
            </p>
            {isClearConfirming ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearData}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Yes, clear all data
                </button>
                <button
                  onClick={handleCancelClear}
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleClearData}
                className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-700 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Clear Analytics Data
              </button>
            )}
          </section>
        </>
      )}
    </div>
  );
}
