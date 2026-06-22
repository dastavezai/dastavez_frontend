// src/pages/OrgManagementPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSubscription } from '../context/SubscriptionContext';

const API = import.meta.env.VITE_API_URL || '';
const getAuth = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const ALL_FEATURES = [
  'CHAT_QA', 'DOCUMENT_UPLOAD', 'DRAFT_GENERATION', 'BASIC_EDITING', 'CLEAN_DOWNLOAD',
  'SMART_SCAN', 'COUNTER_AFFIDAVIT', 'SOF_GENERATION', 'WRIT_COUNTER', 'DOCUMENT_SUMMARY',
  'WORKFLOWS', 'RAG_RESEARCH', 'ADVANCED_EDITING', 'ORG_MANAGEMENT',
  'DESIGNATION_ACCESS_CONTROL', 'TEAM_SHARING', 'AUDIT_LOGS', 'BULK_PROCESSING',
];

interface Member {
  userId: { _id: string; name: string; email: string };
  designation: string | null;
  clearanceLevel: number;
  featureOverrides: { allowed: string[]; denied: string[] };
}

export const OrgManagementPage: React.FC = () => {
  const { subscription } = useSubscription();
  const [org, setOrg] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ designation: '', clearanceLevel: 1, denied: [] as string[], allowed: [] as string[] });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOrg();
  }, []);

  const fetchOrg = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/api/subscriptions/org`, { headers: getAuth() });
      setOrg(res.data.organization);
      setMembers(res.data.members);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (member: Member) => {
    setEditingMember(member);
    setEditForm({
      designation: member.designation || '',
      clearanceLevel: member.clearanceLevel,
      denied: member.featureOverrides?.denied || [],
      allowed: member.featureOverrides?.allowed || [],
    });
  };

  const saveMember = async () => {
    if (!editingMember) return;
    setIsSaving(true);
    try {
      await axios.put(
        `${API}/api/subscriptions/org/members/${editingMember.userId._id}`,
        { designation: editForm.designation, clearanceLevel: editForm.clearanceLevel, allowedFeatures: editForm.allowed, deniedFeatures: editForm.denied },
        { headers: getAuth() }
      );
      setEditingMember(null);
      fetchOrg();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const removeMember = async (userId: string) => {
    if (!confirm('Remove this member from the organization?')) return;
    await axios.delete(`${API}/api/subscriptions/org/members/${userId}`, { headers: getAuth() });
    fetchOrg();
  };

  const toggleFeature = (list: 'denied' | 'allowed', key: string) => {
    setEditForm(prev => ({
      ...prev,
      [list]: prev[list].includes(key)
        ? prev[list].filter(k => k !== key)
        : [...prev[list], key],
    }));
  };

  if (subscription?.tier !== 'enterprise') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Enterprise Feature</h2>
        <p className="text-sm text-gray-500 max-w-sm">Organization management is available on the Enterprise plan. Upgrade to manage your team's access.</p>
        <a href="/billing?plan=enterprise" className="mt-4 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-all">
          Upgrade to Enterprise
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{org?.name || 'Organization'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{members.length} of {org?.maxMembers} members</p>
        </div>
        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Enterprise</span>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Team Members</span>
        </div>

        {members.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No members yet. Invite your team.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {members.map((m) => (
              <div key={m.userId._id} className="px-5 py-3.5 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600">
                    {m.userId.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{m.userId.name}</p>
                  <p className="text-xs text-gray-400 truncate">{m.userId.email}</p>
                </div>

                {/* Designation + clearance */}
                <div className="hidden sm:flex flex-col items-end gap-0.5">
                  <span className="text-xs font-medium text-gray-600">{m.designation || '—'}</span>
                  <span className="text-xs text-gray-400">Level {m.clearanceLevel}</span>
                </div>

                {/* Denied features badge */}
                {m.featureOverrides?.denied?.length > 0 && (
                  <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full">
                    {m.featureOverrides.denied.length} restricted
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(m)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Manage Access
                  </button>
                  <button
                    onClick={() => removeMember(m.userId._id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-400 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditingMember(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Manage Access</p>
                <p className="text-xs text-gray-400">{editingMember.userId.name}</p>
              </div>
              <button onClick={() => setEditingMember(null)} className="text-gray-400 hover:text-gray-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Designation + clearance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Designation</label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={e => setEditForm(p => ({ ...p, designation: e.target.value }))}
                    placeholder="e.g. Senior Associate"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Clearance Level (1–10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editForm.clearanceLevel}
                    onChange={e => setEditForm(p => ({ ...p, clearanceLevel: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Feature overrides */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Feature Access Overrides</p>
                <p className="text-xs text-gray-400 mb-3">Red = blocked for this member. Green = explicitly granted (overrides designation policy).</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {ALL_FEATURES.map(key => {
                    const isDenied  = editForm.denied.includes(key);
                    const isAllowed = editForm.allowed.includes(key);
                    return (
                      <div key={key} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-xs font-medium text-gray-700">{key.replace(/_/g, ' ')}</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => toggleFeature('allowed', key)}
                            className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                              isAllowed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-green-100 hover:text-green-600'
                            }`}
                          >
                            Allow
                          </button>
                          <button
                            onClick={() => toggleFeature('denied', key)}
                            className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                              isDenied ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-600'
                            }`}
                          >
                            Block
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setEditingMember(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
              <button
                onClick={saveMember}
                disabled={isSaving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgManagementPage;
