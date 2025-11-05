// API Types based on OpenAPI spec

export interface LoginRequest {
  id: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface Schedule {
  id: number;
  subject_id: string;
  group_id: string;
  teacher_id: string;
  room_id: string;
  time: string; // ISO date-time
}

export interface QRStreamRequest {
  schedule_id: number;
}

export interface QRScanRequest {
  qr_data: string;
  schedule_id: number;
}

export interface ErrorResponse {
  error: string;
}

export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  role: UserRole;
  token: string;
}

