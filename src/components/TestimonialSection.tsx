import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";

type Testimonial = {
  id: number;
  quote: string;
  name: string;
  title: string;
  company: string;
  rating: number;
  image: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Dastawez AI has completely transformed our legal research process. We've reduced preparation time by 60% while discovering more relevant precedents for our cases.",
    name: "Amanda Richardson",
    title: "Senior Partner",
    company: "Richardson & Associates",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 2,
    quote: "The case prediction features are remarkably accurate. In our last 12 cases, the AI correctly predicted outcomes in 10 instances, giving us a strategic advantage in negotiations.",
    name: "Marcus Chen",
    title: "Criminal Defense Attorney",
    company: "Liberty Legal Defenders",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 3,
    quote: "As a public defender with a massive caseload, Dastawez AI helps me quickly identify key arguments and precedents that would have taken days to research manually.",
    name: "Tanya Jefferson",
    title: "Public Defender",
    company: "County Legal Aid Office",
    rating: 4,
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
  }
];

export function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };
  
  const currentTestimonial = testimonials[activeIndex];
  
  return (
    <div className="py-16 bg-judicial-dark">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-judicial-gold/20 to-transparent rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <Gavel className="h-16 w-16 text-judicial-gold transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center transform group-hover:translate-y-1 transition-all duration-500">
            <span className="text-judicial-gold bg-clip-text text-transparent bg-gradient-to-r from-judicial-gold to-judicial-gold/80">
              AI Powered
            </span>{" "}
            Legal Intelligence
          </h2>
        </div>
      </div>
    </div>
  );
}
