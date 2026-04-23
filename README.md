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
│       ├── facility/           # Module A — Facilities & Assets
│       ├── ticket/             # Module C — Maintenance & Ticketing
│       ├── notification/       # Module D — Notifications
│       ├── auth/               # Module E — Authentication
│       └── visitor/            # Module F — Visitor & Event Access
├── frontend/                   # React (Vite) frontend
│   └── src/
│       ├── api/                # Axios instance & service functions
│       ├── components/         # Navbar, Layout
│       └── pages/
│           ├── facility/       # Resource list & form
│           ├── ticket/         # Ticket list, create, detail + comments
│           ├── notification/   # Notification bell panel
│           ├── auth/           # Login/Register & User management
│           └── visitor/        # Visitor request list & form
└── .github/workflows/ci.yml   # CI pipeline
```

## Modules

| Module | Description | Member |
|--------|-------------|--------|
| A | Facilities & Assets Catalogue | Member 1 — Sulochana |
| B | Booking Management | Member 2 — Kanishka |
| C | Maintenance & Incident Ticketing | Member 3 — Dineesha |
| D | Notifications | Member 4 — Lasitha |
| E | Authentication & Authorization | Member 4 — Lasitha |
| F | Visitor & Event Access Management | Member 5 — Oshada |

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

## Team Contribution

| Member | Branch | Modules | Backend | Frontend |
|--------|--------|---------|---------|----------|
| Sulochana | `sulochana` | A — Facilities | Resource CRUD + search/filter | Resource list & form |
| Kanishka | `kanishka` | B — Booking | *(pending)* | *(pending)* |
| Dineesha | `dineesha` | C — Tickets | Ticket + Comment full CRUD, file uploads, status workflow | Ticket list, create, detail with comments |
| Lasitha | `lasitha` | D + E — Notifications & Auth | Notification CRUD, User register/login/role mgmt | Notification bell, Login/Register, User management |
| Oshada | `main` | F — Visitor Access | Visitor request workflow with QR passes | Visitor request list & form |

## CI/CD

GitHub Actions runs on push/PR to `main`:
- **Backend:** Maven build + tests
- **Frontend:** npm install + Vite build
