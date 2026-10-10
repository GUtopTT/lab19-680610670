const toApiStudent = (s: {
  studentId: string;
  firstName?: string;
  lastName?: string;
  program?: string;
  interests?: string[];
  emails?: { address: string }[];
}) => ({
  studentId: s.studentId,
  firstName: s.firstName,
  lastName: s.lastName,
  program: s.program,
  interests: s.interests,
  emails: s.emails?.map((e) => e.address),
});

addStudent: async (input) => {
  const data = await api<ApiStudent>("post", "/students", toApiStudent(input));
  set((state) => ({ students: [...state.students, fromApiStudent(data)] }));
},

updateStudent: async (input) => {
  const data = await api<ApiStudent>("put", "/students", toApiStudent(input));
  const next = fromApiStudent(data);
  set((state) => ({
    students: state.students.map((s) =>
      s.studentId === next.studentId ? next : s
    ),
  }));
},

removeStudent: async (studentId) => {
  await api("delete", "/students", { studentId });
  set((state) => ({
    students: state.students.filter((s) => s.studentId !== studentId),
    enrollments: state.enrollments.filter((e) => e.studentId !== studentId),
  }));
},

updateEnrollment: async (studentId, courseId, newCourseId) => {
  const data = await api<{ courseId: string }>("put", "/enrollments", {
    studentId,
    courseId,
    newCourseId,
  });
  set((state) => ({
    enrollments: state.enrollments.map((e) =>
      e.studentId === studentId && e.courseId === courseId
        ? { ...e, courseId: data.courseId }
        : e
    ),
  }));
},

dropEnrollment: async (studentId, courseId) => {
  await api("delete", "/enrollments", { studentId, courseId });
  set((state) => ({
    enrollments: state.enrollments.filter(
      (e) => !(e.studentId === studentId && e.courseId === courseId)
    ),
  }));
},
