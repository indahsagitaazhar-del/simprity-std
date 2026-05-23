import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext'; 
import { router } from '@/routes';
import { NotificationManager } from '@/components/NotificationManager'; 

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        {/* NotificationManager berjalan di background tanpa mengganggu UI */}
        <NotificationManager />
        
        {/* Toaster untuk notifikasi ringan di dalam UI */}
        <Toaster position="top-right" richColors />
        
        {/* Router aplikasi utama */}
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthProvider>
  );
}