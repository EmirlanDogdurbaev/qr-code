import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const redirectPath = user.role === 'student' ? '/student/schedule' : '/teacher/schedule';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

