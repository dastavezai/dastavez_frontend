// src/components/subscription/TierBadge.tsx
// Tiny reusable badge showing current tier — drop anywhere in the UI

import React from 'react';
import { useSubscription } from '../../context/SubscriptionContext';

const TIER_ICONS: Record<string, string> = {
  free: '🆓', basic: '⚡', premium: '💎', enterprise: '🏢',
};

interface Props {
  showUpgradeLink?: boolean;
  size?: 'sm' | 'md';
}

export const TierBadge: React.FC<Props> = ({ showUpgradeLink = true, size = 'md' }) => {
  const { subscription, tierMeta } = useSubscription();
  if (!subscription || !tierMeta) return null;

  const isFree = subscription.tier === 'free';
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${tierMeta.badge} ${sizeClass}`}>
        <span>{TIER_ICONS[subscription.tier]}</span>
        {tierMeta.label}
      </span>
      {isFree && showUpgradeLink && (
        <a
          href="/billing"
          className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors underline-offset-2 hover:underline"
        >
          Upgrade
        </a>
      )}
    </div>
  );
};
