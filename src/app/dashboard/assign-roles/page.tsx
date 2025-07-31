/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  UserCheck,
  Settings,
  Crown,
  AlertCircle,
  Users2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface TestUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
  lastActive: string;
  status: "active" | "inactive";
}

interface Role {
  id: string;
  name: string;
}

interface UserWithRoles extends TestUser {
  user_roles: {
    role: Role;
  }[];
}

// Test users data with realistic information
const TEST_USERS: TestUser[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "John Anderson",
    email: "john.admin@example.com",
    avatar: "JA",
    joinedDate: "2024-01-15",
    lastActive: "2024-01-30",
    status: "active",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Sarah Johnson",
    email: "sarah.manager@example.com",
    avatar: "SJ",
    joinedDate: "2024-01-20",
    lastActive: "2024-01-29",
    status: "active",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Mike Thompson",
    email: "mike.editor@example.com",
    avatar: "MT",
    joinedDate: "2024-02-01",
    lastActive: "2024-01-28",
    status: "active",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Lisa Chen",
    email: "lisa.writer@example.com",
    avatar: "LC",
    joinedDate: "2024-02-10",
    lastActive: "2024-01-30",
    status: "active",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "David Rodriguez",
    email: "david.moderator@example.com",
    avatar: "DR",
    joinedDate: "2024-02-15",
    lastActive: "2024-01-27",
    status: "active",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    name: "Emma Wilson",
    email: "emma.analyst@example.com",
    avatar: "EW",
    joinedDate: "2024-02-20",
    lastActive: "2024-01-29",
    status: "active",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    name: "Alex Taylor",
    email: "alex.viewer@example.com",
    avatar: "AT",
    joinedDate: "2024-02-25",
    lastActive: "2024-01-26",
    status: "inactive",
  },
];

export default function AssignRolesPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsersAndRoles();
    fetchRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    try {
      // Get user roles from database
      const { data: userRolesData, error } = await supabase.from("user_roles")
        .select(`
          user_id,
          role:roles(id, name)
        `);

      if (error) throw error;

      // Combine test user data with actual role assignments
      const usersWithRoles = TEST_USERS.map((testUser) => {
        const userRoles = (userRolesData || [])
          .filter((ur) => ur.user_id === testUser.id)
          .map((ur) => ({
            role: {
              id: (ur.role as any).id,
              name: (ur.role as any).name,
            } as Role,
          }));

        return {
          ...testUser,
          user_roles: userRoles,
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error("Failed to fetch user roles: " + error.message);
      console.error("Error fetching user roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setRoles(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch roles: " + error.message);
    }
  };

  const handleEditRoles = (user: UserWithRoles) => {
    setEditingUser(user);
    const currentRoles = user.user_roles.map((ur) => ur.role.id);
    setSelectedRoles(currentRoles);
    setRoleDialogOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleRoleSubmit = async () => {
    if (!editingUser || !isAdmin) return;

    setSubmitting(true);
    try {
      // First, remove all existing roles for this user
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", editingUser.id);

      if (deleteError) throw deleteError;

      // Then, add the selected roles
      if (selectedRoles.length > 0) {
        const userRoles = selectedRoles.map((roleId) => ({
          user_id: editingUser.id,
          role_id: roleId,
        }));

        const { error: insertError } = await supabase
          .from("user_roles")
          .insert(userRoles);

        if (insertError) throw insertError;
      }

      toast.success(`Roles updated for ${editingUser.name}`);
      setRoleDialogOpen(false);
      setEditingUser(null);
      setSelectedRoles([]);
      fetchUsersAndRoles();
    } catch (error: any) {
      toast.error("Failed to update user roles: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
      "Super Admin": "bg-red-100 text-red-800",
      Administrator: "bg-orange-100 text-orange-800",
      "Content Manager": "bg-blue-100 text-blue-800",
      "Content Editor": "bg-green-100 text-green-800",
      "Content Writer": "bg-purple-100 text-purple-800",
      Moderator: "bg-yellow-100 text-yellow-800",
      Analyst: "bg-pink-100 text-pink-800",
      Viewer: "bg-gray-100 text-gray-800",
      Guest: "bg-slate-100 text-slate-800",
    };
    return colors[roleName] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  if (!isAdmin) {
    return (
      <DashboardLayout title="Assign Roles">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Denied</h3>
            <p className="text-gray-600 text-center">
              Only administrators can assign roles to users. Contact your system
              administrator for access.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Assign Roles">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Assign Roles to Users</h2>
            <p className="text-gray-600">
              Manage role assignments for all users in the system
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsersAndRoles}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Badge className="bg-red-100 text-red-800 flex items-center">
              <Crown className="w-4 h-4 mr-1" />
              Admin Only
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter((u) => u.status === "active").length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Users with Roles
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {users.filter((u) => u.user_roles.length > 0).length}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Available Roles
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {roles.length}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              User Role Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No users found</h3>
                <p className="mt-2 text-gray-600">
                  Users will appear here once they are created.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Roles</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs font-medium">
                                {user.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="flex flex-wrap gap-1">
                            {user.user_roles.slice(0, 2).map((ur) => (
                              <Badge
                                key={ur.role.id}
                                className={getRoleColor(ur.role.name)}
                              >
                                {ur.role.name}
                              </Badge>
                            ))}
                            {user.user_roles.length > 2 && (
                              <Badge variant="secondary">
                                +{user.user_roles.length - 2} more
                              </Badge>
                            )}
                            {user.user_roles.length === 0 && (
                              <span className="text-gray-400 text-sm italic">
                                No roles assigned
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(user.joinedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRoles(user)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Roles Dialog */}
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback className="text-xs">
                    {editingUser?.avatar}
                  </AvatarFallback>
                </Avatar>
                Manage Roles for {editingUser?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">User Information</p>
                <p className="font-medium">{editingUser?.email}</p>
                <p className="text-xs text-gray-500">
                  Joined{" "}
                  {editingUser?.joinedDate
                    ? new Date(editingUser.joinedDate).toLocaleDateString()
                    : "N/A"}{" "}
                  • Last active{" "}
                  {editingUser?.lastActive
                    ? new Date(editingUser.lastActive).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Select roles to assign to this user:
                </p>

                {roles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      No roles available. Create some roles first.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          id={role.id}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <label
                            htmlFor={role.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {role.name}
                          </label>
                          <Badge className={getRoleColor(role.name)}>
                            {role.name}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setRoleDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleRoleSubmit} disabled={submitting}>
                  {submitting ? "Saving..." : "Update Roles"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
