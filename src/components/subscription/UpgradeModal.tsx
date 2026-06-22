// src/components/subscription/UpgradeModal.tsx
import React from 'react';
import { useSubscription, Tier, TierMeta } from '../../context/SubscriptionContext';

const TIER_ORDER: Tier[] = ['free', 'basic', 'premium', 'enterprise'];

const TIER_HIGHLIGHTS: Record<Tier, string[]> = {
  free: ['AI Chat Q&A', 'Document Upload', 'Draft Generation (with watermark)'],
  basic: ['Everything in Free', 'Watermark-free downloads', 'Smart Document Scan', 'Counter Affidavit Generator', 'Statement of Facts'],
  premium: ['Everything in Basic', 'Writ Counter Affidavit', 'AI Document Summary', 'Custom Workflows', 'Legal RAG Research', 'Advanced Editing'],
  enterprise: ['Everything in Premium', 'Organization Management', 'Designation-based Access Control', 'Team Document Sharing', 'Audit Logs', 'Bulk Processing'],
};

const TIER_ICONS: Record<Tier, string> = {
  free: '🆓',
  basic: '⚡',
  premium: '💎',
  enterprise: '🏢',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  featureKey?: string;
  featureLabel?: string;
  featureDescription?: string;
  requiredTier?: Tier;
  requiredTierMeta?: TierMeta | null;
  currentTier: Tier;
}

export const UpgradeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  featureLabel,
  featureDescription,
  requiredTier,
  requiredTierMeta,
  currentTier,
}) => {
  const { tierMetaAll } = useSubscription();

  if (!isOpen) return null;

  // Show tiers from required upward
  const requiredRank = TIER_ORDER.indexOf(requiredTier || 'basic');
  const showTiers = TIER_ORDER.slice(Math.max(requiredRank, 1)); // never show Free in upgrade modal

  const handleUpgrade = (tier: Tier) => {
    // Redirect to billing/checkout page — update this path as needed
    window.location.href = `/billing?plan=${tier}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 px-6 pt-8 pb-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div className="flex items-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className="text-sm font-medium text-blue-100">Feature Locked</span>
          </div>

          <h2 className="text-xl font-bold mb-1">
            {featureLabel ? `Unlock "${featureLabel}"` : 'Upgrade Your Plan'}
          </h2>

          {featureDescription && (
            <p className="text-sm text-blue-100 leading-relaxed">{featureDescription}</p>
          )}

          {requiredTierMeta && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
              <span className="text-xs font-semibold">Requires {requiredTierMeta.label} or higher</span>
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {showTiers.map((tier) => {
            const meta = tierMetaAll[tier];
            const isRecommended = tier === requiredTier;
            const isCurrentOrLower = TIER_ORDER.indexOf(tier) <= TIER_ORDER.indexOf(currentTier);

            if (!meta) return null;

            return (
              <div
                key={tier}
                className={`rounded-xl border-2 p-4 transition-all ${
                  isRecommended
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{TIER_ICONS[tier]}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{meta.label}</span>
                        {isRecommended && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{meta.tagline}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{meta.price}</span>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {TIER_HIGHLIGHTS[tier].map((h, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isRecommended ? '#2563EB' : '#10B981'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(tier)}
                  disabled={isCurrentOrLower}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isCurrentOrLower
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isRecommended
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {isCurrentOrLower ? 'Current Plan' : `Upgrade to ${meta.label}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 text-center">
          <p className="text-xs text-gray-400">
            Need help choosing?{' '}
            <a href="/contact" className="text-blue-500 hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
};
