import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/layouts/AppLayout';
import WelcomePage from '@/pages/WelcomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import HomePage from '@/pages/HomePage';
import ActivitiesPage from '@/pages/KegiatanPage';
import AddActivityPage from '@/pages/AddActivityPage';
import EditActivitiesPage from '@/pages/EditActivitiesPage';
import NotificationsPage from '@/pages/NotificationsPage';
import StatisticsPage from '@/pages/AnalitikPage';
import ProfilePage from '@/pages/ProfilePage';

export const router = createBrowserRouter([
  { path: '/', element: <WelcomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'home', element: <HomePage /> },
      { path: 'activities', element: <ActivitiesPage /> },
      { path: 'add-activity', element: <AddActivityPage /> },
      { path: 'edit-activities', element: <EditActivitiesPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'statistics', element: <StatisticsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);


