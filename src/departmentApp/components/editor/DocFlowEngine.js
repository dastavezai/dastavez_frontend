export const buildDocFlow = (pages = [], opts = {}) => {
  const minGapPx = Number(opts.minGapPx || 2);
  const pageHeights = pages.map((p) => Number(p?.height || 1123));

  // Build cumulative offsets for existing pages
  const pageOffsets = [];
  let totalHeight = 0;
  for (let i = 0; i < pageHeights.length; i += 1) {
    pageOffsets.push(totalHeight);
    totalHeight += pageHeights[i];
  }

  const tableGroups = new Map();
  const items = [];

  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i];
    const pageNumber = Number(page?.pageNumber || i + 1);
    const pageOffset = pageOffsets[i] || 0;
    const blocks = Array.isArray(page?.overlayBlocks) ? page.overlayBlocks : [];

    for (const b of blocks) {
      if (!b?.blockKey) continue;
      if (b?.type === 'tableCell' && b?.table?.tableId) {
        const tId = `${pageNumber}:${b.table.tableId}`;
        if (!tableGroups.has(tId)) tableGroups.set(tId, []);
        tableGroups.get(tId).push(b);
        continue;
      }

      // Skip headers/footers from flow re-positioning
      const role = String(b?.role || '');
      if (role === 'pageHeader' || role === 'pageFooter') continue;

      const height = Number(b?.computedHeight || b?.height || 18);
      const fontSize = Number(b?.style?.fontSize || 11);
      items.push({
        kind: 'text',
        blockKey: b.blockKey,
        pageNumber,
        globalY: pageOffset + Number(b?.baseY || 0),
        baseX: Number(b?.baseX || 0),
        height,
        fontSize,
      });
    }
  }

  // Add tables as grouped blocks
  for (const [tId, cells] of tableGroups.entries()) {
    if (!cells.length) continue;
    const xs = cells.map((c) => Number(c.baseX || 0));
    const ys = cells.map((c) => Number(c.baseY || 0));
    const rights = cells.map((c) => Number(c.baseX || 0) + Number(c.width || 0));
    const bottoms = cells.map((c) => Number(c.baseY || 0) + Number(c.height || 0));
    const pageNumber = Number(cells[0]?.pageNumber || 1);
    const pageIndex = Math.max(0, pageNumber - 1);
    const pageOffset = pageOffsets[pageIndex] || 0;
    const x1 = Math.min(...xs);
    const y1 = Math.min(...ys);
    const x2 = Math.max(...rights);
    const y2 = Math.max(...bottoms);
    items.push({
      kind: 'table',
      tableId: tId,
      pageNumber,
      globalY: pageOffset + y1,
      baseX: x1,
      height: Math.max(10, y2 - y1),
      fontSize: 11,
    });
  }

  // Sort by globalY, then X
  items.sort((a, b) => (a.globalY - b.globalY) || (a.baseX - b.baseX));

  const flowMap = new Map(); // blockKey -> { pageNumber, y }
  const tableFlow = new Map(); // tableId -> { pageNumber, yShift }

  let cursorY = 0;
  for (const item of items) {
    const gap = Math.max(minGapPx, Number(item.fontSize || 11) * 0.2);
    const desiredY = Math.max(item.globalY, cursorY + gap);
    const flowY = desiredY;
    cursorY = flowY + item.height;

    // Map to page based on cumulative offsets (extend pages if needed)
    while (flowY >= totalHeight) {
      const lastHeight = pageHeights.length > 0 ? pageHeights[pageHeights.length - 1] : 1123;
      pageOffsets.push(totalHeight);
      pageHeights.push(lastHeight);
      totalHeight += lastHeight;
    }
    let pageIdx = 0;
    for (let i = 0; i < pageOffsets.length; i += 1) {
      const start = pageOffsets[i];
      const end = start + pageHeights[i];
      if (flowY >= start && flowY < end) { pageIdx = i; break; }
    }
    const localY = flowY - pageOffsets[pageIdx];
    const pageNumber = pageIdx + 1;

    if (item.kind === 'text') {
      flowMap.set(item.blockKey, { pageNumber, y: localY });
    } else if (item.kind === 'table') {
      const shift = localY - (item.globalY - (pageOffsets[item.pageNumber - 1] || 0));
      tableFlow.set(item.tableId, { pageNumber, yShift: shift });
    }
  }

  return { flowMap, tableFlow, pageHeights, pageOffsets };
};
