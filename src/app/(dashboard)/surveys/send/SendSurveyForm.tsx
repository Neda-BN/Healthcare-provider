'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Users,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Municipality {
  id: string
  name: string
  contactEmail: string | null
  _count?: {
    emails: number
  }
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
  
  // Email management
  const [municipalityEmails, setMunicipalityEmails] = useState<Record<string, string[]>>({})
  const [loadingEmails, setLoadingEmails] = useState<Record<string, boolean>>({})
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [showEmailList, setShowEmailList] = useState(false)
  
  const [parseReplies, setParseReplies] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; surveyIds?: string[] } | null>(null)

  // Fetch emails for a municipality
  const fetchMunicipalityEmails = async (municipalityId: string) => {
    if (municipalityEmails[municipalityId]) return // Already fetched

    setLoadingEmails(prev => ({ ...prev, [municipalityId]: true }))
    try {
      const res = await fetch(`/api/municipalities/${municipalityId}/emails`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        const emails = data.map((e: { email: string }) => e.email)
        setMunicipalityEmails(prev => ({ ...prev, [municipalityId]: emails }))
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
    } finally {
      setLoadingEmails(prev => ({ ...prev, [municipalityId]: false }))
    }
  }

  // Fetch emails when municipalities are selected
  useEffect(() => {
    selectedMunicipalities.forEach(id => {
      fetchMunicipalityEmails(id)
    })
  }, [selectedMunicipalities])

  // Update selected emails when municipality emails are loaded
  useEffect(() => {
    const allEmails = new Set<string>()
    selectedMunicipalities.forEach(id => {
      const emails = municipalityEmails[id] || []
      emails.forEach(email => allEmails.add(email))
    })
    // Add additional emails
    additionalEmails.forEach(email => allEmails.add(email))
    setSelectedEmails(Array.from(allEmails).sort())
  }, [selectedMunicipalities, municipalityEmails, additionalEmails])

  // Get total email count for a municipality
  const getMunicipalityEmailCount = (m: Municipality): number => {
    if (municipalityEmails[m.id]) {
      return municipalityEmails[m.id].length
    }
    return m._count?.emails || 0
  }

  // Handle municipality selection
  const handleMunicipalityToggle = (municipalityId: string, checked: boolean) => {
    if (checked) {
      setSelectedMunicipalities([...selectedMunicipalities, municipalityId])
    } else {
      setSelectedMunicipalities(selectedMunicipalities.filter((id) => id !== municipalityId))
    }
  }

  // Add additional email
  const handleAddEmail = () => {
    const email = newEmail.trim().toLowerCase()
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (!additionalEmails.includes(email) && !selectedEmails.includes(email)) {
        setAdditionalEmails([...additionalEmails, email])
        setNewEmail('')
      } else {
        toast.error('Email already in the list')
      }
    } else {
      toast.error('Please enter a valid email address')
    }
  }

  // Remove email from selected list
  const handleRemoveEmail = (email: string) => {
    // If it's an additional email, remove from there
    if (additionalEmails.includes(email)) {
      setAdditionalEmails(additionalEmails.filter((e) => e !== email))
    } else {
      // Otherwise, we need to track removed emails
      setSelectedEmails(selectedEmails.filter((e) => e !== email))
    }
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
    if (selectedEmails.length === 0) {
      toast.error('No recipients selected. Add email addresses or upload emails for the municipalities.')
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
          recipientEmails: selectedEmails,
          parseReplies,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send surveys')
      }

      setResult({
        success: true,
        message: `Successfully sent ${data.surveys.length} survey(s) to ${selectedEmails.length} recipients!`,
        surveyIds: data.surveys.map((s: { id: string }) => s.id),
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

  const isLoadingAnyEmails = Object.values(loadingEmails).some(v => v)

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
              {municipalities.map((m) => {
                const emailCount = getMunicipalityEmailCount(m)
                const isLoading = loadingEmails[m.id]
                const isSelected = selectedMunicipalities.includes(m.id)
                
                return (
                  <label
                    key={m.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-surface-200 hover:border-surface-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleMunicipalityToggle(m.id, e.target.checked)}
                        className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="font-medium text-surface-900">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-surface-400" />
                      ) : (
                        <span className={`flex items-center gap-1 text-sm ${emailCount > 0 ? 'text-primary-600' : 'text-surface-400'}`}>
                          <Mail className="w-4 h-4" />
                          {emailCount} {emailCount === 1 ? 'email' : 'emails'}
                        </span>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Recipients Section */}
          <div className="card">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowEmailList(!showEmailList)}
            >
              <h3 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                Recipients
                {selectedEmails.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {selectedEmails.length} {selectedEmails.length === 1 ? 'email' : 'emails'} loaded
                  </span>
                )}
              </h3>
              <button type="button" className="p-1 hover:bg-surface-100 rounded">
                {showEmailList ? <ChevronUp className="w-5 h-5 text-surface-500" /> : <ChevronDown className="w-5 h-5 text-surface-500" />}
              </button>
            </div>

            <AnimatePresence>
              {showEmailList && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-4">
                    {/* Add email input */}
                    <div>
                      <label className="label">Add Additional Email</label>
                      <div className="flex gap-2">
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
                    </div>

                    {/* Email list */}
                    {selectedEmails.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="label mb-0">Email List ({selectedEmails.length})</label>
                          <p className="text-xs text-surface-500">Click × to remove an email</p>
                        </div>
                        <div className="max-h-48 overflow-y-auto bg-surface-50 rounded-lg p-3">
                          <div className="flex flex-wrap gap-2">
                            {selectedEmails.map((email) => (
                              <span
                                key={email}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm ${
                                  additionalEmails.includes(email)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-white border border-surface-200 text-surface-700'
                                }`}
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
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-surface-50 rounded-lg">
                        <Users className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                        <p className="text-surface-500 text-sm">
                          {selectedMunicipalities.length === 0
                            ? 'Select municipalities above to load email recipients'
                            : isLoadingAnyEmails
                            ? 'Loading email recipients...'
                            : 'No email recipients found. Upload emails for the selected municipalities or add them manually.'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary when collapsed */}
            {!showEmailList && selectedEmails.length === 0 && selectedMunicipalities.length > 0 && (
              <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                No email recipients. Click to add emails manually.
              </p>
            )}
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
              disabled={sending || selectedMunicipalities.length === 0 || selectedEmails.length === 0}
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
                  Send to {selectedEmails.length} {selectedEmails.length === 1 ? 'Recipient' : 'Recipients'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
