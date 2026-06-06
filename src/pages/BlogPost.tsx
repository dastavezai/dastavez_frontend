import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import StarField from "@/components/StarField";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPostData {
  id: number;
  title: string;
  date: string;
  category: string;
  readTime: string;
  author: string;
  content: {
    introduction: string;
    sections: {
      heading: string;
      paragraphs: string[];
    }[];
    conclusion: string;
  };
}

const blogPosts: Record<number, BlogPostData> = {
  1: {
    id: 1,
    title: "Modern Jurisprudence in the Digital Age",
    date: "Jan 12, 2026",
    category: "Legal Tech",
    readTime: "8 min read",
    author: "Dastavez AI Team",
    content: {
      introduction: "The intersection of law and technology has never been more critical than in today's digital age. As artificial intelligence, machine learning, and automation reshape industries worldwide, the legal profession finds itself at a pivotal crossroads. This transformation presents both unprecedented opportunities and significant challenges for legal practitioners, judges, and the justice system as a whole.",
      sections: [
        {
          heading: "The Digital Transformation of Legal Practice",
          paragraphs: [
            "Traditional legal practice relied heavily on manual research, paper documentation, and in-person proceedings. Today, AI-powered legal research tools can analyze thousands of case precedents in seconds, identifying relevant patterns and connections that might take human researchers days or weeks to discover.",
            "Cloud-based practice management systems enable lawyers to manage cases, communicate with clients, and collaborate with colleagues from anywhere in the world. Electronic filing systems have streamlined court processes, reducing delays and improving access to justice.",
            "Digital transformation isn't just about efficiency—it's fundamentally changing how legal services are delivered and accessed. Virtual law firms operate entirely online, offering services at reduced costs while maintaining quality standards."
          ]
        },
        {
          heading: "AI-Powered Legal Research and Analysis",
          paragraphs: [
            "Natural Language Processing (NLP) technologies have revolutionized legal research. AI systems can now understand complex legal questions posed in plain language and retrieve relevant case law, statutes, and legal commentary with remarkable accuracy.",
            "Predictive analytics tools analyze historical case outcomes to provide probability assessments for litigation success. These insights help lawyers develop more informed strategies and provide clients with realistic expectations about their cases.",
            "Document review, once a time-consuming and expensive process, has been transformed by machine learning algorithms that can identify relevant documents, flag potential issues, and extract key information from massive datasets with unprecedented speed and accuracy."
          ]
        },
        {
          heading: "Ethical Considerations and Challenges",
          paragraphs: [
            "As technology becomes more integrated into legal practice, important ethical questions arise. How do we ensure AI systems don't perpetuate or amplify existing biases in the legal system? Who is responsible when an AI tool makes an error that affects a case outcome?",
            "Data privacy and security concerns are paramount in an era where sensitive legal information is stored digitally and transmitted electronically. Law firms must implement robust cybersecurity measures to protect client confidentiality and maintain professional integrity.",
            "The digital divide poses challenges for equal access to justice. While technology can make legal services more accessible, it also risks creating new barriers for those without digital literacy or access to technology infrastructure."
          ]
        },
        {
          heading: "The Role of Legal Education",
          paragraphs: [
            "Law schools are adapting their curricula to prepare future lawyers for a technology-driven profession. Courses in legal technology, data privacy, cybersecurity law, and AI ethics are becoming standard components of legal education.",
            "Continuing legal education programs help practicing attorneys stay current with technological developments and their legal implications. Understanding how to effectively leverage technology tools is increasingly viewed as an essential competency for modern legal practitioners.",
            "The next generation of lawyers will need to be comfortable working alongside AI systems, understanding their capabilities and limitations, and maintaining the judgment and ethical reasoning that remain uniquely human."
          ]
        },
        {
          heading: "Future Outlook: The Path Forward",
          paragraphs: [
            "The integration of technology into legal practice will continue to accelerate. We can expect to see more sophisticated AI tools that can handle increasingly complex legal tasks, from contract drafting to legal strategy development.",
            "Blockchain technology promises to transform how legal documents are authenticated and stored, potentially reducing fraud and increasing transparency in legal transactions.",
            "Virtual and augmented reality may soon play a role in courtroom presentations, allowing juries to experience crime scenes or visualize complex evidence in new ways.",
            "Despite these technological advances, the human element of legal practice—judgment, empathy, advocacy, and ethical reasoning—will remain irreplaceable. The most successful legal professionals will be those who can effectively combine technological tools with traditional legal skills."
          ]
        }
      ],
      conclusion: "Modern jurisprudence in the digital age represents a fundamental evolution in how justice is pursued and delivered. While technology brings powerful tools and efficiencies, it also demands thoughtful consideration of its implications for fairness, access, and the rule of law. As we navigate this transformation, the legal profession must embrace innovation while remaining steadfast in its commitment to justice, ethics, and the protection of rights. The future of law lies not in choosing between tradition and technology, but in thoughtfully integrating both to create a more effective, accessible, and just legal system."
    }
  }
};

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const postId = parseInt(id || '1');
  const post = blogPosts[postId];

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-judicial-dark transition-colors duration-300">
        <StarField />
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-judicial-gold/20 mb-6">
                <Tag className="w-12 h-12 text-judicial-gold" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-6">Article Coming Soon</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              This article is currently in development. Our team is working on creating high-quality content for you. 
              In the meantime, check out our featured article on Modern Jurisprudence in the Digital Age.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/blog/1')} 
                size="lg"
                className="bg-judicial-gold hover:bg-judicial-lightGold text-judicial-dark font-semibold"
              >
                Read Featured Article
              </Button>
              <Button 
                onClick={() => navigate('/blog')} 
                size="lg"
                variant="outline"
                className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Blog
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-judicial-dark transition-colors duration-300">
      <StarField />
      <Navbar />

      <article className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button
              onClick={() => navigate('/blog')}
              variant="ghost"
              className="text-judicial-gold hover:text-judicial-lightGold hover:bg-judicial-gold/10"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Blog
            </Button>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 rounded-2xl overflow-hidden border border-judicial-gold/30 shadow-2xl"
          >
            <div className="aspect-video bg-gradient-to-br from-judicial-gold/20 to-judicial-gold/5">
              <img 
                src="https://plus.unsplash.com/premium_photo-1694088516834-6fa55faab454?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Article Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="bg-judicial-gold/20 text-judicial-gold px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {post.category}
              </span>
              <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
              <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white leading-tight mb-6">
              {post.title}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 text-lg">
              By {post.author}
            </p>
          </motion.header>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            {/* Introduction */}
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 first-letter:text-5xl first-letter:font-bold first-letter:text-judicial-gold first-letter:mr-1 first-letter:float-left">
              {post.content.introduction}
            </p>

            {/* Sections */}
            {post.content.sections.map((section, index) => (
              <section key={index} className="mb-12">
                <h2 className="text-3xl font-bold text-black dark:text-white mb-6 mt-8 border-l-4 border-judicial-gold pl-4">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            {/* Conclusion */}
            <section className="mt-12 pt-8 border-t border-gray-300 dark:border-judicial-gold/20">
              <h2 className="text-3xl font-bold text-black dark:text-white mb-6">Conclusion</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg italic">
                {post.content.conclusion}
              </p>
            </section>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 p-8 rounded-xl bg-judicial-navy/30 light:bg-gray-100 border border-judicial-gold/20"
          >
            <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
              Ready to Experience AI-Powered Legal Assistance?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Discover how Dastavez AI can transform your legal practice with cutting-edge technology and intelligent automation.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate('/chat')}
                size="lg"
                className="bg-judicial-gold hover:bg-judicial-lightGold text-judicial-dark font-semibold"
              >
                Try Dastavez AI
              </Button>
              <Button
                onClick={() => navigate('/blog')}
                size="lg"
                variant="outline"
                className="border-judicial-gold text-judicial-gold hover:bg-judicial-gold/10"
              >
                More Articles
              </Button>
            </div>
          </motion.div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
