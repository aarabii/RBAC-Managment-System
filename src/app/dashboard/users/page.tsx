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
import { Users, Settings, Crown, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface Role {
  id: string;
  name: string;
}

interface UserWithRoles extends User {
  user_roles: {
    role: Role;
  }[];
}

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get user roles from database and build user list
      const { data: userRoleData, error: userRoleError } = await supabase.from(
        "user_roles"
      ).select(`
          user_id,
          role:roles(id, name)
        `);

      if (userRoleError) throw userRoleError;

      // Group by user_id to get unique users with their roles
      const userMap = new Map();
      userRoleData?.forEach((ur) => {
        if (!userMap.has(ur.user_id)) {
          userMap.set(ur.user_id, {
            id: ur.user_id,
            email: `user-${ur.user_id.slice(0, 8)}@example.com`, // Generate email from user ID
            created_at: new Date().toISOString(),
            last_sign_in_at: null,
            user_roles: [],
          });
        }
        userMap.get(ur.user_id).user_roles.push({
          role: {
            id: (ur.role as any).id,
            name: (ur.role as any).name,
          } as Role,
        });
      });

      setUsers(Array.from(userMap.values()));
    } catch (error: any) {
      toast.error("Failed to fetch users: " + error.message);
      console.error("Error fetching users:", error);
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
      setRoles((data as any) || []);
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

      toast.success("User roles updated successfully");
      setRoleDialogOpen(false);
      setEditingUser(null);
      setSelectedRoles([]);
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update user roles: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <DashboardLayout title="User Management">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Denied</h3>
            <p className="text-gray-600 text-center">
              Only administrators can manage user roles. Contact your system
              administrator for access.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">User Management</h2>
            <p className="text-gray-600">
              Assign roles to users and manage user permissions
            </p>
          </div>
          <Badge className="bg-red-100 text-red-800 flex items-center">
            <Crown className="w-4 h-4 mr-1" />
            Admin Only
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              All Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No users found</h3>
                <p className="mt-2 text-gray-600">
                  Users will appear here once they sign up.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Role Count</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {user.email}
                            {user.id ===
                              "9fdd9cc1-669b-4ebc-b411-105dada536f9" && (
                              <div className="relative">
                                <Crown className="w-4 h-4 ml-2 text-yellow-500" />
                                <span className="sr-only">Admin User</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="flex flex-wrap gap-1">
                            {user.user_roles.slice(0, 3).map((ur) => (
                              <Badge key={ur.role.id} variant="outline">
                                {ur.role.name}
                              </Badge>
                            ))}
                            {user.user_roles.length > 3 && (
                              <Badge variant="secondary">
                                +{user.user_roles.length - 3} more
                              </Badge>
                            )}
                            {user.user_roles.length === 0 && (
                              <span className="text-gray-400 text-sm">
                                No roles assigned
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{user.user_roles.length} roles</TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {user.last_sign_in_at
                            ? new Date(
                                user.last_sign_in_at
                              ).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRoles(user)}
                          >
                            <Settings className="h-4 w-4" />
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
              <DialogTitle>
                Manage Roles for &quot;{editingUser?.email}&quot;
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select the roles you want to assign to this user.
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
                      className="flex items-center space-x-3 p-3 border rounded-lg"
                    >
                      <Checkbox
                        id={role.id}
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={() => toggleRole(role.id)}
                      />
                      <label
                        htmlFor={role.id}
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}

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
