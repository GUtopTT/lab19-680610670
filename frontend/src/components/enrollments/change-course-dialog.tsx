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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnrollmentStore } from "@/lib/enrollment-store";

export function ChangeCourseDialog({
  studentId,
  courseId,
}: {
  studentId: string;
  courseId: string;
}) {
  const { courses, enrollments, updateEnrollment } = useEnrollmentStore();

  const [open, setOpen] = useState(false);
  const [newCourse, setNewCourse] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const courseOptions = courses
    .filter(
      (c) =>
        !enrollments.some(
          (e) => e.studentId === studentId && e.courseId === c.courseId,
        ),
    )
    .map((c) => ({
      value: c.courseId,
      label: `${c.courseId} — ${c.courseTitle}`,
    }));

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setNewCourse(null);
      setServerError(null);
    }
  };

  const handleSave = async () => {
    if (!newCourse) return;
    setSubmitting(true);
    setServerError(null);
    try {
      await updateEnrollment(studentId, courseId, newCourse);
      handleOpenChange(false);
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`เปลี่ยนวิชา ${courseId}`}
          />
        }
      >
        <ArrowRightLeft className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>เปลี่ยนวิชา {courseId}</DialogTitle>
          <DialogDescription>
            เลือกวิชาใหม่แทนวิชา {courseId} (เลือกได้เฉพาะวิชาที่ยังไม่ได้ลงทะเบียน)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor={`newCourse-${courseId}`}>วิชาใหม่</Label>
          <Select
            items={courseOptions}
            value={newCourse}
            onValueChange={(v) => setNewCourse(v as string)}
          >
            <SelectTrigger id={`newCourse-${courseId}`} className="w-full">
              <SelectValue placeholder="เลือกวิชา" />
            </SelectTrigger>
            <SelectContent>
              {courseOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}
        <DialogFooter>
          <Button disabled={!newCourse || submitting} onClick={handleSave}>
            <ArrowRightLeft className="h-4 w-4" />
            {submitting ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
