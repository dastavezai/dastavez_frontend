import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, MessageCircle, Clock } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";

const Contact = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      console.log("Form submitted:", formData);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "Send us an email and we'll respond within 24 hours",
      links: [
        { label: "support@dastavezai.org", href: "mailto:support@dastavezai.org" },
        { label: "info@dastavezai.org", href: "mailto:info@dastavezai.org" },
      ],
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Call us during business hours for immediate assistance",
      links: [
        { label: "+1 (555) 123-4567", href: "tel:+15551234567" },
        { label: "+1 (555) 987-6543", href: "tel:+15559876543" },
      ],
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      links: [
        { label: "Start Live Chat", href: "#chat", action: true },
      ],
    },
  ];

  const socialLinks = [
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-judicial-dark' : 'bg-white'} transition-colors duration-300`}>
      <Navbar />

      {/* Hero Section */}
      <section className={`${theme === 'dark' ? 'bg-judicial-dark' : 'bg-gradient-to-br from-slate-50 to-slate-100'} py-16 transition-colors duration-300`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-judicial-gold/10 mb-6">
              <Mail className="h-7 w-7 text-judicial-gold" />
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Get in <span className="text-judicial-gold">Touch</span>
            </h1>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Have questions about Dastavez AI? We're here to help. Choose your preferred way to contact us.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Methods Cards */}
          {contactMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${
                  theme === 'dark'
                    ? 'border-judicial-gold/20 bg-slate-900/50 hover:border-judicial-gold hover:bg-slate-900'
                    : 'border-gray-200 bg-white hover:border-judicial-gold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-judicial-gold/10">
                    <IconComponent className="h-6 w-6 text-judicial-gold" />
                  </div>
                  <h3 className={`text-xl font-semibold ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {method.title}
                  </h3>
                </div>
                <p className={`mb-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {method.description}
                </p>
                <div className="space-y-2">
                  {method.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.href}
                      className={`block text-judicial-gold hover:underline font-medium transition-colors ${
                        theme === 'dark' ? 'hover:text-judicial-gold/80' : 'hover:text-judicial-gold'
                      }`}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div>
            <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className={`focus:outline-none focus:ring-2 focus:ring-judicial-gold ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className={`focus:outline-none focus:ring-2 focus:ring-judicial-gold ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone (Optional)
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className={` w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-judicial-gold ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Subject
                  </label>
                  <select
                    name="subject" 
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={` w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-judicial-gold ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">Select a subject</option>
                    <option value="support">Customer Support</option>
                    <option value="sales">Sales Inquiry</option>
                    <option value="technical">Technical Issue</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  required
                  rows={6}
                  className={`focus:outline-none focus:ring-2 focus:ring-judicial-gold ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-judicial-gold hover:bg-judicial-gold/90 text-black font-semibold py-3 rounded-lg transition-all duration-300"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Office Location */}
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Office Location
              </h2>
              <div className={`p-6 rounded-lg border ${
                theme === 'dark'
                  ? 'border-judicial-gold/20 bg-slate-900/50'
                  : 'border-gray-200 bg-white'
              }`}>
                <div className="flex items-start mb-4">
                  <MapPin className="h-5 w-5 text-judicial-gold mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Dastavez AI Headquarters
                    </p>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>
                      Patna, <br />
                      Bihar, India
                      
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Business Hours */}
            <div className={`p-6 rounded-lg border ${
              theme === 'dark'
                ? 'border-judicial-gold/20 bg-slate-900/50'
                : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-judicial-gold mr-2" />
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Business Hours
                </h3>
              </div>
              <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>Closed</span>
                </div>
                <p className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-slate-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                  Response time: Within 24 hours (business days)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <section className={`p-8 rounded-lg ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-slate-900 to-slate-800 border border-judicial-gold/10'
            : 'bg-gradient-to-r from-slate-50 to-slate-100 border border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Connect With Us on Social Media
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-4 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                    theme === 'dark'
                      ? 'border-judicial-gold/30 hover:border-judicial-gold hover:bg-judicial-gold/10'
                      : 'border-judicial-gold/20 hover:border-judicial-gold hover:bg-judicial-gold/10'
                  }`}
                  title={social.label}
                >
                  <IconComponent className="h-6 w-6 text-judicial-gold" />
                </a>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
