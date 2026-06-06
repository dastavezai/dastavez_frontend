import * as pdfjsLib from 'pdfjs-dist';

const mul = (m1, m2) => pdfjsLib.Util.transform(m1, m2);
const apply = (m, x, y) => {
  const [a, b, c, d, e, f] = m;
  return { x: a * x + c * y + e, y: b * x + d * y + f };
};

const rgbToHex = (r, g, b) => {
  const to255 = (v) => Math.max(0, Math.min(255, Math.round((v || 0) * 255)));
  return `#${to255(r).toString(16).padStart(2, '0')}${to255(g).toString(16).padStart(2, '0')}${to255(b).toString(16).padStart(2, '0')}`;
};

const buildSvgPathFromOps = (ops, args, ctm) => {
  let i = 0;
  const parts = [];
  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  const addPoint = (x, y) => {
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  };
  const transformPoint = (x, y) => {
    const p = apply(ctm, x, y);
    addPoint(p.x, p.y);
    return p;
  };

  for (const op of ops) {
    switch (op) {
      case pdfjsLib.OPS.moveTo: {
        const p = transformPoint(args[i], args[i + 1]); i += 2;
        parts.push(`M ${p.x} ${p.y}`);
        break;
      }
      case pdfjsLib.OPS.lineTo: {
        const p = transformPoint(args[i], args[i + 1]); i += 2;
        parts.push(`L ${p.x} ${p.y}`);
        break;
      }
      case pdfjsLib.OPS.curveTo: {
        const p1 = transformPoint(args[i], args[i + 1]);
        const p2 = transformPoint(args[i + 2], args[i + 3]);
        const p3 = transformPoint(args[i + 4], args[i + 5]);
        i += 6;
        parts.push(`C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`);
        break;
      }
      case pdfjsLib.OPS.curveTo2: {
        const p2 = transformPoint(args[i], args[i + 1]);
        const p3 = transformPoint(args[i + 2], args[i + 3]);
        i += 4;
        parts.push(`S ${p2.x} ${p2.y} ${p3.x} ${p3.y}`);
        break;
      }
      case pdfjsLib.OPS.curveTo3: {
        const p1 = transformPoint(args[i], args[i + 1]);
        const p3 = transformPoint(args[i + 2], args[i + 3]);
        i += 4;
        parts.push(`Q ${p1.x} ${p1.y} ${p3.x} ${p3.y}`);
        break;
      }
      case pdfjsLib.OPS.closePath:
        parts.push('Z');
        break;
      case pdfjsLib.OPS.rectangle: {
        const x = args[i]; const y = args[i + 1]; const w = args[i + 2]; const h = args[i + 3];
        i += 4;
        const p1 = transformPoint(x, y);
        const p2 = transformPoint(x + w, y);
        const p3 = transformPoint(x + w, y + h);
        const p4 = transformPoint(x, y + h);
        parts.push(`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`);
        break;
      }
      default:
        break;
    }
  }
  if (!parts.length || !Number.isFinite(minX)) return null;
  return {
    svgPath: parts.join(' '),
    bbox: [minX, minY, maxX, maxY],
  };
};

export const extractPageObjects = async (page, viewport, pageNumber = 1) => {
  const opList = await page.getOperatorList();
  const objects = [];
  const scale = Number(viewport?.scale || 1);
  let ctm = [1, 0, 0, 1, 0, 0];
  const stack = [];
  let stroke = '#000000';
  let fill = null;
  let lineWidth = 1;
  let pendingPath = null;

  const finalizePath = (mode) => {
    if (!pendingPath) return;
    const { svgPath, bbox } = pendingPath;
        objects.push({
      id: `path_${pageNumber}_${objects.length}`,
      type: 'path',
      pageNumber,
          scale,
      bbox,
      svgPath,
      stroke: /stroke/.test(mode) ? stroke : null,
      fill: /fill/.test(mode) ? (fill || stroke) : null,
      strokeWidth: lineWidth,
    });
    pendingPath = null;
  };

  for (let i = 0; i < opList.fnArray.length; i += 1) {
    const fn = opList.fnArray[i];
    const args = opList.argsArray[i] || [];

    switch (fn) {
      case pdfjsLib.OPS.save:
        stack.push(ctm);
        break;
      case pdfjsLib.OPS.restore:
        ctm = stack.pop() || ctm;
        break;
      case pdfjsLib.OPS.transform:
        ctm = mul(ctm, args);
        break;
      case pdfjsLib.OPS.setTransform:
        ctm = args;
        break;
      case pdfjsLib.OPS.setLineWidth:
        lineWidth = Number(args[0] || lineWidth);
        break;
      case pdfjsLib.OPS.setStrokeRGBColor:
        stroke = rgbToHex(args[0], args[1], args[2]);
        break;
      case pdfjsLib.OPS.setFillRGBColor:
        fill = rgbToHex(args[0], args[1], args[2]);
        break;
      case pdfjsLib.OPS.constructPath: {
        const [ops, coords] = args;
        const combined = mul(viewport.transform, ctm);
        const built = buildSvgPathFromOps(ops, coords, combined);
        if (built) pendingPath = built;
        break;
      }
      case pdfjsLib.OPS.stroke:
        finalizePath('stroke');
        break;
      case pdfjsLib.OPS.closeStroke:
        finalizePath('stroke');
        break;
      case pdfjsLib.OPS.fill:
      case pdfjsLib.OPS.eoFill:
        finalizePath('fill');
        break;
      case pdfjsLib.OPS.fillStroke:
      case pdfjsLib.OPS.eoFillStroke:
      case pdfjsLib.OPS.closeFillStroke:
      case pdfjsLib.OPS.closeEOFillStroke:
        finalizePath('fillstroke');
        break;
      case pdfjsLib.OPS.paintImageXObject:
      case pdfjsLib.OPS.paintJpegXObject:
      case pdfjsLib.OPS.paintInlineImageXObject: {
        const combined = mul(viewport.transform, ctm);
        // Image bbox from transforming unit square
        const p1 = apply(combined, 0, 0);
        const p2 = apply(combined, 1, 0);
        const p3 = apply(combined, 1, 1);
        const p4 = apply(combined, 0, 1);
        const xs = [p1.x, p2.x, p3.x, p4.x];
        const ys = [p1.y, p2.y, p3.y, p4.y];
        const bbox = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
        let dataUrl = null;
        try {
          const objId = args?.[0];
          const img = objId ? page.objs?.get(objId) : null;
          if (img?.data && img?.width && img?.height) {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            const imageData = ctx.createImageData(img.width, img.height);
            imageData.data.set(img.data);
            ctx.putImageData(imageData, 0, 0);
            dataUrl = canvas.toDataURL('image/png');
          }
        } catch (_) {
          dataUrl = null;
        }
        objects.push({
          id: `img_${pageNumber}_${objects.length}`,
          type: 'image',
          pageNumber,
          scale,
          bbox,
          dataUrl,
        });
        break;
      }
      default:
        break;
    }
  }

  // If a path was built but never finalized, add it as stroke
  finalizePath('stroke');

  // Normalize bbox to viewport coordinate space (already applied ctm)
  return {
    pageNumber,
    width: viewport.width,
    height: viewport.height,
    objects,
  };
};
