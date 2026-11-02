import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './routes/PrivateRoute';
import { RoleRoute } from './routes/RoleRoute';

import Login from './pages/auth/Login';
import Unauthorized from './pages/Unauthorized';
import Home from './pages/Home';
import Messages from './pages/Messages';
import Agenda from './pages/Agenda';
import Suivi from './pages/Suivi';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFormations from './pages/admin/AdminFormations';

import ProfLayout from './layouts/ProfLayout';
import ProfDashboard from './pages/prof/ProfDashboard';
import ProfCourses from './pages/prof/ProfCourses';
import ProfAssignments from './pages/prof/ProfAssignments';
import ProfAssignmentSubmissions from './pages/prof/ProfAssignmentSubmissions';
import ProfQuizzes from './pages/prof/ProfQuizzes';
import ProfQuizResults from './pages/prof/ProfQuizResults';

import EleveLayout from './layouts/EleveLayout';
import EleveDashboard from './pages/eleve/EleveDashboard';
import EleveCourses from './pages/eleve/EleveCourses';
import EleveAssignments from './pages/eleve/EleveAssignments';
import EleveQuizzes from './pages/eleve/EleveQuizzes';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="utilisateurs" element={<AdminUsers />} />
        <Route path="formations" element={<AdminFormations />} />
        <Route path="suivi" element={<Suivi />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="messages" element={<Messages />} />
      </Route>

      <Route
        path="/prof"
        element={
          <RoleRoute allowedRoles={['prof']}>
            <ProfLayout />
          </RoleRoute>
        }
      >
        <Route index element={<ProfDashboard />} />
        <Route path="cours" element={<ProfCourses />} />
        <Route path="devoirs" element={<ProfAssignments />} />
        <Route path="devoirs/:id/soumissions" element={<ProfAssignmentSubmissions />} />
        <Route path="quiz" element={<ProfQuizzes />} />
        <Route path="quiz/:id/resultats" element={<ProfQuizResults />} />
        <Route path="suivi" element={<Suivi />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="messages" element={<Messages />} />
      </Route>

      <Route
        path="/eleve"
        element={
          <RoleRoute allowedRoles={['eleve']}>
            <EleveLayout />
          </RoleRoute>
        }
      >
        <Route index element={<EleveDashboard />} />
        <Route path="cours" element={<EleveCourses />} />
        <Route path="devoirs" element={<EleveAssignments />} />
        <Route path="quiz" element={<EleveQuizzes />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="messages" element={<Messages />} />
      </Route>
    </Routes>
  );
}

export default App;