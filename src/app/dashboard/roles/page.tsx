/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import {
  supabase,
  Role,
  RoleWithPermissions,
  Permission,
} from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Users, Settings } from "lucide-react";
import { toast } from "sonner";

interface RoleForm {
  name: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingRolePermissions, setEditingRolePermissions] =
    useState<Role | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleForm>({ name: "" });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select(
          `
          id,
          name,
          created_at,
          role_permissions (
            permission:permissions (
              id,
              name,
              description
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRoles((data as any) || []);
    } catch (error: any) {
      toast.error("Failed to fetch roles: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from("permissions")
        .select("id, name, description")
        .order("name");

      if (error) throw error;
      setPermissions((data as any) || []);
    } catch (error: any) {
      toast.error("Failed to fetch permissions: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingRole) {
        // Update existing role
        const { error } = await supabase
          .from("roles")
          .update({
            name: formData.name.trim(),
          })
          .eq("id", editingRole.id);

        if (error) throw error;
        toast.success("Role updated successfully");
      } else {
        // Create new role
        const { error } = await supabase.from("roles").insert({
          name: formData.name.trim(),
        });

        if (error) throw error;
        toast.success("Role created successfully");
      }

      setFormData({ name: "" });
      setEditingRole(null);
      setDialogOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast.error("Failed to save role: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermissionSubmit = async () => {
    if (!editingRolePermissions) return;

    setSubmitting(true);
    try {
      // First, remove all existing permissions for this role
      const { error: deleteError } = await supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", editingRolePermissions.id);

      if (deleteError) throw deleteError;

      // Then, add the selected permissions
      if (selectedPermissions.length > 0) {
        const rolePermissions = selectedPermissions.map((permissionId) => ({
          role_id: editingRolePermissions.id,
          permission_id: permissionId,
        }));

        const { error: insertError } = await supabase
          .from("role_permissions")
          .insert(rolePermissions);

        if (insertError) throw insertError;
      }

      toast.success("Role permissions updated successfully");
      setPermissionDialogOpen(false);
      setEditingRolePermissions(null);
      setSelectedPermissions([]);
      fetchRoles();
    } catch (error: any) {
      toast.error("Failed to update role permissions: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name });
    setDialogOpen(true);
  };

  const handleEditPermissions = (role: RoleWithPermissions) => {
    setEditingRolePermissions(role);
    const currentPermissions = role.role_permissions.map(
      (rp) => rp.permission.id
    );
    setSelectedPermissions(currentPermissions);
    setPermissionDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      // First check if role is being used by any users
      const { data: userRoles, error: checkError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role_id", roleToDelete.id);

      if (checkError) throw checkError;

      if (userRoles && userRoles.length > 0) {
        toast.error(
          "Cannot delete role: it is currently assigned to one or more users"
        );
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
        return;
      }

      // Delete role permissions first
      const { error: deletePermissionsError } = await supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", roleToDelete.id);

      if (deletePermissionsError) throw deletePermissionsError;

      // Then delete the role
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", roleToDelete.id);

      if (error) throw error;

      toast.success("Role deleted successfully");
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (error: any) {
      toast.error("Failed to delete role: " + error.message);
    }
  };

  const openCreateDialog = () => {
    setEditingRole(null);
    setFormData({ name: "" });
    setDialogOpen(true);
  };

  const openDeleteDialog = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <DashboardLayout title="Role Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Roles</h2>
            <p className="text-gray-600">
              Manage roles and assign permissions to them
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              All Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading roles...</div>
            ) : roles.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No roles found</h3>
                <p className="mt-2 text-gray-600">
                  Get started by creating your first role.
                </p>
                <Button onClick={openCreateDialog} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Role
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Permission Count</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          {role.name}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="flex flex-wrap gap-1">
                            {role.role_permissions.slice(0, 3).map((rp) => (
                              <Badge key={rp.permission.id} variant="outline">
                                {rp.permission.name}
                              </Badge>
                            ))}
                            {role.role_permissions.length > 3 && (
                              <Badge variant="secondary">
                                +{role.role_permissions.length - 3} more
                              </Badge>
                            )}
                            {role.role_permissions.length === 0 && (
                              <span className="text-gray-400 text-sm">
                                No permissions assigned
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {role.role_permissions.length} permissions
                        </TableCell>
                        <TableCell>
                          {new Date(role.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPermissions(role)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(role)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(role)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Role Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRole ? "Edit Role" : "Create New Role"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Administrator, Content Editor, Support Agent"
                  required
                />
                <p className="text-sm text-gray-600">
                  Use descriptive names like &quot;Administrator&quot; or
                  &quot;Content Editor&quot;
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editingRole ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Permissions Dialog */}
        <Dialog
          open={permissionDialogOpen}
          onOpenChange={setPermissionDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Manage Permissions for &quot;{editingRolePermissions?.name}
                &quot;
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select the permissions you want to assign to this role.
              </p>

              {permissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No permissions available. Create some permissions first.
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg"
                    >
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {permission.name}
                        </label>
                        {permission.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setPermissionDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button onClick={handlePermissionSubmit} disabled={submitting}>
                  {submitting ? "Saving..." : "Update Permissions"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete the role &quot;
                {roleToDelete?.name}&quot;?
              </p>
              <p className="text-sm text-gray-600">
                This action cannot be undone. All permissions assigned to this
                role will be removed.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
