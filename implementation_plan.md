# Smart Campus Operations Hub – Full Implementation Plan

Complete implementation plan for the **Smart Campus Operations Hub** covering all 5 members and modules A–F.

---

## Team Allocation

| Member | Module(s) | Scope |
|--------|-----------|-------|
| **Member 1** | Module A – Facilities & Assets Catalogue | Resource CRUD, search/filter |
| **Member 2** | Module B – Booking Management | Booking workflow, conflict checking |
| **Member 3** | Module C – Maintenance & Incident Ticketing | Tickets, attachments, comments |
| **Member 4** | Module D – Notifications + Module E – Auth | Notifications panel, OAuth 2.0, RBAC |
| **Member 5** | Module F – Visitor & Event Access *(Innovation)* | Visitor requests, QR passes, check-in/out |

---

## Proposed Changes

### Project Initialization (Shared)

#### Backend – Spring Boot (`/backend`)
- Java 17, Spring Boot 3.x, MongoDB, Maven
- Dependencies: `spring-boot-starter-web`, `spring-boot-starter-data-mongodb`, `spring-boot-starter-validation`, `lombok`, `spring-dotenv`
- Package structure:
  ```
  com.smartcampus
  ├── config/          (CORS, Security, global configs)
  ├── exception/       (GlobalExceptionHandler, custom exceptions)
  ├── facility/        (Module A)
  ├── booking/         (Module B)
  ├── ticket/          (Module C)
  ├── notification/    (Module D)
  ├── auth/            (Module E)
  ├── visitor/         (Module F)
  └── SmartCampusApplication.java
  ```

#### Frontend – React + Vite (`/frontend`)
- React Router, Axios, react-icons, vanilla CSS
  ```
  src/
  ├── api/             (Axios instance, service functions)
  ├── components/      (Navbar, Layout, ProtectedRoute, etc.)
  ├── pages/
  │   ├── facility/    (Module A)
  │   ├── booking/     (Module B)
  │   ├── ticket/      (Module C)
  │   ├── notification/(Module D)
  │   └── visitor/     (Module F)
  ├── App.jsx
  └── index.css
  ```

#### CI/CD – `.github/workflows/ci.yml`
- Build & test on push/PR to `main` (Java 17 + Node 20)

---

### Module A – Facilities & Assets Catalogue (Member 1) ✅ DONE

#### `Resource.java` – Model
| Field | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId |
| `name` | String | Resource name |
| `type` | Enum | LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT |
| `capacity` | int | Seating/usage capacity |
| `location` | String | Building + floor |
| `availabilityWindows` | List\<String\> | e.g., ["Mon 08:00-17:00"] |
| `status` | Enum | ACTIVE, OUT_OF_SERVICE |
| `description` | String | Additional details |
| `createdAt` / `updatedAt` | LocalDateTime | Timestamps |

#### REST Endpoints (5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/resources` | List all (filters: name, type, status, location, minCapacity) |
| `GET` | `/api/resources/{id}` | Get single resource |
| `POST` | `/api/resources` | Create resource |
| `PUT` | `/api/resources/{id}` | Update resource |
| `DELETE` | `/api/resources/{id}` | Delete resource |

#### Frontend Pages
- Resource List (card grid + search + filters)
- Add/Edit Resource form
- Resource Detail view

---

### Module B – Booking Management (Member 2)

#### `Booking.java` – Model
| Field | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId |
| `resourceId` | String | Reference to Resource |
| `userId` | String | User who booked |
| `date` | LocalDate | Booking date |
| `startTime` | LocalTime | Start of booking |
| `endTime` | LocalTime | End of booking |
| `purpose` | String | Reason for booking |
| `expectedAttendees` | int | Number of attendees |
| `status` | Enum | PENDING, APPROVED, REJECTED, CANCELLED |
| `rejectionReason` | String | Reason if rejected |
| `createdAt` / `updatedAt` | LocalDateTime | Timestamps |

#### REST Endpoints (min 4, using different HTTP methods)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bookings` | List all (Admin: filters by date, status, resource) |
| `GET` | `/api/bookings/{id}` | Get single booking |
| `GET` | `/api/bookings/my/{userId}` | User's own bookings |
| `POST` | `/api/bookings` | Request a booking (with conflict check) |
| `PUT` | `/api/bookings/{id}` | Update booking |
| `DELETE` | `/api/bookings/{id}` | Cancel booking |
| `PUT` | `/api/bookings/{id}/approve` | Approve (Admin) |
| `PUT` | `/api/bookings/{id}/reject` | Reject with reason (Admin) |

#### Key Logic
- **Conflict checking**: prevent overlapping bookings for the same resource (same date + overlapping time range)
- **Workflow**: `PENDING → APPROVED/REJECTED`, approved bookings can be `CANCELLED`

#### Frontend Pages
- Booking request form (select resource, date, time range, purpose)
- My Bookings list with status
- Admin panel (all bookings + approve/reject)

---

### Module C – Maintenance & Incident Ticketing (Member 3)

#### `Ticket.java` – Model
| Field | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId |
| `resourceId` | String | Related resource/location |
| `userId` | String | User who reported |
| `category` | String | e.g., Electrical, Plumbing, IT |
| `description` | String | Issue description |
| `priority` | Enum | LOW, MEDIUM, HIGH, CRITICAL |
| `contactDetails` | String | Preferred contact |
| `attachments` | List\<String\> | Up to 3 image file paths/URLs |
| `status` | Enum | OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED |
| `rejectionReason` | String | Reason if rejected |
| `assignedTo` | String | Technician user ID |
| `resolutionNotes` | String | Notes from technician |
| `createdAt` / `updatedAt` | LocalDateTime | Timestamps |

#### `Comment.java` – Model
| Field | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId |
| `ticketId` | String | Parent ticket |
| `userId` | String | Comment author |
| `content` | String | Comment text |
| `createdAt` / `updatedAt` | LocalDateTime | Timestamps |

#### REST Endpoints (min 4)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tickets` | List all (filters: status, priority, category) |
| `GET` | `/api/tickets/{id}` | Get ticket with comments |
| `POST` | `/api/tickets` | Create ticket (with file upload) |
| `PUT` | `/api/tickets/{id}` | Update ticket |
| `DELETE` | `/api/tickets/{id}` | Delete ticket |
| `PUT` | `/api/tickets/{id}/assign` | Assign technician |
| `PUT` | `/api/tickets/{id}/status` | Update status + resolution notes |
| `POST` | `/api/tickets/{id}/comments` | Add comment |
| `PUT` | `/api/tickets/{id}/comments/{commentId}` | Edit own comment |
| `DELETE` | `/api/tickets/{id}/comments/{commentId}` | Delete own comment |

#### Key Logic
- **File uploads**: up to 3 images per ticket (multipart/form-data)
- **Comment ownership**: users can only edit/delete their own comments
- **Workflow**: `OPEN → IN_PROGRESS → RESOLVED → CLOSED` (Admin can `REJECT`)

#### Frontend Pages
- Create ticket form (with image upload)
- Ticket list with filters
- Ticket detail view (status updates, comments thread)

---

### Module D – Notifications (Member 4 – Part 1)

#### `Notification.java` – Model
| Field | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId |
| `userId` | String | Recipient user |
| `title` | String | Notification title |
| `message` | String | Notification body |
| `type` | Enum | BOOKING_APPROVED, BOOKING_REJECTED, TICKET_STATUS, NEW_COMMENT |
| `referenceId` | String | Related booking/ticket ID |
| `isRead` | boolean | Read status |
| `createdAt` | LocalDateTime | Timestamp |

#### REST Endpoints (min 4)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications/{userId}` | Get user's notifications |
| `GET` | `/api/notifications/{userId}/unread-count` | Get unread count |
| `PUT` | `/api/notifications/{id}/read` | Mark as read |
| `PUT` | `/api/notifications/{userId}/read-all` | Mark all as read |
| `DELETE` | `/api/notifications/{id}` | Delete notification |

#### Key Logic
- Triggered when: booking approved/rejected, ticket status changes, new comment added
- Created via service calls from other modules (Booking, Ticket services call `NotificationService.createNotification()`)

#### Frontend
- Notification bell icon with unread count in Navbar
- Notification dropdown/panel with clickable items

---

### Module E – Authentication & Authorization (Member 4 – Part 2)

#### Implementation
- **OAuth 2.0** with Google sign-in using Spring Security OAuth2 Client
- Dependencies: `spring-boot-starter-oauth2-client`, `spring-boot-starter-security`
- Roles: `USER`, `ADMIN` (optionally `TECHNICIAN`, `SECURITY`)
- JWT token-based session after OAuth login

#### `User.java` – Model
| Field | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId |
| `email` | String | Google email |
| `name` | String | Display name |
| `avatarUrl` | String | Google profile image |
| `role` | Enum | USER, ADMIN, TECHNICIAN, SECURITY |
| `createdAt` | LocalDateTime | Timestamp |

#### REST Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/login` | Initiate OAuth login |
| `GET` | `/api/auth/callback` | OAuth callback |
| `GET` | `/api/auth/me` | Get current user |
| `PUT` | `/api/auth/users/{id}/role` | Update user role (Admin) |

#### Frontend
- Google Login button
- Protected routes (redirect unauthenticated users)
- Admin user management page

---

### Module F – Visitor & Event Access Management (Member 5) ✅ DONE

#### `VisitorRequest.java` – Model
| Field | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId |
| `visitorName` | String | Visitor name |
| `nicOrPassport` | String | NIC or passport |
| `hostPerson` | String | Host person |
| `hostDepartment` | String | Department |
| `purpose` | String | Reason for visit |
| `visitDate` | LocalDate | Date |
| `visitTime` | LocalTime | Time |
| `location` | String | Building/location |
| `numberOfVisitors` | int | Count |
| `status` | Enum | PENDING, APPROVED, REJECTED, CHECKED_IN, CHECKED_OUT |
| `rejectionReason` | String | Reason if rejected |
| `qrCode` | String | QR code data |
| `createdBy` | String | Submitter |
| `checkInTime` / `checkOutTime` | LocalDateTime | Timestamps |
| `createdAt` / `updatedAt` | LocalDateTime | Timestamps |

#### REST Endpoints (10)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/visitor-requests` | List all (filters: date, status, location, host) |
| `GET` | `/api/visitor-requests/{id}` | Get single |
| `GET` | `/api/visitor-requests/my/{userId}` | User's requests |
| `POST` | `/api/visitor-requests` | Submit request |
| `PUT` | `/api/visitor-requests/{id}` | Update request |
| `DELETE` | `/api/visitor-requests/{id}` | Delete request |
| `PUT` | `…/{id}/approve` | Approve (generates QR) |
| `PUT` | `…/{id}/reject` | Reject with reason |
| `PUT` | `…/{id}/check-in` | Check-in |
| `PUT` | `…/{id}/check-out` | Check-out |

#### Frontend Pages
- Submit request form
- My requests view
- Admin panel (approve/reject/filter)
- Check-in/out interface
- QR digital pass modal

---

## Verification Plan

### Automated Tests
1. `cd backend && mvn clean package` — backend compiles + tests
2. `cd frontend && npm run build` — frontend compiles

### Manual Verification
- Test each module's endpoints via Postman
- Verify frontend pages render and API integration works
- Test OAuth login flow
- Test workflow state transitions for each module
