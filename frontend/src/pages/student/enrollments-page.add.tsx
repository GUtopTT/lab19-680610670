import { useState } from "react";
import ChangeCourseDialog from "@/components/ChangeCourseDialog";

const dropEnrollment = useEnrollmentStore((s) => s.dropEnrollment);
const [dropError, setDropError] = useState("");

const handleDrop = async (courseId: string) => {
  setDropError("");
  try {
    await dropEnrollment(studentId, courseId);
  } catch (err: any) {
    setDropError(
      err?.response?.data?.message ?? err?.message ?? "ยกเลิกการลงทะเบียนไม่สำเร็จ"
    );
  }
};

{dropError && <p className="mb-2 text-sm text-destructive">{dropError}</p>}

<TableHead className="text-right">Action</TableHead>

<TableCell className="text-right">
  <div className="flex justify-end gap-1">
    <ChangeCourseDialog studentId={e.studentId} courseId={e.courseId} />
    <ConfirmDeleteButton
      title={`ยกเลิกการลงทะเบียน ${e.courseId}?`}
      description="การลงทะเบียนวิชานี้จะถูกลบออก"
      onConfirm={() => handleDrop(e.courseId)}
    />
  </div>
</TableCell>
