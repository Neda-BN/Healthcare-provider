import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Fetch municipalities for the dropdown
  const municipalities = await prisma.municipality.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <DashboardLayout
      municipalities={municipalities}
      user={{
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
      }}
    >
      {children}
    </DashboardLayout>
  )
}



