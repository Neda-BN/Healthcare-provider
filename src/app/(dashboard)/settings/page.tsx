'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Mail,
  Bell,
  Shield,
  Palette,
  Save,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    companyName: 'Health Care Provider',
    emailReminders: true,
    reminderDays: 7,
    autoParseReplies: true,
    requireAllQuestions: false,
    darkMode: false,
  })

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Settings saved successfully')
    setSaving(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900">Settings</h1>
        <p className="text-surface-500 mt-1">Manage your application preferences</p>
      </div>

      {/* General Settings */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900">General</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="input"
            />
            <p className="text-xs text-surface-500 mt-1">
              Displayed in emails and the sidebar
            </p>
          </div>
        </div>
      </motion.div>

      {/* Email Settings */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900">Email</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-surface-50 rounded-lg cursor-pointer">
            <div>
              <span className="font-medium text-surface-900">Auto-parse email replies</span>
              <p className="text-sm text-surface-500">
                Automatically extract survey responses from email replies
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoParseReplies}
              onChange={(e) => setSettings({ ...settings, autoParseReplies: e.target.checked })}
              className="w-5 h-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-surface-50 rounded-lg cursor-pointer">
            <div>
              <span className="font-medium text-surface-900">Send email reminders</span>
              <p className="text-sm text-surface-500">
                Automatically remind recipients who haven&apos;t responded
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailReminders}
              onChange={(e) => setSettings({ ...settings, emailReminders: e.target.checked })}
              className="w-5 h-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          {settings.emailReminders && (
            <div className="ml-4">
              <label className="label">Reminder after (days)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.reminderDays}
                onChange={(e) => setSettings({ ...settings, reminderDays: parseInt(e.target.value) })}
                className="input w-32"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Survey Settings */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900">Surveys</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-surface-50 rounded-lg cursor-pointer">
            <div>
              <span className="font-medium text-surface-900">Require all questions</span>
              <p className="text-sm text-surface-500">
                Mark survey as incomplete unless all questions are answered
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.requireAllQuestions}
              onChange={(e) => setSettings({ ...settings, requireAllQuestions: e.target.checked })}
              className="w-5 h-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Demo Info */}
      <motion.div
        className="card bg-primary-50 border-primary-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-semibold text-primary-900 mb-2">Demo Mode</h3>
        <p className="text-sm text-primary-700 mb-3">
          This is a demo application. Settings changes are not persisted to the database in this version.
          In production, connect to your SMTP provider and configure environment variables.
        </p>
        <div className="text-xs font-mono bg-primary-100 p-3 rounded-lg text-primary-800 overflow-x-auto">
          <div>SMTP_HOST=localhost</div>
          <div>SMTP_PORT=1025</div>
          <div>DATABASE_URL=file:./dev.db</div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  )
}

