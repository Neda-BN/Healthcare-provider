'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Plus,
  Upload,
  Pencil,
  Trash2,
  Mail,
  Search,
  X,
  Check,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Municipality {
  id: string
  name: string
  description: string | null
  organizationNumber: string | null
  businessType: string | null
  contactEmail: string | null
  _count: {
    emails: number
    surveys: number
    placements: number
  }
}

interface ParsedEmails {
  emails: string[]
  count: number
  fileName: string
}

export default function ManageMunicipalitiesPage() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEmailsModal, setShowEmailsModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Email modal view state: 'list' or 'upload'
  const [emailModalView, setEmailModalView] = useState<'list' | 'upload'>('list')
  
  // Selected municipality
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null)
  const [municipalityEmails, setMunicipalityEmails] = useState<string[]>([])
  
  // Form states
  const [formName, setFormName] = useState('')
  const [formOrgNumber, setFormOrgNumber] = useState('')
  const [formBusinessType, setFormBusinessType] = useState('')
  const [formSaving, setFormSaving] = useState(false)
  
  // Business type options
  const businessTypeOptions = [
    { value: 'HVB', label: 'HVB' },
    { value: 'LSS', label: 'LSS' },
    { value: 'SUPPORTIVE_HOUSING', label: 'Supportive housing' },
    { value: 'ELDERLY_CARE', label: 'Elderly care' },
  ]
  
  // Upload states
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [parsedEmails, setParsedEmails] = useState<ParsedEmails | null>(null)
  const [uploadParsing, setUploadParsing] = useState(false)
  const [uploadSaving, setUploadSaving] = useState(false)
  const [replaceExisting, setReplaceExisting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Expanded row for email preview
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Fetch municipalities
  const fetchMunicipalities = async () => {
    try {
      const res = await fetch('/api/municipalities', {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setMunicipalities(data)
      }
    } catch (error) {
      console.error('Error fetching municipalities:', error)
      toast.error('Failed to load municipalities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMunicipalities()
  }, [])

  // Filter municipalities by search
  const filteredMunicipalities = municipalities.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Create municipality
  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error('Municipality name is required')
      return
    }

    setFormSaving(true)
    try {
      const res = await fetch('/api/municipalities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formName,
          organizationNumber: formOrgNumber,
          businessType: formBusinessType,
        }),
      })

      if (res.ok) {
        toast.success('Municipality created successfully')
        setShowCreateModal(false)
        resetForm()
        fetchMunicipalities()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create municipality')
      }
    } catch (error) {
      toast.error('Failed to create municipality')
    } finally {
      setFormSaving(false)
    }
  }

  // Update municipality
  const handleUpdate = async () => {
    if (!selectedMunicipality || !formName.trim()) {
      toast.error('Municipality name is required')
      return
    }

    setFormSaving(true)
    try {
      const res = await fetch(`/api/municipalities/${selectedMunicipality.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formName,
          organizationNumber: formOrgNumber,
          businessType: formBusinessType,
        }),
      })

      if (res.ok) {
        toast.success('Municipality updated successfully')
        setShowEditModal(false)
        resetForm()
        fetchMunicipalities()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update municipality')
      }
    } catch (error) {
      toast.error('Failed to update municipality')
    } finally {
      setFormSaving(false)
    }
  }

  // Delete municipality
  const handleDelete = async () => {
    if (!selectedMunicipality) return

    setFormSaving(true)
    try {
      const res = await fetch(`/api/municipalities/${selectedMunicipality.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        toast.success('Municipality deleted successfully')
        setShowDeleteConfirm(false)
        setSelectedMunicipality(null)
        fetchMunicipalities()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete municipality')
      }
    } catch (error) {
      toast.error('Failed to delete municipality')
    } finally {
      setFormSaving(false)
    }
  }

  // Parse uploaded file
  const handleFileUpload = async () => {
    if (!uploadFile) return

    setUploadParsing(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)

      const res = await fetch('/api/municipalities/upload-emails', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.count > 0) {
        setParsedEmails({
          emails: data.emails,
          count: data.count,
          fileName: data.fileName,
        })
        toast.success(`Found ${data.count} valid email addresses`)
      } else if (data.count === 0) {
        toast.error('No valid email addresses found in the file')
        setParsedEmails(null)
      } else {
        toast.error(data.error || 'Failed to parse file')
        setParsedEmails(null)
      }
    } catch (error) {
      toast.error('Failed to parse file')
      setParsedEmails(null)
    } finally {
      setUploadParsing(false)
    }
  }

  // Save parsed emails to municipality
  const handleSaveEmails = async () => {
    if (!selectedMunicipality || !parsedEmails) return

    setUploadSaving(true)
    try {
      const res = await fetch(`/api/municipalities/${selectedMunicipality.id}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          emails: parsedEmails.emails,
          replaceExisting,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`Saved ${data.added} emails. Total: ${data.total}`)
        
        // Update the municipalities list immediately to reflect the new email count
        await fetchMunicipalities()
        
        // Refresh emails and go back to list view
        await fetchMunicipalityEmails(selectedMunicipality.id)
        
        // Update the selected municipality count in state
        setSelectedMunicipality(prev => prev ? {
          ...prev,
          _count: { ...prev._count, emails: data.total }
        } : null)
        
        resetUploadForm()
        setEmailModalView('list')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save emails')
      }
    } catch (error) {
      toast.error('Failed to save emails')
    } finally {
      setUploadSaving(false)
    }
  }

  // Fetch emails for a municipality
  const fetchMunicipalityEmails = async (municipalityId: string) => {
    try {
      const res = await fetch(`/api/municipalities/${municipalityId}/emails`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setMunicipalityEmails(data.map((e: { email: string }) => e.email))
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
    }
  }

  // Open edit modal
  const openEditModal = (municipality: Municipality) => {
    setSelectedMunicipality(municipality)
    setFormName(municipality.name)
    setFormOrgNumber(municipality.organizationNumber || '')
    setFormBusinessType(municipality.businessType || '')
    setShowEditModal(true)
  }

  // Open emails modal (unified for viewing and uploading)
  const openEmailsModal = async (municipality: Municipality, startWithUpload = false) => {
    setSelectedMunicipality(municipality)
    await fetchMunicipalityEmails(municipality.id)
    setEmailModalView(startWithUpload ? 'upload' : 'list')
    setShowEmailsModal(true)
  }

  // Close emails modal
  const closeEmailsModal = () => {
    setShowEmailsModal(false)
    setMunicipalityEmails([])
    setEmailModalView('list')
    // Refresh municipalities list to ensure email counts are up to date
    fetchMunicipalities()
    resetUploadForm()
  }

  // Reset form
  const resetForm = () => {
    setFormName('')
    setFormOrgNumber('')
    setFormBusinessType('')
    setSelectedMunicipality(null)
  }

  // Reset upload form
  const resetUploadForm = () => {
    setUploadFile(null)
    setParsedEmails(null)
    setReplaceExisting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Toggle expanded row
  const toggleExpanded = async (municipalityId: string) => {
    if (expandedId === municipalityId) {
      setExpandedId(null)
    } else {
      await fetchMunicipalityEmails(municipalityId)
      setExpandedId(municipalityId)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Manage Municipalities</h1>
          <p className="text-surface-500 mt-1">Create, edit, and manage municipality email lists</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Municipality
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input
          type="text"
          placeholder="Search municipalities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {/* Municipalities Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="w-12 px-3 py-3 text-left font-medium text-surface-600"></th>
                <th className="w-[30%] px-4 py-3 text-left font-medium text-surface-600">Municipality</th>
                <th className="w-[20%] px-4 py-3 text-center font-medium text-surface-600">Email Recipients</th>
                <th className="w-[15%] px-4 py-3 text-center font-medium text-surface-600">Surveys</th>
                <th className="w-[15%] px-4 py-3 text-center font-medium text-surface-600">Placements</th>
                <th className="w-[20%] px-4 py-3 text-center font-medium text-surface-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMunicipalities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-surface-500">
                    {searchQuery ? 'No municipalities found matching your search' : 'No municipalities yet. Click "Add Municipality" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredMunicipalities.map((municipality) => (
                  <>
                    <tr key={municipality.id} className="group border-b border-surface-100 last:border-b-0 hover:bg-surface-50/50">
                      <td className="w-12 px-3 py-3">
                        <button
                          onClick={() => toggleExpanded(municipality.id)}
                          className="p-1 hover:bg-surface-100 rounded transition-colors"
                        >
                          {expandedId === municipality.id ? (
                            <ChevronUp className="w-4 h-4 text-surface-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-surface-400" />
                          )}
                        </button>
                      </td>
                      <td className="w-[30%] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary-50 rounded-lg flex-shrink-0">
                            <Building2 className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-surface-900 truncate">{municipality.name}</div>
                            {municipality.description && (
                              <div className="text-sm text-surface-500 truncate">{municipality.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="w-[20%] px-4 py-3 text-center">
                        <button
                          onClick={() => openEmailsModal(municipality)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-100 hover:bg-surface-200 rounded-full text-sm font-medium text-surface-700 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          {municipality._count.emails}
                        </button>
                      </td>
                      <td className="w-[15%] px-4 py-3 text-center text-surface-600">{municipality._count.surveys}</td>
                      <td className="w-[15%] px-4 py-3 text-center text-surface-600">{municipality._count.placements}</td>
                      <td className="w-[20%] px-4 py-3">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEmailsModal(municipality, true)}
                            className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Upload email list"
                          >
                            <Upload className="w-4 h-4 text-primary-600" />
                          </button>
                          <button
                            onClick={() => openEditModal(municipality)}
                            className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-surface-600" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMunicipality(municipality)
                              setShowDeleteConfirm(true)
                            }}
                            className="p-2 hover:bg-accent-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-accent-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded email preview row */}
                    {expandedId === municipality.id && (
                      <tr className="bg-surface-50">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="ml-10">
                            <div className="text-sm font-medium text-surface-700 mb-2">
                              Email Recipients ({municipality._count.emails})
                            </div>
                            {municipalityEmails.length > 0 ? (
                              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {municipalityEmails.slice(0, 20).map((email) => (
                                  <span key={email} className="px-2 py-1 bg-white border border-surface-200 rounded text-xs text-surface-600">
                                    {email}
                                  </span>
                                ))}
                                {municipalityEmails.length > 20 && (
                                  <span className="px-2 py-1 bg-surface-100 rounded text-xs text-surface-500">
                                    +{municipalityEmails.length - 20} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-surface-500">No email recipients yet</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Municipality Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal onClose={() => { setShowCreateModal(false); resetForm() }}>
            <div className="p-6">
              <h2 className="text-xl font-display font-bold text-surface-900 mb-4">Add Municipality</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Name <span className="text-accent-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="input w-full"
                    placeholder="e.g., Nordic Care AB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Organization Number</label>
                  <input
                    type="text"
                    value={formOrgNumber}
                    onChange={(e) => setFormOrgNumber(e.target.value)}
                    className="input w-full"
                    placeholder="e.g., 556123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Business Type</label>
                  <select
                    value={formBusinessType}
                    onChange={(e) => setFormBusinessType(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Select business type...</option>
                    {businessTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
                <button 
                  onClick={() => { setShowCreateModal(false); resetForm() }} 
                  className="px-4 py-2 bg-surface-100 text-surface-700 font-medium rounded-lg hover:bg-surface-200 transition-colors border border-surface-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate} 
                  disabled={formSaving} 
                  className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {formSaving ? 'Creating...' : 'Create Municipality'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Municipality Modal */}
      <AnimatePresence>
        {showEditModal && selectedMunicipality && (
          <Modal onClose={() => { setShowEditModal(false); resetForm() }}>
            <div className="p-6">
              <h2 className="text-xl font-display font-bold text-surface-900 mb-4">Edit Municipality</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Name <span className="text-accent-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Organization Number</label>
                  <input
                    type="text"
                    value={formOrgNumber}
                    onChange={(e) => setFormOrgNumber(e.target.value)}
                    className="input w-full"
                    placeholder="e.g., 556123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Business Type</label>
                  <select
                    value={formBusinessType}
                    onChange={(e) => setFormBusinessType(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Select business type...</option>
                    {businessTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
                <button 
                  onClick={() => { setShowEditModal(false); resetForm() }} 
                  className="px-4 py-2 bg-surface-100 text-surface-700 font-medium rounded-lg hover:bg-surface-200 transition-colors border border-surface-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate} 
                  disabled={formSaving} 
                  className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {formSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Unified Email Recipients Modal (View + Upload in one) */}
      <AnimatePresence>
        {showEmailsModal && selectedMunicipality && (
          <Modal onClose={closeEmailsModal} size="lg">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {emailModalView === 'upload' && (
                    <button
                      onClick={() => {
                        setEmailModalView('list')
                        resetUploadForm()
                      }}
                      className="p-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors border border-surface-200"
                      title="Go back"
                    >
                      <ArrowLeft className="w-5 h-5 text-surface-700" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-xl font-display font-bold text-surface-900">
                      {emailModalView === 'list' ? 'Email Recipients' : 'Upload Email List'}
                    </h2>
                    <p className="text-surface-500">
                      {selectedMunicipality.name} • {municipalityEmails.length} emails
                    </p>
                  </div>
                </div>
                {emailModalView === 'list' && (
                  <button
                    onClick={() => setEmailModalView('upload')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Emails
                  </button>
                )}
              </div>

              {/* Content */}
              {emailModalView === 'list' ? (
                /* Email List View */
                <>
                  {municipalityEmails.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto bg-surface-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {municipalityEmails.map((email) => (
                          <div key={email} className="flex items-center gap-2 px-3 py-2 bg-white border border-surface-200 rounded-lg">
                            <Mail className="w-4 h-4 text-surface-400" />
                            <span className="text-sm text-surface-700 truncate">{email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-surface-50 rounded-lg border-2 border-dashed border-surface-200">
                      <Users className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                      <p className="text-surface-600 mb-4">No email recipients yet</p>
                      <button 
                        onClick={() => setEmailModalView('upload')} 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Email List
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end mt-6 pt-4 border-t border-surface-200">
                    <button 
                      onClick={closeEmailsModal} 
                      className="px-4 py-2 bg-surface-100 text-surface-700 font-medium rounded-lg hover:bg-surface-200 transition-colors border border-surface-300"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                /* Upload View */
                <>
                  {!parsedEmails ? (
                    <div className="space-y-4">
                      {/* File Upload Drop Zone */}
                      <label 
                        htmlFor="file-upload" 
                        className="block border-2 border-dashed border-primary-300 bg-primary-50/50 rounded-xl p-8 text-center hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer group"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,.xls,.txt"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="file-upload"
                        />
                        <div className="flex justify-center mb-4">
                          <div className="p-4 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors">
                            <Upload className="w-8 h-8 text-primary-600" />
                          </div>
                        </div>
                        <p className="text-primary-900 font-semibold mb-1 group-hover:text-primary-700">Click to upload a file</p>
                        <p className="text-sm text-primary-600">CSV, XLSX, or TXT files supported</p>
                      </label>

                      {/* Selected File */}
                      {uploadFile && (
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            {uploadFile.name.endsWith('.csv') && <FileSpreadsheet className="w-6 h-6 text-green-600" />}
                            {(uploadFile.name.endsWith('.xlsx') || uploadFile.name.endsWith('.xls')) && <FileSpreadsheet className="w-6 h-6 text-blue-600" />}
                            {uploadFile.name.endsWith('.txt') && <FileText className="w-6 h-6 text-surface-600" />}
                            <div>
                              <p className="font-medium text-surface-900">{uploadFile.name}</p>
                              <p className="text-xs text-surface-500">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button 
                            onClick={resetUploadForm} 
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Remove file"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      {/* Supported Formats Info */}
                      <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                        <h4 className="font-medium text-surface-900 mb-2">Supported Formats</h4>
                        <ul className="text-sm text-surface-600 space-y-1">
                          <li>• <strong>CSV</strong> - Comma-separated values</li>
                          <li>• <strong>XLSX/XLS</strong> - Excel spreadsheet</li>
                          <li>• <strong>TXT</strong> - Plain text (one email per line)</li>
                        </ul>
                        <p className="text-xs text-surface-500 mt-2">
                          The system will automatically detect and extract all valid email addresses.
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
                        <button 
                          onClick={() => {
                            setEmailModalView('list')
                            resetUploadForm()
                          }} 
                          className="px-4 py-2 bg-surface-100 text-surface-700 font-medium rounded-lg hover:bg-surface-200 transition-colors border border-surface-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleFileUpload}
                          disabled={!uploadFile || uploadParsing}
                          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploadParsing ? 'Parsing...' : 'Parse File'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Preview parsed emails */
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                        <Check className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">
                            Found {parsedEmails.count} valid email addresses
                          </p>
                          <p className="text-sm text-green-700">from {parsedEmails.fileName}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-surface-900 mb-2">Preview (first 20)</h4>
                        <div className="max-h-48 overflow-y-auto bg-surface-50 rounded-lg p-3">
                          <div className="flex flex-wrap gap-2">
                            {parsedEmails.emails.slice(0, 20).map((email) => (
                              <span key={email} className="px-2 py-1 bg-white border border-surface-200 rounded text-sm">
                                {email}
                              </span>
                            ))}
                            {parsedEmails.emails.length > 20 && (
                              <span className="px-2 py-1 bg-surface-100 rounded text-sm text-surface-500">
                                +{parsedEmails.emails.length - 20} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {municipalityEmails.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                          <div className="flex-1">
                            <p className="text-sm text-amber-800">
                              This municipality already has {municipalityEmails.length} emails.
                            </p>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={replaceExisting}
                              onChange={(e) => setReplaceExisting(e.target.checked)}
                              className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-amber-800">Replace all</span>
                          </label>
                        </div>
                      )}

                      <div className="flex justify-between gap-3 pt-4 border-t border-surface-200">
                        <button
                          onClick={() => {
                            setParsedEmails(null)
                            setUploadFile(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                          className="px-4 py-2 text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-colors border border-primary-200"
                        >
                          Upload Different File
                        </button>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              setEmailModalView('list')
                              resetUploadForm()
                            }} 
                            className="px-4 py-2 bg-surface-100 text-surface-700 font-medium rounded-lg hover:bg-surface-200 transition-colors border border-surface-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEmails}
                            disabled={uploadSaving}
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {uploadSaving ? 'Saving...' : `Save ${parsedEmails.count} Emails`}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedMunicipality && (
          <Modal onClose={() => { setShowDeleteConfirm(false); setSelectedMunicipality(null) }}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-accent-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-surface-900">Delete Municipality</h2>
                  <p className="text-surface-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-surface-600 mb-6">
                Are you sure you want to delete <strong>{selectedMunicipality.name}</strong>? 
                This will also remove all {selectedMunicipality._count.emails} email recipients associated with this municipality.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setSelectedMunicipality(null) }} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={formSaving} className="btn bg-accent-600 text-white hover:bg-accent-700">
                  {formSaving ? 'Deleting...' : 'Delete Municipality'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// Modal Component
function Modal({ children, onClose, size = 'md' }: { children: React.ReactNode; onClose: () => void; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-xl z-50 max-h-[90vh] overflow-y-auto`}
      >
        {children}
      </motion.div>
    </>
  )
}
