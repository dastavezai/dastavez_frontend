// client/src/components/StatementOfFacts.jsx
//
// Renders the AI-generated Statement of Facts when the user clicks "See SOF".
// Wire-up: find your "See SOF" button in DocumentViewer.jsx and connect it to this component.
//
// STEP 1 — Import at top of DocumentViewer.jsx:
//   import StatementOfFacts from './StatementOfFacts';
//
// STEP 2 — Add state in DocumentViewer.jsx:
//   const [sofData, setSofData] = useState(null);
//   const [sofLoading, setSofLoading] = useState(false);
//   const [showSOF, setShowSOF] = useState(false);
//
// STEP 3 — Replace your existing "See SOF" button with:
//   <button onClick={() => handleGenerateSOF()}>See SOF</button>
//
// STEP 4 — Add the handler function in DocumentViewer.jsx:
//   const handleGenerateSOF = async () => {
//     setShowSOF(true);
//     setSofLoading(true);
//     try {
//       const res = await axios.post(
//         `${API_URL}/api/files/edit/sof`,
//         { sessionId: currentSessionId },   // or pass text directly
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
//       setSofData(res.data.sof);
//     } catch (err) {
//       setSofData({ error: err.response?.data?.message || 'SOF generation failed' });
//     } finally {
//       setSofLoading(false);
//     }
//   };
//
// STEP 5 — Render in sidebar JSX (below DocumentSummary, above Smart Scan):
//   {showSOF && (
//     <StatementOfFacts
//       sof={sofData}
//       isLoading={sofLoading}
//       onClose={() => setShowSOF(false)}
//     />
//   )}

import { useState } from "react";

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SOFSkeleton() {
  const bar = (w, h = 10, mb = 8) => (
    <div style={{
      width: w, height: h,
      background: "var(--color-background-secondary)",
      borderRadius: 5, marginBottom: mb,
      animation: "sofPulse 1.4s ease-in-out infinite",
    }} />
  );
  return (
    <div>
      <style>{`@keyframes sofPulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      {bar("55%", 16, 14)}
      {bar("80%")} {bar("70%")} {bar("90%", 10, 20)}
      {bar("45%", 13, 10)}
      {bar("95%")} {bar("85%")} {bar("78%")} {bar("88%")}
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────
function Section({ title, icon, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: 6, background: "none", border: "none", cursor: "pointer",
          padding: "8px 0", textAlign: "left",
          borderBottom: "1px solid var(--color-border-tertiary)",
          marginBottom: open ? 10 : 0,
        }}
      >
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)", flex: 1 }}>
          {title}
        </span>
        {count !== undefined && (
          <span style={{
            fontSize: 10, background: "var(--color-background-secondary)",
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: 8, padding: "1px 6px",
            color: "var(--color-text-secondary)",
          }}>
            {count}
          </span>
        )}
        <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && children}
    </div>
  );
}

// ─── Paragraph fact row ───────────────────────────────────────────────────────
function FactPara({ number, fact }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
      <span style={{
        fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary)",
        minWidth: 22, paddingTop: 1,
      }}>
        {number}.
      </span>
      <p style={{
        fontSize: 12, color: "var(--color-text-primary)",
        lineHeight: 1.65, margin: 0,
      }}>
        {fact}
      </p>
    </div>
  );
}

// ─── Chronology row ───────────────────────────────────────────────────────────
function ChronRow({ date, event }) {
  return (
    <div style={{
      display: "flex", gap: 10, marginBottom: 10,
      paddingBottom: 10, borderBottom: "1px solid var(--color-border-tertiary)",
    }}>
      <span style={{
        fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)",
        minWidth: 80, flexShrink: 0, paddingTop: 1,
      }}>
        {date}
      </span>
      <span style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.55 }}>
        {event}
      </span>
    </div>
  );
}

// ─── Simple list ──────────────────────────────────────────────────────────────
function BulletList({ items, color = "var(--color-text-secondary)" }) {
  if (!items?.length) return (
    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic" }}>
      None identified
    </p>
  );
  return (
    <ul style={{ margin: 0, paddingLeft: 16 }}>
      {items.map((item, i) => (
        <li key={i} style={{
          fontSize: 12, color: "var(--color-text-primary)",
          lineHeight: 1.6, marginBottom: 6, color,
        }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function StatementOfFacts({ sof, isLoading = false, onClose }) {

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!sof) return;
    const text = buildPlainText(sof);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    const text = buildPlainText(sof);
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>${sof?.title || 'Statement of Facts'}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.8; margin: 60px; color: #000; }
        h1 { font-size: 16px; text-align: center; text-transform: uppercase; }
        h2 { font-size: 14px; text-decoration: underline; margin-top: 24px; }
        p { margin: 8px 0; text-align: justify; }
        .para-num { font-weight: bold; }
        .verification { margin-top: 40px; font-style: italic; border-top: 1px solid #000; padding-top: 12px; }
      </style></head><body>
      <pre style="font-family:inherit;white-space:pre-wrap">${text}</pre>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  // ── Container styles ────────────────────────────────────────────────────────
  const container = {
    background: "var(--color-background-primary)",
    border: "1px solid var(--color-border-tertiary)",
    borderRadius: 10,
    padding: "14px 16px",
    marginBottom: 16,
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={container}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>
          Generating Statement of Facts...
        </div>
        <SOFSkeleton />
      </div>
    );
  }

  // ── No data ─────────────────────────────────────────────────────────────────
  if (!sof) return null;

  // ── Error ───────────────────────────────────────────────────────────────────
  if (sof.error && !sof.title?.includes('Facts')) {
    return (
      <div style={{ ...container, borderColor: "#FCA5A5", background: "#FEF2F2" }}>
        <div style={{ fontSize: 13, color: "#991B1B", fontWeight: 600, marginBottom: 4 }}>
          SOF generation failed
        </div>
        <div style={{ fontSize: 12, color: "#B91C1C" }}>{sof.error}</div>
        {onClose && (
          <button onClick={onClose} style={{ marginTop: 10, fontSize: 12, color: "#991B1B", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            Dismiss
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={container}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            Statement of Facts
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.4 }}>
            {sof.title}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 8 }}>
          <button onClick={handleCopy} style={{ fontSize: 11, padding: "3px 8px", border: "1px solid var(--color-border-tertiary)", borderRadius: 5, background: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}>
            {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={handlePrint} style={{ fontSize: 11, padding: "3px 8px", border: "1px solid var(--color-border-tertiary)", borderRadius: 5, background: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}>
            Print
          </button>
          {onClose && (
            <button onClick={onClose} style={{ fontSize: 11, padding: "3px 8px", border: "none", borderRadius: 5, background: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Meta info ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14, fontSize: 12 }}>
        {[
          ["Case ref", sof.caseReference],
          ["Court", sof.court],
          ["Prepared for", sof.preparedFor],
          ["Date", sof.dateOfDocument],
        ].filter(([, v]) => v && v !== "Not specified").map(([label, value]) => (
          <div key={label}>
            <span style={{ color: "var(--color-text-secondary)" }}>{label}: </span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Parties ────────────────────────────────────────────────────────── */}
      {sof.parties?.length > 0 && (
        <Section icon="👥" title="Parties" count={sof.parties.length} defaultOpen={true}>
          {sof.parties.map((p, i) => (
            <div key={i} style={{ marginBottom: 8, paddingLeft: 8, borderLeft: "2px solid var(--color-border-tertiary)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)" }}>
                {p.designation}: {p.name}
              </div>
              {p.description && (
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
                  {p.description}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ── Background facts (numbered paragraphs) ─────────────────────────── */}
      {sof.backgroundFacts?.length > 0 && (
        <Section icon="📋" title="Statement of Facts" count={sof.backgroundFacts.length} defaultOpen={true}>
          {sof.backgroundFacts.map((f) => (
            <FactPara key={f.paraNumber} number={f.paraNumber} fact={f.fact} />
          ))}
        </Section>
      )}

      {/* ── Chronology ─────────────────────────────────────────────────────── */}
      {sof.chronology?.length > 0 && (
        <Section icon="📅" title="Chronology of Events" count={sof.chronology.length} defaultOpen={false}>
          {sof.chronology.map((c, i) => (
            <ChronRow key={i} date={c.date} event={c.event} />
          ))}
        </Section>
      )}

      {/* ── Documents relied upon ──────────────────────────────────────────── */}
      {sof.documentsReliedUpon?.length > 0 && (
        <Section icon="📎" title="Documents Relied Upon" count={sof.documentsReliedUpon.length} defaultOpen={false}>
          <BulletList items={sof.documentsReliedUpon} />
        </Section>
      )}

      {/* ── Admitted facts ─────────────────────────────────────────────────── */}
      {sof.admittedFacts?.length > 0 && (
        <Section icon="✅" title="Admitted Facts" count={sof.admittedFacts.length} defaultOpen={false}>
          <BulletList items={sof.admittedFacts} color="var(--color-text-success, #166534)" />
        </Section>
      )}

      {/* ── Disputed facts ─────────────────────────────────────────────────── */}
      {sof.disputedFacts?.length > 0 && (
        <Section icon="⚔️" title="Disputed Facts" count={sof.disputedFacts.length} defaultOpen={false}>
          <BulletList items={sof.disputedFacts} color="var(--color-text-danger, #991B1B)" />
        </Section>
      )}

      {/* ── Legal issues arising ───────────────────────────────────────────── */}
      {sof.legalIssuesArising?.length > 0 && (
        <Section icon="⚖️" title="Legal Issues Arising" count={sof.legalIssuesArising.length} defaultOpen={true}>
          {sof.legalIssuesArising.map((issue, i) => (
            <div key={i} style={{
              fontSize: 12, color: "var(--color-text-primary)",
              lineHeight: 1.6, marginBottom: 8,
              paddingLeft: 10, borderLeft: "2px solid #7C3AED",
            }}>
              {i + 1}. {issue}
            </div>
          ))}
        </Section>
      )}

      {/* ── Relief sought ──────────────────────────────────────────────────── */}
      {sof.reliefSought && sof.reliefSought !== "Not determinable from document alone" && (
        <div style={{
          background: "var(--color-background-secondary)",
          border: "1px solid var(--color-border-tertiary)",
          borderRadius: 8, padding: "10px 12px", marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 }}>
            Relief Sought
          </div>
          <p style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.6, margin: 0 }}>
            {sof.reliefSought}
          </p>
        </div>
      )}

      {/* ── Verification clause ────────────────────────────────────────────── */}
      {sof.verification && (
        <div style={{
          background: "var(--color-background-secondary)",
          borderTop: "1px solid var(--color-border-tertiary)",
          padding: "10px 12px", borderRadius: "0 0 8px 8px", marginTop: 4,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 }}>
            Verification
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
            {sof.verification}
          </p>
        </div>
      )}

      {/* ── Generation meta ────────────────────────────────────────────────── */}
      {sof.generationTimeSeconds > 0 && (
        <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 10, textAlign: "right" }}>
          Generated in {sof.generationTimeSeconds}s
        </div>
      )}

    </div>
  );
}

// ─── Plain text export ────────────────────────────────────────────────────────
function buildPlainText(sof) {
  const lines = [];
  lines.push(sof.title?.toUpperCase() || 'STATEMENT OF FACTS');
  lines.push('');

  if (sof.caseReference !== 'Not specified') lines.push(`Case Reference: ${sof.caseReference}`);
  if (sof.court !== 'Not specified') lines.push(`Court: ${sof.court}`);
  if (sof.dateOfDocument !== 'Not specified') lines.push(`Date: ${sof.dateOfDocument}`);
  lines.push('');

  if (sof.parties?.length) {
    lines.push('PARTIES');
    sof.parties.forEach(p => lines.push(`  ${p.designation}: ${p.name}\n  ${p.description}`));
    lines.push('');
  }

  if (sof.backgroundFacts?.length) {
    lines.push('STATEMENT OF FACTS');
    sof.backgroundFacts.forEach(f => lines.push(`${f.paraNumber}. ${f.fact}`));
    lines.push('');
  }

  if (sof.chronology?.length) {
    lines.push('CHRONOLOGY');
    sof.chronology.forEach(c => lines.push(`  ${c.date}: ${c.event}`));
    lines.push('');
  }

  if (sof.legalIssuesArising?.length) {
    lines.push('LEGAL ISSUES ARISING');
    sof.legalIssuesArising.forEach((issue, i) => lines.push(`  ${i + 1}. ${issue}`));
    lines.push('');
  }

  if (sof.reliefSought) {
    lines.push('RELIEF SOUGHT');
    lines.push(sof.reliefSought);
    lines.push('');
  }

  if (sof.verification) {
    lines.push('VERIFICATION');
    lines.push(sof.verification);
  }

  lines.push(`\nGenerated by Dastavezai on ${new Date(sof.generatedAt).toLocaleString('en-IN')}`);
  return lines.join('\n');
}
