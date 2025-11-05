import axios, { type AxiosInstance } from "axios";
import type {
  LoginRequest,
  LoginResponse,
  Schedule,
  QRScanRequest,
  QRStreamRequest,
  UserRole,
} from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async login(
    role: UserRole,
    credentials: LoginRequest
  ): Promise<LoginResponse> {
    const endpoint = role === "student" ? "/student/login" : "/teacher/login";
    const response = await this.client.post<LoginResponse>(
      endpoint,
      credentials
    );
    return response.data;
  }

  async getSchedule(role: UserRole): Promise<Schedule[]> {
    const endpoint =
      role === "student" ? "/student/schedule" : "/teacher/schedule";
    const response = await this.client.get<Schedule[]>(endpoint);
    return response.data;
  }

  async scanQR(data: QRScanRequest): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      "/student/scan",
      data
    );
    return response.data;
  }

  async startQRStream(data: QRStreamRequest): Promise<Response> {
    const token = localStorage.getItem("token");
    
    const response = await fetch(`${API_BASE_URL}/teacher/qr-stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to start QR stream");
    }

    return response;
  }
}

export const apiClient = new ApiClient();
