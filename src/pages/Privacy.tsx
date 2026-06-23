import React from "react";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export default function Privacy() {
  const sections: LegalSection[] = [
    {
      id: "information-we-collect",
      title: "1. Information We Collect",
      content: (
        <>
          <p>
            We collect information that you directly provide to us and details generated automatically during your use of Dastavez AI. This includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identity & Account Details:</strong> Your name, email address, password, profile details, and account setup choices.</li>
            <li><strong>Uploaded Documents:</strong> Legal drafts, case descriptions, agreements, briefs, or files that you upload for analysis, parsing, and summarization.</li>
            <li><strong>Usage Analytics:</strong> Logs, device specifications, IP addresses, click paths, search history, and telemetry details associated with your interaction with the Platform.</li>
          </ul>
        </>
      ),
    },
    {
      id: "how-we-use-information",
      title: "2. How We Use Information",
      content: (
        <>
          <p>
            We use your personal data and uploaded files strictly to deliver and improve our Services. Specifically:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Service Delivery:</strong> Processing your requests, executing document scans, generating AI analysis, and retrieving case records.</li>
            <li><strong>Platform Improvement:</strong> Enhancing our AI heuristics, system layouts, user flows, search speeds, and accuracy rates.</li>
            <li><strong>Security and Fraud Prevention:</strong> Protecting your account, identifying malicious attempts, preventing scrapers, and verifying authorization.</li>
            <li><strong>Customer Support:</strong> Assisting you with technical questions, subscription management, and user experience adjustments.</li>
            <li><strong>Communication:</strong> Providing system status notifications, newsletter updates (if opted in), and responding to queries.</li>
          </ul>
        </>
      ),
    },
    {
      id: "document-processing",
      title: "3. Document Processing & AI Systems",
      content: (
        <>
          <p className="font-semibold text-red-600 dark:text-yellow-500">
            HOW WE HANDLE YOUR UPLOADED DOCUMENTS:
          </p>
          <p>
            Dastavez AI utilizes state-of-the-art artificial intelligence models. When you upload a document:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>AI Analysis:</strong> Your documents are processed by AI models to summarize structure, identify key clauses, and build legal drafts.</li>
            <li><strong>Confidentiality and Isolation:</strong> Your uploaded documents are isolated in secure sandboxed systems. We do not use your personal legal drafts or confidential agreements to train generic public models.</li>
            <li><strong>Temporary and Secure Caching:</strong> Files are stored in secure cloud systems with access keys restricted strictly to authorized execution contexts.</li>
          </ul>
        </>
      ),
    },
    {
      id: "data-security",
      title: "4. Data Security",
      content: (
        <>
          <p>
            The security of your documents and personal info is our highest priority. We implement robust, enterprise-grade measures:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Encryption:</strong> Data is encrypted both in transit (using HTTPS/TLS 1.3) and at rest (using AES-256 encryption standards).</li>
            <li><strong>Access Controls:</strong> Fine-grained role-based access restricts data lookup to the database layer, accessible only by verified processes.</li>
            <li><strong>Security Monitoring:</strong> Real-time surveillance, threat detection, audit logging, and vulnerability scans of our server infrastructure.</li>
          </ul>
        </>
      ),
    },
    {
      id: "data-retention",
      title: "5. Data Retention & Deletion",
      content: (
        <>
          <p>
            We retain your personal data and documents only for as long as is necessary to provide the Services and as detailed in your subscription settings:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Active Content:</strong> Documents uploaded to your workspace are kept as long as you maintain your account.</li>
            <li><strong>User-Initiated Deletion:</strong> You can delete your uploaded drafts or account at any time. Deleted documents are immediately removed from our active database and purged from backups within standard cycle periods (normally 30 days).</li>
            <li><strong>Legal Obligations:</strong> We may retain logs and transaction details to comply with accounting standards or regional regulations.</li>
          </ul>
        </>
      ),
    },
    {
      id: "third-party-services",
      title: "6. Third-Party Services",
      content: (
        <>
          <p>
            We do not sell your personal data or uploaded documents. We may share information with trusted third-party service providers who assist us:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>AI Inference APIs:</strong> Premium LLM providers and AI pipelines running under strict corporate privacy mandates where data is not used for model training.</li>
            <li><strong>Cloud Infrastructure:</strong> Database and server hosting partners (e.g. AWS, Supabase, Vercel/Netlify) executing under strict data processor contracts.</li>
            <li><strong>Payment Processors:</strong> Gateways managing subscription billing with PCI-DSS compliant credit card handling.</li>
          </ul>
        </>
      ),
    },
    {
      id: "user-rights",
      title: "7. User Rights",
      content: (
        <>
          <p>
            Depending on your jurisdiction, you possess the following rights regarding your data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access Data:</strong> The right to request copies of the personal data and files we store.</li>
            <li><strong>Request Corrections:</strong> The right to update inaccurate details or incomplete profiles.</li>
            <li><strong>Request Deletion:</strong> The right to request that we erase your personal information and documents from our active networks.</li>
            <li><strong>Manage Preferences:</strong> The right to change subscription communications, cookie preferences, and consent controls.</li>
          </ul>
          <p>
            To exercise any of these rights, you can configure your profile directly or contact our support team.
          </p>
        </>
      ),
    },
    {
      id: "cookies-and-analytics",
      title: "8. Cookies & Analytics",
      content: (
        <>
          <p>
            We use cookies, web beacons, and related tracking tools to provide state preservation (keeping you logged in), remember preferences, and gather usage metrics.
          </p>
          <p>
            You can configure your browser to block or alert you about cookies, but some components of the Platform may cease to function correctly if you disable cookies. For details, review our <a href="/cookie-policy" className="text-judicial-gold hover:underline font-semibold">Cookie Policy</a>.
          </p>
        </>
      ),
    },
    {
      id: "policy-updates",
      title: "9. Policy Updates",
      content: (
        <>
          <p>
            We may update our Privacy Policy from time to time to adapt to new legal mandates or modifications in our AI services.
          </p>
          <p>
            We will inform you of updates by updating the "Last Updated" date on this page, and for major changes, we will provide a more prominent banner or email notification.
          </p>
        </>
      ),
    },
    {
      id: "contact-information",
      title: "10. Contact Information",
      content: (
        <>
          <p>
            If you have questions, queries, or complaints regarding how we handle your personal data and documents, please contact us:
          </p>
          <div className="bg-gray-50 dark:bg-judicial-navy/30 border border-gray-100 dark:border-judicial-gold/10 p-6 rounded-xl mt-4">
            <p className="font-semibold text-black dark:text-white">Doclair Dastavez AI Solution Private Limited</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Patna, Bihar, India</p>
            <p className="text-gray-600 dark:text-gray-400">Email: <a href="mailto:info@dastavezai.org" className="text-judicial-gold hover:underline">info@dastavezai.org</a></p>
            <p className="text-gray-600 dark:text-gray-400">Phone: <a href="tel:+918210607476" className="text-judicial-gold hover:underline">+91 8210607476</a></p>
          </div>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Your privacy and data security are important to us."
      lastUpdated="June 19, 2026"
      metaTitle="Privacy Policy"
      metaDescription="Learn about Dastavez AI's Privacy Policy. Understand how we collect, process, secure, and delete your documents and account information."
      sections={sections}
    />
  );
}
