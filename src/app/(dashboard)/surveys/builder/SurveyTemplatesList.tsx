'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  FileText,
  Edit3,
  Trash2,
  Eye,
  Search,
  ClipboardList,
  Star,
  MoreVertical,
  Calendar,
  Hash,
  Send,
  X,
  Copy,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface TemplateSummary {
  id: string
  name: string
  description: string
  version: number
  isDefault: boolean
  questionCount: number
  surveyCount: number
  createdAt: string
  updatedAt: string
}

interface SurveyTemplatesListProps {
  initialTemplates: TemplateSummary[]
}

export default function SurveyTemplatesList({ initialTemplates }: SurveyTemplatesListProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState<TemplateSummary[]>(initialTemplates)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // New survey form state
  const [newSurveyName, setNewSurveyName] = useState('')
  const [newSurveyDescription, setNewSurveyDescription] = useState('')

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateSurvey = async () => {
    if (!newSurveyName.trim()) {
      toast.error('Please enter a survey name')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSurveyName,
          description: newSurveyDescription,
          questions: [],
        }),
      })

      if (!res.ok) throw new Error('Failed to create survey')
      
      const newTemplate = await res.json()
      toast.success('Survey created successfully')
      
      // Close modal first, then navigate
      setShowCreateModal(false)
      setNewSurveyName('')
      setNewSurveyDescription('')
      
      // Small delay to let React finish state updates before navigation
      setTimeout(() => {
        router.push(`/surveys/builder/${newTemplate.id}`)
      }, 100)
    } catch (error) {
      toast.error('Failed to create survey')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete survey')
      
      setTemplates(templates.filter((t) => t.id !== id))
      toast.success('Survey deleted successfully')
      setShowDeleteModal(null)
    } catch (error) {
      toast.error('Failed to delete survey')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicate = async (template: TemplateSummary) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/templates/${template.id}`)
      if (!res.ok) throw new Error('Failed to fetch template')
      const fullTemplate = await res.json()

      const duplicateRes = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description,
          questions: fullTemplate.questions.map((q: any) => ({
            questionCode: q.questionCode,
            questionText: q.questionText,
            questionType: q.questionType,
            category: q.category,
            required: q.required,
            minValue: q.minValue,
            maxValue: q.maxValue,
          })),
        }),
      })

      if (!duplicateRes.ok) throw new Error('Failed to duplicate survey')
      
      const newTemplate = await duplicateRes.json()
      setTemplates([
        {
          id: newTemplate.id,
          name: newTemplate.name,
          description: newTemplate.description || '',
          version: 1,
          isDefault: false,
          questionCount: newTemplate.questions.length,
          surveyCount: 0,
          createdAt: newTemplate.createdAt,
          updatedAt: newTemplate.updatedAt,
        },
        ...templates,
      ])
      toast.success('Survey duplicated successfully')
      setActiveMenu(null)
    } catch (error) {
      toast.error('Failed to duplicate survey')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = async (id: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/templates/${id}`)
      if (!res.ok) throw new Error('Failed to fetch template')
      const data = await res.json()
      setPreviewData(data)
      setShowPreviewModal(id)
    } catch (error) {
      toast.error('Failed to load preview')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">
            Survey Builder
          </h1>
          <p className="text-surface-500 dark:text-dark-text-muted mt-1">
            Create and manage your surveys with custom questions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Create New Survey
        </button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-dark-text-muted" />
          <input
            type="text"
            placeholder="Search surveys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-dark-text-muted">
          <ClipboardList className="w-4 h-4" />
          <span>{templates.length} templates</span>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template, index) => (
            <div
              key={template.id}
              className="card group hover:shadow-lg dark:hover:shadow-dark-soft transition-all duration-200 cursor-pointer relative"
              onClick={() => router.push(`/surveys/builder/${template.id}`)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Default badge */}
              {template.isDefault && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Star className="w-3 h-3" />
                    Default
                  </span>
                </div>
              )}

              {/* More options menu */}
              <div className="absolute top-3 right-3" style={{ right: template.isDefault ? '80px' : '12px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveMenu(activeMenu === template.id ? null : template.id)
                  }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-100 dark:hover:bg-dark-surface-light transition-all"
                >
                  <MoreVertical className="w-4 h-4 text-surface-500 dark:text-dark-text-muted" />
                </button>

                {activeMenu === template.id && (
                  <div
                    className="absolute right-0 top-8 w-44 bg-white dark:bg-dark-surface rounded-lg shadow-lg dark:shadow-dark-soft border border-surface-200 dark:border-dark-border py-1 z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        router.push(`/surveys/builder/${template.id}`)
                        setActiveMenu(null)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface-light"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Survey
                    </button>
                    <button
                      onClick={() => {
                        handlePreview(template.id)
                        setActiveMenu(null)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface-light"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface-light"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <Link
                      href={`/surveys/send?template=${template.id}`}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary-600 dark:text-dark-primary hover:bg-surface-50 dark:hover:bg-dark-surface-light"
                      onClick={() => setActiveMenu(null)}
                    >
                      <Send className="w-4 h-4" />
                      Send Survey
                    </Link>
                    <div className="my-1 border-t border-surface-200 dark:border-dark-border" />
                    <button
                      onClick={() => {
                        setShowDeleteModal(template.id)
                        setActiveMenu(null)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Card content */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-100 dark:bg-dark-primary/20 rounded-lg">
                  <FileText className="w-5 h-5 text-primary-600 dark:text-dark-primary" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="font-semibold text-surface-900 dark:text-dark-text truncate group-hover:text-primary-600 dark:group-hover:text-dark-primary transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-dark-text-muted mt-1 line-clamp-2">
                    {template.description || 'No description'}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-100 dark:border-dark-border text-sm text-surface-500 dark:text-dark-text-muted">
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  <span>{template.questionCount} questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>{template.surveyCount} sent</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-xs text-surface-400 dark:text-dark-text-muted">
                <Calendar className="w-3 h-3" />
                <span>Updated {formatDate(template.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-surface-300 dark:text-dark-text-muted mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-2">
            {searchQuery ? 'No surveys found' : 'No surveys yet'}
          </h3>
          <p className="text-surface-500 dark:text-dark-text-muted mb-4">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Create your first survey template to get started'}
          </p>
          {!searchQuery && (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Create New Survey
            </button>
          )}
        </div>
      )}

      {/* Create Modal - No Framer Motion */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl dark:shadow-dark-soft w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-dark-border">
              <h2 className="text-xl font-display font-bold text-surface-900 dark:text-dark-text">
                Create New Survey
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface-light"
              >
                <X className="w-5 h-5 text-surface-500 dark:text-dark-text-muted" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label">Survey Name *</label>
                <input
                  type="text"
                  value={newSurveyName}
                  onChange={(e) => setNewSurveyName(e.target.value)}
                  className="input"
                  placeholder="e.g., Municipality Satisfaction Survey 2024"
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Description (Optional)</label>
                <textarea
                  value={newSurveyDescription}
                  onChange={(e) => setNewSurveyDescription(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Brief description of this survey..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-200 dark:border-dark-border bg-surface-50 dark:bg-dark-surface-light rounded-b-2xl">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSurvey}
                disabled={isLoading || !newSurveyName.trim()}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                {isLoading ? 'Creating...' : 'Create Survey'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - No Framer Motion */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70"
            onClick={() => setShowDeleteModal(null)}
          />
          <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl dark:shadow-dark-soft w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-accent-100 dark:bg-accent-900/30">
              <Trash2 className="w-6 h-6 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-lg font-semibold text-center text-surface-900 dark:text-dark-text mb-2">
              Delete Survey?
            </h3>
            <p className="text-center text-surface-500 dark:text-dark-text-muted mb-6">
              This action cannot be undone. All questions in this survey will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTemplate(showDeleteModal)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal - No Framer Motion */}
      {showPreviewModal && previewData && (
        <PreviewModal
          template={previewData}
          onClose={() => {
            setShowPreviewModal(null)
            setPreviewData(null)
          }}
        />
      )}

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  )
}

// Preview Modal Component - No Framer Motion
function PreviewModal({
  template,
  onClose,
}: {
  template: any
  onClose: () => void
}) {
  const categories = Array.from(
    new Set(template.questions?.map((q: any) => q.category).filter(Boolean))
  ) as string[]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl dark:shadow-dark-soft w-full max-w-2xl max-h-[90vh] overflow-auto animate-fade-in">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-surface-200 dark:border-dark-border bg-white dark:bg-dark-surface">
          <div>
            <h2 className="text-xl font-display font-bold text-surface-900 dark:text-dark-text">
              {template.name}
            </h2>
            <p className="text-sm text-surface-500 dark:text-dark-text-muted">
              {template.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface-light"
          >
            <X className="w-5 h-5 text-surface-500 dark:text-dark-text-muted" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {template.questions?.length > 0 ? (
            categories.length > 0 ? (
              categories.map((category) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-primary-700 dark:text-dark-primary mb-4">
                    {category}
                  </h3>
                  <div className="space-y-4">
                    {template.questions
                      .filter((q: any) => q.category === category)
                      .map((q: any) => (
                        <QuestionPreview key={q.id} question={q} />
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-4">
                {template.questions.map((q: any) => (
                  <QuestionPreview key={q.id} question={q} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-8 text-surface-500 dark:text-dark-text-muted">
              No questions in this survey yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Question Preview Component
function QuestionPreview({ question }: { question: any }) {
  return (
    <div className="p-4 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
      <div className="flex items-start gap-3">
        <span className="font-mono text-sm text-primary-600 dark:text-dark-primary bg-primary-100 dark:bg-dark-primary/20 px-2 py-0.5 rounded mt-0.5">
          {question.questionCode}
        </span>
        <div className="flex-1">
          <p className="text-surface-900 dark:text-dark-text">
            {question.questionText}
            {question.required && <span className="text-accent-500 ml-1">*</span>}
          </p>
          <div className="mt-3">
            {question.questionType === 'RATING' && (
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button key={n} className="rating-btn" disabled>
                    {n}
                  </button>
                ))}
                <button className="rating-btn rating-btn-na" disabled>
                  N/A
                </button>
              </div>
            )}
            {question.questionType === 'YESNO' && (
              <div className="flex gap-2">
                <button className="btn-secondary btn-sm" disabled>
                  Yes
                </button>
                <button className="btn-secondary btn-sm" disabled>
                  No
                </button>
                <button className="btn-secondary btn-sm" disabled>
                  N/A
                </button>
              </div>
            )}
            {question.questionType === 'TEXT' && (
              <input
                type="text"
                className="input"
                placeholder="Short answer..."
                disabled
              />
            )}
            {question.questionType === 'LONGTEXT' && (
              <textarea
                className="input min-h-[80px]"
                placeholder="Your comments..."
                disabled
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
