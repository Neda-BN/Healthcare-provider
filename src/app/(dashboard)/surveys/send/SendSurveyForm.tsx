'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Send,
  Building2,
  FileText,
  Mail,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Municipality {
  id: string
  name: string
  contactEmail: string | null
}

interface Template {
  id: string
  name: string
  description: string | null
  isDefault: boolean
  questionCount: number
}

interface SendSurveyFormProps {
  municipalities: Municipality[]
  templates: Template[]
}

export default function SendSurveyForm({ municipalities, templates }: SendSurveyFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedMunicipality = searchParams.get('municipality')

  const [selectedMunicipalities, setSelectedMunicipalities] = useState<string[]>(
    preselectedMunicipality ? [preselectedMunicipality] : []
  )
  const [selectedTemplate, setSelectedTemplate] = useState(
    templates.find((t) => t.isDefault)?.id || templates[0]?.id || ''
  )
  const [title, setTitle] = useState('')
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [parseReplies, setParseReplies] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; surveyIds?: string[] } | null>(null)

  const handleAddEmail = () => {
    if (newEmail && !additionalEmails.includes(newEmail)) {
      setAdditionalEmails([...additionalEmails, newEmail])
      setNewEmail('')
    }
  }

  const handleRemoveEmail = (email: string) => {
    setAdditionalEmails(additionalEmails.filter((e) => e !== email))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedMunicipalities.length === 0) {
      toast.error('Please select at least one municipality')
      return
    }
    if (!selectedTemplate) {
      toast.error('Please select a survey template')
      return
    }

    setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/surveys/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          municipalityIds: selectedMunicipalities,
          templateId: selectedTemplate,
          title: title || `Survey - ${new Date().toLocaleDateString('sv-SE')}`,
          additionalEmails,
          parseReplies,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send surveys')
      }

      setResult({
        success: true,
        message: `Successfully sent ${data.surveys.length} survey(s)!`,
        surveyIds: data.surveys.map((s: any) => s.id),
      })
      toast.success('Surveys sent successfully!')
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send surveys',
      })
      toast.error('Failed to send surveys')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900">Send Survey</h1>
        <p className="text-surface-500 mt-1">
          Send a survey to one or more municipalities by email
        </p>
      </div>

      {result ? (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`flex flex-col items-center py-8 ${result.success ? 'text-green-600' : 'text-accent-600'}`}>
            {result.success ? (
              <CheckCircle className="w-16 h-16 mb-4" />
            ) : (
              <AlertCircle className="w-16 h-16 mb-4" />
            )}
            <h2 className="text-xl font-semibold mb-2">
              {result.success ? 'Surveys Sent!' : 'Failed to Send'}
            </h2>
            <p className="text-surface-600 text-center mb-6">{result.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setResult(null)} className="btn-secondary">
                Send More
              </button>
              <button onClick={() => router.push('/dashboard')} className="btn-primary">
                Go to Dashboard
              </button>
            </div>
          </div>

          {result.success && (
            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
              <h3 className="font-medium text-primary-800 mb-2">📧 Demo: View Emails</h3>
              <p className="text-sm text-primary-700 mb-3">
                If you&apos;re running Maildev locally (npm run maildev), you can view the sent emails at:
              </p>
              <a
                href="http://localhost:1080"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-sm inline-flex"
              >
                Open Maildev (localhost:1080)
              </a>
            </div>
          )}
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Select Template
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-surface-900">{template.name}</span>
                    {template.isDefault && (
                      <span className="badge-primary text-xs">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-surface-500">
                    {template.questionCount} questions
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Municipality Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-600" />
              Select Municipalities
            </h3>
            <div className="space-y-2">
              {municipalities.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMunicipalities.includes(m.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedMunicipalities.includes(m.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMunicipalities([...selectedMunicipalities, m.id])
                        } else {
                          setSelectedMunicipalities(selectedMunicipalities.filter((id) => id !== m.id))
                        }
                      }}
                      className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="font-medium text-surface-900">{m.name}</span>
                  </div>
                  {m.contactEmail && (
                    <span className="text-sm text-surface-500">{m.contactEmail}</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Survey Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary-600" />
              Survey Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="label">Survey Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder={`Survey - ${new Date().toLocaleDateString('sv-SE')}`}
                />
              </div>

              <div>
                <label className="label">Additional Recipients (optional)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                    className="input flex-1"
                    placeholder="additional@email.com"
                  />
                  <button type="button" onClick={handleAddEmail} className="btn-secondary">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {additionalEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {additionalEmails.map((email) => (
                      <span
                        key={email}
                        className="flex items-center gap-1 px-3 py-1 bg-surface-100 rounded-full text-sm"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          className="p-0.5 hover:bg-surface-200 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="parseReplies"
                  checked={parseReplies}
                  onChange={(e) => setParseReplies(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="parseReplies" className="text-sm text-surface-700">
                  Automatically parse email replies as survey responses
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || selectedMunicipalities.length === 0}
              className="btn-primary"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Survey ({selectedMunicipalities.length})
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

