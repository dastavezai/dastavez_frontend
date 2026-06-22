// src/context/SubscriptionContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export type Tier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface TierMeta {
  label: string;
  color: string;
  badge: string;
  price: string;
  tagline: string;
}

export interface FeatureDef {
  key: string;
  label: string;
  description: string;
  minTier: Tier;
  watermark: boolean;
  watermarkRemovedAt?: Tier;
  category: string;
}

interface SubscriptionState {
  tier: Tier;
  status: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  designation: string | null;
  clearanceLevel: number;
  orgId: string | null;
}

interface SubscriptionContextValue {
  subscription: SubscriptionState | null;
  tierMeta: TierMeta | null;
  accessibleFeatures: string[];
  allFeatures: Record<string, FeatureDef>;
  tierMetaAll: Record<Tier, TierMeta>;
  isLoading: boolean;

  // Key helpers
  can: (featureKey: string) => boolean;
  cannotReason: (featureKey: string) => string | null;
  refresh: () => void;
}

const TIER_RANK: Record<Tier, number> = { free: 0, basic: 1, premium: 2, enterprise: 3 };

const defaultCtx: SubscriptionContextValue = {
  subscription: null,
  tierMeta: null,
  accessibleFeatures: [],
  allFeatures: {},
  tierMetaAll: {} as any,
  isLoading: true,
  can: () => false,
  cannotReason: () => 'Loading...',
  refresh: () => {},
};

const SubscriptionContext = createContext<SubscriptionContextValue>(defaultCtx);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [tierMeta, setTierMeta] = useState<TierMeta | null>(null);
  const [accessibleFeatures, setAccessibleFeatures] = useState<string[]>([]);
  const [allFeatures, setAllFeatures] = useState<Record<string, FeatureDef>>({});
  const [tierMetaAll, setTierMetaAll] = useState<Record<Tier, TierMeta>>({} as any);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem('token');

  const fetchSubscription = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const [subRes, featRes] = await Promise.all([
        axios.get(`${API}/api/subscriptions/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/subscriptions/features`),
      ]);

      setSubscription(subRes.data.subscription);
      setTierMeta(subRes.data.tierMeta);
      setAccessibleFeatures(subRes.data.accessibleFeatures);
      setAllFeatures(featRes.data.features);
      setTierMetaAll(featRes.data.tierMeta);
    } catch (err) {
      console.error('[Subscription] Failed to load:', err);
      // Fall back to free
      setSubscription({ tier: 'free', status: 'active', trialEndsAt: null, currentPeriodEnd: null, designation: null, clearanceLevel: 1, orgId: null });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const can = useCallback((featureKey: string): boolean => {
    return accessibleFeatures.includes(featureKey);
  }, [accessibleFeatures]);

  const cannotReason = useCallback((featureKey: string): string | null => {
    if (accessibleFeatures.includes(featureKey)) return null;
    const feature = allFeatures[featureKey];
    if (!feature) return 'Feature unavailable.';
    const required = feature.minTier;
    const requiredLabel = tierMetaAll[required]?.label || required;
    return `Requires ${requiredLabel} plan or higher.`;
  }, [accessibleFeatures, allFeatures, tierMetaAll]);

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      tierMeta,
      accessibleFeatures,
      allFeatures,
      tierMetaAll,
      isLoading,
      can,
      cannotReason,
      refresh: fetchSubscription,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);

// ─── Convenience hook ─────────────────────────────────────────────────────────
export const useFeature = (featureKey: string) => {
  const { can, cannotReason, allFeatures, tierMetaAll, subscription } = useSubscription();
  const feature = allFeatures[featureKey];
  const hasAccess = can(featureKey);
  const reason = cannotReason(featureKey);
  const requiredTierMeta = feature ? tierMetaAll[feature.minTier] : null;

  return {
    hasAccess,
    reason,
    feature,
    requiredTierMeta,
    currentTier: subscription?.tier ?? 'free',
  };
};
