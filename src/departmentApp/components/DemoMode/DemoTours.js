/**
 * Tour step definitions for the interactive demo/guide system.
 * Each tour has: title, description, and an array of joyride steps.
 * Steps use data-tour="xxx" attributes added to components.
 */

export const TOURS = {
  upload: {
    title: 'Upload & Scan',
    description: 'Learn how to upload documents and understand the AI scan process.',
    context: 'upload',
    steps: [
      {
        target: '[data-tour="upload-dropzone"]',
        title: 'Upload Your Document',
        content: 'Drag and drop a legal document here, or click to browse. Supported formats: PDF, DOCX, DOC, RTF, TXT, and images (JPG, PNG — OCR will extract text).',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="open-editor-btn"]',
        title: 'Open in Editor',
        content: 'After the AI scan completes, click here to open your document in the full editor. If fields are detected, you\'ll first see a modal to review and edit them.',
        placement: 'top',
      },
    ],
  },

  editor: {
    title: 'Document Editor',
    description: 'Master the editor — formatting, AI assistant, analysis, and export.',
    context: 'editor',
    steps: [
      {
        target: '[data-tour="editor-toolbar"]',
        title: 'Formatting Toolbar',
        content: 'Bold, italic, headings, alignment, lists, and more. The toolbar adapts to your document type with relevant formatting options.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="sidebar-toggle-analysis"]',
        title: 'Analysis Panel',
        content: 'Toggle the AI analysis panel. It shows document health, precedent cases, compliance issues, statute references, and more — all generated from your document.',
        placement: 'right',
      },
      {
        target: '[data-tour="download-menu"]',
        title: 'Download Options',
        content: 'Export your document as DOCX or PDF. You can also download an audit trail of all AI-suggested changes. The download preserves your document\'s original formatting.',
        placement: 'bottom',
      },
      {
        target: '.tiptap-editor',
        title: 'Document Editor',
        content: 'Edit your document directly. Select text to get AI suggestions, or use the AI assistant panel for questions about your document. All changes are tracked and can be undone.',
        placement: 'left',
      },
    ],
  },

  analysis: {
    title: 'Analysis Dashboard',
    description: 'Understand each analysis tab and how to use AI insights.',
    context: 'editor',
    steps: [
      {
        target: '[data-tour="analysis-tablist"]',
        title: 'Analysis Tabs',
        content: 'Each tab shows a different aspect of your document\'s AI analysis. Badges show the number of items found. Tabs with 0 items are dimmed.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="tab-overview"]',
        title: 'Overview Tab',
        content: 'Shows document type, extracted parties, document health score, and a summary of all findings across categories.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="tab-precedences"]',
        title: 'Cases & Precedents',
        content: 'Shows court cases cited in your document. Case citations are verified against the document text. Click "AI Discover" to find additional relevant landmark cases.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="tab-compliance"]',
        title: 'Compliance & Statutes',
        content: 'Three sub-tabs: Issues (compliance violations), Missing (expected clauses not found), and Statutes (laws referenced in your document with section analysis).',
        placement: 'bottom',
      },
      {
        target: '[data-tour="tab-clauses"]',
        title: 'Clause Flaws',
        content: 'Individual clauses with issues — vague language, contradictions, or legally problematic phrasing. Each includes a suggested fix you can apply with one click.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="tab-issues"]',
        title: 'Issues Tab',
        content: 'Chronological inconsistencies, outdated law references (e.g. IPC → BNS), and internal contradictions found within your document.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="tab-caseSearch"]',
        title: 'Case Search',
        content: 'Search Indian Kanoon and SCC Online for case law. Results include citations, headnotes, and direct links to the full judgments.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="tab-arguments"]',
        title: 'Arguments Generator',
        content: 'AI generates legal arguments for and against based on your document. Useful for drafting rebuttals or strengthening your position.',
        placement: 'bottom',
      },
    ],
  },
};
