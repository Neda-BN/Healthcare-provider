import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Heart, Mail, Calendar, FileText } from 'lucide-react'

async function getCaregivers() {
  return prisma.user.findMany({
    where: { role: 'CAREGIVER' },
    include: {
      surveys: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export default async function CaregiversPage() {
  const session = await getSession()
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const caregivers = await getCaregivers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900">Caregivers</h1>
        <p className="text-surface-500 mt-1">View and manage caregiver accounts</p>
      </div>

      <div className="grid gap-4">
        {caregivers.map((caregiver) => (
          <div key={caregiver.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <Heart className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900">{caregiver.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {caregiver.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined {new Date(caregiver.createdAt).toLocaleDateString('sv-SE')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{caregiver.surveys.length}</div>
                <div className="text-xs text-surface-500">Surveys created</div>
              </div>
            </div>

            {caregiver.surveys.length > 0 && (
              <div className="mt-4 pt-4 border-t border-surface-200">
                <p className="text-sm font-medium text-surface-700 mb-2">Recent Surveys</p>
                <div className="flex flex-wrap gap-2">
                  {caregiver.surveys.map((survey) => (
                    <span key={survey.id} className="badge-neutral flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {survey.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {caregivers.length === 0 && (
        <div className="card text-center py-12">
          <Heart className="w-12 h-12 mx-auto text-surface-300 mb-4" />
          <p className="text-surface-500">No caregivers found.</p>
        </div>
      )}
    </div>
  )
}

