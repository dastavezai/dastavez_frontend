import React from "react";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export default function CookiePolicy() {
  const sections: LegalSection[] = [
    {
      id: "types-of-cookies",
      title: "1. Types of Cookies Used",
      content: (
        <>
          <p>
            Cookies are small text files stored on your computer or mobile device when you visit websites. We use cookies to enable core features, remember settings, and analyze site performance. The categories of cookies we use are:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential / Strictly Necessary Cookies:</strong> These cookies are critical for the Platform to operate. They enable basic functions like page routing, access to secure account zones, session preservation, and safety controls. The website cannot function correctly without them, and they cannot be disabled in our system.</li>
            <li><strong>Preference / Functional Cookies:</strong> These cookies enable the Platform to remember choices you make (such as your theme choice, username, or regional defaults) to provide a more personalized, premium experience.</li>
            <li><strong>Performance / Analytical Cookies:</strong> These cookies collect aggregated information about how users interact with our website, which pages are visited most, and if any errors occur. This helps us optimize site performance.</li>
            <li><strong>Marketing Cookies:</strong> These cookies track user navigation trends to help us deliver relevant promotions or optimize demo-booking campaigns.</li>
          </ul>
        </>
      ),
    },
    {
      id: "analytics-usage",
      title: "2. Analytics Usage",
      content: (
        <>
          <p>
            We utilize third-party analytics services (such as Google Analytics or self-hosted telemetry tools) to gather metrics and understand site traffic. These tools help us see:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Which features or legal draft cards are clicked most frequently.</li>
            <li>Average reading speeds and interaction durations on our pages.</li>
            <li>Browser and device configurations used by visitors to optimize layouts.</li>
          </ul>
          <p>
            This data is anonymized and aggregated before review. We use it solely to improve our user interface, speed up loading times, and enhance our services.
          </p>
        </>
      ),
    },
    {
      id: "cookie-management",
      title: "3. Cookie Management",
      content: (
        <>
          <p>
            You have the right to choose whether to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline them if you prefer.
          </p>
          <p>
            Please note that if you choose to reject cookies, some features of the Dastavez AI website (such as staying logged in or loading persistent theme settings) may be degraded or become completely unavailable.
          </p>
          <p>
            To manage cookie controls in your browser, search for "Cookies" in your browser's Help menu or visit:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-judicial-gold hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-judicial-gold hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/sfri11471" target="_blank" rel="noopener noreferrer" className="text-judicial-gold hover:underline">Apple Safari</a></li>
            <li><a href="https://support.microsoft.com/microsoft-edge/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-judicial-gold hover:underline">Microsoft Edge</a></li>
          </ul>
        </>
      ),
    },
    {
      id: "user-consent",
      title: "4. User Consent Information",
      content: (
        <>
          <p>
            When you visit our site for the first time, you may be presented with a cookie informational notice or banner. By continuing to navigate our Platform, you consent to our use of cookies as detailed in this policy.
          </p>
          <p>
            If you wish to withdraw or modify your consent, you can clear your browser's cookies and cache. Upon reloading the page, you will be prompted again to confirm your cookie configurations.
          </p>
        </>
      ),
    },
    {
      id: "contact-information",
      title: "5. Contact Information",
      content: (
        <>
          <p>
            If you have any questions or concerns regarding our use of cookies or analytical data, please reach out to us:
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
      title="Cookie Policy"
      subtitle="This Cookie Policy explains how and why we use cookies to improve your Dastavez AI experience."
      lastUpdated="June 19, 2026"
      metaTitle="Cookie Policy"
      metaDescription="Read Dastavez AI's Cookie Policy. Learn about the types of cookies we use, our analytics usage, and how you can manage cookie settings."
      sections={sections}
    />
  );
}
