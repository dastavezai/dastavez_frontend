/**
 * OnlyOffice Automation API (connector.callCommand + Document Builder)
 * for anchor-accurate citation insertion in the live DOCX.
 */

export function buildAnchorCandidates(anchorText = '') {
  const raw = String(anchorText || '').replace(/\u00a0/g, ' ').trim();
  if (!raw) return [];

  const normalized = raw
    .replace(/^[\s\u2022•·\-*\d.()]+/, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  const chunks = normalized
    .split(/(?:\n+|\.|;|:|\?|!|\u2014|\u2013)/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter((part) => part.length >= 8);

  const candidates = [
    normalized,
    ...chunks,
    normalized.substring(0, 220),
    normalized.substring(0, 160),
    normalized.substring(0, 120),
    normalized.substring(0, 80),
    normalized.substring(0, 60),
  ]
    .map((s) => String(s || '').replace(/\s+/g, ' ').trim())
    .filter((s, idx, arr) => s.length >= 8 && arr.indexOf(s) === idx);

  return candidates;
}

export function mergeAnchorCandidateLists(...lists) {
  const merged = [];
  const seen = new Set();
  for (const list of lists) {
    for (const item of list || []) {
      const v = String(item || '').replace(/\s+/g, ' ').trim();
      if (v.length < 8) continue;
      const key = v.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(v);
    }
  }
  return merged;
}

function parseCommandResult(result) {
  if (result == null) return null;
  if (typeof result === 'object') return result;
  const s = String(result).trim();
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch (_) {
    return { ok: !!s, raw: s };
  }
}

export function callCommandAsync(conn, commandFn, timeoutMs = 12000) {
  return new Promise((resolve) => {
    if (!conn?.callCommand) {
      resolve(null);
      return;
    }
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(parseCommandResult(value));
    };
    try {
      conn.callCommand(commandFn, false, (result) => finish(result));
      setTimeout(() => finish(null), timeoutMs);
    } catch (err) {
      console.warn('[OO-Automation] callCommand failed:', err?.message || err);
      finish(null);
    }
  });
}

function setAscScope(payload) {
  if (typeof window === 'undefined') return;
  window.Asc = window.Asc || {};
  window.Asc.scope = { ...(window.Asc.scope || {}), ...payload };
}

/**
 * Runs inside OnlyOffice (Api / Asc.scope). Must be a plain function — no closures.
 */
export function automationInsertCitationCommand() {
  var anchors = Asc.scope.anchorCandidates || [];
  var citation = String(Asc.scope.citationText || '').trim();
  var mode = String(Asc.scope.insertMode || 'append');

  if (!citation) {
    return JSON.stringify({ ok: false, reason: 'empty_citation' });
  }

  var doc = Api.GetDocument();
  if (!doc || typeof doc.Search !== 'function') {
    return JSON.stringify({ ok: false, reason: 'no_document_api' });
  }

  function insertAfterParagraph(para, text) {
    if (!para) return false;
    var newPara = Api.CreateParagraph();
    newPara.AddText(text);
    if (typeof para.InsertParagraphAfter === 'function') {
      para.InsertParagraphAfter(newPara);
      return true;
    }
    if (typeof para.AddElement === 'function') {
      para.AddElement(newPara);
      return true;
    }
    return false;
  }

  function insertAfterRange(range, text) {
    if (!range) return false;
    try {
      if (typeof range.GetParagraph === 'function') {
        var para = range.GetParagraph();
        if (insertAfterParagraph(para, text)) return true;
      }
    } catch (_) {}

    try {
      if (typeof range.Select === 'function') {
        range.Select();
      }
      var p = Api.CreateParagraph();
      p.AddText(text);
      doc.InsertContent([p], false);
      return true;
    } catch (_) {
      return false;
    }
  }

  for (var i = 0; i < anchors.length; i++) {
    var needle = String(anchors[i] || '').trim();
    if (needle.length < 8) continue;

    var results = null;
    try {
      results = doc.Search(needle, false);
    } catch (_) {
      try {
        results = doc.Search(needle);
      } catch (__) {
        results = null;
      }
    }

    if (!results || !results.length) continue;

    var range = results[0];
    var payload = mode === 'replace' ? citation : '\n' + citation;

    if (mode === 'replace' && typeof range.SetText === 'function') {
      try {
        range.SetText(citation);
        if (typeof range.Select === 'function') range.Select();
        return JSON.stringify({ ok: true, anchor: needle, method: 'replace_range' });
      } catch (_) {}
    }

    if (insertAfterRange(range, payload)) {
      try {
        if (typeof range.Select === 'function') range.Select();
      } catch (_) {}
      return JSON.stringify({ ok: true, anchor: needle, method: 'insert_after_range' });
    }
  }

  return JSON.stringify({ ok: false, reason: 'anchor_not_found' });
}

export function automationJumpToAnchorCommand() {
  var anchors = Asc.scope.anchorCandidates || [];
  var doc = Api.GetDocument();
  if (!doc || typeof doc.Search !== 'function') {
    return JSON.stringify({ ok: false });
  }
  for (var i = 0; i < anchors.length; i++) {
    var needle = String(anchors[i] || '').trim();
    if (needle.length < 8) continue;
    var results = null;
    try {
      results = doc.Search(needle, false);
    } catch (_) {
      try {
        results = doc.Search(needle);
      } catch (__) {
        results = null;
      }
    }
    if (results && results.length && typeof results[0].Select === 'function') {
      results[0].Select();
      return JSON.stringify({ ok: true, anchor: needle });
    }
  }
  return JSON.stringify({ ok: false });
}

export async function automationInsertCitation(conn, citationText, anchorCandidates, mode = 'append') {
  if (!conn?.callCommand) {
    return { inserted: false, anchorUsed: '', method: '', reason: 'no_callCommand' };
  }

  const anchors = mergeAnchorCandidateLists(anchorCandidates);
  const built = buildAnchorCandidates(anchors[0] || '');
  const merged = mergeAnchorCandidateLists(anchors, built);

  if (!merged.length) {
    return { inserted: false, anchorUsed: '', method: '', reason: 'no_anchors' };
  }

  setAscScope({
    anchorCandidates: merged,
    citationText: String(citationText || '').trim(),
    insertMode: mode,
  });

  const result = await callCommandAsync(conn, automationInsertCitationCommand, 15000);
  if (result?.ok) {
    return {
      inserted: true,
      anchorUsed: result.anchor || merged[0],
      method: result.method || 'automation',
      reason: '',
    };
  }

  return {
    inserted: false,
    anchorUsed: '',
    method: '',
    reason: result?.reason || 'automation_failed',
  };
}

export function automationExtractPlainTextCommand() {
  var doc = Api.GetDocument();
  if (!doc) return JSON.stringify({ ok: false, text: '' });

  if (typeof doc.GetText === 'function') {
    try {
      return JSON.stringify({ ok: true, text: String(doc.GetText() || '') });
    } catch (_) {}
  }

  var parts = [];
  try {
    var n = typeof doc.GetElementsCount === 'function' ? doc.GetElementsCount() : 0;
    for (var i = 0; i < n; i++) {
      var el = doc.GetElement(i);
      if (el && typeof el.GetText === 'function') {
        var t = String(el.GetText() || '').trim();
        if (t) parts.push(t);
      }
    }
  } catch (_) {}

  return JSON.stringify({ ok: true, text: parts.join('\n') });
}

export async function automationGetDocumentPlainText(conn) {
  if (!conn?.callCommand) return '';
  setAscScope({});
  const result = await callCommandAsync(conn, automationExtractPlainTextCommand, 10000);
  return result?.ok ? String(result.text || '') : '';
}

export async function automationJumpToAnchor(conn, anchorText) {
  if (!conn?.callCommand) return false;

  const merged = mergeAnchorCandidateLists(
    Array.isArray(anchorText) ? anchorText : [anchorText],
    buildAnchorCandidates(Array.isArray(anchorText) ? anchorText[0] : anchorText)
  );
  if (!merged.length) return false;

  setAscScope({ anchorCandidates: merged });
  const result = await callCommandAsync(conn, automationJumpToAnchorCommand, 8000);
  return !!result?.ok;
}
