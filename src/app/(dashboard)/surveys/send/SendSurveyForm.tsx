'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  Eye,
  ExternalLink,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  ArrowLeft,
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
  
  // Demo mode states
  const [showDemoMode, setShowDemoMode] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false)

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
        <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">Send Survey</h1>
        <p className="text-surface-500 dark:text-dark-text-muted mt-1">
          Send a survey to one or more municipalities by email
        </p>
      </div>

      {result ? (
        showDemoMode && result.success ? (
          /* Demo Mode - Split View */
          <div className="animate-fade-in">
            {/* Demo Mode Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowDemoMode(false)}
                className="flex items-center gap-2 text-surface-600 dark:text-dark-text-muted hover:text-surface-900 dark:hover:text-dark-text transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Summary
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-surface-500 dark:text-dark-text-muted mr-2">Preview:</span>
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded-lg transition-colors ${previewDevice === 'desktop' ? 'bg-primary-100 dark:bg-dark-primary/20 text-primary-600 dark:text-dark-primary' : 'text-surface-400 dark:text-dark-text-muted hover:bg-surface-100 dark:hover:bg-dark-surface-light'}`}
                  title="Desktop view"
                >
                  <Monitor className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded-lg transition-colors ${previewDevice === 'mobile' ? 'bg-primary-100 dark:bg-dark-primary/20 text-primary-600 dark:text-dark-primary' : 'text-surface-400 dark:text-dark-text-muted hover:bg-surface-100 dark:hover:bg-dark-surface-light'}`}
                  title="Mobile view"
                >
                  <Smartphone className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-surface-200 dark:bg-dark-border mx-1" />
                <button
                  onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
                  className="p-2 rounded-lg text-surface-400 dark:text-dark-text-muted hover:bg-surface-100 dark:hover:bg-dark-surface-light transition-colors"
                  title={isPreviewFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isPreviewFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <a
                  href="/email-survey-mockup.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-surface-400 dark:text-dark-text-muted hover:bg-surface-100 dark:hover:bg-dark-surface-light transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className={`grid gap-6 ${isPreviewFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
              {/* Left Side - Survey Summary (hidden in fullscreen) */}
              {!isPreviewFullscreen && (
                <div className="lg:col-span-1 space-y-4">
                  {/* Success Card */}
                  <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-300">Survey Sent!</h3>
                        <p className="text-sm text-green-600 dark:text-green-400">{result.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Survey Details */}
                  <div className="card">
                    <h4 className="font-semibold text-surface-900 dark:text-dark-text mb-3">Survey Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-surface-500 dark:text-dark-text-muted">Template</span>
                        <span className="font-medium text-surface-900 dark:text-dark-text">
                          {templates.find(t => t.id === selectedTemplate)?.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-surface-500 dark:text-dark-text-muted">Recipients</span>
                        <span className="font-medium text-surface-900 dark:text-dark-text">{selectedEmails.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-surface-500 dark:text-dark-text-muted">Municipalities</span>
                        <span className="font-medium text-surface-900 dark:text-dark-text">{selectedMunicipalities.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipients List */}
                  <div className="card">
                    <h4 className="font-semibold text-surface-900 dark:text-dark-text mb-3">Recipients</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedMunicipalities.map(id => {
                        const m = municipalities.find(mun => mun.id === id)
                        return (
                          <div key={id} className="flex items-center gap-2 text-sm">
                            <Building2 className="w-4 h-4 text-primary-600 dark:text-dark-primary" />
                            <span className="text-surface-700 dark:text-dark-text">{m?.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { setResult(null); setShowDemoMode(false) }} className="btn-secondary w-full">
                      Send Another Survey
                    </button>
                    <button onClick={() => router.push('/dashboard')} className="btn-primary w-full">
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )}

              {/* Right Side - Email Preview */}
              <div className={isPreviewFullscreen ? 'col-span-1' : 'lg:col-span-2'}>
                <div className="card p-0 overflow-hidden">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-dark-surface-light border-b border-surface-200 dark:border-dark-border">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary-600 dark:text-dark-primary" />
                      <span className="font-medium text-surface-900 dark:text-dark-text">Email Preview</span>
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                        Demo Mode
                      </span>
                    </div>
                    <span className="text-xs text-surface-500 dark:text-dark-text-muted">
                      This is how recipients will see the survey
                    </span>
                  </div>

                  {/* Email Preview Frame */}
                  <div className={`bg-surface-100 dark:bg-dark-bg p-4 flex justify-center ${isPreviewFullscreen ? 'min-h-[80vh]' : 'min-h-[600px]'}`}>
                    <div 
                      className={`bg-white dark:bg-dark-surface rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                        previewDevice === 'mobile' 
                          ? 'w-[375px]' 
                          : 'w-full max-w-[700px]'
                      }`}
                    >
                      {/* Fake Email Client Header */}
                      <div className="bg-surface-800 dark:bg-dark-surface-light px-4 py-3 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex">
                            <span className="text-surface-400 w-16">From:</span>
                            <span>survey@healthcare-provider.se</span>
                          </div>
                          <div className="flex">
                            <span className="text-surface-400 w-16">To:</span>
                            <span>{selectedEmails[0] || 'recipient@municipality.se'}</span>
                          </div>
                          <div className="flex">
                            <span className="text-surface-400 w-16">Subject:</span>
                            <span className="font-medium">Kvalitetsundersökning - Nordic Care Quality Index</span>
                          </div>
                        </div>
                      </div>

                      {/* Email Content (iframe) */}
                      <iframe
                        src="/email-survey-mockup.html"
                        className={`w-full border-0 ${isPreviewFullscreen ? 'h-[70vh]' : 'h-[500px]'}`}
                        title="Survey Email Preview"
                      />
                    </div>
                  </div>

                  {/* Preview Footer */}
                  <div className="px-4 py-3 bg-surface-50 dark:bg-dark-surface-light border-t border-surface-200 dark:border-dark-border">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-surface-500 dark:text-dark-text-muted">
                        💡 This preview shows the complete survey flow. Recipients can answer directly in the email.
                      </p>
                      <a
                        href="/email-survey-mockup.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 dark:text-dark-primary hover:underline flex items-center gap-1"
                      >
                        Open full preview
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fullscreen close button */}
            {isPreviewFullscreen && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-50">
                <button
                  onClick={() => setIsPreviewFullscreen(false)}
                  className="btn-secondary shadow-lg"
                >
                  <Minimize2 className="w-4 h-4" />
                  Exit Fullscreen
                </button>
                <button
                  onClick={() => { setResult(null); setShowDemoMode(false) }}
                  className="btn-primary shadow-lg"
                >
                  Send Another Survey
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Standard Result View */
          <div className="card animate-fade-in">
            <div className={`flex flex-col items-center py-8 ${result.success ? 'text-green-600 dark:text-green-400' : 'text-accent-600 dark:text-accent-400'}`}>
              {result.success ? (
                <CheckCircle className="w-16 h-16 mb-4" />
              ) : (
                <AlertCircle className="w-16 h-16 mb-4" />
              )}
              <h2 className="text-xl font-semibold mb-2">
                {result.success ? 'Surveys Sent!' : 'Failed to Send'}
              </h2>
              <p className="text-surface-600 dark:text-dark-text-muted text-center mb-6">{result.message}</p>
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
              <>
                {/* Demo Mode CTA */}
                <div className="mt-6 p-6 bg-gradient-to-r from-primary-50 to-teal-50 dark:from-dark-primary/20 dark:to-teal-900/20 rounded-xl border-2 border-primary-200 dark:border-dark-primary/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-100 dark:bg-dark-primary/30 rounded-xl">
                      <Eye className="w-8 h-8 text-primary-600 dark:text-dark-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary-900 dark:text-dark-text mb-1">🎯 Demo Mode Available</h3>
                      <p className="text-sm text-primary-700 dark:text-dark-text-muted mb-4">
                        See exactly what recipients will receive! Preview the complete email survey flow, including how they can respond directly in the email.
                      </p>
                      <button
                        onClick={() => setShowDemoMode(true)}
                        className="btn-primary"
                      >
                        <Eye className="w-4 h-4" />
                        View Email Preview
                      </button>
                    </div>
                  </div>
                </div>

                {/* Maildev info */}
                <div className="mt-4 p-4 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
                  <h3 className="font-medium text-surface-800 dark:text-dark-text mb-2">📧 Local Development</h3>
                  <p className="text-sm text-surface-600 dark:text-dark-text-muted mb-3">
                    If you&apos;re running Maildev locally, you can view actual sent emails at:
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
              </>
            )}
          </div>
        )
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600 dark:text-dark-primary" />
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
                      ? 'border-primary-500 bg-primary-50 dark:border-dark-primary dark:bg-dark-primary/20'
                      : 'border-surface-200 hover:border-surface-300 dark:border-dark-border dark:hover:border-dark-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-surface-900 dark:text-dark-text">{template.name}</span>
                    {template.isDefault && (
                      <span className="badge-primary text-xs">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-surface-500 dark:text-dark-text-muted">
                    {template.questionCount} questions
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Municipality Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-600 dark:text-dark-primary" />
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
                        ? 'border-primary-500 bg-primary-50 dark:border-dark-primary dark:bg-dark-primary/20'
                        : 'border-surface-200 hover:border-surface-300 dark:border-dark-border dark:hover:border-dark-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleMunicipalityToggle(m.id, e.target.checked)}
                        className="w-4 h-4 rounded border-surface-300 dark:border-dark-border text-primary-600 dark:text-dark-primary focus:ring-primary-500 dark:focus:ring-dark-primary dark:bg-dark-surface"
                      />
                      <span className="font-medium text-surface-900 dark:text-dark-text">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-surface-400 dark:text-dark-text-muted" />
                      ) : (
                        <span className={`flex items-center gap-1 text-sm ${emailCount > 0 ? 'text-primary-600 dark:text-dark-primary' : 'text-surface-400 dark:text-dark-text-muted'}`}>
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
              <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600 dark:text-dark-primary" />
                Recipients
                {selectedEmails.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-100 dark:bg-dark-primary/20 text-primary-700 dark:text-dark-primary rounded-full text-sm font-medium">
                    {selectedEmails.length} {selectedEmails.length === 1 ? 'email' : 'emails'} loaded
                  </span>
                )}
              </h3>
              <button type="button" className="p-1 hover:bg-surface-100 dark:hover:bg-dark-surface-light rounded">
                {showEmailList ? <ChevronUp className="w-5 h-5 text-surface-500 dark:text-dark-text-muted" /> : <ChevronDown className="w-5 h-5 text-surface-500 dark:text-dark-text-muted" />}
              </button>
            </div>

            {showEmailList && (
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
                      <p className="text-xs text-surface-500 dark:text-dark-text-muted">Click × to remove an email</p>
                    </div>
                    <div className="max-h-48 overflow-y-auto bg-surface-50 dark:bg-dark-surface-light rounded-lg p-3">
                      <div className="flex flex-wrap gap-2">
                        {selectedEmails.map((email) => (
                          <span
                            key={email}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm ${
                              additionalEmails.includes(email)
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : 'bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border text-surface-700 dark:text-dark-text'
                            }`}
                          >
                            {email}
                            <button
                              type="button"
                              onClick={() => handleRemoveEmail(email)}
                              className="p-0.5 hover:bg-surface-200 dark:hover:bg-dark-surface-lighter rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
                    <Users className="w-10 h-10 text-surface-300 dark:text-dark-text-muted mx-auto mb-2" />
                    <p className="text-surface-500 dark:text-dark-text-muted text-sm">
                      {selectedMunicipalities.length === 0
                        ? 'Select municipalities above to load email recipients'
                        : isLoadingAnyEmails
                        ? 'Loading email recipients...'
                        : 'No email recipients found. Upload emails for the selected municipalities or add them manually.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Summary when collapsed */}
            {!showEmailList && selectedEmails.length === 0 && selectedMunicipalities.length > 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                No email recipients. Click to add emails manually.
              </p>
            )}
          </div>

          {/* Survey Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary-600 dark:text-dark-primary" />
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
                  className="w-4 h-4 rounded border-surface-300 dark:border-dark-border text-primary-600 dark:text-dark-primary focus:ring-primary-500 dark:focus:ring-dark-primary dark:bg-dark-surface"
                />
                <label htmlFor="parseReplies" className="text-sm text-surface-700 dark:text-dark-text">
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
