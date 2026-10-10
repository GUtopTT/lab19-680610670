import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Props = {
  studentId: string;
  courseId: string;
};

export default function ChangeCourseDialog({ studentId, courseId }: Props) {
  const courses = useEnrollmentStore((s) => s.courses);
  const enrollments = useEnrollmentStore((s) => s.enrollments);
  const updateEnrollment = useEnrollmentStore((s) => s.updateEnrollment);

  const [open, setOpen] = useState(false);
  const [newCourseId, setNewCourseId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const available = courses.filter(
    (c) =>
      !enrollments.some(
        (e) => e.studentId === studentId && e.courseId === c.courseId
      )
  );

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setNewCourseId("");
      setError("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateEnrollment(studentId, courseId, newCourseId);
      handleOpenChange(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "เกิดข้อผิดพลาด"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <ArrowRightLeft />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เปลี่ยนวิชา {courseId}</DialogTitle>
          <DialogDescription>
            เลือกวิชาใหม่แทนวิชา {courseId} (เลือกได้เฉพาะวิชาที่ยังไม่ได้ลงทะเบียน)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">วิชาใหม่</label>
          <Select value={newCourseId} onValueChange={setNewCourseId}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกวิชา" />
            </SelectTrigger>
            <SelectContent>
              {available.map((c) => (
                <SelectItem key={c.courseId} value={c.courseId}>
                  {c.courseId} — {c.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={!newCourseId || saving}>
            <ArrowRightLeft />
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
