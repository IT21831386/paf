import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ResourceList from './pages/facility/ResourceList';
import ResourceForm from './pages/facility/ResourceForm';
import ResourceDetail from './pages/facility/ResourceDetail';
import VisitorRequestList from './pages/visitor/VisitorRequestList';
import VisitorRequestForm from './pages/visitor/VisitorRequestForm';
import VisitorRequestDetail from './pages/visitor/VisitorRequestDetail';
import LoginPage from './pages/auth/LoginPage';
import UserManagement from './pages/auth/UserManagement';
import ProfilePage from './pages/auth/ProfilePage';
import TicketList from './pages/ticket/TicketList';
import CreateTicket from './pages/ticket/CreateTicket';
import TicketDetail from './pages/ticket/TicketDetail';
import BookingList from './pages/booking/BookingList';
import BookingForm from './pages/booking/BookingForm';
import BookingDetail from './pages/booking/BookingDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotificationPage from './pages/notification/NotificationPage';
import VirtualTour from './pages/virtual-tour/VirtualTour';
import VirtualTourDetail from './pages/virtual-tour/VirtualTourDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginPage />} />

          {/* Module A: Facilities & Assets */}
          <Route path="resources" element={<ProtectedRoute><ResourceList /></ProtectedRoute>} />
          <Route path="resources/new" element={<ProtectedRoute allowedRoles={['ADMIN']}><ResourceForm /></ProtectedRoute>} />
          <Route path="resources/edit/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><ResourceForm /></ProtectedRoute>} />
          <Route path="resources/:id" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />

          {/* Module C: Maintenance & Incident Ticketing */}
          <Route path="tickets" element={<ProtectedRoute><TicketList /></ProtectedRoute>} />
          <Route path="tickets/new" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
          <Route path="tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
          {/* Module B: Meeting Room Bookings */}
          <Route path="bookings" element={<BookingList />} />
          <Route path="bookings/new" element={<BookingForm />} />
          <Route path="bookings/edit/:id" element={<BookingForm />} />
          <Route path="bookings/:id" element={<BookingDetail />} />

          {/* Module D: Notifications */}
          <Route path="notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />

          {/* Module E: Auth & Admin */}
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
          <Route path="admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

          {/* Module F: Visitor & Event Access */}
          <Route path="visitor-requests" element={<ProtectedRoute><VisitorRequestList /></ProtectedRoute>} />
          <Route path="visitor-requests/new" element={<ProtectedRoute><VisitorRequestForm /></ProtectedRoute>} />
          <Route path="visitor-requests/edit/:id" element={<ProtectedRoute><VisitorRequestForm /></ProtectedRoute>} />
          <Route path="visitor-requests/:id" element={<ProtectedRoute><VisitorRequestDetail /></ProtectedRoute>} />

          {/* Virtual Tour */}
          <Route path="virtual-tour" element={<VirtualTour />} />
          <Route path="virtual-tour/:buildingId" element={<VirtualTourDetail />} />
          <Route path="virtual-tour/:buildingId/:floorId" element={<VirtualTourDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
