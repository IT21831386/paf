import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ResourceList from './pages/facility/ResourceList';
import ResourceForm from './pages/facility/ResourceForm';
import VisitorRequestList from './pages/visitor/VisitorRequestList';
import VisitorRequestForm from './pages/visitor/VisitorRequestForm';
import LoginPage from './pages/auth/LoginPage';
import UserManagement from './pages/auth/UserManagement';
import TicketList from './pages/ticket/TicketList';
import CreateTicket from './pages/ticket/CreateTicket';
import TicketDetail from './pages/ticket/TicketDetail';
import BookingList from './pages/booking/BookingList';
import BookingForm from './pages/booking/BookingForm';
import BookingDetail from './pages/booking/BookingDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* Module A: Facilities & Assets */}
          <Route path="resources" element={<ResourceList />} />
          <Route path="resources/new" element={<ResourceForm />} />
          <Route path="resources/edit/:id" element={<ResourceForm />} />
          {/* Module C: Maintenance & Incident Ticketing */}
          <Route path="tickets" element={<TicketList />} />
          <Route path="tickets/new" element={<CreateTicket />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          {/* Module B: Meeting Room Bookings */}
          <Route path="bookings" element={<BookingList />} />
          <Route path="bookings/new" element={<BookingForm />} />
          <Route path="bookings/edit/:id" element={<BookingForm />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
          {/* Module F: Visitor & Event Access */}
          <Route path="visitor-requests" element={<VisitorRequestList />} />
          <Route path="visitor-requests/new" element={<VisitorRequestForm />} />
          {/* Module E: Auth */}
          <Route path="login" element={<LoginPage />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
