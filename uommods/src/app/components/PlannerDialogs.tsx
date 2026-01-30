import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Course } from "@/lib/types";

interface PlannerDialogsProps {
  showDuplicateDialog: boolean;
  setShowDuplicateDialog: (show: boolean) => void;
  prereqDialogOpen: boolean;
  setPrereqDialogOpen: (open: boolean) => void;
  pendingCourse: Course | null;
  missingPrereqs: Course[];
  onAddCourseOnly: () => void;
  onAddWithPrereqs: () => void;
}

export default function PlannerDialogs({
  showDuplicateDialog,
  setShowDuplicateDialog,
  prereqDialogOpen,
  setPrereqDialogOpen,
  pendingCourse,
  missingPrereqs,
  onAddCourseOnly,
  onAddWithPrereqs,
}: PlannerDialogsProps) {
  return (
    <>
      {showDuplicateDialog && (
        <Dialog open={true} onOpenChange={() => setShowDuplicateDialog(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicate course</DialogTitle>
              <DialogDescription>
                This course has already been added.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={prereqDialogOpen} onOpenChange={setPrereqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Missing Prerequisites</DialogTitle>
            <div>
              {pendingCourse?.code} has unmet prerequisites:
              <ul className="mt-2 list-disc ml-4 text-muted-foreground">
                {missingPrereqs.map((c) => (
                  <li key={c.code}>
                    {c.code} – {c.title}
                  </li>
                ))}
              </ul>
              <br />
              Would you like to add just the course, or both the course and
              prerequisites?
            </div>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={onAddCourseOnly}>
              Add Course Only
            </Button>
            <Button onClick={onAddWithPrereqs}>Add with Prerequisites</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}