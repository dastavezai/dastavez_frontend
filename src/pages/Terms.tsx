import React from "react";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export default function Terms() {
  const sections: LegalSection[] = [
    {
      id: "acceptance-of-terms",
      title: "1. Acceptance of Terms",
      content: (
        <>
          <p>
            By accessing or using Dastavez AI (the "Platform" or "Service"), operated by Doclair Dastavez AI Solution Private Limited ("we", "us", or "our"), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not access or use our Service.
          </p>
          <p>
            These Terms & Conditions constitute a legally binding agreement between you, whether personally or on behalf of an entity, and us, concerning your access to and use of the website and related applications.
          </p>
        </>
      ),
    },
    {
      id: "description-of-services",
      title: "2. Description of Services",
      content: (
        <>
          <p>
            Dastavez AI is a cutting-edge legal technology platform designed to streamline legal workflows. The Service includes, but is not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>AI-Powered Document Analysis:</strong> Intelligent scanning and structural parsing of legal agreements.</li>
            <li><strong>Legal Research Assistance:</strong> Contextual queries and search tools mapped to regional statutes and case law.</li>
            <li><strong>Document Summarization:</strong> Briefings, outlines, and summaries of long-form legal documents.</li>
            <li><strong>Workflow Automation:</strong> Task sequencing and templates for legal draft compilation.</li>
            <li><strong>Other Legal Technology Tools:</strong> Interactive query models, AI legal chats, and verification modules.</li>
          </ul>
          <p>
            We continuously innovate to provide the best possible experience. You acknowledge and agree that the form, nature, and features of the Services may change or evolve over time without prior notice.
          </p>
        </>
      ),
    },
    {
      id: "user-responsibilities",
      title: "3. User Responsibilities",
      content: (
        <>
          <p>
            To maintain a secure and compliant platform, you agree to fulfill the following obligations:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Lawful Content:</strong> You represent and warrant that any content, drafts, or information you upload to the Platform is lawful and does not violate third-party intellectual property or privacy rights.</li>
            <li><strong>No Misuse:</strong> You agree not to misuse the Platform, including but not limited to introducing viruses, scraping content, or executing automated attacks.</li>
            <li><strong>No Unauthorized Access:</strong> You must not attempt to gain unauthorized access to any parts of the Service, server infrastructure, or user accounts.</li>
            <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials and are fully responsible for all activities that occur under your account.</li>
          </ul>
        </>
      ),
    },
    {
      id: "intellectual-property",
      title: "4. Intellectual Property",
      content: (
        <>
          <p>
            The Platform and its entire contents, features, and functionality (including but not limited to all information, software, code, text, displays, images, video, audio, and the design, selection, and arrangement thereof) are owned by us, our licensors, or other providers of such material and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>
          <p>
            The Dastavez AI branding, logos, and service names are trademarks of Doclair Dastavez AI Solution Private Limited. You must not use such marks without our prior written permission. All AI-generated platform features, models, heuristics, and software components remain the exclusive intellectual property of the company.
          </p>
        </>
      ),
    },
    {
      id: "limitation-of-liability",
      title: "5. Limitation of Liability",
      content: (
        <>
          <p>
            To the maximum extent permitted by law, Doclair Dastavez AI Solution Private Limited, its directors, employees, or partners, shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your use of, or inability to use, the Platform or Service.</li>
            <li>Any temporary or permanent service interruptions or errors.</li>
            <li>Third-party integrations, links, or services accessible through our Platform.</li>
            <li>User-generated content or submissions uploaded to the Service.</li>
          </ul>
        </>
      ),
    },
    {
      id: "account-termination",
      title: "6. Account Termination",
      content: (
        <>
          <p>
            We reserve the right, without notice and in our sole discretion, to terminate or suspend your account and access to the Services. Circumstances that may lead to termination include, but are not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Breaches or violations of these Terms & Conditions or other incorporated policies.</li>
            <li>Request by law enforcement or governmental agencies.</li>
            <li>Unexpected technical or security issues.</li>
            <li>Non-payment of subscription fees or other financial obligations.</li>
            <li>Engagement in fraudulent, illegal, or abusive activities.</li>
          </ul>
        </>
      ),
    },
    {
      id: "changes-to-terms",
      title: "7. Changes to Terms",
      content: (
        <>
          <p>
            We may revise and update these Terms & Conditions from time to time in our sole discretion. All changes are effective immediately when posted and apply to all access and use of the Platform thereafter.
          </p>
          <p>
            Your continued use of the Platform following the posting of revised Terms & Conditions means that you accept and agree to the changes. You are expected to check this page periodically to remain informed of any updates.
          </p>
        </>
      ),
    },
    {
      id: "contact-information",
      title: "8. Contact Information",
      content: (
        <>
          <p>
            If you have any questions, concerns, or feedback regarding these Terms & Conditions, please reach out to us:
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
      title="Terms & Conditions"
      subtitle="Please read these Terms & Conditions carefully before using Dastavez AI services."
      lastUpdated="June 19, 2026"
      metaTitle="Terms & Conditions"
      metaDescription="Read Dastavez AI's Terms & Conditions carefully. Learn about your responsibilities, service availability, AI disclaimer, and limitation of liability."
      sections={sections}
    />
  );
}
