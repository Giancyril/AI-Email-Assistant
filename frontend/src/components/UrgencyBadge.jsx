import React from 'react';

export default function UrgencyBadge({ urgency }) {
  const normalized = (urgency || 'low').toLowerCase();

  const configs = {
    critical: 'text-red-400 bg-red-500/10 border-red-500/20',
    high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };

  const currentClass = configs[normalized] || configs.low;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${currentClass}`}>
      {urgency || 'Low'}
    </span>
  );
}
