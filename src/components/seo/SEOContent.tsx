"use client";

import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOContentProps {
  title: string;
  description: string;
  faqs?: FAQItem[];
  neighborhoods?: string[];
  cityName?: string;
}

export function SEOContent({
  title,
  description,
  faqs,
  neighborhoods,
  cityName,
}: SEOContentProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* SEO Content Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="prose prose-lg max-w-none mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </motion.div>

        {/* Neighborhoods for city pages */}
        {neighborhoods && neighborhoods.length > 0 && cityName && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Zonas con actividades en {cityName}
            </h3>
            <div className="flex flex-wrap gap-2">
              {neighborhoods.map((hood, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {hood}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        {faqs && faqs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Preguntas frecuentes
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border rounded-xl overflow-hidden bg-card"
                >
                  <button
                    onClick={() =>
                      setExpandedFaq(expandedFaq === index ? null : index)
                    }
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                    aria-expanded={expandedFaq === index}
                  >
                    <span className="font-medium text-foreground pr-4">
                      {faq.question}
                    </span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedFaq === index ? "auto" : 0,
                      opacity: expandedFaq === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
