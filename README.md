# Smart Campus Operations Hub

A university campus operations management platform built with **Spring Boot** + **React** for the IT3030 PAF module.

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.5, Spring Data MongoDB, Maven
- **Frontend:** React 19 (Vite), React Router, Axios, React Icons
- **Database:** MongoDB (Atlas)
- **CI/CD:** GitHub Actions

## Project Structure

```
paf/
├── backend/                    # Spring Boot backend
│   └── src/main/java/com/smartcampus/
│       ├── config/             # WebConfig (file serving, CORS)
│       ├── exception/          # Global error handling
│       ├── admin/              # Admin Dashboard stats API
│       ├── facility/           # Module A — Facilities & Assets
│       ├── ticket/             # Module C — Maintenance & Ticketing
│       ├── notification/       # Module D — Notifications
│       ├── auth/               # Module E — Authentication & Authorization
│       └── visitor/            # Module F — Visitor & Event Access
├── frontend/                   # React (Vite) frontend
│   └── src/
│       ├── api/                # Axios instance & service functions
│       ├── components/         # Navbar, Layout, ProtectedRoute
│       └── pages/
│           ├── admin/          # Admin Dashboard (stats, recent activity)
│           ├── facility/       # Resource list, detail & form
│           ├── ticket/         # Ticket list, create, detail + comments
│           ├── notification/   # Notification bell panel & history page
│           ├── auth/           # Login/Register, User management, Profile
│           └── visitor/        # Visitor request list, detail & form
└── .github/workflows/ci.yml   # CI pipeline
```

## Modules

| Module | Description | Member |
|--------|-------------|--------|
| A | Facilities & Assets Catalogue | Member 1 — Kanishka |
| B | Booking Management | Member 2 — Upeka |
| C | Maintenance & Incident Ticketing | Member 3 — Dineesha |
| D | Notifications | Member 4 — Lasitha |
| E | Authentication & Authorization | Member 4 — Lasitha |
| F | Visitor & Event Access Management | Member 5 — Sulochana |

## Key Features

### Route Protection & Authorization
- **ProtectedRoute component** wraps all authenticated pages — redirects to `/login` if not logged in
- **Role-based access control** with 4 roles: `USER`, `ADMIN`, `TECHNICIAN`, `SECURITY`
- Admin-only routes: Dashboard (`/admin`), User Management (`/users`), Resource Create/Edit
- Security-only features: Visitor check-in / check-out

### Admin Dashboard (`/admin`)
- **Live stats cards:** total users, resources, tickets, visitor requests
- **Status breakdowns:** tickets by status (Open/In Progress/Resolved/Closed/Rejected), visitors by status
- **Recent activity:** last 5 tickets and visitor requests
- **Quick action buttons:** create resource, ticket, visitor request, manage users

### Module A — Facilities & Assets
- Resource list with search, filter by type/status/location, and **resource count**
- **Resource detail page** (`/resources/:id`) showing all fields, availability windows
- **Clickable resource cards** navigate to detail view
- CRUD operations restricted to **ADMIN** role only

### Module C — Maintenance & Incident Ticketing
- **"My Tickets" toggle** to filter own tickets vs all tickets
- Comments use **logged-in user** identity (no more hardcoded user)
- **Technician dropdown** populated from user list for ticket assignment
- **Resource dropdown** in ticket creation form, populated from facilities API
- Status updates and assignment restricted to **ADMIN/TECHNICIAN** roles
- Delete restricted to ticket owner or ADMIN

### Module D — Notifications
- **Notification bell** (dropdown) with real-time polling, relative timestamps ("2h ago")
- **Full notification history page** (`/notifications`) with filter tabs: All, Unread, by Type
- Bulk mark-read and individual delete
- **"View All"** link in bell dropdown

### Module E — Auth & User Profile
- Login / Register with role assignment
- **Profile page** (`/profile`) — edit name, change password
- User management (ADMIN only)

### Module F — Visitor & Event Access
- **"My Requests" toggle** to filter own requests vs all
- **Visitor detail page** (`/visitor-requests/:id`) with full info, visit log, QR code
- **Role-based controls:**
  - ADMIN: approve / reject (with reason) / delete
  - SECURITY: check-in / check-out
  - USER: view own requests, create new
- **Clickable request cards** navigate to detail view

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Environment Setup

Create a `.env` file in the project root **and** `backend/` folder:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smartcampus
```

### Backend
```bash
cd backend
mvn spring-boot:run
```
Server starts at `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`

### Seed Data
```powershell
.\seed-data.ps1
```
Populates DB with test users, resources, tickets, notifications, and visitor requests.

### Default Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@smartcampus.lk | admin123 | ADMIN |
| tech1@smartcampus.lk | pass123 | TECHNICIAN |
| security@smartcampus.lk | pass123 | SECURITY |
| john@student.lk | pass123 | USER |

## API Endpoints

### Module A — Facilities & Assets (Member 1)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | List all (with filters) |
| GET | `/api/resources/{id}` | Get by ID |
| POST | `/api/resources` | Create |
| PUT | `/api/resources/{id}` | Update |
| DELETE | `/api/resources/{id}` | Delete |

---

### Module C — Maintenance & Ticketing (Member 3)

**Tickets:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | List all (filters: status, priority, category, assignedTo) |
| GET | `/api/tickets/{id}` | Get by ID |
| GET | `/api/tickets/my/{userId}` | User's tickets |
| POST | `/api/tickets` | Create (multipart, max 3 images) |
| PUT | `/api/tickets/{id}` | Update (OPEN only) |
| DELETE | `/api/tickets/{id}` | Delete + cascade comments |
| PUT | `/api/tickets/{id}/assign` | Assign technician |
| PUT | `/api/tickets/{id}/status` | Update status (OPEN→IN_PROGRESS→RESOLVED→CLOSED) |

**Comments:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets/{ticketId}/comments` | List comments |
| POST | `/api/tickets/{ticketId}/comments` | Add comment |
| PUT | `/api/tickets/{ticketId}/comments/{id}` | Edit own comment |
| DELETE | `/api/tickets/{ticketId}/comments/{id}` | Delete own comment |

---

### Module D — Notifications (Member 4)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/{userId}` | All notifications |
| GET | `/api/notifications/{userId}/unread` | Unread only |
| GET | `/api/notifications/{userId}/unread-count` | Unread count |
| POST | `/api/notifications` | Create notification |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| PUT | `/api/notifications/{userId}/read-all` | Mark all read |
| DELETE | `/api/notifications/{id}` | Delete |

---

### Module E — Authentication & Authorization (Member 4)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me/{id}` | Get profile |
| GET | `/api/auth/users` | List all users (Admin) |
| PUT | `/api/auth/users/{id}/role` | Update role (Admin) |
| PUT | `/api/auth/users/{id}/profile` | Update profile |
| PUT | `/api/auth/users/{id}/change-password` | Change password |
| DELETE | `/api/auth/users/{id}` | Delete user (Admin) |

---

### Module F — Visitor & Event Access (Member 5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/visitor-requests` | List all (with filters) |
| GET | `/api/visitor-requests/{id}` | Get by ID |
| GET | `/api/visitor-requests/my/{userId}` | User's requests |
| POST | `/api/visitor-requests` | Create |
| PUT | `/api/visitor-requests/{id}` | Update |
| DELETE | `/api/visitor-requests/{id}` | Delete |
| PUT | `/api/visitor-requests/{id}/approve` | Approve |
| PUT | `/api/visitor-requests/{id}/reject` | Reject |
| PUT | `/api/visitor-requests/{id}/check-in` | Check-in |
| PUT | `/api/visitor-requests/{id}/check-out` | Check-out |

---

### Admin Dashboard API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/recent-tickets` | Last 5 tickets |
| GET | `/api/admin/recent-visitors` | Last 5 visitor requests |

## Team Contribution

| Member | Branch | Modules | Backend | Frontend |
|--------|--------|---------|---------|----------|
| Kanishka | `kanishka` | A — Facilities | Resource CRUD + search/filter | Resource list, detail & form |
| Upeka | `upeka` | B — Booking | *(pending)* | *(pending)* |
| Dineesha | `dineesha` | C — Tickets | Ticket + Comment full CRUD, file uploads, status workflow | Ticket list, create, detail with comments, My Tickets |
| Lasitha | `lasitha` | D + E — Notifications & Auth | Notification CRUD, User auth, Admin Dashboard API, change-password | Notification bell + history, Login/Register, Profile, Admin Dashboard, ProtectedRoute |
| Sulochana | `sulochana` | F — Visitor Access | Visitor request workflow with QR passes | Visitor request list, detail & form, role-based controls |

## CI/CD

GitHub Actions runs on push/PR to `main`:
- **Backend:** Maven build + tests
- **Frontend:** npm install + Vite build
