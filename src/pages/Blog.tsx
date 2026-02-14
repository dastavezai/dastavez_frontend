import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import StarField from "@/components/StarField";
import FloatingCard from '@/components/FloatingCard';
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Legal Tech', 'AI & Analytics', 'Compliance', 'Digital Law', 'Case Studies'];

  const posts = [
    {
      id: 1,
      title: "Modern Jurisprudence in the Digital Age",
      date: "Jan 12, 2026",
      excerpt: "Exploring how AI is reshaping the legal landscape and transforming traditional legal practices.",
      category: "Legal Tech",
      featured: true
    },
    {
      id: 2,
      title: "Compliance Strategies for 2026",
      date: "Jan 05, 2026",
      excerpt: "A comprehensive guide to navigating new regulatory frameworks in the evolving legal landscape.",
      category: "Compliance",
      featured: false
    },
    {
      id: 3,
      title: "AI-Powered Case Prediction: Revolutionizing Legal Strategy",
      date: "Dec 28, 2025",
      excerpt: "How machine learning algorithms analyze historical case data to predict outcomes and improve legal strategies.",
      category: "AI & Analytics",
      featured: false
    },
    {
      id: 4,
      title: "Blockchain in Legal Documentation",
      date: "Dec 20, 2025",
      excerpt: "Ensuring document authenticity with immutable records and exploring smart contracts' legal implications.",
      category: "Digital Law",
      featured: false
    },
    {
      id: 5,
      title: "The Rise of Legal Analytics",
      date: "Dec 15, 2025",
      excerpt: "How big data analytics is transforming legal research and decision-making processes in modern law firms.",
      category: "AI & Analytics",
      featured: false
    },
    {
      id: 6,
      title: "Cybersecurity Compliance in Law Firms",
      date: "Dec 10, 2025",
      excerpt: "Protecting sensitive client data under GDPR, CCPA, and emerging privacy regulations.",
      category: "Compliance",
      featured: false
    },
    {
      id: 7,
      title: "Remote Depositions: Technology's Impact",
      date: "Dec 05, 2025",
      excerpt: "Video conferencing tools, legal admissibility, and maintaining evidentiary integrity in digital depositions.",
      category: "Digital Law",
      featured: false
    },
    {
      id: 8,
      title: "Natural Language Processing in Contract Analysis",
      date: "Nov 28, 2025",
      excerpt: "AI-powered contract review for identifying risks, inconsistencies, and improving accuracy over manual processes.",
      category: "AI & Analytics",
      featured: false
    },
    {
      id: 9,
      title: "Digital Evidence Authentication",
      date: "Nov 20, 2025",
      excerpt: "Best practices for presenting digital evidence in court and maintaining chain of custody in the digital age.",
      category: "Digital Law",
      featured: false
    }
  ];

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  const featuredPost = posts.find(post => post.featured) || posts[0];

  return (
    <div className="min-h-screen bg-white dark:bg-judicial-dark transition-colors duration-300">
      <StarField />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl font-bold mb-6 text-black dark:text-white sm:text-5xl md:text-5xl">
                Legal <span className="text-judicial-gold">Insights</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Expert analysis on legal trends, emerging technologies, and the intersection of law and innovation.
              </p>
            </motion.div>
          </section>

          {/* Category Filter */}
          <section className="mb-16">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map(category => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-judicial-gold text-judicial-dark shadow-lg'
                      : 'bg-judicial-gold/10 text-judicial-gold border border-judicial-gold/20 hover:bg-judicial-gold/20'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </section>

          {/* Featured Post */}
          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="text-center mb-8">
                <span className="text-judicial-gold text-sm font-bold uppercase tracking-widest">Featured Article</span>
              </div>
              <FloatingCard className="rounded-xl transition-all">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Featured Image */}
                  <div className="aspect-video bg-gradient-to-br from-judicial-gold/20 to-judicial-gold/5 rounded-lg overflow-hidden border border-judicial-gold/30">
                    <img 
                      src="https://plus.unsplash.com/premium_photo-1694088516834-6fa55faab454?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                      alt={featuredPost.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                    />
                  </div>

                  {/* Featured Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-judicial-gold/20 text-judicial-gold px-3 py-1 rounded-full font-medium">{featuredPost.category}</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text- dark:text-white leading-tight">{featuredPost.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">{featuredPost.excerpt}</p>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-judicial-gold/60 text-sm">{featuredPost.date}</span>
                      <button 
                        onClick={() => navigate(`/blog/${featuredPost.id}`)}
                        className="px-6 py-2 bg-judicial-gold text-judicial-dark font-semibold rounded-lg hover:bg-judicial-lightGold transition-all duration-300"
                      >
                        Read Full Article
                      </button>
                    </div>
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          </section>

          {/* Blog Posts Grid */}
          <section className="mb-16">
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredPosts.filter(post => !post.featured).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="group h-full rounded-2xl border border-judicial-gold/20 bg-judicial-navy/30 light:bg-white shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col h-full space-y-4 p-6">
                      {/* Category Badge */}
                      <div className="flex items-center justify-between">
                        <span className="bg-judicial-gold/20 text-judicial-gold px-3 py-1 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-black dark:text-white group-hover:text-judicial-gold transition-colors duration-300 leading-tight">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">{post.excerpt}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-judicial-gold/20">
                        <span className="text-judicial-gold/60 text-sm">{post.date}</span>
                        <span className="text-judicial-gold/40 text-sm font-medium cursor-default">Read More</span>
                      </div>
                    </div>
                    </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-6">Want to Learn More?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Explore all our articles and stay updated with the latest insights on legal technology and AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-judicial-gold hover:bg-judicial-lightGold text-judicial-dark font-semibold">
                  Load More Articles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10">
                  Subscribe to Updates
                </Button>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
