import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Users, Shield, Mail, Calendar } from 'lucide-react'

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
  })
}

export default async function AdminUsersPage() {
  const session = await getSession()
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">User Management</h1>
          <p className="text-surface-500 mt-1">Manage system users and permissions</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-surface-600">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </td>
                  <td>
                    <span className={user.role === 'ADMIN' ? 'badge-primary' : 'badge-neutral'}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={user.active ? 'badge-success' : 'badge-error'}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-surface-500">
                    {new Date(user.createdAt).toLocaleDateString('sv-SE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Demo Note:</strong> User management is read-only in this demo. 
          In production, you can add, edit, and deactivate users from this page.
        </p>
      </div>
    </div>
  )
}

