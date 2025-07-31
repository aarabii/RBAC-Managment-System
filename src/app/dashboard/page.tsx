'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Key, Link, Crown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Stats {
  permissions: number
  roles: number
  rolePermissions: number
}

export default function DashboardPage() {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState<Stats>({ permissions: 0, roles: 0, rolePermissions: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [permissionsRes, rolesRes, rolePermissionsRes] = await Promise.all([
        supabase.from('permissions').select('id', { count: 'exact' }),
        supabase.from('roles').select('id', { count: 'exact' }),
        supabase.from('role_permissions').select('role_id', { count: 'exact' })
      ])

      setStats({
        permissions: permissionsRes.count || 0,
        roles: rolesRes.count || 0,
        rolePermissions: rolePermissionsRes.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.permissions}
              </div>
              <p className="text-xs text-muted-foreground">
                Individual permissions defined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.roles}
              </div>
              <p className="text-xs text-muted-foreground">
                Roles created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role-Permission Links</CardTitle>
              <Link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.rolePermissions}
              </div>
              <p className="text-xs text-muted-foreground">
                Permissions assigned to roles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                RBAC system operational
              </p>
            </CardContent>
          </Card>
        </div>

        {isAdmin && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <Crown className="mr-2 h-5 w-5" />
                Administrator Privileges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-red-700">
                <p className="font-medium">You have full administrative access to:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Create, edit, and delete any permissions</li>
                  <li>• Create, edit, and delete any roles</li>
                  <li>• Assign any permissions to any roles</li>
                  <li>• Assign any roles to any users</li>
                  <li>• Use natural language commands without restrictions</li>
                </ul>
                <p className="mt-3 text-xs text-red-600 font-medium">
                  User ID: 9fdd9cc1-669b-4ebc-b411-105dada536f9
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Get Started</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create permissions for your application</li>
                  <li>• Define roles for different user types</li>
                  <li>• Link permissions to roles</li>
                  <li>• Use natural language commands for quick setup</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                {stats.permissions === 0 && stats.roles === 0 ? (
                  <p>No activity yet. Start by creating your first permission or role!</p>
                ) : (
                  <div className="space-y-2">
                    <p>System initialized with:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {stats.permissions > 0 && <li>{stats.permissions} permissions created</li>}
                      {stats.roles > 0 && <li>{stats.roles} roles defined</li>}
                      {stats.rolePermissions > 0 && <li>{stats.rolePermissions} role-permission links established</li>}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
