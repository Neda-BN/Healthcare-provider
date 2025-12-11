import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  BarChart3,
  ChevronRight,
  Calendar,
} from 'lucide-react'

async function getMunicipalities() {
  const municipalities = await prisma.municipality.findMany({
    where: { active: true },
    include: {
      surveys: {
        where: { status: 'COMPLETED' },
        include: {
          responses: {
            where: { ratingValue: { not: null } },
          },
        },
      },
      placements: {
        where: { status: 'ACTIVE' },
      },
    },
    orderBy: { name: 'asc' },
  })

  return municipalities.map((m) => {
    const allRatings = m.surveys.flatMap((s) =>
      s.responses.map((r) => r.ratingValue!)
    )
    const avgScore = allRatings.length > 0
      ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
      : 0

    return {
      id: m.id,
      name: m.name,
      contactEmail: m.contactEmail,
      contactPhone: m.contactPhone,
      city: m.city,
      surveyCount: m.surveys.length,
      activePlacements: m.placements.length,
      avgScore,
      frameworkAgreementEnd: m.frameworkAgreementEnd?.toISOString(),
    }
  })
}

export default async function MunicipalitiesPage() {
  const municipalities = await getMunicipalities()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Municipalities</h1>
          <p className="text-surface-500 mt-1">Manage and view all municipality partnerships</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {municipalities.map((municipality) => (
          <Link
            key={municipality.id}
            href={`/municipality/${municipality.id}`}
            className="card-hover group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">
                    {municipality.name}
                  </h3>
                  {municipality.city && (
                    <p className="text-sm text-surface-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {municipality.city}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-surface-300 group-hover:text-primary-600 transition-colors" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-2 bg-surface-50 rounded-lg">
                <div className="text-xl font-bold text-surface-900">{municipality.surveyCount}</div>
                <div className="text-xs text-surface-500">Surveys</div>
              </div>
              <div className="text-center p-2 bg-surface-50 rounded-lg">
                <div className="text-xl font-bold text-surface-900">{municipality.activePlacements}</div>
                <div className="text-xs text-surface-500">Placements</div>
              </div>
              <div className="text-center p-2 bg-primary-50 rounded-lg">
                <div className="text-xl font-bold text-primary-700">{municipality.avgScore}/10</div>
                <div className="text-xs text-primary-600">Avg Score</div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-surface-600">
              {municipality.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-surface-400" />
                  <span className="truncate">{municipality.contactEmail}</span>
                </div>
              )}
              {municipality.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-surface-400" />
                  {municipality.contactPhone}
                </div>
              )}
              {municipality.frameworkAgreementEnd && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-surface-400" />
                  <span>
                    Agreement ends: {new Date(municipality.frameworkAgreementEnd).toLocaleDateString('sv-SE')}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {municipalities.length === 0 && (
        <div className="card text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-surface-300 mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 mb-2">No municipalities yet</h3>
          <p className="text-surface-500">Run the seed command to add demo municipalities.</p>
        </div>
      )}
    </div>
  )
}

