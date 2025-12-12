'use client'

import { useState, useEffect } from 'react'
import {
  Stethoscope,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Users,
  FileText,
  ExternalLink,
} from 'lucide-react'

interface HealthcareProvider {
  id: string
  name: string
  organizationNumber: string
  businessType: string
  contactEmail: string
  contactPhone: string
  address: string
  city: string
  rating: number
  activePlacements: number
  totalSurveys: number
  agreementStatus: 'active' | 'expiring' | 'expired'
  agreementEnd: string
  specializations: string[]
}

// Mock data for healthcare providers
const mockProviders: HealthcareProvider[] = [
  {
    id: '1',
    name: 'Nordic Care AB',
    organizationNumber: '556123-4567',
    businessType: 'HVB',
    contactEmail: 'kontakt@nordiccare.se',
    contactPhone: '+46 8 123 45 67',
    address: 'Storgatan 1',
    city: 'Stockholm',
    rating: 8.7,
    activePlacements: 12,
    totalSurveys: 45,
    agreementStatus: 'active',
    agreementEnd: '2025-12-31',
    specializations: ['Ungdomsvård', 'Familjehem', 'Akutplacering'],
  },
  {
    id: '2',
    name: 'Omsorg Plus AB',
    organizationNumber: '556234-5678',
    businessType: 'LSS',
    contactEmail: 'info@omsorgplus.se',
    contactPhone: '+46 31 234 56 78',
    address: 'Västra Hamngatan 10',
    city: 'Göteborg',
    rating: 7.9,
    activePlacements: 8,
    totalSurveys: 32,
    agreementStatus: 'expiring',
    agreementEnd: '2025-02-28',
    specializations: ['LSS-boende', 'Daglig verksamhet'],
  },
  {
    id: '3',
    name: 'Trygg Vård Sverige',
    organizationNumber: '556345-6789',
    businessType: 'ELDERLY_CARE',
    contactEmail: 'kontakt@tryggvard.se',
    contactPhone: '+46 40 345 67 89',
    address: 'Södra Förstadsgatan 25',
    city: 'Malmö',
    rating: 9.1,
    activePlacements: 15,
    totalSurveys: 67,
    agreementStatus: 'active',
    agreementEnd: '2026-06-30',
    specializations: ['Äldreomsorg', 'Demensboende', 'Korttidsboende'],
  },
  {
    id: '4',
    name: 'Familjevård Norr',
    organizationNumber: '556456-7890',
    businessType: 'HVB',
    contactEmail: 'info@familjevardnorr.se',
    contactPhone: '+46 90 456 78 90',
    address: 'Kungsgatan 15',
    city: 'Umeå',
    rating: 8.2,
    activePlacements: 6,
    totalSurveys: 24,
    agreementStatus: 'active',
    agreementEnd: '2025-09-30',
    specializations: ['Familjehem', 'Konsulentstödd familjehemsvård'],
  },
]

const businessTypeLabels: Record<string, string> = {
  HVB: 'HVB',
  LSS: 'LSS',
  ELDERLY_CARE: 'Äldreomsorg',
  SUPPORTIVE_HOUSING: 'Stödboende',
}

export default function HealthcareProvidersPage() {
  const [providers, setProviders] = useState<HealthcareProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setProviders(mockProviders)
      setLoading(false)
    }, 500)
  }, [])

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || provider.businessType === filterType
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Aktivt avtal
          </span>
        )
      case 'expiring':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Utgår snart
          </span>
        )
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            Utgånget
          </span>
        )
      default:
        return null
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return 'text-green-600 dark:text-green-400'
    if (rating >= 7) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
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
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">Healthcare Providers</h1>
          <p className="text-surface-500 dark:text-dark-text-muted mt-1">
            Overview of healthcare providers with active contracts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-primary-50 dark:bg-dark-primary/20 rounded-lg">
            <span className="text-2xl font-bold text-primary-600 dark:text-dark-primary">{providers.length}</span>
            <span className="text-sm text-primary-600 dark:text-dark-primary ml-2">Providers</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="all">All Types</option>
          <option value="HVB">HVB</option>
          <option value="LSS">LSS</option>
          <option value="ELDERLY_CARE">Äldreomsorg</option>
          <option value="SUPPORTIVE_HOUSING">Stödboende</option>
        </select>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="card hover:shadow-lg dark:hover:shadow-dark-glow transition-all duration-200 cursor-pointer group"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-primary-100 dark:bg-dark-primary/20 rounded-xl group-hover:bg-primary-200 dark:group-hover:bg-dark-primary/30 transition-colors">
                  <Stethoscope className="w-6 h-6 text-primary-600 dark:text-dark-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-dark-primary transition-colors">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-dark-text-muted">
                    {businessTypeLabels[provider.businessType] || provider.businessType}
                  </p>
                </div>
              </div>
              {getStatusBadge(provider.agreementStatus)}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 p-3 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
              <Star className={`w-5 h-5 ${getRatingColor(provider.rating)}`} />
              <span className={`text-xl font-bold ${getRatingColor(provider.rating)}`}>
                {provider.rating.toFixed(1)}
              </span>
              <span className="text-sm text-surface-500 dark:text-dark-text-muted">/ 10 quality rating</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-surface-400 dark:text-dark-text-muted" />
                <span className="text-sm text-surface-600 dark:text-dark-text">
                  <span className="font-semibold">{provider.activePlacements}</span> active placements
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-surface-400 dark:text-dark-text-muted" />
                <span className="text-sm text-surface-600 dark:text-dark-text">
                  <span className="font-semibold">{provider.totalSurveys}</span> surveys
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-surface-600 dark:text-dark-text-muted">
                <MapPin className="w-4 h-4" />
                <span>{provider.address}, {provider.city}</span>
              </div>
              <div className="flex items-center gap-2 text-surface-600 dark:text-dark-text-muted">
                <Mail className="w-4 h-4" />
                <span>{provider.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-surface-600 dark:text-dark-text-muted">
                <Phone className="w-4 h-4" />
                <span>{provider.contactPhone}</span>
              </div>
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-2 mb-4">
              {provider.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-surface-100 dark:bg-dark-surface-light text-surface-600 dark:text-dark-text-muted rounded-md text-xs"
                >
                  {spec}
                </span>
              ))}
            </div>

            {/* Agreement End */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-200 dark:border-dark-border">
              <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-dark-text-muted">
                <Calendar className="w-4 h-4" />
                <span>Agreement ends: {new Date(provider.agreementEnd).toLocaleDateString('sv-SE')}</span>
              </div>
              <button className="text-primary-600 dark:text-dark-primary hover:text-primary-700 dark:hover:text-dark-primary-hover text-sm font-medium flex items-center gap-1">
                View details
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="card text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-surface-300 dark:text-dark-text-muted mb-4" />
          <p className="text-surface-500 dark:text-dark-text-muted">No healthcare providers found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

