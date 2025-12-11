'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HelpCircle,
  Book,
  Mail,
  MessageSquare,
  FileText,
  Video,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'

const faqs = [
  {
    question: 'How do I create a new survey?',
    answer: 'Navigate to "New internal survey" → "Question builder" in the sidebar. You can create a new template or modify the existing one. Once ready, click "Send Survey" in the top bar to email it to municipalities.',
  },
  {
    question: 'How do municipalities respond to surveys?',
    answer: 'Municipalities can respond directly by replying to the survey email. They should format their answers as "Q4: 8" or "Q5a: 7" etc. The system will automatically parse these responses. Alternatively, they can provide free-text comments.',
  },
  {
    question: 'How is the response rate calculated?',
    answer: 'Response rate = (Number of completed surveys / Total surveys sent) × 100. A survey is considered "completed" when at least 50% of the questions have been answered.',
  },
  {
    question: 'Can I compare multiple municipalities?',
    answer: 'Yes! Go to "Municipalities" → "Analyse" to access the comparison tool. You can select 2-4 municipalities and compare their scores across all categories, with visual charts and delta calculations.',
  },
  {
    question: 'How do I export survey data?',
    answer: 'From the Analyse page, click "Export CSV" to download comparison data. For individual survey results, visit the survey detail page and use the export options there.',
  },
  {
    question: 'What do the rating scores mean?',
    answer: 'Ratings are on a 1-10 scale where 1 = very poor and 10 = excellent. Scores 8+ are considered strengths, 6-7 are average, and below 6 indicate areas needing improvement.',
  },
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex p-4 bg-primary-100 rounded-2xl mb-4">
          <HelpCircle className="w-12 h-12 text-primary-600" />
        </div>
        <h1 className="text-3xl font-display font-bold text-surface-900">Help & Support</h1>
        <p className="text-surface-500 mt-2 max-w-xl mx-auto">
          Find answers to common questions and learn how to get the most out of the survey system.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Book, label: 'User Guide', href: '#guide' },
          { icon: Video, label: 'Video Tutorials', href: '#tutorials' },
          { icon: Mail, label: 'Contact Support', href: 'mailto:support@healthcare-provider.se' },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="card-hover flex items-center gap-4 group"
          >
            <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
              <item.icon className="w-6 h-6 text-primary-600" />
            </div>
            <span className="font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
              {item.label}
            </span>
          </a>
        ))}
      </div>

      {/* Getting Started Guide */}
      <div className="card" id="guide">
        <h2 className="text-xl font-display font-bold text-surface-900 mb-6">Getting Started</h2>
        <div className="space-y-6">
          {[
            {
              step: 1,
              title: 'Select a Municipality',
              description: 'Use the dropdown in the top bar to select which municipality you want to work with. This filters the dashboard to show only that municipality\'s data.',
            },
            {
              step: 2,
              title: 'Review or Create a Survey Template',
              description: 'Go to "New internal survey" → "Question builder" to view or modify survey questions. The default template includes all Nordic Care Index questions.',
            },
            {
              step: 3,
              title: 'Send a Survey',
              description: 'Click "Send Survey" in the top bar or navigate to the send page. Select municipalities and recipients, then send the survey via email.',
            },
            {
              step: 4,
              title: 'Collect Responses',
              description: 'Recipients reply directly to the email with their ratings. The system automatically parses responses like "Q4: 8" and updates the dashboard.',
            },
            {
              step: 5,
              title: 'Analyze Results',
              description: 'View individual municipality dashboards or use the Analyse tool to compare multiple municipalities side by side.',
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">{item.title}</h3>
                <p className="text-surface-600 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card">
        <h2 className="text-xl font-display font-bold text-surface-900 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-surface-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-50 transition-colors"
              >
                <span className="font-medium text-surface-900">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-surface-400" />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openFaq === index ? 'auto' : 0,
                  opacity: openFaq === index ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="p-4 pt-0 text-surface-600">{faq.answer}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold">Need more help?</h3>
              <p className="text-primary-100">Our support team is here to assist you.</p>
            </div>
          </div>
          <a
            href="mailto:support@healthcare-provider.se"
            className="btn bg-white text-primary-700 hover:bg-primary-50"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}

