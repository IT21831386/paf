# Smart Campus Operations Hub

A university campus operations management platform built with **Spring Boot** + **React**.

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.5, Spring Data MongoDB, Maven
- **Frontend:** React 19 (Vite), React Router, Axios
- **Database:** MongoDB
- **CI/CD:** GitHub Actions

## Modules

| Module | Description | Member |
|--------|-------------|--------|
| A | Facilities & Assets Catalogue | Member 1 |
| B | Booking Management | Member 2 |
| C | Maintenance & Incident Ticketing | Member 3 |
| D | Notifications | Member 4 |
| E | Authentication & Authorization | (Shared) |
| F | Visitor & Event Access Management | Member 5 |

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MongoDB running on `localhost:27017`

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

### Module A — Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | List all (with filters) |
| GET | `/api/resources/{id}` | Get by ID |
| POST | `/api/resources` | Create |
| PUT | `/api/resources/{id}` | Update |
| DELETE | `/api/resources/{id}` | Delete |

### Module F — Visitor Requests
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

Document each member's endpoints and UI components here.
