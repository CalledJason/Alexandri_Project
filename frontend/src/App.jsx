import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ManageGroupsPage from './pages/ManageGroupsPage';
import CreateGroupPage from './pages/CreateGroupPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import GroupDetailPage from './pages/GroupDetailPage';
import MyGroupsPage from './pages/MyGroupsPage';
import SchedulePage from './pages/SchedulePage';
import NotFoundPage from './pages/NotFoundPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="group/:id" element={<GroupDetailPage />} />
            <Route path="profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="my-groups" element={
              <PrivateRoute>
                <MyGroupsPage />
              </PrivateRoute>
            } />
            <Route path="schedule" element={
              <PrivateRoute>
                <SchedulePage />
              </PrivateRoute>
            } />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="manage" element={
              <PrivateRoute>
                <ManageGroupsPage />
              </PrivateRoute>
            } />
            <Route path="create" element={
              <PrivateRoute>
                <CreateGroupPage />
              </PrivateRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
