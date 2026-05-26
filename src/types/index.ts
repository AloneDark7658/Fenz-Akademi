// ============================================================================
// Fenz Akademi — Genel Tip Tanımları
// ============================================================================

import type { Role, QuestionStatus } from "@prisma/client";

// ─── API Response Tipleri ───────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Sayfalama (Pagination) ─────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Kullanıcı Session Tipi ─────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  classLevel: number | null;
}

// ─── Dashboard Widget Tipleri ───────────────────────────────────────────────

export interface StudentStats {
  totalPoints: number;
  currentStreak: number;
  completedLessons: number;
  averageScore: number;
}

export interface CourseWithLessons {
  id: string;
  title: string;
  description: string | null;
  gradeLevel: number;
  imageUrl: string | null;
  videoLessons: {
    id: string;
    title: string;
    duration: number | null;
    orderIndex: number;
  }[];
}

// ─── Re-export Prisma Enum'ları ─────────────────────────────────────────────

export type { Role, QuestionStatus };
