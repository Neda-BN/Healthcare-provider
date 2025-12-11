import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Database, FileText, Building2, Users, MessageSquare } from 'lucide-react'

async function getMasterData() {
  const [
    municipalityCount,
    templateCount,
    questionCount,
    surveyCount,
    responseCount,
    userCount,
  ] = await Promise.all([
    prisma.municipality.count({ where: { active: true } }),
    prisma.surveyTemplate.count({ where: { active: true } }),
    prisma.surveyQuestion.count(),
    prisma.survey.count(),
    prisma.surveyResponse.count(),
    prisma.user.count({ where: { active: true } }),
  ])

  const settings = await prisma.systemSetting.findMany()

  return {
    stats: {
      municipalityCount,
      templateCount,
      questionCount,
      surveyCount,
      responseCount,
      userCount,
    },
    settings,
  }
}

export default async function MasterDataPage() {
  const session = await getSession()
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const { stats, settings } = await getMasterData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900">Master Data</h1>
        <p className="text-surface-500 mt-1">System data overview and configuration</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Municipalities', value: stats.municipalityCount, icon: Building2 },
          { label: 'Templates', value: stats.templateCount, icon: FileText },
          { label: 'Questions', value: stats.questionCount, icon: MessageSquare },
          { label: 'Surveys', value: stats.surveyCount, icon: FileText },
          { label: 'Responses', value: stats.responseCount, icon: MessageSquare },
          { label: 'Users', value: stats.userCount, icon: Users },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <stat.icon className="w-5 h-5 mx-auto text-primary-600 mb-2" />
            <div className="text-2xl font-bold text-surface-900">{stat.value}</div>
            <div className="text-xs text-surface-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* System Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900">System Settings</h2>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => (
                <tr key={setting.id}>
                  <td className="font-mono text-sm">{setting.key}</td>
                  <td>{setting.value}</td>
                  <td>
                    <span className="badge-neutral">{setting.category}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Info */}
      <div className="card bg-surface-50">
        <h3 className="font-semibold text-surface-900 mb-3">Database Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-surface-500">Provider:</span>
            <span className="ml-2 font-mono">SQLite (demo)</span>
          </div>
          <div>
            <span className="text-surface-500">Location:</span>
            <span className="ml-2 font-mono">prisma/dev.db</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-surface-500">
          For production, update DATABASE_URL in .env to use PostgreSQL.
        </p>
      </div>
    </div>
  )
}

