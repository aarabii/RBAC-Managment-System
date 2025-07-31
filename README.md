# 🛡️ RBAC Manager

<div align="center">
  <p><em>A comprehensive Role-Based Access Control management system that makes permissions simple and secure</em></p>
</div>

---

## 🧒 What is RBAC?

Imagine a school where only **teachers** can enter the _staff room_, and only **students** can play during _recess_. RBAC is like school rules: everyone gets a role, and each role decides what you can or can't do. It's how computers keep things safe and organized!

---

## 🎯 Overview

**RBAC Manager** is a powerful, visual system for managing who can do what in your application. Built with modern web technologies, it provides an intuitive interface for administrators to control user permissions, assign roles, and maintain security across their entire system.

Perfect for applications that need granular access control, team management, and compliance with security standards.

---

## ✨ Features

### 🔐 **Core RBAC Capabilities**

- **🔑 Permission Management** - Create, read, update, and delete individual permissions with ease
- **👥 Role Management** - Complete CRUD operations for roles with visual permission assignments
- **👤 User Management** - Seamlessly assign roles to users and manage their access levels
- **🔗 Role-Permission Linking** - Intuitive drag-and-drop interface for connecting roles with permissions

### 🚀 **Advanced Functionality**

- **💬 Natural Language Configuration** - Use plain English commands like "Give editors permission to publish articles"
- **⚡ Admin-Only Controls** - Dedicated administrative interface with elevated privileges
- **🔄 Real-time Updates** - Instant synchronization when roles and permissions change
- **📊 Comprehensive Dashboard** - Beautiful overview with system statistics and activity monitoring

### 🎨 **Modern User Experience**

- **🌓 Dark/Light Mode** - Seamless theme switching for user preference
- **📱 Mobile-First Design** - Fully responsive interface that works on any device
- **🎯 Intuitive Navigation** - Clean, organized layout with logical information architecture
- **⚡ Performance Optimized** - Lightning-fast load times and smooth interactions

---

## 🛠️ Technology Stack

| Category           | Technology              | Purpose                                           |
| ------------------ | ----------------------- | ------------------------------------------------- |
| **Frontend**       | Next.js 15 + TypeScript | Modern React framework with type safety           |
| **Backend**        | Supabase                | PostgreSQL database with built-in authentication  |
| **UI Framework**   | Shadcn/ui               | Accessible, customizable component library        |
| **Styling**        | Tailwind CSS            | Utility-first CSS framework                       |
| **Icons**          | Lucide React            | Beautiful, consistent icon system                 |
| **Authentication** | Supabase Auth           | Secure user authentication and session management |

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** 18+ and npm installed
- **Supabase** account with a new project created

### 📦 Installation

1. **Clone and Setup**

   ```bash
   git clone https://github.com/aarabii/RBAC-Managment-System
   cd rbac-manager
   npm install
   ```

2. **Environment Configuration**

   Create `.env.local` in your project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Database Setup**

   - Open your Supabase project dashboard
   - Navigate to **SQL Editor**
   - Copy and execute the contents of `database/schema.sql`
   - This creates all tables and inserts sample data

4. **Launch Development Server**

   ```bash
   npm run dev
   ```

5. **Access Your Application**

   Open [http://localhost:3000](http://localhost:3000) in your browser 🎉

---

## 🗄️ Database Schema

Our RBAC system uses a clean, normalized database structure designed for scalability and performance.

### 📋 **Permissions Table**

| Column        | Type      | Constraints      | Description                            |
| ------------- | --------- | ---------------- | -------------------------------------- |
| `id`          | UUID      | PRIMARY KEY      | Unique permission identifier           |
| `name`        | TEXT      | UNIQUE, NOT NULL | Permission name (e.g., "users:create") |
| `description` | TEXT      | NULLABLE         | Human-readable description             |
| `created_at`  | TIMESTAMP | DEFAULT NOW()    | Record creation timestamp              |

### 👑 **Roles Table**

| Column        | Type      | Constraints      | Description                       |
| ------------- | --------- | ---------------- | --------------------------------- |
| `id`          | UUID      | PRIMARY KEY      | Unique role identifier            |
| `name`        | TEXT      | UNIQUE, NOT NULL | Role name (e.g., "Administrator") |
| `description` | TEXT      | NULLABLE         | Role description and purpose      |
| `created_at`  | TIMESTAMP | DEFAULT NOW()    | Record creation timestamp         |

### 🔗 **Role-Permissions Junction Table**

| Column                    | Type | Constraints                  | Description                          |
| ------------------------- | ---- | ---------------------------- | ------------------------------------ |
| `role_id`                 | UUID | FOREIGN KEY → roles.id       | Reference to role                    |
| `permission_id`           | UUID | FOREIGN KEY → permissions.id | Reference to permission              |
| **Composite Primary Key** |      | `(role_id, permission_id)`   | Ensures unique role-permission pairs |

### 👤 **User-Roles Junction Table**

| Column                    | Type      | Constraints                 | Description                     |
| ------------------------- | --------- | --------------------------- | ------------------------------- |
| `user_id`                 | UUID      | FOREIGN KEY → auth.users.id | Reference to authenticated user |
| `role_id`                 | UUID      | FOREIGN KEY → roles.id      | Reference to assigned role      |
| `assigned_at`             | TIMESTAMP | DEFAULT NOW()               | Role assignment timestamp       |
| **Composite Primary Key** |           | `(user_id, role_id)`        | Ensures unique user-role pairs  |

---

## 👥 User Roles & Test Data

### 🎭 **Pre-configured Roles**

| Role                | Description                       | Typical Use Case                   |
| ------------------- | --------------------------------- | ---------------------------------- |
| **Super Admin**     | 🔓 Complete system access         | System owner, technical lead       |
| **Administrator**   | 👨‍💼 User and role management       | HR managers, team leads            |
| **Content Manager** | 📝 Full content permissions       | Editorial directors, content heads |
| **Content Editor**  | ✏️ Content creation and editing   | Senior editors, content creators   |
| **Content Writer**  | 📄 Content creation only          | Writers, junior content creators   |
| **Moderator**       | 🛡️ Comment and user moderation    | Community managers                 |
| **Analyst**         | 📊 Analytics and reporting access | Data analysts, marketers           |
| **Viewer**          | 👀 Read-only system access        | Stakeholders, external reviewers   |
| **Guest**           | 🚪 Minimal permissions            | Trial users, temporary access      |

### 🧪 **Test User Accounts**

| Name                | Email                       | Role            | Purpose                  |
| ------------------- | --------------------------- | --------------- | ------------------------ |
| **John Anderson**   | john.admin@example.com      | Administrator   | Demo admin capabilities  |
| **Sarah Johnson**   | sarah.manager@example.com   | Content Manager | Content management demo  |
| **Mike Thompson**   | mike.editor@example.com     | Content Editor  | Editorial workflow demo  |
| **Lisa Chen**       | lisa.writer@example.com     | Content Writer  | Writer permissions demo  |
| **David Rodriguez** | david.moderator@example.com | Moderator       | Moderation features demo |
| **Emma Wilson**     | emma.analyst@example.com    | Analyst         | Analytics access demo    |
| **Alex Taylor**     | alex.viewer@example.com     | Viewer          | Read-only access demo    |

---

## 🔧 Administrative Features

### 🛡️ **Admin Access Setup**

Administrators enjoy elevated privileges including:

- **🌐 Full System Access** - Complete visibility and control over all features
- **👥 User Role Management** - Assign, modify, and revoke user roles
- **🔐 Permission Administration** - Create, edit, and delete permissions system-wide
- **📊 System Monitoring** - Access to comprehensive analytics and system health metrics
- **💬 Unrestricted Natural Language Commands** - Full access to AI-powered configuration

### ⚡ **Admin-Exclusive Features**

- **👤 User Management Dashboard** - Comprehensive user overview with role assignments
- **🎯 Role Assignment Interface** - Streamlined role management workflows
- **📈 System Statistics** - Real-time metrics, usage analytics, and performance insights
- **🔍 Audit Logging** - Track all permission changes and administrative actions

---

## 🗣️ Natural Language Commands

Transform complex permission management into simple conversations! Our AI-powered system understands natural language and executes RBAC operations seamlessly.

### 🔑 **Creating Permissions**

```
"Create a new permission called 'edit_articles'"
"Add permission 'delete_users' with description 'Allow user deletion'"
"Make a permission for 'view_analytics' that lets users see reports"
```

### 👑 **Creating Roles**

```
"Create a role called 'Blog Administrator'"
"Add a new role named 'Customer Support Agent'"
"Make a role for 'Marketing Team' with content permissions"
```

### 🔗 **Assigning Permissions**

```
"Give the 'Content Editor' role permission to 'publish_articles'"
"Let 'Support Agents' access 'view_user_profiles'"
"Allow 'Marketing Team' to 'create_campaigns' and 'view_analytics'"
```

### ❌ **Removing Permissions**

```
"Remove 'delete_users' permission from 'Support Agent' role"
"Take away 'edit_settings' from the 'Content Writer' role"
"Stop letting 'Guests' access 'view_sensitive_data'"
```

---

## 🏗️ Project Architecture

```
src/
├── 📁 app/                    # Next.js App Router
│   ├── 📊 dashboard/         # Main application interface
│   │   ├── 🎯 assign-roles/  # Role assignment workflows
│   │   ├── 💬 nl-config/     # Natural language interface
│   │   ├── 🔑 permissions/   # Permission management
│   │   ├── 👑 roles/         # Role administration
│   │   ├── 👥 users/         # User management
│   │   └── 🏠 page.tsx       # Dashboard homepage
│   ├── 🔐 login/            # Authentication flows
│   ├── 🌐 layout.tsx        # Global app layout
│   └── 🏠 page.tsx          # Application landing page
├── 🧩 components/            # Reusable UI components
│   ├── 🎨 ui/               # Shadcn/ui component library
│   └── 📱 DashboardLayout.tsx # Dashboard wrapper component
├── 🔄 contexts/             # React context providers
│   └── 🔐 AuthContext.tsx   # Authentication state management
└── 📚 lib/                  # Utility libraries and configs
    ├── 🗄️ supabase.ts       # Supabase client configuration
    └── 🛠️ utils.ts          # Helper functions and utilities
```

---

## 🚀 Development Scripts

| Command              | Purpose                     | When to Use                    |
| -------------------- | --------------------------- | ------------------------------ |
| `npm run dev`        | 🔧 Start development server | Active development and testing |
| `npm run build`      | 📦 Build for production     | Preparing for deployment       |
| `npm run start`      | 🌐 Start production server  | Running built application      |
| `npm run lint`       | 🔍 Run ESLint checks        | Code quality assurance         |
| `npm run type-check` | ✅ TypeScript validation    | Type safety verification       |
