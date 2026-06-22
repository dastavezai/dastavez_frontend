// src/components/subscription/FeatureGate.tsx
// ─── Drop-in wrapper that locks any UI element behind a feature check ─────────
//
// Usage:
//   <FeatureGate featureKey="WRIT_COUNTER">
//     <WritCounterButton />
//   </FeatureGate>
//
// Locked state: greyed out with a lock icon. Click opens the upgrade modal.

import React, { useState, ReactNode } from 'react';
import { useFeature } from '../../context/SubscriptionContext';
import { UpgradeModal } from './UpgradeModal';

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
  // Optional: custom locked UI. If not provided uses default grey overlay + lock
  lockedFallback?: ReactNode;
  // Don't show lock overlay — just hide entirely if locked
  hideIfLocked?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureKey,
  children,
  lockedFallback,
  hideIfLocked = false,
}) => {
  const { hasAccess, feature, requiredTierMeta, currentTier } = useFeature(featureKey);
  const [modalOpen, setModalOpen] = useState(false);

  if (hasAccess) return <>{children}</>;
  if (hideIfLocked) return null;

  if (lockedFallback) return <>{lockedFallback}</>;

  return (
    <>
      <div
        className="relative group cursor-pointer select-none"
        onClick={() => setModalOpen(true)}
        title={`Requires ${requiredTierMeta?.label || ''} plan`}
      >
        {/* Greyed overlay */}
        <div className="opacity-40 pointer-events-none filter grayscale">
          {children}
        </div>

        {/* Lock badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 shadow-sm group-hover:shadow-md transition-shadow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className="text-xs font-semibold text-gray-500">
              {requiredTierMeta?.label || 'Upgrade'}
            </span>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureKey={featureKey}
        featureLabel={feature?.label}
        featureDescription={feature?.description}
        requiredTier={feature?.minTier}
        requiredTierMeta={requiredTierMeta}
        currentTier={currentTier}
      />
    </>
  );
};

// ─── LockedButton — use when you want a single locked-looking button ──────────
interface LockedButtonProps {
  featureKey: string;
  label: string;
  icon?: ReactNode;
  className?: string;
}

export const LockedButton: React.FC<LockedButtonProps> = ({ featureKey, label, icon, className }) => {
  const { hasAccess, feature, requiredTierMeta, currentTier } = useFeature(featureKey);
  const [modalOpen, setModalOpen] = useState(false);

  if (hasAccess) return null; // If accessible, caller renders the real button

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 cursor-pointer hover:border-blue-300 hover:text-blue-400 transition-all ${className}`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${requiredTierMeta?.badge || 'bg-gray-100 text-gray-500'}`}>
          {requiredTierMeta?.label}
        </span>
      </button>

      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureKey={featureKey}
        featureLabel={feature?.label}
        featureDescription={feature?.description}
        requiredTier={feature?.minTier}
        requiredTierMeta={requiredTierMeta}
        currentTier={currentTier}
      />
    </>
  );
};
