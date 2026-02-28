import React from 'react';
import { VoiceCommandStatus } from '../../types/voice';

interface Props {
  status: VoiceCommandStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  VoiceCommandStatus,
  { label: string; colorClass: string; animate: boolean }
> = {
  idle: { label: 'Voice ready', colorClass: 'bg-gray-400', animate: false },
  listening: { label: 'Listening...', colorClass: 'bg-green-500', animate: true },
  processing: { label: 'Processing...', colorClass: 'bg-blue-500', animate: true },
  error: { label: 'Error', colorClass: 'bg-red-500', animate: false },
  unsupported: { label: 'Not supported', colorClass: 'bg-yellow-500', animate: false },
};

export function VoiceStatusIndicator({ status, className = '' }: Props) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={config.label}
    >
      <span
        className={`inline-block w-3 h-3 rounded-full ${config.colorClass} ${
          config.animate ? 'animate-pulse' : ''
        }`}
      />
      <span className="text-sm text-gray-600 dark:text-gray-300">{config.label}</span>
    </div>
  );
}
