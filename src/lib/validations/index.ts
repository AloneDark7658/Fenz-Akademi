// ============================================================================
// Fenz Akademi — Zod Validasyon Şemaları Barrel Export
// ============================================================================

export {
  RoleEnum,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  type RoleType,
  type RegisterInput,
  type LoginInput,
  type UpdateProfileInput,
} from "./user.schema";

export {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
  createVideoLessonSchema,
  updateVideoLessonSchema,
  type CreateCourseInput,
  type UpdateCourseInput,
  type CourseQueryInput,
  type CreateVideoLessonInput,
  type UpdateVideoLessonInput,
} from "./course.schema";

export {
  QuestionStatusEnum,
  createQuestionSchema,
  updateQuestionSchema,
  type QuestionStatusType,
  type CreateQuestionInput,
  type UpdateQuestionInput,
} from "./question.schema";

export {
  upsertProgressSchema,
  checkAnswerSchema,
  submitQuizAnswersSchema,
  quizResultQuerySchema,
  type UpsertProgressInput,
  type CheckAnswerInput,
  type SubmitQuizAnswersInput,
  type QuizResultQueryInput,
} from "./quiz.schema";
