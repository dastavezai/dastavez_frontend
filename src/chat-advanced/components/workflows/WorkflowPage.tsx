// src/chat-advanced/components/workflows/WorkflowPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { workflowService, Workflow } from '../../services/workflowService';
import { CreateWorkflowModal } from './CreateWorkflowModal';
import { WorkflowCard } from './WorkflowCard';

const CATEGORIES = [
  'Due diligence', 'Review agreements', 'Litigation', 'Arbitration',
  'Real Estate', 'Drafting', 'Corporate', 'Capital markets', 'Personal',
];

export const WorkflowsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Due diligence');
  const [curatedWorkflows, setCuratedWorkflows] = useState<Workflow[]>([]);
  const [myWorkflows, setMyWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Workflow | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [curated, mine] = await Promise.all([
        workflowService.getCurated(activeCategory !== 'Due diligence' ? activeCategory : undefined),
        workflowService.list({ category: activeCategory !== 'Due diligence' ? activeCategory : undefined }),
      ]);
      setCuratedWorkflows(curated);
      setMyWorkflows(mine.workflows.filter(w => !w.isCurated));
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (workflow: Workflow) => {
    try {
      await workflowService.delete(workflow._id);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filteredCurated = searchQuery
    ? curatedWorkflows.filter(w =>
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.query.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : curatedWorkflows;

  const filteredMine = searchQuery
    ? myWorkflows.filter(w =>
        w.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : myWorkflows;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Hide Files
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <span className="text-sm font-medium text-gray-900">Document Review</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Chat Input Area */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
          <div className="px-4 py-3">
            <input
              type="text"
              placeholder="Ask anything..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm">
              Submit
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Capabilities Bar */}
        <div className="mb-6">
          <p className="text-xs text-center text-gray-500 mb-3">Select sources and capabilities</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { label: 'Attach Files', icon: '📎', active: true },
              { label: 'Enable Research', icon: '🌐' },
              { label: 'Enable Drafting', icon: '✏️' },
              { label: 'Enable Deep Mode', icon: '✦' },
              { label: 'Connect Email', icon: '✉️' },
            ].map(cap => (
              <button
                key={cap.label}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
                  cap.active
                    ? 'bg-white border-blue-400 text-blue-600 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span>{cap.icon}</span>
                {cap.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-center text-gray-500 mt-2.5">
            For more in-depth answers, make sure to enable <span className="font-semibold text-gray-700">✦ deep mode.</span>
          </p>
        </div>

        {/* Workflows Section Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Try out curated workflows</span>
          <button
            onClick={() => setAutoSuggest(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              autoSuggest
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoSuggest ? 'bg-green-500' : 'bg-gray-400'}`} />
            Auto-Suggest {autoSuggest ? 'On' : 'Off'}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Workflow Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded-md w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-md w-1/2" />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-5 w-16 bg-gray-100 rounded-md" />
                  <div className="h-5 w-20 bg-gray-100 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Create Your Own */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="group bg-white border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all min-h-[110px] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                Create your own workflow
              </span>
            </button>

            {/* My Workflows */}
            {filteredMine.map(w => (
              <WorkflowCard
                key={w._id}
                workflow={w}
                isOwned
                onDelete={() => setDeleteTarget(w)}
              />
            ))}

            {/* Curated Workflows */}
            {filteredCurated.map(w => (
              <WorkflowCard key={w._id} workflow={w} />
            ))}

            {/* Empty state */}
            {filteredCurated.length === 0 && filteredMine.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No workflows found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different category or create your own</p>
              </div>
            )}
          </div>
        )}

        {/* Explore More */}
        {!isLoading && filteredCurated.length > 0 && (
          <div className="mt-4 text-center">
            <button className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
              Explore more workflows →
            </button>
            <p className="text-xs text-gray-400 mt-0.5">(Browse all workflows in library)</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateWorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={fetchData}
      />

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Delete Workflow</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Are you sure you want to delete <span className="font-medium text-gray-700">"{deleteTarget.title}"</span>? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;