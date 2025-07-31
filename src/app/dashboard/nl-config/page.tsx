/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  action?: {
    type: string;
    success: boolean;
    details?: string;
  };
}

interface ParsedCommand {
  action: string;
  target: string;
  value: string;
  description?: string;
}

export default function NaturalLanguageConfigPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "system",
      content:
        "Welcome! You can use natural language to manage your RBAC system. Try commands like:\n\n• &quot;Create a new permission called &apos;edit_articles&apos;&quot;\n• &quot;Give the role &apos;Content Editor&apos; the permission to &apos;edit_articles&apos;&quot;\n• &quot;Create a role called &apos;Administrator&apos;&quot;\n• &quot;Remove permission &apos;delete_users&apos; from role &apos;Support Agent&apos;&quot;",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const parseNaturalLanguageCommand = (input: string): ParsedCommand | null => {
    const lowercaseInput = input.toLowerCase().trim();

    // Create permission patterns
    if (
      lowercaseInput.match(/create.*permission.*called?.*['"`]([^'"`]+)['"`]/)
    ) {
      const match = lowercaseInput.match(
        /create.*permission.*called?.*['"`]([^'"`]+)['"`]/
      );
      const permissionName = match?.[1];
      if (permissionName) {
        return {
          action: "create_permission",
          target: "permission",
          value: permissionName,
        };
      }
    }

    // Create permission with description
    if (
      lowercaseInput.match(
        /create.*permission.*['"`]([^'"`]+)['"`].*description.*['"`]([^'"`]+)['"`]/
      )
    ) {
      const match = lowercaseInput.match(
        /create.*permission.*['"`]([^'"`]+)['"`].*description.*['"`]([^'"`]+)['"`]/
      );
      const permissionName = match?.[1];
      const description = match?.[2];
      if (permissionName && description) {
        return {
          action: "create_permission",
          target: "permission",
          value: permissionName,
          description: description,
        };
      }
    }

    // Create role patterns
    if (lowercaseInput.match(/create.*role.*called?.*['"`]([^'"`]+)['"`]/)) {
      const match = lowercaseInput.match(
        /create.*role.*called?.*['"`]([^'"`]+)['"`]/
      );
      const roleName = match?.[1];
      if (roleName) {
        return {
          action: "create_role",
          target: "role",
          value: roleName,
        };
      }
    }

    // Assign permission to role patterns
    if (
      lowercaseInput.match(
        /give.*role.*['"`]([^'"`]+)['"`].*permission.*['"`]([^'"`]+)['"`]/
      )
    ) {
      const match = lowercaseInput.match(
        /give.*role.*['"`]([^'"`]+)['"`].*permission.*['"`]([^'"`]+)['"`]/
      );
      const roleName = match?.[1];
      const permissionName = match?.[2];
      if (roleName && permissionName) {
        return {
          action: "assign_permission",
          target: "role_permission",
          value: `${roleName}|${permissionName}`,
        };
      }
    }

    // Alternative assign pattern
    if (
      lowercaseInput.match(
        /assign.*permission.*['"`]([^'"`]+)['"`].*role.*['"`]([^'"`]+)['"`]/
      )
    ) {
      const match = lowercaseInput.match(
        /assign.*permission.*['"`]([^'"`]+)['"`].*role.*['"`]([^'"`]+)['"`]/
      );
      const permissionName = match?.[1];
      const roleName = match?.[2];
      if (roleName && permissionName) {
        return {
          action: "assign_permission",
          target: "role_permission",
          value: `${roleName}|${permissionName}`,
        };
      }
    }

    // Remove permission from role patterns
    if (
      lowercaseInput.match(
        /remove.*permission.*['"`]([^'"`]+)['"`].*from.*role.*['"`]([^'"`]+)['"`]/
      )
    ) {
      const match = lowercaseInput.match(
        /remove.*permission.*['"`]([^'"`]+)['"`].*from.*role.*['"`]([^'"`]+)['"`]/
      );
      const permissionName = match?.[1];
      const roleName = match?.[2];
      if (roleName && permissionName) {
        return {
          action: "remove_permission",
          target: "role_permission",
          value: `${roleName}|${permissionName}`,
        };
      }
    }

    return null;
  };

  const executeCommand = async (
    command: ParsedCommand
  ): Promise<{ success: boolean; message: string }> => {
    try {
      switch (command.action) {
        case "create_permission":
          const { error: permError } = await supabase
            .from("permissions")
            .insert({
              name: command.value,
              description: command.description || null,
            });

          if (permError) throw permError;
          return {
            success: true,
            message: `Permission &apos;${command.value}&apos; created successfully!`,
          };

        case "create_role":
          const { error: roleError } = await supabase.from("roles").insert({
            name: command.value,
          });

          if (roleError) throw roleError;
          return {
            success: true,
            message: `Role &apos;${command.value}&apos; created successfully!`,
          };

        case "assign_permission":
          const [roleName, permissionName] = command.value.split("|");

          // Find role and permission
          const { data: role, error: roleQueryError } = await supabase
            .from("roles")
            .select("id")
            .eq("name", roleName)
            .single();

          if (roleQueryError || !role) {
            return {
              success: false,
              message: `Role &apos;${roleName}&apos; not found. Please create it first.`,
            };
          }

          const { data: permission, error: permQueryError } = await supabase
            .from("permissions")
            .select("id")
            .eq("name", permissionName)
            .single();

          if (permQueryError || !permission) {
            return {
              success: false,
              message: `Permission &apos;${permissionName}&apos; not found. Please create it first.`,
            };
          }

          // Check if assignment already exists
          const { data: existing } = await supabase
            .from("role_permissions")
            .select("*")
            .eq("role_id", role.id)
            .eq("permission_id", permission.id)
            .single();

          if (existing) {
            return {
              success: false,
              message: `Role &apos;${roleName}&apos; already has permission &apos;${permissionName}&apos;.`,
            };
          }

          // Create assignment
          const { error: assignError } = await supabase
            .from("role_permissions")
            .insert({
              role_id: role.id,
              permission_id: permission.id,
            });

          if (assignError) throw assignError;
          return {
            success: true,
            message: `Permission &apos;${permissionName}&apos; assigned to role &apos;${roleName}&apos; successfully!`,
          };

        case "remove_permission":
          const [removeRoleName, removePermissionName] =
            command.value.split("|");

          // Find role and permission
          const { data: removeRole, error: removeRoleQueryError } =
            await supabase
              .from("roles")
              .select("id")
              .eq("name", removeRoleName)
              .single();

          if (removeRoleQueryError || !removeRole) {
            return {
              success: false,
              message: `Role &apos;${removeRoleName}&apos; not found.`,
            };
          }

          const { data: removePermission, error: removePermQueryError } =
            await supabase
              .from("permissions")
              .select("id")
              .eq("name", removePermissionName)
              .single();

          if (removePermQueryError || !removePermission) {
            return {
              success: false,
              message: `Permission &apos;${removePermissionName}&apos; not found.`,
            };
          }

          // Remove assignment
          const { error: removeError } = await supabase
            .from("role_permissions")
            .delete()
            .eq("role_id", removeRole.id)
            .eq("permission_id", removePermission.id);

          if (removeError) throw removeError;
          return {
            success: true,
            message: `Permission &apos;${removePermissionName}&apos; removed from role &apos;${removeRoleName}&apos; successfully!`,
          };

        default:
          return { success: false, message: "Unknown command action." };
      }
    } catch (error: any) {
      return {
        success: false,
        message:
          error.message || "An error occurred while executing the command.",
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const parsedCommand = parseNaturalLanguageCommand(inputValue);

      if (!parsedCommand) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content:
            "I couldn&apos;t understand that command. Please try using one of these formats:\n\n• &quot;Create a new permission called &apos;permission_name&apos;&quot;\n• &quot;Create a role called &apos;role_name&apos;&quot;\n• &quot;Give the role &apos;role_name&apos; the permission to &apos;permission_name&apos;&quot;\n• &quot;Remove permission &apos;permission_name&apos; from role &apos;role_name&apos;&quot;",
          timestamp: new Date(),
          action: {
            type: "parse_error",
            success: false,
          },
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const result = await executeCommand(parsedCommand);

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: result.message,
        timestamp: new Date(),
        action: {
          type: parsedCommand.action,
          success: result.success,
          details: parsedCommand.value,
        },
      };

      setMessages((prev) => [...prev, responseMessage]);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Error: ${
          error.message || "Something went wrong. Please try again."
        }`,
        timestamp: new Date(),
        action: {
          type: "error",
          success: false,
        },
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Command execution failed");
    } finally {
      setLoading(false);
    }
  };

  const getMessageIcon = (message: Message) => {
    if (message.type === "system")
      return <Sparkles className="h-4 w-4 text-blue-500" />;
    if (message.type === "user")
      return <MessageCircle className="h-4 w-4 text-gray-500" />;

    if (message.action?.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (message.action?.success === false) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }

    return <MessageCircle className="h-4 w-4 text-blue-500" />;
  };

  const getActionBadge = (action: Message["action"]) => {
    if (!action) return null;

    const colors = {
      create_permission: "bg-green-100 text-green-800",
      create_role: "bg-blue-100 text-blue-800",
      assign_permission: "bg-purple-100 text-purple-800",
      remove_permission: "bg-red-100 text-red-800",
      parse_error: "bg-gray-100 text-gray-800",
      error: "bg-red-100 text-red-800",
    };

    const labels = {
      create_permission: "Create Permission",
      create_role: "Create Role",
      assign_permission: "Assign Permission",
      remove_permission: "Remove Permission",
      parse_error: "Parse Error",
      error: "Error",
    };

    return (
      <Badge
        className={
          colors[action.type as keyof typeof colors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {labels[action.type as keyof typeof labels] || action.type}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Natural Language Configuration">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              Natural Language RBAC Configuration
            </h2>
            <p className="text-gray-600">
              Use plain English to manage permissions and roles
            </p>
          </div>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type !== "user" && (
                    <div className="flex-shrink-0 mt-1">
                      {getMessageIcon(message)}
                    </div>
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === "user"
                        ? "bg-blue-500 text-white"
                        : message.type === "system"
                        ? "bg-blue-50 text-blue-900 border border-blue-200"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    {message.action && (
                      <div className="mt-2 flex items-center gap-2">
                        {getActionBadge(message.action)}
                        {message.action.success && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                        {message.action.success === false && (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {message.type === "user" && (
                    <div className="flex-shrink-0 mt-1">
                      {getMessageIcon(message)}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your command in plain English..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Example Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Creating Permissions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • &quot;Create a new permission called
                    &apos;edit_articles&apos;&quot;
                  </li>
                  <li>
                    • &quot;Create permission &apos;delete_users&apos; with
                    description &apos;Allow user deletion&apos;&quot;
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Creating Roles</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • &quot;Create a role called &apos;Administrator&apos;&quot;
                  </li>
                  <li>
                    • &quot;Create a new role called &apos;Content
                    Editor&apos;&quot;
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Assigning Permissions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • &quot;Give the role &apos;Content Editor&apos; the
                    permission to &apos;edit_articles&apos;&quot;
                  </li>
                  <li>
                    • &quot;Assign permission &apos;view_dashboard&apos; to role
                    &apos;Support Agent&apos;&quot;
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Removing Permissions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • &quot;Remove permission &apos;delete_users&apos; from role
                    &apos;Support Agent&apos;&quot;
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
