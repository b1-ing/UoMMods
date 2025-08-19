import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import Link from "next/link";
import { Course } from "@/lib/mockcourses";
import { Program } from "@/lib/programs";
import { PrereqDisplay } from "@/app/components/PrereqDisplay";
import { Year } from "./PlannerControls";

export type ColumnType = "year" | "sem1" | "sem2";

interface CourseColumnProps {
  label: string | null;
  type: ColumnType;
  selectedYear: Year;
  selectedProgramCode: string;
  programs: Record<string, Program>;
  columns: Record<Year, Record<ColumnType, Course[]>>;
  onAddCourse: (type: ColumnType) => void;
  onRemoveCourse: (course: Course, type: ColumnType) => void;
}

export default function CourseColumn({
  label,
  type,
  selectedYear,
  selectedProgramCode,
  programs,
  columns,
  onAddCourse,
  onRemoveCourse,
}: CourseColumnProps) {
  const key = `y${selectedYear}${type}cred` as keyof Program;
  const program = programs[selectedProgramCode];
  const requiredCredits = program
    ? (program[key as keyof Program] as number)
    : 0;
  const yearColumns = columns[selectedYear];
  const currentCredits = yearColumns?.[type]
    ? yearColumns[type].reduce(
        (sum, course) => sum + (course?.credits ?? 0),
        0
      )
    : 0;

  return (
    <Card className="w-full sm:w-1/3 p-4 flex flex-col gap-4 m-1">
      <div className="flex justify-between items-center">
        <CardTitle>
          {label ? `${label} –` : type === "year" ? "Year-Long –" : type === "sem1" ? "Semester 1 –" : "Semester 2 –"} {currentCredits}/{requiredCredits}{" "}
          credits
        </CardTitle>
        <Button size="sm" onClick={() => onAddCourse(type)}>
          + Add
        </Button>
      </div>

      <CardContent className="space-y-2 p-2">
        {(columns[selectedYear][type] ?? []).map((course) =>
          course ? (
            <Link
              href={`/route/${course.code}`}
              key={`${type}-${course.code ?? "not found"}`}
            >
              <Card className="p-2 m-2">
                <div className="flex justify-between items-start">
                  <div className="font-semibold">
                    {course.code ?? "not found"} – {course.title}
                    {course.mandatory === "Compulsory" && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded ml-2 block mt-1">
                        Compulsory
                      </span>
                    )}
                  </div>
                  <div>
                    {course.mandatory === "Optional" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          onRemoveCourse(course, type);
                        }}
                      >
                        <Trash />
                      </Button>
                    ) : (
                      <span></span>
                    )}
                  </div>
                </div>
                {course.prerequisites_list && (
                  <PrereqDisplay
                    prerequisites={course.prerequisites_list}
                    corequisites={course.corequisites_list}
                    columns={columns[selectedYear]}
                  />
                )}
                <div className="text-sm text-muted-foreground">
                  {course.credits} units
                </div>
              </Card>
            </Link>
          ) : null
        )}
      </CardContent>
    </Card>
  );
}