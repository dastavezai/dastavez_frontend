const IST_LOCALE = 'en-IN';

export function normalizeAuditChange(c, index = 0) {
  const ts = c?.timestamp ? new Date(c.timestamp) : null;
  const validTs = ts && !Number.isNaN(ts.getTime()) ? ts : null;
  let changeType = c?.changeType;
  if (!changeType && c?.type === 'suggestion') changeType = 'suggestion';
  if (!changeType && c?.type) changeType = c.type;
  if (!changeType) changeType = 'manual_edit';

  return {
    index,
    timestampIso: validTs ? validTs.toISOString() : null,
    dateKey: validTs ? validTs.toISOString().slice(0, 10) : 'unknown',
    dateLabel: validTs
      ? validTs.toLocaleDateString(IST_LOCALE, {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'Unknown date',
    timeLabel: validTs
      ? validTs.toLocaleTimeString(IST_LOCALE, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : '—',
    changeType,
    instruction: c?.instruction || '',
    summary: c?.summary || '',
    previousText: c?.previousText || c?.originalText || '',
    newText: c?.newText || c?.suggestedText || '',
    reverted: !!c?.reverted,
    raw: c,
  };
}

export function buildAuditEntries(changes = []) {
  return (changes || []).map((c, idx) => normalizeAuditChange(c, idx));
}

export function filterAuditEntries(entries, { from, to, type, q } = {}) {
  let list = [...entries];
  if (from) list = list.filter((e) => e.dateKey >= String(from).slice(0, 10));
  if (to) list = list.filter((e) => e.dateKey <= String(to).slice(0, 10));
  if (type && type !== 'all') list = list.filter((e) => e.changeType === type);
  if (q?.trim()) {
    const needle = q.trim().toLowerCase();
    list = list.filter((e) =>
      [e.instruction, e.summary, e.previousText, e.newText, e.changeType]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }
  return list;
}

export function groupAuditEntriesByDate(entries) {
  const byDate = new Map();
  for (const e of entries) {
    if (!byDate.has(e.dateKey)) byDate.set(e.dateKey, []);
    byDate.get(e.dateKey).push(e);
  }
  for (const [, dayEntries] of byDate) {
    dayEntries.sort((a, b) => (b.timestampIso || '').localeCompare(a.timestampIso || ''));
  }
  return [...byDate.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export const CHANGE_TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'ai_edit', label: 'AI edit' },
  { value: 'manual_edit', label: 'Manual edit' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'undo', label: 'Undo' },
  { value: 'redo', label: 'Redo' },
  { value: 'autosave', label: 'Autosave' },
];
