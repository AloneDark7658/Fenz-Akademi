// ============================================================================
// Fenz Akademi — Genel Tip Tanımları
// ============================================================================

// Prisma enum types (defined locally to avoid @prisma/client export issues with Prisma v5)
export type Role = "STUDENT" | "TEACHER" | "PARENT" | "ADMIN";
export type QuestionStatus = "DRAFT" | "PUBLISHED";


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

// Role ve QuestionStatus yukarıda tanımlandı, ayrıca re-export'a gerek yok.

