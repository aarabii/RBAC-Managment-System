-- RBAC Database Schema for Complete RBAC Management System
-- This script creates all necessary tables and populates them with test data
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security (RLS) on auth.users if not already enabled
-- ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Permissions Table
CREATE TABLE permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Roles Table
CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Role-Permissions Junction Table
CREATE TABLE role_permissions (
    role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
    permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- User-Roles Junction Table
CREATE TABLE user_roles (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Insert Comprehensive Test Data

-- Permissions for a complete RBAC system
INSERT INTO permissions (name, description) VALUES
    ('users:create', 'Create new users'),
    ('users:read', 'View user information'),
    ('users:update', 'Edit user details'),
    ('users:delete', 'Delete users'),
    ('roles:create', 'Create new roles'),
    ('roles:read', 'View roles'),
    ('roles:update', 'Edit roles'),
    ('roles:delete', 'Delete roles'),
    ('permissions:create', 'Create new permissions'),
    ('permissions:read', 'View permissions'),
    ('permissions:update', 'Edit permissions'),
    ('permissions:delete', 'Delete permissions'),
    ('articles:create', 'Create articles'),
    ('articles:read', 'Read articles'),
    ('articles:update', 'Edit articles'),
    ('articles:delete', 'Delete articles'),
    ('articles:publish', 'Publish articles'),
    ('comments:moderate', 'Moderate comments'),
    ('system:admin', 'Full system administration'),
    ('dashboard:view', 'Access dashboard'),
    ('analytics:view', 'View analytics'),
    ('settings:manage', 'Manage system settings');

-- Roles for different user types
INSERT INTO roles (name) VALUES
    ('Super Admin'),
    ('Administrator'),
    ('Content Manager'),
    ('Content Editor'),
    ('Content Writer'),
    ('Moderator'),
    ('Analyst'),
    ('Viewer'),
    ('Guest');

-- Role-Permission assignments for a realistic RBAC setup
INSERT INTO role_permissions (role_id, permission_id) VALUES
    -- Super Admin gets everything
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='system:admin')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='users:create')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='users:read')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='users:update')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='users:delete')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='roles:create')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='roles:read')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='roles:update')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='roles:delete')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='permissions:create')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='permissions:read')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='permissions:update')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='permissions:delete')),
    ((SELECT id FROM roles WHERE name='Super Admin'), (SELECT id FROM permissions WHERE name='settings:manage')),
    
    -- Administrator gets most permissions
    ((SELECT id FROM roles WHERE name='Administrator'), (SELECT id FROM permissions WHERE name='users:read')),
    ((SELECT id FROM roles WHERE name='Administrator'), (SELECT id FROM permissions WHERE name='users:update')),
    ((SELECT id FROM roles WHERE name='Administrator'), (SELECT id FROM permissions WHERE name='roles:read')),
    ((SELECT id FROM roles WHERE name='Administrator'), (SELECT id FROM permissions WHERE name='permissions:read')),
    ((SELECT id FROM roles WHERE name='Administrator'), (SELECT id FROM permissions WHERE name='dashboard:view')),
    ((SELECT id FROM roles WHERE name='Administrator'), (SELECT id FROM permissions WHERE name='analytics:view')),
    
    -- Content Manager
    ((SELECT id FROM roles WHERE name='Content Manager'), (SELECT id FROM permissions WHERE name='articles:create')),
    ((SELECT id FROM roles WHERE name='Content Manager'), (SELECT id FROM permissions WHERE name='articles:read')),
    ((SELECT id FROM roles WHERE name='Content Manager'), (SELECT id FROM permissions WHERE name='articles:update')),
    ((SELECT id FROM roles WHERE name='Content Manager'), (SELECT id FROM permissions WHERE name='articles:delete')),
    ((SELECT id FROM roles WHERE name='Content Manager'), (SELECT id FROM permissions WHERE name='articles:publish')),
    ((SELECT id FROM roles WHERE name='Content Manager'), (SELECT id FROM permissions WHERE name='comments:moderate')),
    ((SELECT id FROM roles WHERE name='Content Manager'), (SELECT id FROM permissions WHERE name='dashboard:view')),
    
    -- Content Editor
    ((SELECT id FROM roles WHERE name='Content Editor'), (SELECT id FROM permissions WHERE name='articles:create')),
    ((SELECT id FROM roles WHERE name='Content Editor'), (SELECT id FROM permissions WHERE name='articles:read')),
    ((SELECT id FROM roles WHERE name='Content Editor'), (SELECT id FROM permissions WHERE name='articles:update')),
    ((SELECT id FROM roles WHERE name='Content Editor'), (SELECT id FROM permissions WHERE name='dashboard:view')),
    
    -- Content Writer
    ((SELECT id FROM roles WHERE name='Content Writer'), (SELECT id FROM permissions WHERE name='articles:create')),
    ((SELECT id FROM roles WHERE name='Content Writer'), (SELECT id FROM permissions WHERE name='articles:read')),
    ((SELECT id FROM roles WHERE name='Content Writer'), (SELECT id FROM permissions WHERE name='dashboard:view')),
    
    -- Moderator
    ((SELECT id FROM roles WHERE name='Moderator'), (SELECT id FROM permissions WHERE name='comments:moderate')),
    ((SELECT id FROM roles WHERE name='Moderator'), (SELECT id FROM permissions WHERE name='articles:read')),
    ((SELECT id FROM roles WHERE name='Moderator'), (SELECT id FROM permissions WHERE name='dashboard:view')),
    
    -- Analyst
    ((SELECT id FROM roles WHERE name='Analyst'), (SELECT id FROM permissions WHERE name='analytics:view')),
    ((SELECT id FROM roles WHERE name='Analyst'), (SELECT id FROM permissions WHERE name='dashboard:view')),
    
    -- Viewer
    ((SELECT id FROM roles WHERE name='Viewer'), (SELECT id FROM permissions WHERE name='articles:read')),
    ((SELECT id FROM roles WHERE name='Viewer'), (SELECT id FROM permissions WHERE name='dashboard:view')),
    
    -- Guest (minimal permissions)
    ((SELECT id FROM roles WHERE name='Guest'), (SELECT id FROM permissions WHERE name='articles:read'));

-- Create test users in auth.users (Note: In production, users would sign up normally)
-- These are fake UUIDs for demonstration purposes
-- In a real scenario, you would need to create actual auth users through Supabase Auth

-- Test user UUIDs (these would normally be generated by Supabase Auth)
DO $$
BEGIN
    -- Insert test users into auth.users if they don't exist
    -- Note: This might not work in all Supabase setups due to RLS policies
    -- You may need to create these users through the Supabase Auth interface
    
    -- Try to insert test users (this may fail due to auth restrictions)
    BEGIN
        INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, aud, role) VALUES
            ('550e8400-e29b-41d4-a716-446655440001', 'john.admin@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
            ('550e8400-e29b-41d4-a716-446655440002', 'sarah.manager@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
            ('550e8400-e29b-41d4-a716-446655440003', 'mike.editor@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
            ('550e8400-e29b-41d4-a716-446655440004', 'lisa.writer@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
            ('550e8400-e29b-41d4-a716-446655440005', 'david.moderator@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
            ('550e8400-e29b-41d4-a716-446655440006', 'emma.analyst@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
            ('550e8400-e29b-41d4-a716-446655440007', 'alex.viewer@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated')
        ON CONFLICT (id) DO NOTHING;
    EXCEPTION
        WHEN others THEN
            -- If we can't insert into auth.users, we'll just proceed with user_roles
            RAISE NOTICE 'Could not insert into auth.users. This is normal if RLS is enabled.';
    END;
END $$;

-- Assign roles to users (including your admin user and test users)
INSERT INTO user_roles (user_id, role_id) VALUES
    -- Your admin user
    ('9fdd9cc1-669b-4ebc-b411-105dada536f9', (SELECT id FROM roles WHERE name='Super Admin')),
    
    -- Test users with different roles
    ('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM roles WHERE name='Administrator')),
    ('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM roles WHERE name='Content Manager')),
    ('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM roles WHERE name='Content Editor')),
    ('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM roles WHERE name='Content Writer')),
    ('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM roles WHERE name='Moderator')),
    ('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM roles WHERE name='Analyst')),
    ('550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM roles WHERE name='Viewer'))
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Row Level Security Policies (Optional - uncomment if you want RLS)
-- Enable RLS on tables
-- ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies (example - adjust based on your needs)
-- CREATE POLICY "Users can view permissions" ON permissions FOR SELECT USING (true);
-- CREATE POLICY "Only admins can modify permissions" ON permissions FOR ALL USING (
--   EXISTS (
--     SELECT 1 FROM user_roles ur
--     JOIN roles r ON ur.role_id = r.id
--     WHERE ur.user_id = auth.uid() AND r.name IN ('Super Admin', 'Administrator')
--   )
-- );

-- Functions to help with RBAC queries
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid uuid)
RETURNS TABLE(permission_name text, permission_description text) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.name, p.description
  FROM permissions p
  JOIN role_permissions rp ON p.id = rp.permission_id
  JOIN user_roles ur ON rp.role_id = ur.role_id
  WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_roles(user_uuid uuid)
RETURNS TABLE(role_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name
  FROM roles r
  JOIN user_roles ur ON r.id = ur.role_id
  WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage examples:
-- SELECT * FROM get_user_permissions('9fdd9cc1-669b-4ebc-b411-105dada536f9');
-- SELECT * FROM get_user_roles('9fdd9cc1-669b-4ebc-b411-105dada536f9');

