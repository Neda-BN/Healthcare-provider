'use client'

import { useState, useEffect } from 'react'
import {
  MapPin,
  Users,
  Building2,
  Home,
  Phone,
  Mail,
  Search,
  Plus,
  Pencil,
  MoreVertical,
  ChevronRight,
} from 'lucide-react'

interface District {
  id: string
  name: string
  code: string
  population: number
  area: string
  mainContact: string
  contactEmail: string
  contactPhone: string
  activePlacements: number
  healthcareProviders: number
  neighborhoods: string[]
  status: 'active' | 'inactive'
}

// Mock data for districts
const mockDistricts: District[] = [
  {
    id: '1',
    name: 'Norrmalm',
    code: 'NRM',
    population: 74000,
    area: '2.5 km²',
    mainContact: 'Anna Lindberg',
    contactEmail: 'anna.lindberg@stockholm.se',
    contactPhone: '+46 8 508 01 234',
    activePlacements: 23,
    healthcareProviders: 4,
    neighborhoods: ['Vasastaden', 'Norra Bantorget', 'Hötorget', 'Brunkebergstorg'],
    status: 'active',
  },
  {
    id: '2',
    name: 'Södermalm',
    code: 'SDM',
    population: 127000,
    area: '8.8 km²',
    mainContact: 'Erik Johansson',
    contactEmail: 'erik.johansson@stockholm.se',
    contactPhone: '+46 8 508 02 345',
    activePlacements: 34,
    healthcareProviders: 6,
    neighborhoods: ['Hornstull', 'Medborgarplatsen', 'Slussen', 'Tantolunden', 'Mariatorget'],
    status: 'active',
  },
  {
    id: '3',
    name: 'Kungsholmen',
    code: 'KHM',
    population: 71000,
    area: '4.0 km²',
    mainContact: 'Maria Svensson',
    contactEmail: 'maria.svensson@stockholm.se',
    contactPhone: '+46 8 508 03 456',
    activePlacements: 18,
    healthcareProviders: 3,
    neighborhoods: ['Fridhemsplan', 'Rådhuset', 'Kristineberg', 'Stadshagen'],
    status: 'active',
  },
  {
    id: '4',
    name: 'Östermalm',
    code: 'OST',
    population: 73000,
    area: '4.7 km²',
    mainContact: 'Johan Bergström',
    contactEmail: 'johan.bergstrom@stockholm.se',
    contactPhone: '+46 8 508 04 567',
    activePlacements: 15,
    healthcareProviders: 5,
    neighborhoods: ['Stureplan', 'Karlaplan', 'Gärdet', 'Djurgården'],
    status: 'active',
  },
  {
    id: '5',
    name: 'Hägersten-Liljeholmen',
    code: 'HGL',
    population: 95000,
    area: '19.5 km²',
    mainContact: 'Lisa Karlsson',
    contactEmail: 'lisa.karlsson@stockholm.se',
    contactPhone: '+46 8 508 05 678',
    activePlacements: 28,
    healthcareProviders: 4,
    neighborhoods: ['Liljeholmen', 'Hägersten', 'Midsommarkransen', 'Telefonplan'],
    status: 'active',
  },
  {
    id: '6',
    name: 'Skärholmen',
    code: 'SKH',
    population: 47000,
    area: '16.4 km²',
    mainContact: 'Anders Nilsson',
    contactEmail: 'anders.nilsson@stockholm.se',
    contactPhone: '+46 8 508 06 789',
    activePlacements: 42,
    healthcareProviders: 7,
    neighborhoods: ['Skärholmen centrum', 'Bredäng', 'Sätra', 'Vårberg'],
    status: 'active',
  },
]

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)

  useEffect(() => {
    setTimeout(() => {
      setDistricts(mockDistricts)
      setLoading(false)
    }, 500)
  }, [])

  const filteredDistricts = districts.filter(district =>
    district.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    district.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    district.neighborhoods.some(n => n.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalPopulation = districts.reduce((sum, d) => sum + d.population, 0)
  const totalPlacements = districts.reduce((sum, d) => sum + d.activePlacements, 0)

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
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">Districts</h1>
          <p className="text-surface-500 dark:text-dark-text-muted mt-1">
            Geographic areas covered by this municipality
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Add District
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-dark-primary/20 rounded-lg">
              <MapPin className="w-5 h-5 text-primary-600 dark:text-dark-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-dark-text">{districts.length}</p>
              <p className="text-sm text-surface-500 dark:text-dark-text-muted">Districts</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-dark-text">
                {(totalPopulation / 1000).toFixed(0)}k
              </p>
              <p className="text-sm text-surface-500 dark:text-dark-text-muted">Population</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Home className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-dark-text">{totalPlacements}</p>
              <p className="text-sm text-surface-500 dark:text-dark-text-muted">Active Placements</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-dark-text">
                {districts.reduce((sum, d) => sum + d.healthcareProviders, 0)}
              </p>
              <p className="text-sm text-surface-500 dark:text-dark-text-muted">Providers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
        <input
          type="text"
          placeholder="Search districts or neighborhoods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {/* Districts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDistricts.map((district) => (
          <div
            key={district.id}
            className="card hover:shadow-lg dark:hover:shadow-dark-glow transition-all duration-200 cursor-pointer group"
            onClick={() => setSelectedDistrict(district)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-100 dark:bg-dark-primary/20 rounded-xl group-hover:bg-primary-200 dark:group-hover:bg-dark-primary/30 transition-colors">
                  <MapPin className="w-5 h-5 text-primary-600 dark:text-dark-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-dark-primary transition-colors">
                    {district.name}
                  </h3>
                  <span className="text-xs text-surface-500 dark:text-dark-text-muted font-mono">
                    {district.code}
                  </span>
                </div>
              </div>
              <button
                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-surface-100 dark:hover:bg-dark-surface-light rounded-lg transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle edit
                }}
              >
                <MoreVertical className="w-4 h-4 text-surface-500 dark:text-dark-text-muted" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-surface-400 dark:text-dark-text-muted" />
                  <span className="text-xs text-surface-500 dark:text-dark-text-muted">Population</span>
                </div>
                <p className="font-semibold text-surface-900 dark:text-dark-text">
                  {district.population.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Home className="w-4 h-4 text-surface-400 dark:text-dark-text-muted" />
                  <span className="text-xs text-surface-500 dark:text-dark-text-muted">Placements</span>
                </div>
                <p className="font-semibold text-surface-900 dark:text-dark-text">
                  {district.activePlacements}
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="mb-4">
              <p className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
                {district.mainContact}
              </p>
              <p className="text-xs text-surface-500 dark:text-dark-text-muted">
                {district.contactEmail}
              </p>
            </div>

            {/* Neighborhoods */}
            <div className="flex flex-wrap gap-1.5">
              {district.neighborhoods.slice(0, 3).map((neighborhood, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-surface-100 dark:bg-dark-surface-light text-surface-600 dark:text-dark-text-muted rounded text-xs"
                >
                  {neighborhood}
                </span>
              ))}
              {district.neighborhoods.length > 3 && (
                <span className="px-2 py-0.5 bg-primary-50 dark:bg-dark-primary/20 text-primary-600 dark:text-dark-primary rounded text-xs">
                  +{district.neighborhoods.length - 3} more
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200 dark:border-dark-border">
              <span className="text-xs text-surface-500 dark:text-dark-text-muted">
                {district.healthcareProviders} providers
              </span>
              <span className="text-xs text-primary-600 dark:text-dark-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                View details
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredDistricts.length === 0 && (
        <div className="card text-center py-12">
          <MapPin className="w-12 h-12 mx-auto text-surface-300 dark:text-dark-text-muted mb-4" />
          <p className="text-surface-500 dark:text-dark-text-muted">No districts found matching your search.</p>
        </div>
      )}

      {/* District Detail Modal */}
      {selectedDistrict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70"
            onClick={() => setSelectedDistrict(null)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-dark-surface rounded-2xl shadow-xl dark:shadow-dark-soft overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 dark:bg-dark-primary/20 rounded-xl">
                    <MapPin className="w-8 h-8 text-primary-600 dark:text-dark-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">
                      {selectedDistrict.name}
                    </h2>
                    <p className="text-surface-500 dark:text-dark-text-muted font-mono">
                      District Code: {selectedDistrict.code}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDistrict(null)}
                  className="p-2 hover:bg-surface-100 dark:hover:bg-dark-surface-light rounded-lg transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
                  <p className="text-2xl font-bold text-surface-900 dark:text-dark-text">
                    {selectedDistrict.population.toLocaleString()}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-dark-text-muted">Population</p>
                </div>
                <div className="text-center p-4 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
                  <p className="text-2xl font-bold text-surface-900 dark:text-dark-text">
                    {selectedDistrict.area}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-dark-text-muted">Area</p>
                </div>
                <div className="text-center p-4 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
                  <p className="text-2xl font-bold text-surface-900 dark:text-dark-text">
                    {selectedDistrict.activePlacements}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-dark-text-muted">Placements</p>
                </div>
                <div className="text-center p-4 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
                  <p className="text-2xl font-bold text-surface-900 dark:text-dark-text">
                    {selectedDistrict.healthcareProviders}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-dark-text-muted">Providers</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text mb-3">Contact Information</h3>
                <div className="bg-surface-50 dark:bg-dark-surface-light rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-surface-400 dark:text-dark-text-muted" />
                    <span className="text-surface-700 dark:text-dark-text">{selectedDistrict.mainContact}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-surface-400 dark:text-dark-text-muted" />
                    <a href={`mailto:${selectedDistrict.contactEmail}`} className="text-primary-600 dark:text-dark-primary hover:underline">
                      {selectedDistrict.contactEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-surface-400 dark:text-dark-text-muted" />
                    <a href={`tel:${selectedDistrict.contactPhone}`} className="text-primary-600 dark:text-dark-primary hover:underline">
                      {selectedDistrict.contactPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Neighborhoods */}
              <div className="mb-6">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text mb-3">Neighborhoods</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDistrict.neighborhoods.map((neighborhood, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-primary-50 dark:bg-dark-primary/20 text-primary-700 dark:text-dark-primary rounded-full text-sm"
                    >
                      {neighborhood}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-dark-border">
                <button
                  onClick={() => setSelectedDistrict(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button className="btn-primary">
                  <Pencil className="w-4 h-4" />
                  Edit District
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

