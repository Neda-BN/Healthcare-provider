import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'Health Care Provider - Survey Management',
  description: 'Municipality survey management, dashboards, and comparative analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased bg-surface-50 text-surface-900">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1c1917',
              color: '#fafaf9',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#0d9488',
                secondary: '#fafaf9',
              },
            },
            error: {
              iconTheme: {
                primary: '#f97066',
                secondary: '#fafaf9',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}

