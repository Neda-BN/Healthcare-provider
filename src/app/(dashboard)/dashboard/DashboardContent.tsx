'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  TrendingUp,
  Users,
  BarChart3,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface DashboardData {
  totalSurveys: number
  completedSurveys: number
  responseRate: number
  municipalityStats: Array<{
    id: string
    name: string
    surveyCount: number
    avgScore: number
  }>
  categoryAverages: Array<{
    category: string
    average: number
    responseCount: number
  }>
  timeSeries: Array<{
    month: string
    surveyCount: number
    avgScore: number
  }>
  recentComments: Array<{
    id: string
    text: string
    municipality: string
    category: string
    date: string
  }>
}

interface DashboardContentProps {
  data: DashboardData
  userName: string
}

export default function DashboardContent({ data, userName }: DashboardContentProps) {
  const chartColors = {
    primary: 'rgb(13, 148, 136)',
    primaryLight: 'rgba(13, 148, 136, 0.2)',
    accent: 'rgb(249, 112, 102)',
    accentLight: 'rgba(249, 112, 102, 0.2)',
    surface: 'rgb(120, 113, 108)',
  }

  // Prepare chart data
  const timeSeriesChartData = useMemo(() => ({
    labels: data.timeSeries.map((d) => {
      const [year, month] = d.month.split('-')
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('sv-SE', {
        month: 'short',
        year: '2-digit',
      })
    }),
    datasets: [
      {
        label: 'Number of Surveys',
        data: data.timeSeries.map((d) => d.surveyCount),
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primaryLight,
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Average Score',
        data: data.timeSeries.map((d) => d.avgScore),
        borderColor: chartColors.accent,
        backgroundColor: chartColors.accentLight,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  }), [data.timeSeries])

  const categoryChartData = useMemo(() => ({
    labels: data.categoryAverages.map((c) => c.category),
    datasets: [
      {
        label: 'Average Score',
        data: data.categoryAverages.map((c) => c.average),
        backgroundColor: data.categoryAverages.map((_, i) =>
          `hsl(${170 + i * 15}, 70%, ${45 + i * 3}%)`
        ),
        borderRadius: 8,
      },
    ],
  }), [data.categoryAverages])

  const municipalityChartData = useMemo(() => ({
    labels: data.municipalityStats.map((m) => m.name),
    datasets: [
      {
        label: 'Average Score',
        data: data.municipalityStats.map((m) => m.avgScore),
        backgroundColor: [
          'rgba(13, 148, 136, 0.8)',
          'rgba(249, 112, 102, 0.8)',
          'rgba(168, 162, 158, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  }), [data.municipalityStats])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  }

  const timeSeriesOptions = {
    ...chartOptions,
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Surveys',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        min: 0,
        max: 10,
        title: {
          display: true,
          text: 'Score',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
    indexAxis: 'y' as const,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900">
          Welcome back, {userName.split(' ')[0]}
        </h1>
        <p className="text-surface-500 mt-1">
          Here&apos;s an overview of your survey performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Surveys',
            value: data.totalSurveys,
            icon: FileText,
            color: 'primary',
            change: '+12%',
            up: true,
          },
          {
            label: 'Completed',
            value: data.completedSurveys,
            icon: TrendingUp,
            color: 'primary',
            change: '+8%',
            up: true,
          },
          {
            label: 'Response Rate',
            value: `${data.responseRate}%`,
            icon: Users,
            color: 'accent',
            change: '-2%',
            up: false,
          },
          {
            label: 'Municipalities',
            value: data.municipalityStats.length,
            icon: BarChart3,
            color: 'primary',
            change: '0%',
            up: true,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-500">{stat.label}</p>
                <p className="text-3xl font-bold text-surface-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.color === 'primary' ? 'bg-primary-100' : 'bg-accent-100'}`}>
                <stat.icon className={`w-5 h-5 ${stat.color === 'primary' ? 'text-primary-600' : 'text-accent-600'}`} />
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-3 text-sm ${stat.up ? 'text-green-600' : 'text-accent-600'}`}>
              {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{stat.change} from last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Survey Trends</h3>
          <div className="chart-container">
            <Line data={timeSeriesChartData} options={timeSeriesOptions} />
          </div>
        </motion.div>

        {/* Municipality Comparison */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Municipality Performance</h3>
          <div className="chart-container flex items-center justify-center">
            <div className="w-64 h-64">
              <Doughnut data={municipalityChartData} options={chartOptions} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {data.municipalityStats.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ['#0d9488', '#f97066', '#a8a29e'][i] }}
                  />
                  <span className="text-surface-700">{m.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-surface-500">{m.surveyCount} surveys</span>
                  <span className="font-medium text-surface-900">{m.avgScore}/10</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Category Scores */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Scores by Category</h3>
        <div className="h-96">
          <Bar data={categoryChartData} options={barOptions} />
        </div>
      </motion.div>

      {/* Recent Comments */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-surface-900">Recent Comments</h3>
          <MessageSquare className="w-5 h-5 text-surface-400" />
        </div>
        <div className="space-y-4">
          {data.recentComments.length > 0 ? (
            data.recentComments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-surface-50 rounded-lg border border-surface-200"
              >
                <p className="text-surface-700">&ldquo;{comment.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-3 text-sm text-surface-500">
                  <span className="badge-primary">{comment.municipality}</span>
                  <span>{comment.category}</span>
                  <span>•</span>
                  <span>{new Date(comment.date).toLocaleDateString('sv-SE')}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-surface-500 py-8">No comments yet</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

