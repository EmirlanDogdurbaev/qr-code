import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Schedule } from '@/types/api';
import { Calendar, Clock, MapPin, User, BookOpen, QrCode, LogOut } from 'lucide-react';

export default function StudentSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSchedule('student');
      setSchedules(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="bg-white dark:bg-zinc-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Student Dashboard
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Welcome, {user?.id}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/student/scan')}
                variant="default"
                className="gap-2"
              >
                <QrCode className="h-4 w-4" />
                Scan QR
              </Button>
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Schedule
            </CardTitle>
            <CardDescription>
              View your class schedule and scan QR codes for attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-50"></div>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400">Loading schedule...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-md">
                {error}
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                No classes scheduled
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            <span>Subject: {schedule.subject_id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(schedule.time)}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-zinc-500" />
                            <span>Teacher: {schedule.teacher_id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-zinc-500" />
                            <span>Room: {schedule.room_id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-zinc-500" />
                            <span>Group: {schedule.group_id}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          onClick={() => navigate('/student/scan', { state: { scheduleId: schedule.id } })}
                          className="w-full sm:w-auto gap-2"
                        >
                          <QrCode className="h-4 w-4" />
                          Mark Attendance
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

