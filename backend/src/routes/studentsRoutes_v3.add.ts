router.put("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const parsed = zStudentPutBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: parsed.error.issues,
      });
    }

    const { studentId, firstName, lastName, program, interests, emails } =
      parsed.data;
    const user = (req as any).user;

    if (user.role !== "ADMIN" && user.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are allowed to edit only your own data",
      });
    }

    const existing = await prisma.student.findFirst({ where: { studentId } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Student does not exist",
      });
    }

    const data: Record<string, unknown> = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (program !== undefined) data.program = program;
    if (interests !== undefined) data.interests = interests;
    if (emails !== undefined) data.emails = emails;

    const updated = await prisma.student.update({
      where: { studentId },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Student has been updated successfully",
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

router.delete(
  "/",
  authenticateToken,
  checkRoleAdmin,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.body?.studentId;
      if (typeof studentId !== "string" || studentId.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          error: "studentId is required",
        });
      }

      const existing = await prisma.student.findFirst({ where: { studentId } });
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Student does not exist",
        });
      }

      await prisma.$transaction([
        prisma.enrollment.deleteMany({ where: { studentId } }),
        prisma.student.delete({ where: { studentId } }),
      ]);

      return res.status(200).json({
        success: true,
        message: "Student has been deleted successfully",
        data: existing,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Something is wrong, please try again",
        error: err,
      });
    }
  }
);
