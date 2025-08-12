import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Info } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-judicial-dark">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-judicial-gold/10 mb-6">
            <Info className="h-7 w-7 text-judicial-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-judicial-gold">Dastawez AI Oracle</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Dastawez AI Oracle is an advanced legal assistant designed to empower legal professionals, students, and the public with instant access to legal knowledge. Our mission is to make legal information more accessible, understandable, and actionable for everyone.
          </p>
        </div>
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-judicial-gold mb-4">Our Vision</h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            We envision a world where legal expertise is at your fingertips. By leveraging state-of-the-art AI and vast legal databases, we aim to bridge the gap between complex legal language and everyday understanding.
          </p>
        </section>
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-judicial-gold mb-4">What We Offer</h2>
          <ul className="text-gray-300 max-w-3xl mx-auto list-disc list-inside space-y-2">
            <li>
              <span className="font-semibold text-white">Instant Legal Answers:</span> Get quick, reliable responses to your legal questions.
            </li>
            <li>
              <span className="font-semibold text-white">Case Analysis:</span> Analyze legal cases and receive AI-powered insights.
            </li>
            <li>
              <span className="font-semibold text-white">Accessible to All:</span> Whether you are a lawyer, student, or curious citizen, our platform is designed for you.
            </li>
            <li>
              <span className="font-semibold text-white">Secure & Confidential:</span> Your queries and data are handled with utmost privacy and security.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-judicial-gold mb-4">Meet the Team</h2>
          <p className="text-gray-300 max-w-3xl mx-auto mb-2">
            Dastawez AI Oracle is built by a passionate team of legal experts, AI engineers, and designers committed to transforming the way people interact with the law.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;