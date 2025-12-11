'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Check,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Download,
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
  id: string
  name: string
  surveyCount: number
  avgScore: number
  categoryAverages: Array<{ category: string; average: number }>
  strengths: Array<{ category: string; average: number }>
  weaknesses: Array<{ category: string; average: number }>
}

interface AnalysisData {
  municipalities: MunicipalityData[]
  categories: string[]
}

const chartColors = [
  'rgba(13, 148, 136, 0.8)',
  'rgba(249, 112, 102, 0.8)',
  'rgba(168, 162, 158, 0.8)',
  'rgba(59, 130, 246, 0.8)',
]

const darkChartColors = [
  'rgba(6, 182, 212, 0.8)',
  'rgba(249, 112, 102, 0.8)',
  'rgba(148, 163, 184, 0.8)',
  'rgba(96, 165, 250, 0.8)',
]

export default function AnalyseContent({ data }: { data: AnalysisData }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const colors = isDark ? darkChartColors : chartColors

  const [selectedIds, setSelectedIds] = useState<string[]>(
    data.municipalities.slice(0, 3).map((m) => m.id)
  )

  const selectedMunicipalities = useMemo(
    () => data.municipalities.filter((m) => selectedIds.includes(m.id)),
    [data.municipalities, selectedIds]
  )

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((i) => i !== id))
      }
    } else if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id])
    }
  }

  // Prepare comparison chart data
  const comparisonChartData = useMemo(() => ({
    labels: data.categories,
    datasets: selectedMunicipalities.map((m, i) => ({
      label: m.name,
      data: data.categories.map((cat) => {
        const catData = m.categoryAverages.find((c) => c.category === cat)
        return catData?.average || 0
      }),
      backgroundColor: colors[i],
      borderRadius: 4,
    })),
  }), [selectedMunicipalities, data.categories, colors])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          color: isDark ? '#F1F5F9' : '#1c1917',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
          text: 'Average Score',
          color: isDark ? '#94A3B8' : '#78716c',
        },
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

  // Calculate deltas between municipalities
  const calculateDelta = (m1: MunicipalityData, m2: MunicipalityData, category: string) => {
    const v1 = m1.categoryAverages.find((c) => c.category === category)?.average || 0
    const v2 = m2.categoryAverages.find((c) => c.category === category)?.average || 0
    return Math.round((v1 - v2) * 10) / 10
  }

  const handleExportCSV = () => {
    const headers = ['Category', ...selectedMunicipalities.map((m) => m.name)]
    const rows = data.categories.map((cat) => [
      cat,
      ...selectedMunicipalities.map((m) => {
        const catData = m.categoryAverages.find((c) => c.category === cat)
        return catData?.average.toString() || '0'
      }),
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'municipality-comparison.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">
            Comparative Analysis
          </h1>
          <p className="text-surface-500 dark:text-dark-text-muted mt-1">
            Compare performance across municipalities (select 2-4)
          </p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Municipality Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4">Select Municipalities</h3>
        <div className="flex flex-wrap gap-3">
          {data.municipalities.map((m) => {
            const isSelected = selectedIds.includes(m.id)
            const colorIndex = selectedIds.indexOf(m.id)
            return (
              <button
                key={m.id}
                onClick={() => toggleSelection(m.id)}
                disabled={!isSelected && selectedIds.length >= 4}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:border-dark-primary dark:bg-dark-primary/20'
                    : 'border-surface-200 hover:border-surface-300 dark:border-dark-border dark:hover:border-dark-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'border-primary-500 bg-primary-500 dark:border-dark-primary dark:bg-dark-primary' : 'border-surface-300 dark:border-dark-border'
                  }`}
                  style={isSelected ? { backgroundColor: colors[colorIndex].replace('0.8', '1') } : {}}
                >
                  {isSelected && <Check className="w-3 h-3 text-white dark:text-dark-primary-text" />}
                </div>
                <span className={isSelected ? 'text-primary-700 dark:text-dark-primary font-medium' : 'text-surface-700 dark:text-dark-text'}>
                  {m.name}
                </span>
                <span className="text-sm text-surface-500 dark:text-dark-text-muted">({m.avgScore}/10)</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedMunicipalities.map((m, i) => (
          <motion.div
            key={m.id}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[i].replace('0.8', '1') }}
              />
              <h4 className="font-semibold text-surface-900 dark:text-dark-text">{m.name}</h4>
            </div>
            <div className="text-3xl font-bold text-surface-900 dark:text-dark-text">{m.avgScore}/10</div>
            <p className="text-sm text-surface-500 dark:text-dark-text-muted mt-1">{m.surveyCount} surveys completed</p>
          </motion.div>
        ))}
      </div>

      {/* Comparison Chart */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4">Score Comparison by Category</h3>
        <div className="h-96">
          <Bar data={comparisonChartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Comparison Table */}
      <motion.div
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4">Detailed Comparison</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="sticky left-0 bg-surface-50 dark:bg-dark-surface">Category</th>
                {selectedMunicipalities.map((m, i) => (
                  <th key={m.id} className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[i].replace('0.8', '1') }}
                      />
                      {m.name}
                    </div>
                  </th>
                ))}
                {selectedMunicipalities.length === 2 && <th className="text-center">Delta</th>}
              </tr>
            </thead>
            <tbody>
              {data.categories.map((category) => (
                <tr key={category}>
                  <td className="sticky left-0 bg-white dark:bg-dark-surface font-medium">{category}</td>
                  {selectedMunicipalities.map((m) => {
                    const catData = m.categoryAverages.find((c) => c.category === category)
                    const score = catData?.average || 0
                    return (
                      <td key={m.id} className="text-center">
                        <span
                          className={`font-medium ${
                            score >= 8
                              ? 'text-green-600 dark:text-green-400'
                              : score >= 6
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-accent-600 dark:text-accent-400'
                          }`}
                        >
                          {score}
                        </span>
                      </td>
                    )
                  })}
                  {selectedMunicipalities.length === 2 && (
                    <td className="text-center">
                      {(() => {
                        const delta = calculateDelta(
                          selectedMunicipalities[0],
                          selectedMunicipalities[1],
                          category
                        )
                        return (
                          <span
                            className={`flex items-center justify-center gap-1 ${
                              delta > 0
                                ? 'text-green-600 dark:text-green-400'
                                : delta < 0
                                ? 'text-accent-600 dark:text-accent-400'
                                : 'text-surface-500 dark:text-dark-text-muted'
                            }`}
                          >
                            {delta > 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : delta < 0 ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : null}
                            {delta > 0 ? '+' : ''}
                            {delta}
                          </span>
                        )
                      })()}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedMunicipalities.map((m, i) => (
          <motion.div
            key={m.id}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[i].replace('0.8', '1') }}
              />
              <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text">{m.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-surface-700 dark:text-dark-text">Top Strengths</span>
                </div>
                <div className="space-y-2">
                  {m.strengths.map((s, j) => (
                    <div key={s.category} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <span className="text-sm text-surface-700 dark:text-dark-text">{s.category}</span>
                      <span className="font-medium text-green-700 dark:text-green-400">{s.average}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium text-surface-700 dark:text-dark-text">Areas to Improve</span>
                </div>
                <div className="space-y-2">
                  {m.weaknesses.map((w, j) => (
                    <div key={w.category} className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                      <span className="text-sm text-surface-700 dark:text-dark-text">{w.category}</span>
                      <span className="font-medium text-amber-700 dark:text-amber-400">{w.average}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
