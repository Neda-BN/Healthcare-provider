'use client'

import { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import {
  Plus,
  GripVertical,
  Trash2,
  Edit3,
  Save,
  Eye,
  X,
  Hash,
  AlignLeft,
  ToggleLeft,
  FileText,
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
  questions: Question[]
}

interface QuestionBuilderProps {
  initialTemplate: Template | null
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

export default function QuestionBuilder({ initialTemplate }: QuestionBuilderProps) {
  const [template, setTemplate] = useState<Template>(
    initialTemplate || {
      id: '',
      name: 'New Survey Template',
      description: '',
      questions: [],
    }
  )
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)

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
    toast.success('Question saved')
  }

  const handleDeleteQuestion = (id: string) => {
    setTemplate({
      ...template,
      questions: template.questions
        .filter((q) => q.id !== id)
        .map((q, i) => ({ ...q, orderIndex: i })),
    })
    toast.success('Question deleted')
  }

  const handleReorder = (newOrder: Question[]) => {
    setTemplate({
      ...template,
      questions: newOrder.map((q, i) => ({ ...q, orderIndex: i })),
    })
  }

  const handleSaveTemplate = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/templates', {
        method: template.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })
      if (!res.ok) throw new Error('Failed to save template')
      const data = await res.json()
      setTemplate({ ...template, id: data.id })
      toast.success('Template saved successfully')
    } catch (error) {
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  // Group questions by category
  const categories = Array.from(new Set(template.questions.map((q) => q.category))).filter(Boolean) as string[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">Question Builder</h1>
          <p className="text-surface-500 dark:text-dark-text-muted mt-1">Create and manage survey questions</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPreview(true)} className="btn-secondary">
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button onClick={handleSaveTemplate} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Template Name</label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="input"
              placeholder="Enter template name"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <input
              type="text"
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
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
          <Reorder.Group
            axis="y"
            values={template.questions}
            onReorder={handleReorder}
            className="space-y-2"
          >
            {template.questions.map((question) => {
              const Icon = questionTypeIcons[question.questionType]
              return (
                <Reorder.Item
                  key={question.id}
                  value={question}
                  className="flex items-center gap-3 p-4 bg-surface-50 dark:bg-dark-surface-light rounded-lg border border-surface-200 dark:border-dark-border cursor-move hover:border-primary-300 dark:hover:border-dark-primary transition-colors"
                >
                  <GripVertical className="w-5 h-5 text-surface-400 dark:text-dark-text-muted flex-shrink-0" />
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
                    <p className="text-surface-700 dark:text-dark-text mt-1 truncate">{question.questionText || 'No question text'}</p>
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
                </Reorder.Item>
              )
            })}
          </Reorder.Group>
        ) : (
          <div className="text-center py-12 bg-surface-50 dark:bg-dark-surface-light rounded-lg border-2 border-dashed border-surface-200 dark:border-dark-border">
            <FileText className="w-12 h-12 mx-auto text-surface-300 dark:text-dark-text-muted mb-4" />
            <p className="text-surface-500 dark:text-dark-text-muted">No questions yet</p>
            <button onClick={handleAddQuestion} className="btn-primary btn-sm mt-4">
              <Plus className="w-4 h-4" />
              Add your first question
            </button>
          </div>
        )}
      </div>

      {/* Question Editor Modal */}
      {editingQuestion && (
        <QuestionEditor
          question={editingQuestion}
          categories={categories}
          onSave={handleSaveQuestion}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          template={template}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}

// Question Editor Component
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl dark:shadow-dark-soft w-full max-w-lg max-h-[90vh] overflow-auto"
      >
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
                    onClick={() => setForm({
                      ...form,
                      questionType: type,
                      minValue: type === 'RATING' ? 1 : null,
                      maxValue: type === 'RATING' ? 10 : null,
                    })}
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

        <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-200 dark:border-dark-border bg-surface-50 dark:bg-dark-surface-light">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="btn-primary">
            <Save className="w-4 h-4" />
            Save Question
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Preview Modal Component
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-xl dark:shadow-dark-soft w-full max-w-2xl max-h-[90vh] overflow-auto"
      >
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
          {categories.length > 0 ? (
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
          )}
        </div>
      </motion.div>
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
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className="rating-btn"
                    disabled
                  >
                    {n}
                  </button>
                ))}
                <button className="rating-btn rating-btn-na" disabled>N/A</button>
              </div>
            )}
            {question.questionType === 'YESNO' && (
              <div className="flex gap-2">
                <button className="btn-secondary btn-sm" disabled>Yes</button>
                <button className="btn-secondary btn-sm" disabled>No</button>
                <button className="btn-secondary btn-sm" disabled>N/A</button>
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
