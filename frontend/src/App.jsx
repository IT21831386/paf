import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ResourceList from './pages/facility/ResourceList';
import ResourceForm from './pages/facility/ResourceForm';
import VisitorRequestList from './pages/visitor/VisitorRequestList';
import VisitorRequestForm from './pages/visitor/VisitorRequestForm';

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
          {/* Module F: Visitor & Event Access */}
          <Route path="visitor-requests" element={<VisitorRequestList />} />
          <Route path="visitor-requests/new" element={<VisitorRequestForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
