import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Info } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-judicial-dark transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-judicial-gold/10 mb-6">
            <Info className="h-7 w-7 text-judicial-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-black dark:text-white">About</span> <span className="text-judicial-gold">Dastavez AI Oracle</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Dastavez AI Oracle is an advanced legal assistant designed to empower legal professionals, students, and the public with instant access to legal knowledge. Our mission is to make legal information more accessible, understandable, and actionable for everyone.
          </p>
        </div>
        <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
          <h2 className="text-2xl font-semibold text-judicial-gold md:col-span-1">Our Vision</h2>
          <div className="md:col-span-2">
            <p className="text-gray-700 dark:text-gray-300">
              We envision a world where legal expertise is at your fingertips. By leveraging state-of-the-art AI and vast legal databases, we aim to bridge the gap between complex legal language and everyday understanding.
            </p>
          </div>
        </section>

        <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
          <h2 className="text-2xl font-semibold text-judicial-gold md:col-span-1">What We Offer</h2>
          <div className="md:col-span-2">
            <ul className="text-gray-700 dark:text-gray-300 space-y-3 list-disc list-outside pl-5">
              <li>
                <span className="font-semibold text-black dark:text-white">Instant Legal Answers:</span> Get quick, reliable responses to your legal questions.
              </li>
              <li>
                <span className="font-semibold text-black dark:text-white">Case Analysis:</span> Analyze legal cases and receive AI-powered insights.
              </li>
              <li>
                <span className="font-semibold text-black dark:text-white">Accessible to All:</span> Whether you are a lawyer, student, or curious citizen, our platform is designed for you.
              </li>
              <li>
                <span className="font-semibold text-black dark:text-white">Secure & Confidential:</span> Your queries and data are handled with utmost privacy and security.
              </li>
            </ul>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
          <h2 className="text-2xl font-semibold text-judicial-gold md:col-span-1">Meet the Teams</h2>
          <div className="md:col-span-2">
            <p className="text-gray-700 dark:text-gray-300">
              Dastavez AI Oracle is built by a passionate team of legal experts, AI engineers, and designers committed to transforming the way people interact with the law.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;