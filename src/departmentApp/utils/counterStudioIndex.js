/** Build / sync first-page INDEX table rows for Counter Studio. */

function parsePageRangeSpan(pageStr) {
  const s = String(pageStr || '').trim();
  if (!s) return 0;
  const range = s.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    if (Number.isFinite(a) && Number.isFinite(b) && b >= a) return b - a + 1;
  }
  if (/\d+/.test(s)) return 1;
  return 0;
}

function estimateBodyCharCount(counterData = {}) {
  const draft = Array.isArray(counterData.counterDraft) ? counterData.counterDraft : [];
  const parts = [
    counterData.deponentDetails,
    ...(counterData.preliminaryObjections || []),
    ...draft.map((x) => x?.counterArgument || x?.supportingLaw || ''),
    counterData.prayer,
    counterData.verification,
    ...(counterData.statementOfAdditionalFacts || []),
  ];
  return parts.map((p) => String(p || '')).join(' ').length;
}

export function inferIndexLayout(counterData = {}) {
  const hint = `${counterData.caseNumber || ''} ${counterData.documentTitle || ''} ${counterData.sourceDocumentType || ''}`;
  if (/mjc|show\s+cause/i.test(hint)) {
    return { variant: 'mjc_show_cause', showMjcMatterPage: true };
  }
  return {};
}

function bodyStartPageForLayout(layout = {}) {
  if (layout.variant === 'mjc_show_cause' && layout.showMjcMatterPage !== false) return 3;
  if (layout.variant === 'mjc_show_cause') return 2;
  return 2;
}

function estimateBodyPageCount(counterData = {}) {
  const chars = estimateBodyCharCount(counterData);
  return Math.max(1, Math.ceil(chars / 2400));
}

function formatPageSpan(start, count) {
  const s = Math.max(1, Number(start) || 1);
  const n = Math.max(1, Number(count) || 1);
  if (n <= 1) return String(s);
  return `${s}-${s + n - 1}`;
}

/** Fill empty Page no. cells (estimated pages within the filed counter). */
export function fillIndexEntryPages(indexEntries, counterData = {}, layout = {}) {
  const rows = Array.isArray(indexEntries) ? indexEntries.map((r) => ({ ...r })) : [];
  if (!rows.length) return rows;

  const bodyStart = bodyStartPageForLayout(layout);
  const bodyPages = estimateBodyPageCount(counterData);
  const annexures = Array.isArray(counterData.annexureIndex) ? counterData.annexureIndex : [];
  let annexCursor = bodyStart + bodyPages;

  return rows.map((row, i) => {
    const existing = String(row.page ?? '').trim();
    if (existing) return row;

    if (i === 0) {
      return { ...row, page: formatPageSpan(bodyStart, bodyPages) };
    }

    const annexIdx = i - 1;
    const annex = annexures[annexIdx] || {};
    let count = parsePageRangeSpan(annex.pageRange || annex.page);
    if (!count) count = 1;

    const page = formatPageSpan(annexCursor, count);
    annexCursor += count;
    return { ...row, page };
  });
}

export function resolveCounterOnBehalfParticulars(result = {}) {
  const title = String(result.documentTitle || '').trim();
  if (title) return title;
  const opNo = String(result.showCauseOnBehalfOfOpNo || result.oppositePartyNo || '').trim();
  if (opNo) return `Counter Affidavit on behalf of OP No. ${opNo}`;
  const respondent = String(result.respondentName || '').trim();
  if (respondent) return `Counter Affidavit on behalf of ${respondent}`;
  return 'Counter Affidavit on behalf of the Respondent(s)';
}

function annexureParticularsLabel(a, index = 0) {
  const letter = String(a?.letter || a?.id || '').trim() || String.fromCharCode(65 + index);
  const desc = String(a?.description || a?.particulars || '').trim();
  if (!desc) return `Annexure-${letter}`;
  if (/^Annexure/i.test(desc) || desc.startsWith('A Photostat') || desc.startsWith('A photocopy')) {
    return desc;
  }
  return `A Photostat copy of ${desc}`;
}

export function buildDefaultIndexEntries(result = {}) {
  const rows = [
    {
      slNo: '1',
      particulars: resolveCounterOnBehalfParticulars(result),
      page: '',
      rowType: 'main',
    },
  ];
  const annexures = Array.isArray(result.annexureIndex) ? result.annexureIndex : [];
  annexures.forEach((a, i) => {
    rows.push({
      slNo: String(i + 2),
      particulars: annexureParticularsLabel(a, i),
      page: String(a.pageRange || a.page || '').trim(),
      rowType: 'annexure',
      letter: String(a.letter || a.id || '').trim() || String.fromCharCode(65 + i),
    });
  });
  return rows;
}

export function annexureIndexFromIndexEntries(indexEntries = []) {
  if (!Array.isArray(indexEntries) || indexEntries.length < 2) return [];
  return indexEntries.slice(1).map((row, i) => {
      let description = String(row.particulars || '').trim();
      const letterMatch = description.match(/^Annexure-([A-Za-z0-9]+)\s*:\s*/i);
      const letter = row.letter || (letterMatch ? letterMatch[1] : String.fromCharCode(65 + i));
      if (letterMatch) description = description.slice(letterMatch[0].length).trim();
      if (description.startsWith('A Photostat copy of ')) {
        description = description.slice('A Photostat copy of '.length).trim();
      }
      return {
        letter,
        description,
        pageRange: String(row.page || '').trim(),
        page: String(row.page || '').trim(),
      };
    });
}

export function normalizeIndexState(result = {}) {
  const captionSubject = String(result.captionSubject || 'Counter Affidavit').trim() || 'Counter Affidavit';
  const layout = inferIndexLayout(result);
  let indexEntries =
    Array.isArray(result.indexEntries) && result.indexEntries.length > 0
      ? result.indexEntries.map((row, i) => ({
        slNo: String(row.slNo || i + 1),
        particulars: String(row.particulars || ''),
        page: String(row.page ?? ''),
        rowType: row.rowType || (i === 0 ? 'main' : 'annexure'),
        letter: row.letter,
      }))
      : buildDefaultIndexEntries(result);
  indexEntries = fillIndexEntryPages(indexEntries, result, layout);
  return {
    captionSubject,
    indexEntries,
    annexureIndex: annexureIndexFromIndexEntries(indexEntries),
  };
}
