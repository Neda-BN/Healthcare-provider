'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  HelpCircle,
  Book,
  Mail,
  MessageSquare,
  Video,
  ChevronDown,
  ClipboardList,
  Building2,
  BarChart3,
  Send,
  PenSquare,
} from 'lucide-react'

const faqs = [
  {
    question: 'How do I create a new survey?',
    answer: 'Go to Surveys → Create New in the sidebar to open the Question Builder. You can create a new template or modify the existing one. Add questions, set their types (rating, yes/no, text), and organize them by categories.',
  },
  {
    question: 'How do I send a survey?',
    answer: 'Navigate to Surveys → Send Survey. Select the survey template, choose municipalities and recipients, then click Send. Recipients will receive an email with instructions to reply with their answers.',
  },
  {
    question: 'How do municipalities respond to surveys?',
    answer: 'Municipalities respond by replying to the survey email. They format answers as "Q4: 8" or "Q5a: 7". The system automatically parses these responses. Alternatively, they can provide free-text comments.',
  },
  {
    question: 'How is the response rate calculated?',
    answer: 'Response rate = (Completed surveys / Total sent) × 100. A survey is "completed" when at least 50% of questions have been answered.',
  },
  {
    question: 'Can I compare multiple municipalities?',
    answer: 'Yes! Go to Analysis → Compare to access the comparison tool. Select 2-4 municipalities and compare scores across all categories with visual charts and delta calculations.',
  },
  {
    question: 'How do I export survey data?',
    answer: 'From the Analysis → Reports page, click "Export CSV" to download all survey data. For comparison exports, visit Analysis → Compare and use the export button there.',
  },
  {
    question: 'What do the rating scores mean?',
    answer: 'Ratings are 1-10 where 1 = very poor and 10 = excellent. Scores 8+ are strengths (green), 6-7 average (amber), below 6 need improvement (red).',
  },
]

const navigationGuide = [
  {
    icon: ClipboardList,
    title: 'Surveys',
    items: [
      { name: 'Create New', desc: 'Build survey templates with the question builder' },
      { name: 'Send Survey', desc: 'Email surveys to municipality contacts' },
      { name: 'All Surveys', desc: 'View all sent surveys and their status' },
    ],
  },
  {
    icon: Building2,
    title: 'Municipalities',
    items: [
      { name: 'Overview', desc: 'List of all municipalities and placements' },
      { name: 'Agreements', desc: 'Framework agreements with municipalities' },
      { name: 'Placements', desc: 'Care placements per municipality' },
    ],
  },
  {
    icon: BarChart3,
    title: 'Analysis',
    items: [
      { name: 'Reports', desc: 'Monthly and individual survey reports' },
      { name: 'Compare', desc: 'Compare scores across municipalities' },
    ],
  },
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex p-4 bg-primary-100 dark:bg-dark-primary/20 rounded-2xl mb-4">
          <HelpCircle className="w-12 h-12 text-primary-600 dark:text-dark-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-dark-text">Help & Support</h1>
        <p className="text-surface-500 dark:text-dark-text-muted mt-2 max-w-xl mx-auto">
          Learn how to navigate the system and get the most out of your surveys.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/surveys/builder" className="card-hover flex items-center gap-4 group">
          <div className="p-3 bg-primary-50 dark:bg-dark-primary/20 rounded-xl group-hover:bg-primary-100 dark:group-hover:bg-dark-primary/30 transition-colors">
            <PenSquare className="w-6 h-6 text-primary-600 dark:text-dark-primary" />
          </div>
          <span className="font-medium text-surface-900 dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-dark-primary transition-colors">
            Create Survey
          </span>
        </Link>
        <Link href="/surveys/send" className="card-hover flex items-center gap-4 group">
          <div className="p-3 bg-primary-50 dark:bg-dark-primary/20 rounded-xl group-hover:bg-primary-100 dark:group-hover:bg-dark-primary/30 transition-colors">
            <Send className="w-6 h-6 text-primary-600 dark:text-dark-primary" />
          </div>
          <span className="font-medium text-surface-900 dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-dark-primary transition-colors">
            Send Survey
          </span>
        </Link>
        <a
          href="mailto:support@healthcare-provider.se"
          className="card-hover flex items-center gap-4 group"
        >
          <div className="p-3 bg-primary-50 dark:bg-dark-primary/20 rounded-xl group-hover:bg-primary-100 dark:group-hover:bg-dark-primary/30 transition-colors">
            <Mail className="w-6 h-6 text-primary-600 dark:text-dark-primary" />
          </div>
          <span className="font-medium text-surface-900 dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-dark-primary transition-colors">
            Contact Support
          </span>
        </a>
      </div>

      {/* Navigation Guide */}
      <div className="card" id="guide">
        <h2 className="text-xl font-display font-bold text-surface-900 dark:text-dark-text mb-6">Navigation Guide</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {navigationGuide.map((section) => (
            <div key={section.title} className="space-y-3">
              <div className="flex items-center gap-2">
                <section.icon className="w-5 h-5 text-primary-600 dark:text-dark-primary" />
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.name} className="text-sm">
                    <span className="font-medium text-surface-700 dark:text-dark-text">{item.name}</span>
                    <p className="text-surface-500 dark:text-dark-text-muted">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="card">
        <h2 className="text-xl font-display font-bold text-surface-900 dark:text-dark-text mb-6">Quick Start</h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: 'Create a Survey',
              description: 'Go to Surveys → Create New to build your questionnaire with the Question Builder.',
              link: '/surveys/builder',
            },
            {
              step: 2,
              title: 'Send to Municipalities',
              description: 'Navigate to Surveys → Send Survey, select recipients, and send the survey.',
              link: '/surveys/send',
            },
            {
              step: 3,
              title: 'View Results',
              description: 'Check Analysis → Reports for survey results and scores.',
              link: '/reports',
            },
            {
              step: 4,
              title: 'Compare Performance',
              description: 'Use Analysis → Compare to benchmark municipalities against each other.',
              link: '/analyse',
            },
          ].map((item) => (
            <Link
              key={item.step}
              href={item.link}
              className="flex gap-4 p-4 -mx-4 rounded-lg hover:bg-surface-50 dark:hover:bg-dark-surface-light transition-colors group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-dark-primary/20 text-primary-700 dark:text-dark-primary flex items-center justify-center font-bold group-hover:bg-primary-200 dark:group-hover:bg-dark-primary/30 transition-colors">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-dark-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-surface-600 dark:text-dark-text-muted text-sm mt-0.5">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card">
        <h2 className="text-xl font-display font-bold text-surface-900 dark:text-dark-text mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-surface-200 dark:border-dark-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-50 dark:hover:bg-dark-surface-light transition-colors"
              >
                <span className="font-medium text-surface-900 dark:text-dark-text">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
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
                <p className="p-4 pt-0 text-surface-600 dark:text-dark-text-muted">{faq.answer}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="card bg-gradient-to-br from-primary-500 to-primary-700 dark:from-dark-primary dark:to-dark-primary-hover text-white dark:text-dark-primary-text">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 dark:bg-dark-bg/30 rounded-xl">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold">Still need help?</h3>
              <p className="text-primary-100 dark:text-dark-text-muted">Our support team is ready to assist.</p>
            </div>
          </div>
          <a
            href="mailto:support@healthcare-provider.se"
            className="btn bg-white dark:bg-dark-bg text-primary-700 dark:text-dark-primary hover:bg-primary-50 dark:hover:bg-dark-surface"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
