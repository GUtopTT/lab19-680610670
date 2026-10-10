export const zEnrollmentPutBody = z.object({
  studentId: z.string().min(1),
  courseId: z.string().min(1),
  newCourseId: z.string().min(1),
});
