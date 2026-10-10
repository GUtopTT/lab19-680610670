router.put("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const parsed = zEnrollmentPutBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: parsed.error.issues,
      });
    }

    const { studentId, courseId, newCourseId } = parsed.data;
    const user = (req as any).user;

    if (user.role !== "ADMIN" && user.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are allowed to edit only your own enrollments",
      });
    }

    const oldEnrollment = await prisma.enrollment.findFirst({
      where: { studentId, courseId },
    });
    if (!oldEnrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment does not exist",
      });
    }

    const newCourse = await prisma.course.findFirst({
      where: { courseId: newCourseId },
    });
    if (!newCourse) {
      return res.status(404).json({
        success: false,
        message: "New course does not exist",
      });
    }

    if (newCourseId === courseId) {
      return res.status(400).json({
        success: false,
        message: "New course must be different from the current course",
      });
    }

    const duplicated = await prisma.enrollment.findFirst({
      where: { studentId, courseId: newCourseId },
    });
    if (duplicated) {
      return res.status(409).json({
        success: false,
        message: "Student is already enrolled in the new course",
      });
    }

    const updated = await prisma.enrollment.update({
      where: { id: oldEnrollment.id },
      data: { courseId: newCourseId },
    });

    return res.status(200).json({
      success: true,
      message: "Enrollment has been updated successfully",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

router.delete("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { studentId, courseId } = req.body ?? {};
    if (
      typeof studentId !== "string" ||
      typeof courseId !== "string" ||
      !studentId ||
      !courseId
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: "studentId and courseId are required",
      });
    }

    const user = (req as any).user;
    if (user.role !== "ADMIN" && user.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are allowed to drop only your own enrollments",
      });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId, courseId },
    });
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment does not exist",
      });
    }

    await prisma.enrollment.delete({ where: { id: enrollment.id } });

    return res.status(200).json({
      success: true,
      message: "Enrollment has been deleted successfully",
      data: enrollment,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});
