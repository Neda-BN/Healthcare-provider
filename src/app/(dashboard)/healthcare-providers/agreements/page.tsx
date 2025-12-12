'use client'

import { useState, useEffect } from 'react'
import {
  ScrollText,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  Filter,
} from 'lucide-react'

interface Agreement {
  id: string
  providerName: string
  organizationNumber: string
  businessType: string
  startDate: string
  endDate: string
  status: 'active' | 'expiring' | 'expired'
  contractValue: string
  services: string[]
  lastReviewDate: string
  nextReviewDate: string
  notes: string
}

// Mock data for agreements
const mockAgreements: Agreement[] = [
  {
    id: '1',
    providerName: 'Nordic Care AB',
    organizationNumber: '556123-4567',
    businessType: 'HVB',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    status: 'active',
    contractValue: '2 500 000 SEK',
    services: ['HVB-hem för ungdomar', 'Akutplacering', 'Familjehemsverksamhet'],
    lastReviewDate: '2024-06-15',
    nextReviewDate: '2025-06-15',
    notes: 'Utmärkt samarbete. Förlängning rekommenderas.',
  },
  {
    id: '2',
    providerName: 'Omsorg Plus AB',
    organizationNumber: '556234-5678',
    businessType: 'LSS',
    startDate: '2024-03-01',
    endDate: '2025-02-28',
    status: 'expiring',
    contractValue: '1 800 000 SEK',
    services: ['LSS-boende', 'Daglig verksamhet', 'Korttidsvistelse'],
    lastReviewDate: '2024-09-01',
    nextReviewDate: '2025-01-15',
    notes: 'Avtal utgår snart. Förhandlingar om förlängning pågår.',
  },
  {
    id: '3',
    providerName: 'Trygg Vård Sverige',
    organizationNumber: '556345-6789',
    businessType: 'ELDERLY_CARE',
    startDate: '2024-07-01',
    endDate: '2026-06-30',
    status: 'active',
    contractValue: '3 200 000 SEK',
    services: ['Särskilt boende', 'Demensboende', 'Korttidsboende', 'Hemtjänst'],
    lastReviewDate: '2024-12-01',
    nextReviewDate: '2025-06-01',
    notes: 'Nytt avtal. God kvalitet hittills.',
  },
  {
    id: '4',
    providerName: 'Familjevård Norr',
    organizationNumber: '556456-7890',
    businessType: 'HVB',
    startDate: '2023-10-01',
    endDate: '2025-09-30',
    status: 'active',
    contractValue: '1 200 000 SEK',
    services: ['Familjehem', 'Konsulentstödd familjehemsvård'],
    lastReviewDate: '2024-04-01',
    nextReviewDate: '2025-04-01',
    notes: 'Stabil leverantör med god track record.',
  },
]

const businessTypeLabels: Record<string, string> = {
  HVB: 'HVB',
  LSS: 'LSS',
  ELDERLY_CARE: 'Äldreomsorg',
  SUPPORTIVE_HOUSING: 'Stödboende',
}

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null)

  useEffect(() => {
    setTimeout(() => {
      setAgreements(mockAgreements)
      setLoading(false)
    }, 500)
  }, [])

  const filteredAgreements = agreements.filter(agreement => {
    if (filterStatus === 'all') return true
    return agreement.status === filterStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Aktivt
          </span>
        )
      case 'expiring':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Utgår snart
          </span>
        )
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            Utgånget
          </span>
        )
      default:
        return null
    }
  }

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-dark-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">Framework Agreements</h1>
          <p className="text-surface-500 dark:text-dark-text-muted mt-1">
            Manage and review healthcare provider agreements
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {agreements.filter(a => a.status === 'active').length}
              </p>
              <p className="text-sm text-green-600 dark:text-green-500">Active Agreements</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {agreements.filter(a => a.status === 'expiring').length}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-500">Expiring Soon</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-primary-50 to-teal-50 dark:from-dark-primary/20 dark:to-teal-900/20 border-primary-200 dark:border-dark-primary">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-dark-primary/30 rounded-lg">
              <ScrollText className="w-5 h-5 text-primary-600 dark:text-dark-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-700 dark:text-dark-primary">
                {agreements.length}
              </p>
              <p className="text-sm text-primary-600 dark:text-dark-text-muted">Total Agreements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-surface-400 dark:text-dark-text-muted" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-48"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Agreements Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Type</th>
              <th>Period</th>
              <th>Contract Value</th>
              <th>Status</th>
              <th>Days Left</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgreements.map((agreement) => {
              const daysLeft = getDaysUntilExpiry(agreement.endDate)
              return (
                <tr key={agreement.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-50 dark:bg-dark-primary/20 rounded-lg">
                        <Building2 className="w-4 h-4 text-primary-600 dark:text-dark-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-dark-text">{agreement.providerName}</p>
                        <p className="text-xs text-surface-500 dark:text-dark-text-muted">{agreement.organizationNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="px-2 py-1 bg-surface-100 dark:bg-dark-surface-light rounded text-sm text-surface-700 dark:text-dark-text">
                      {businessTypeLabels[agreement.businessType] || agreement.businessType}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm">
                      <p className="text-surface-900 dark:text-dark-text">
                        {new Date(agreement.startDate).toLocaleDateString('sv-SE')}
                      </p>
                      <p className="text-surface-500 dark:text-dark-text-muted">
                        to {new Date(agreement.endDate).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                  </td>
                  <td className="font-medium text-surface-900 dark:text-dark-text">
                    {agreement.contractValue}
                  </td>
                  <td>{getStatusBadge(agreement.status)}</td>
                  <td>
                    <span className={`font-semibold ${
                      daysLeft < 30 ? 'text-red-600 dark:text-red-400' :
                      daysLeft < 90 ? 'text-amber-600 dark:text-amber-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedAgreement(agreement)}
                        className="p-2 hover:bg-surface-100 dark:hover:bg-dark-surface-light rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-surface-600 dark:text-dark-text-muted" />
                      </button>
                      <button
                        className="p-2 hover:bg-surface-100 dark:hover:bg-dark-surface-light rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-surface-600 dark:text-dark-text-muted" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Agreement Detail Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70"
            onClick={() => setSelectedAgreement(null)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-dark-surface rounded-2xl shadow-xl dark:shadow-dark-soft overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-100 dark:bg-dark-primary/20 rounded-xl">
                    <ScrollText className="w-6 h-6 text-primary-600 dark:text-dark-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-surface-900 dark:text-dark-text">
                      {selectedAgreement.providerName}
                    </h2>
                    <p className="text-surface-500 dark:text-dark-text-muted">
                      {selectedAgreement.organizationNumber}
                    </p>
                  </div>
                </div>
                {getStatusBadge(selectedAgreement.status)}
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm text-surface-500 dark:text-dark-text-muted">Contract Period</label>
                  <p className="font-medium text-surface-900 dark:text-dark-text">
                    {new Date(selectedAgreement.startDate).toLocaleDateString('sv-SE')} - {new Date(selectedAgreement.endDate).toLocaleDateString('sv-SE')}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-surface-500 dark:text-dark-text-muted">Contract Value</label>
                  <p className="font-medium text-surface-900 dark:text-dark-text">{selectedAgreement.contractValue}</p>
                </div>
                <div>
                  <label className="text-sm text-surface-500 dark:text-dark-text-muted">Last Review</label>
                  <p className="font-medium text-surface-900 dark:text-dark-text">
                    {new Date(selectedAgreement.lastReviewDate).toLocaleDateString('sv-SE')}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-surface-500 dark:text-dark-text-muted">Next Review</label>
                  <p className="font-medium text-surface-900 dark:text-dark-text">
                    {new Date(selectedAgreement.nextReviewDate).toLocaleDateString('sv-SE')}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-surface-500 dark:text-dark-text-muted">Services Included</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAgreement.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-50 dark:bg-dark-primary/20 text-primary-700 dark:text-dark-primary rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-surface-500 dark:text-dark-text-muted">Notes</label>
                <p className="mt-1 text-surface-700 dark:text-dark-text bg-surface-50 dark:bg-dark-surface-light p-3 rounded-lg">
                  {selectedAgreement.notes}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-dark-border">
                <button
                  onClick={() => setSelectedAgreement(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button className="btn-primary">
                  <Download className="w-4 h-4" />
                  Download Agreement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

