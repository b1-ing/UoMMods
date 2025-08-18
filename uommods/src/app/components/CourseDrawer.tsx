import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Course } from "@/lib/mockcourses";
import { PrereqDisplay } from "@/app/components/PrereqDisplay";
import { Year } from "./PlannerControls";
import { ColumnType } from "./CourseColumn";

interface CourseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string | null;
  type: ColumnType;
  selectedYear: Year;
  columns: Record<Year, Record<ColumnType, Course[]>>;
  filteredCourses: Course[];
  onSelectCourse: (course: Course, type: ColumnType) => void;
}

export default function CourseDrawer({
  open,
  onOpenChange,
  label,
  type,
  selectedYear,
  columns,
  filteredCourses,
  onSelectCourse,
}: CourseDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh] overflow-hidden flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Select Course for {label}</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <ScrollArea className="h-full">
            <div className="space-y-2 pb-4">
              {filteredCourses.map((course) => (
                <Card
                  key={course.code}
                  className="p-2 cursor-pointer hover:bg-muted"
                  onClick={() => onSelectCourse(course, type)}
                >
                  <div className="font-medium">
                    {course.code}
                    <p>
                      {course.title} ({course.credits} units)
                    </p>
                  </div>
                  {course.prerequisites_list && (
                    <PrereqDisplay
                      prerequisites={course.prerequisites_list}
                      corequisites={course.corequisites_list}
                      columns={columns[selectedYear]}
                    />
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}