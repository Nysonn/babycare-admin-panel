# BabyCare Admin Panel

A web-based administration panel for the BabyCare platform. Provides admins with tools to manage users, approve babysitter profiles, monitor activity, and create additional admin accounts.

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v3 with a custom pink theme
- **Font:** Andika (Google Fonts)
- **State Management:** Redux Toolkit
- **Server State:** TanStack Query (React Query v5)
- **HTTP Client:** Axios with request/response interceptors
- **Routing:** React Router v6
- **Notifications:** React Hot Toast
- **Icons:** Lucide React

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher

## Environment Setup

Copy the example environment file and fill in your API base URL:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_BASE_URL=https://your-backend-api-url
```

## Running Locally

```bash
npm run dev
```

The app will be available at http://localhost:5173.

## Building for Production

```bash
npm run build
```

Output is written to the `dist/` directory.

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Authenticated entry point — email/password login for admin accounts only |
| `/` | Dashboard | Summary stat cards (users, babysitters, parents, pending) plus recent activity table |
| `/users` | Users | Searchable, filterable table of all users with infinite scroll, suspend and delete actions |
| `/users/:id` | User Detail | Full profile view with documents preview, approval/suspend/delete actions |
| `/approvals` | Approvals | Card grid of all babysitter accounts with Review Profile, Suspend and Delete actions |
| `/activity` | Activity | Message activity report with stat cards, level filter and infinite scroll table |
| `/create-admin` | Create Admin | Form to provision a new admin account with client-side validation |

## Folder Structure

```
src/
  api/
    axios.ts              Axios instance with auth interceptors
    endpoints/
      auth.ts             Login and logout API calls
      users.ts            User management API calls
      admin.ts            Admin creation API call
  components/
    layout/
      AppLayout.tsx       Root layout combining sidebar, topbar, and content area
      Sidebar.tsx         Collapsible navigation sidebar
      TopBar.tsx          Fixed top bar showing page title and admin name
    ui/
      Badge.tsx           Status badge pill component
      ConfirmModal.tsx    Reusable confirmation dialog
      DocumentPreviewModal.tsx  Full-screen document/image viewer
      SessionExpiredModal.tsx   Modal shown on 401 session expiry
      Spinner.tsx         Animated loading spinner
  pages/
    Login.tsx             Login page
    Dashboard.tsx         Dashboard with stat cards and activity table
    Users.tsx             Users list with search, filters and infinite scroll
    UserDetail.tsx        User profile with documents and action buttons
    Approvals.tsx         Babysitter cards grid with review and moderation actions
    Activity.tsx          Activity report with stat cards, filter and infinite scroll
    CreateAdmin.tsx       Form to create a new admin account
  utils/
    helpers.ts            Date formatters, initials, badge variant helpers
  store/
    index.ts              Redux store setup, typed hooks
    slices/
      authSlice.ts        Authentication state (token, user, isAuthenticated)
      uiSlice.ts          UI state (sessionExpired, sidebarCollapsed)
  types/
    index.ts              All shared TypeScript interfaces
  App.tsx                 Router setup, providers, protected/public route wrappers
  main.tsx                React entry point
  index.css               Tailwind directives and global styles
```
