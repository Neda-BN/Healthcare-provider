'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Award,
  AlertTriangle,
  ChevronRight,
  Send,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useTheme } from '@/contexts/ThemeContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface MunicipalityData {
  municipality: {
    id: string
    name: string
    contactEmail: string | null
    contactPhone: string | null
    address: string | null
    city: string | null
    frameworkAgreementStart: string | undefined
    frameworkAgreementEnd: string | undefined
  }
  stats: {
    totalSurveys: number
    completedSurveys: number
    responseRate: number
    avgScore: number
    activePlacements: number
  }
  categoryAverages: Array<{ category: string; average: number }>
  strengths: Array<{ category: string; average: number }>
  weaknesses: Array<{ category: string; average: number }>
  recentComments: Array<{
    id: string
    text: string
    category: string
    date: string
  }>
  surveys: Array<{
    id: string
    title: string
    status: string
    sentAt: string | undefined
    completedAt: string | undefined
    createdBy: string
    responseCount: number
  }>
}

export default function MunicipalityDashboard({ data }: { data: MunicipalityData }) {
  const { municipality, stats, categoryAverages, strengths, weaknesses, recentComments, surveys } = data
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartData = {
    labels: categoryAverages.map((c) => c.category),
    datasets: [
      {
        label: 'Average Score',
        data: categoryAverages.map((c) => c.average),
        backgroundColor: isDark ? 'rgba(6, 182, 212, 0.8)' : 'rgba(13, 148, 136, 0.8)',
        borderRadius: 6,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          color: isDark ? '#94A3B8' : '#78716c',
        },
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          color: isDark ? '#94A3B8' : '#78716c',
        },
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'badge-neutral',
      SENT: 'badge-warning',
      PARTIAL: 'badge-warning',
      COMPLETED: 'badge-success',
      CLOSED: 'badge-neutral',
    }
    return styles[status] || 'badge-neutral'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-dark-primary/20 rounded-xl">
              <Building2 className="w-6 h-6 text-primary-600 dark:text-dark-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">
              {municipality.name}
            </h1>
          </div>
          <p className="text-surface-500 dark:text-dark-text-muted mt-1 ml-12">Municipality Dashboard</p>
        </div>
        <Link href={`/surveys/send?municipality=${municipality.id}`} className="btn-primary">
          <Send className="w-4 h-4" />
          Send Survey
        </Link>
      </div>

      {/* Contact & Agreement Info */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {municipality.contactEmail && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
              <div>
                <p className="text-xs text-surface-500 dark:text-dark-text-muted">Email</p>
                <a href={`mailto:${municipality.contactEmail}`} className="text-primary-600 dark:text-dark-primary hover:underline">
                  {municipality.contactEmail}
                </a>
              </div>
            </div>
          )}
          {municipality.contactPhone && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
              <div>
                <p className="text-xs text-surface-500 dark:text-dark-text-muted">Phone</p>
                <span className="text-surface-900 dark:text-dark-text">{municipality.contactPhone}</span>
              </div>
            </div>
          )}
          {municipality.city && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
              <div>
                <p className="text-xs text-surface-500 dark:text-dark-text-muted">Location</p>
                <span className="text-surface-900 dark:text-dark-text">{municipality.address}, {municipality.city}</span>
              </div>
            </div>
          )}
          {municipality.frameworkAgreementEnd && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
              <div>
                <p className="text-xs text-surface-500 dark:text-dark-text-muted">Agreement Ends</p>
                <span className="text-surface-900 dark:text-dark-text">
                  {new Date(municipality.frameworkAgreementEnd).toLocaleDateString('sv-SE')}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Surveys', value: stats.totalSurveys, icon: FileText },
          { label: 'Completed', value: stats.completedSurveys, icon: TrendingUp },
          { label: 'Response Rate', value: `${stats.responseRate}%`, icon: Users },
          { label: 'Avg Score', value: `${stats.avgScore}/10`, icon: Award },
          { label: 'Active Placements', value: stats.activePlacements, icon: Building2 },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="card text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <stat.icon className="w-5 h-5 mx-auto text-primary-600 dark:text-dark-primary mb-2" />
            <p className="text-2xl font-bold text-surface-900 dark:text-dark-text">{stat.value}</p>
            <p className="text-xs text-surface-500 dark:text-dark-text-muted mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text">Top Strengths</h3>
          </div>
          <div className="space-y-3">
            {strengths.map((s, i) => (
              <div key={s.category} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-400 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-surface-700 dark:text-dark-text">{s.category}</span>
                </div>
                <span className="font-semibold text-green-700 dark:text-green-400">{s.average}/10</span>
              </div>
            ))}
            {strengths.length === 0 && (
              <p className="text-center text-surface-500 dark:text-dark-text-muted py-4">No data available</p>
            )}
          </div>
        </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text">Areas for Improvement</h3>
          </div>
          <div className="space-y-3">
            {weaknesses.map((w, i) => (
              <div key={w.category} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-800/50 text-amber-700 dark:text-amber-400 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-surface-700 dark:text-dark-text">{w.category}</span>
                </div>
                <span className="font-semibold text-amber-700 dark:text-amber-400">{w.average}/10</span>
              </div>
            ))}
            {weaknesses.length === 0 && (
              <p className="text-center text-surface-500 dark:text-dark-text-muted py-4">No data available</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Category Chart */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4">Scores by Category</h3>
        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Recent Surveys & Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Surveys */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text">Recent Surveys</h3>
            <Link href={`/municipalities/${municipality.id}/surveys`} className="text-sm text-primary-600 dark:text-dark-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {surveys.slice(0, 5).map((survey) => (
              <Link
                key={survey.id}
                href={`/surveys/${survey.id}`}
                className="flex items-center justify-between p-3 bg-surface-50 dark:bg-dark-surface-light rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface transition-colors group"
              >
                <div>
                  <p className="font-medium text-surface-900 dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-dark-primary">{survey.title}</p>
                  <p className="text-sm text-surface-500 dark:text-dark-text-muted">
                    {survey.completedAt
                      ? `Completed ${new Date(survey.completedAt).toLocaleDateString('sv-SE')}`
                      : `Sent ${survey.sentAt ? new Date(survey.sentAt).toLocaleDateString('sv-SE') : 'Draft'}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusBadge(survey.status)}>{survey.status}</span>
                  <ChevronRight className="w-4 h-4 text-surface-400 dark:text-dark-text-muted" />
                </div>
              </Link>
            ))}
            {surveys.length === 0 && (
              <p className="text-center text-surface-500 dark:text-dark-text-muted py-4">No surveys yet</p>
            )}
          </div>
        </motion.div>

        {/* Recent Comments */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4">Recent Comments</h3>
          <div className="space-y-3">
            {recentComments.map((comment) => (
              <div key={comment.id} className="p-3 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
                <p className="text-surface-700 dark:text-dark-text text-sm">&ldquo;{comment.text}&rdquo;</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-surface-500 dark:text-dark-text-muted">
                  <span className="badge-primary">{comment.category}</span>
                  <span>{new Date(comment.date).toLocaleDateString('sv-SE')}</span>
                </div>
              </div>
            ))}
            {recentComments.length === 0 && (
              <p className="text-center text-surface-500 dark:text-dark-text-muted py-4">No comments yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
