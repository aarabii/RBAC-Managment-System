/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { supabase, Permission, PermissionWithRoles } from "@/lib/supabase";
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
import { Plus, Pencil, Trash2, Key } from "lucide-react";
import { toast } from "sonner";

interface PermissionForm {
  name: string;
  description: string;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] =
    useState<Permission | null>(null);
  const [formData, setFormData] = useState<PermissionForm>({
    name: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from("permissions")
        .select(
          `
          id,
          name,
          description,
          created_at,
          role_permissions (
            role:roles (
              id,
              name
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPermissions((data as any) || []);
    } catch (error: any) {
      toast.error("Failed to fetch permissions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Permission name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from("permissions")
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
          })
          .eq("id", editingPermission.id);

        if (error) throw error;
        toast.success("Permission updated successfully");
      } else {
        // Create new permission
        const { error } = await supabase.from("permissions").insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        });

        if (error) throw error;
        toast.success("Permission created successfully");
      }

      setFormData({ name: "", description: "" });
      setEditingPermission(null);
      setDialogOpen(false);
      fetchPermissions();
    } catch (error: any) {
      toast.error("Failed to save permission: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!permissionToDelete) return;

    try {
      // First check if permission is being used by any roles
      const { data: rolePermissions, error: checkError } = await supabase
        .from("role_permissions")
        .select("role_id")
        .eq("permission_id", permissionToDelete.id);

      if (checkError) throw checkError;

      if (rolePermissions && rolePermissions.length > 0) {
        toast.error(
          "Cannot delete permission: it is currently assigned to one or more roles"
        );
        setDeleteDialogOpen(false);
        setPermissionToDelete(null);
        return;
      }

      const { error } = await supabase
        .from("permissions")
        .delete()
        .eq("id", permissionToDelete.id);

      if (error) throw error;

      toast.success("Permission deleted successfully");
      setDeleteDialogOpen(false);
      setPermissionToDelete(null);
      fetchPermissions();
    } catch (error: any) {
      toast.error("Failed to delete permission: " + error.message);
    }
  };

  const openCreateDialog = () => {
    setEditingPermission(null);
    setFormData({ name: "", description: "" });
    setDialogOpen(true);
  };

  const openDeleteDialog = (permission: Permission) => {
    setPermissionToDelete(permission);
    setDeleteDialogOpen(true);
  };

  return (
    <DashboardLayout title="Permission Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Permissions</h2>
            <p className="text-gray-600">
              Manage individual permissions for your application
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Permission
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              All Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading permissions...</div>
            ) : permissions.length === 0 ? (
              <div className="text-center py-8">
                <Key className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">
                  No permissions found
                </h3>
                <p className="mt-2 text-gray-600">
                  Get started by creating your first permission.
                </p>
                <Button onClick={openCreateDialog} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Permission
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Assigned Roles</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">
                          {permission.name}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {permission.description || (
                            <span className="text-gray-400 italic">
                              No description
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {permission.role_permissions.map((rp) => (
                              <Badge key={rp.role.id} variant="secondary">
                                {rp.role.name}
                              </Badge>
                            ))}
                            {permission.role_permissions.length === 0 && (
                              <span className="text-gray-400 text-sm">
                                No roles assigned
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(permission.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(permission)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(permission)}
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

        {/* Create/Edit Permission Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPermission
                  ? "Edit Permission"
                  : "Create New Permission"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Permission Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., can_edit_articles, delete_users"
                  required
                />
                <p className="text-sm text-gray-600">
                  Use descriptive names like &quot;can_edit_articles&quot; or
                  &quot;view_dashboard&quot;
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of what this permission allows"
                />
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
                  {submitting
                    ? "Saving..."
                    : editingPermission
                    ? "Update"
                    : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Permission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete the permission &quot;
                {permissionToDelete?.name}&quot;?
              </p>
              <p className="text-sm text-gray-600">
                This action cannot be undone. The permission will be removed
                from all roles that currently have it assigned.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Permission
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
