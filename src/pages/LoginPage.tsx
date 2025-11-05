import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types/api";

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>("student");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.login(role, { id, password });
      login({
        id,
        role,
        token: response.token,
      });


      if (role === "student") {
        navigate("/student/schedule");
      } else {
        navigate("/teacher/schedule");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Kuga LMS
          </CardTitle>
          <CardDescription className="text-center">
            Attendance Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Role</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={role === "student" ? "default" : "outline"}
                  onClick={() => setRole("student")}
                  className="w-full"
                >
                  Student
                </Button>
                <Button
                  type="button"
                  variant={role === "teacher" ? "default" : "outline"}
                  onClick={() => setRole("teacher")}
                  className="w-full"
                >
                  Teacher
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                type="text"
                placeholder={role === "student" ? "S1001" : "T2001"}
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center space-y-1 pt-2">
              <p>Test credentials:</p>
              <p>Student: S1001 / pass</p>
              <p>Teacher: T2001 / pass</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
