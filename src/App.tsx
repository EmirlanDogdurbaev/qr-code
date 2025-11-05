import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '@/pages/LoginPage';
import StudentSchedulePage from '@/pages/student/StudentSchedulePage';
import StudentScanPage from '@/pages/student/StudentScanPage';
import TeacherSchedulePage from '@/pages/teacher/TeacherSchedulePage';
import TeacherQRStreamPage from '@/pages/teacher/TeacherQRStreamPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/student/schedule"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/scan"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentScanPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/schedule"
            element={
              <ProtectedRoute allowedRole="teacher">
                <TeacherSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/qr-stream"
            element={
              <ProtectedRoute allowedRole="teacher">
                <TeacherQRStreamPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
