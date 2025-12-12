'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  Eye,
  X,
  Hash,
  AlignLeft,
  ToggleLeft,
  FileText,
  ArrowLeft,
  Check,
  Send,
  ChevronUp,
  ChevronDown,
  Home,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Question {
  id: string
  questionCode: string
  questionText: string
  questionType: 'RATING' | 'YESNO' | 'TEXT' | 'LONGTEXT'
  category: string
  orderIndex: number
  required: boolean
  minValue: number | null
  maxValue: number | null
}

interface Template {
  id: string
  name: string
  description: string
  version: number
  isDefault: boolean
  surveyType?: 'HVB' | 'LSS' | 'CUSTOM'
  questions: Question[]
}

interface TemplateEditorProps {
  initialTemplate: Template
}

const questionTypeIcons = {
  RATING: Hash,
  YESNO: ToggleLeft,
  TEXT: AlignLeft,
  LONGTEXT: FileText,
}

const questionTypeLabels = {
  RATING: 'Rating (1-10)',
  YESNO: 'Yes/No',
  TEXT: 'Short Text',
  LONGTEXT: 'Long Text',
}

export default function TemplateEditor({ initialTemplate }: TemplateEditorProps) {
  const router = useRouter()
  const [template, setTemplate] = useState<Template>(initialTemplate)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `new-${Date.now()}`,
      questionCode: `Q${template.questions.length + 1}`,
      questionText: '',
      questionType: 'RATING',
      category: '',
      orderIndex: template.questions.length,
      required: true,
      minValue: 1,
      maxValue: 10,
    }
    setEditingQuestion(newQuestion)
  }

  const handleSaveQuestion = (question: Question) => {
    const existing = template.questions.find((q) => q.id === question.id)
    if (existing) {
      setTemplate({
        ...template,
        questions: template.questions.map((q) => (q.id === question.id ? question : q)),
      })
    } else {
      setTemplate({
        ...template,
        questions: [...template.questions, question],
      })
    }
    setEditingQuestion(null)
    setHasChanges(true)
    toast.success('Question saved')
  }

  const handleDeleteQuestion = (id: string) => {
    setTemplate({
      ...template,
      questions: template.questions
        .filter((q) => q.id !== id)
        .map((q, i) => ({ ...q, orderIndex: i })),
    })
    setHasChanges(true)
    toast.success('Question deleted')
  }

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...template.questions]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex < 0 || newIndex >= newQuestions.length) return
    
    const temp = newQuestions[index]
    newQuestions[index] = newQuestions[newIndex]
    newQuestions[newIndex] = temp
    
    const reorderedQuestions = newQuestions.map((q, i) => ({ ...q, orderIndex: i }))
    
    setTemplate({
      ...template,
      questions: reorderedQuestions,
    })
    setHasChanges(true)
  }

  const handleSaveTemplate = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })
      if (!res.ok) throw new Error('Failed to save template')
      const data = await res.json()
      
      // Update local state with server response
      setTemplate({
        ...template,
        version: data.version,
        questions: data.questions.map((q: any) => ({
          id: q.id,
          questionCode: q.questionCode,
          questionText: q.questionText,
          questionType: q.questionType as 'RATING' | 'YESNO' | 'TEXT' | 'LONGTEXT',
          category: q.category || '',
          orderIndex: q.orderIndex,
          required: q.required,
          minValue: q.minValue,
          maxValue: q.maxValue,
        })),
      })
      
      setHasChanges(false)
      toast.success('Survey saved successfully')
    } catch (error) {
      toast.error('Failed to save survey')
    } finally {
      setSaving(false)
    }
  }

  const handleTemplateInfoChange = (field: 'name' | 'description', value: string) => {
    setTemplate({ ...template, [field]: value })
    setHasChanges(true)
  }

  const categories = Array.from(new Set(template.questions.map((q) => q.category))).filter(Boolean) as string[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/surveys/builder"
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-surface-500 dark:text-dark-text-muted" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">
                Edit Survey
              </h1>
              {template.surveyType && template.surveyType !== 'CUSTOM' && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  template.surveyType === 'HVB'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {template.surveyType === 'HVB' ? <Home className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                  {template.surveyType}
                </span>
              )}
              {hasChanges && (
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                  Unsaved changes
                </span>
              )}
            </div>
            <p className="text-surface-500 dark:text-dark-text-muted mt-1">
              {template.name} • Version {template.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPreview(true)} className="btn-secondary">
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <Link href={`/surveys/send?template=${template.id}`} className="btn-secondary">
            <Send className="w-4 h-4" />
            Send Survey
          </Link>
          <button onClick={handleSaveTemplate} disabled={saving || !hasChanges} className="btn-primary">
            {saving ? (
              <>
                <Save className="w-4 h-4 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4">Survey Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Survey Name</label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => handleTemplateInfoChange('name', e.target.value)}
              className="input"
              placeholder="Enter survey name"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <input
              type="text"
              value={template.description}
              onChange={(e) => handleTemplateInfoChange('description', e.target.value)}
              className="input"
              placeholder="Brief description"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text">
            Questions ({template.questions.length})
          </h2>
          <button onClick={handleAddQuestion} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {template.questions.length > 0 ? (
          <div className="space-y-2">
            {template.questions.map((question, index) => {
              const Icon = questionTypeIcons[question.questionType]
              return (
                <div
                  key={question.id}
                  className="flex items-center gap-3 p-4 bg-surface-50 dark:bg-dark-surface-light rounded-lg border border-surface-200 dark:border-dark-border hover:border-primary-300 dark:hover:border-dark-primary transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-surface-200 dark:hover:bg-dark-surface-lighter disabled:opacity-30 disabled:cursor-not-allowed text-surface-400 dark:text-dark-text-muted"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveQuestion(index, 'down')}
                      disabled={index === template.questions.length - 1}
                      className="p-1 rounded hover:bg-surface-200 dark:hover:bg-dark-surface-lighter disabled:opacity-30 disabled:cursor-not-allowed text-surface-400 dark:text-dark-text-muted"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-primary-600 dark:text-dark-primary bg-primary-50 dark:bg-dark-primary/20 px-2 py-0.5 rounded">
                        {question.questionCode}
                      </span>
                      {question.category && (
                        <span className="badge-neutral text-xs">{question.category}</span>
                      )}
                      {!question.required && (
                        <span className="badge-warning text-xs">Optional</span>
                      )}
                    </div>
                    <p className="text-surface-700 dark:text-dark-text mt-1 truncate">
                      {question.questionText || 'No question text'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-surface-500 dark:text-dark-text-muted">
                      <Icon className="w-3 h-3" />
                      {questionTypeLabels[question.questionType]}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingQuestion(question)}
                      className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-dark-surface-lighter text-surface-500 dark:text-dark-text-muted hover:text-surface-700 dark:hover:text-dark-text transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900/30 text-surface-500 dark:text-dark-text-muted hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface-50 dark:bg-dark-surface-light rounded-lg border-2 border-dashed border-surface-200 dark:border-dark-border">
            <FileText className="w-12 h-12 mx-auto text-surface-300 dark:text-dark-text-muted mb-4" />
            <p className="text-surface-500 dark:text-dark-text-muted mb-2">No questions yet</p>
            <p className="text-sm text-surface-400 dark:text-dark-text-muted mb-4">
              Add questions to build your survey
            </p>
            <button onClick={handleAddQuestion} className="btn-primary btn-sm">
              <Plus className="w-4 h-4" />
              Add your first question
            </button>
          </div>
        )}
      </div>

      {/* Question Editor Modal - No Framer Motion */}
      {editingQuestion && (
        <QuestionEditor
          question={editingQuestion}
          categories={categories}
          onSave={handleSaveQuestion}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      {/* Preview Modal - No Framer Motion */}
      {showPreview && (
        <PreviewModal
          template={template}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}

// Question Editor Component - Pure React, no Framer Motion
function QuestionEditor({
  question,
  categories,
  onSave,
  onClose,
}: {
  question: Question
  categories: string[]
  onSave: (question: Question) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(question)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl dark:shadow-dark-soft w-full max-w-lg max-h-[90vh] overflow-auto animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-dark-border">
          <h2 className="text-xl font-display font-bold text-surface-900 dark:text-dark-text">
            {question.id.startsWith('new-') ? 'Add Question' : 'Edit Question'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface-light">
            <X className="w-5 h-5 text-surface-500 dark:text-dark-text-muted" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Question Code</label>
              <input
                type="text"
                value={form.questionCode}
                onChange={(e) => setForm({ ...form, questionCode: e.target.value })}
                className="input font-mono"
                placeholder="Q1a"
              />
            </div>
            <div>
              <label className="label">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input"
                placeholder="Enter or select"
                list="categories"
              />
              <datalist id="categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="label">Question Text</label>
            <textarea
              value={form.questionText}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              className="input min-h-[100px]"
              placeholder="Enter the question..."
            />
          </div>

          <div>
            <label className="label">Question Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['RATING', 'YESNO', 'TEXT', 'LONGTEXT'] as const).map((type) => {
                const Icon = questionTypeIcons[type]
                return (
                  <button
                    key={type}
                    onClick={() =>
                      setForm({
                        ...form,
                        questionType: type,
                        minValue: type === 'RATING' ? 1 : null,
                        maxValue: type === 'RATING' ? 10 : null,
                      })
                    }
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      form.questionType === type
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-dark-primary dark:bg-dark-primary/20 dark:text-dark-primary'
                        : 'border-surface-200 hover:border-surface-300 dark:border-dark-border dark:hover:border-dark-primary/50 dark:text-dark-text'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{questionTypeLabels[type]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={form.required}
              onChange={(e) => setForm({ ...form, required: e.target.checked })}
              className="w-4 h-4 rounded border-surface-300 dark:border-dark-border text-primary-600 dark:text-dark-primary focus:ring-primary-500 dark:focus:ring-dark-primary dark:bg-dark-surface"
            />
            <label htmlFor="required" className="text-sm text-surface-700 dark:text-dark-text">
              Required question
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-200 dark:border-dark-border bg-surface-50 dark:bg-dark-surface-light rounded-b-2xl">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="btn-primary">
            <Save className="w-4 h-4" />
            Save Question
          </button>
        </div>
      </div>
    </div>
  )
}

// Preview Modal Component - Pure React, no Framer Motion
function PreviewModal({
  template,
  onClose,
}: {
  template: Template
  onClose: () => void
}) {
  const categories = Array.from(new Set(template.questions.map((q) => q.category))).filter(Boolean) as string[]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl dark:shadow-dark-soft w-full max-w-2xl max-h-[90vh] overflow-auto animate-fade-in">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-surface-200 dark:border-dark-border bg-white dark:bg-dark-surface">
          <div>
            <h2 className="text-xl font-display font-bold text-surface-900 dark:text-dark-text">{template.name}</h2>
            <p className="text-sm text-surface-500 dark:text-dark-text-muted">{template.description}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface-light">
            <X className="w-5 h-5 text-surface-500 dark:text-dark-text-muted" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {template.questions.length > 0 ? (
            categories.length > 0 ? (
              categories.map((category) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-primary-700 dark:text-dark-primary mb-4">{category}</h3>
                  <div className="space-y-4">
                    {template.questions
                      .filter((q) => q.category === category)
                      .map((q) => (
                        <QuestionPreview key={q.id} question={q} />
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-4">
                {template.questions.map((q) => (
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
function QuestionPreview({ question }: { question: Question }) {
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
              <input type="text" className="input" placeholder="Short answer..." disabled />
            )}
            {question.questionType === 'LONGTEXT' && (
              <textarea className="input min-h-[80px]" placeholder="Your comments..." disabled />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
