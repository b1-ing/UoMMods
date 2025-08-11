"use client";

import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Program } from "@/lib/programs";
import { RefreshCwIcon, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Course } from "@/lib/mockcourses";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PrereqDisplay } from "@/app/components/PrereqDisplay";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Semester } from "@/lib/semesters";

type ColumnType = "year" | "sem1" | "sem2";
export type Year = 1 | 2 | 3 | 4;
const defaultColumns = {
  1: {
    year: [],
    sem1: [],
    sem2: [],
  },
  2: {
    year: [],
    sem1: [],
    sem2: [],
  },
  3: {
    year: [],
    sem1: [],
    sem2: [],
  },
  4: {
    year: [],
    sem1: [],
    sem2: [],
  },
};

export default function Planner() {
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [selectedProgramCode, setSelectedProgramCode] = useState<string>(
    localStorage.getItem("selectedProgramCode") ?? ""
  );
  const [selectedSemester, setSelectedSemester] =
    useState<keyof typeof Semester>("sem1");
  const [selectedYear, setSelectedYear] = useState<Year>(
    Number(localStorage.getItem("selectedYear") ?? "") as Year
  );
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const [missingPrereqs, setMissingPrereqs] = useState<Course[]>([]);
  const [prereqDialogOpen, setPrereqDialogOpen] = useState(false);
  const [pendingColumn, setPendingColumn] = useState<ColumnType>("year");

  const [openDrawer, setOpenDrawer] = useState<ColumnType | null>(null);
  const [columns, setColumns] = useState<
    Record<Year, Record<ColumnType, Course[]>>
  >(JSON.parse(localStorage.getItem("columns") ?? "null") ?? defaultColumns);
  const [programs, setPrograms] = useState<Record<string, Program>>({});

  const resetColumns = () => {
    setColumns(defaultColumns);
  };

  const clearLocalStorageColumns = () => {
    localStorage.setItem("columns", JSON.stringify(defaultColumns));
    resetColumns();
  };

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("course_programs")
      .select(
        `
          course_code,
          courses (
          *)`
      )
      .eq("program_id", selectedProgramCode);
    const courseMap: Record<string, Course> = {};
    if (data) {
      data.forEach((record) => {
        const courses = record.courses;
        if (Array.isArray(courses)) {
          courses.forEach((course) => {
            if (course?.code) {
              courseMap[course.code] = {
                ...course,
                code: course.code,
              };
            }
          });
        } else if (
          courses &&
          typeof courses === "object" &&
          "code" in courses
        ) {
          const singleCourse = courses as Course;
          courseMap[singleCourse.code] = {
            ...singleCourse,
            code: singleCourse.code,
          };
        }
      });
    }

    setCourses(courseMap);
  };

  const fetchPrograms = async () => {
    const { data, error } = await supabase.from("programs").select("*");

    if (error) {
      console.error("Error fetching programs:", error);
      return;
    }

    // Convert array to object for easier access
    const programMap: Record<string, Program> = {};
    data?.forEach((program) => {
      programMap[program.program_id] = program;
    });

    setPrograms(programMap);
  };

  const storePreferences = async () => {
    localStorage.setItem("selectedYear", selectedYear.toString());
    localStorage.setItem("selectedProgramCode", selectedProgramCode.toString());
    localStorage.setItem("columns", JSON.stringify(columns));
  };

  const fetchPreferences = async () => {
    setSelectedYear(
      (prev) => Number(localStorage.getItem("selectedYear") ?? prev) as Year
    );
    setSelectedProgramCode(
      (prev) => localStorage.getItem("selectedProgramCode") ?? prev
    );
    setColumns(
      (prev) => JSON.parse(localStorage.getItem("columns") ?? "null") ?? prev
    );
  };

  const addCompulsoryCourses = useCallback(() => {
    const program = programs[selectedProgramCode as keyof typeof programs];
    if (!program || !selectedYear) return;

    const newColumns: Record<ColumnType, Course[]> = {
      year: [...columns[selectedYear]["year"]],
      sem1: [...columns[selectedYear]["sem1"]],
      sem2: [...columns[selectedYear]["sem2"]],
    };

    const toCourse = (code: string): Course | null => courses[code] ?? null;

    const safeMap = (arr: string[]) =>
      arr.map(toCourse).filter((course): course is Course => course !== null);

    switch (selectedYear) {
      case 1:
        newColumns.year = safeMap(program.firstyrfy);
        newColumns.sem1 = safeMap(program.firstyrs1comp);
        newColumns.sem2 = safeMap(program.firstyrs2comp);
        break;
      case 2:
        newColumns.year = safeMap(program.secondyrfy);
        newColumns.sem1 = safeMap(program.secondyrs1comp);
        newColumns.sem2 = safeMap(program.secondyrs2comp);
        break;
      case 3:
        newColumns.year = safeMap(program.thirdyrfy);
        newColumns.sem1 = safeMap(program.thirdyrs1comp);
        newColumns.sem2 = safeMap(program.thirdyrs2comp);
        break;
      default:
        return;
    }

    setColumns((prev) => {
      return {
        ...prev,
        [selectedYear]: { ...prev[selectedYear], ...newColumns },
      };
    });
  }, [selectedProgramCode, selectedYear, courses, programs, columns]);

  const handleAddWithPrereqs = () => {
    if (!pendingCourse) return;
    if (pendingCourse && pendingColumn) {
      updateColumns(selectedYear, pendingColumn, pendingCourse);
    }
    missingPrereqs.forEach((prereqCourse) => {
      if (!prereqCourse) return;

      // Decide which column based on its semester
      const semesters = prereqCourse.semesters ?? [];

      let targetColumn: ColumnType | null = null;
      if (semesters.includes("Full year")) targetColumn = "year";
      else if (semesters.includes("Semester 1")) targetColumn = "sem1";
      else if (semesters.includes("Semester 2")) targetColumn = "sem2";

      if (targetColumn) {
        addCourseToColumn(selectedYear, prereqCourse, targetColumn);
      }
    });

    setPendingCourse(null);
    setMissingPrereqs([]);
    setPrereqDialogOpen(false);
    setOpenDrawer(null);
  };

  useEffect(() => {
    resetColumns();
  }, [selectedProgramCode]);

  useEffect(() => {
    fetchPreferences();
    fetchPrograms();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [selectedProgramCode, fetchCourses]);

  useEffect(() => {
    storePreferences();
  }, [selectedYear, selectedProgramCode, columns, storePreferences]);

  useEffect(() => {
    if (!selectedProgramCode || !selectedYear || !courses) return;

    // only populate compulsory courses if nothing has been added yet for that year
    const yearCols = columns[selectedYear];
    const hasAny = (["year", "sem1", "sem2"] as ColumnType[]).some(
      (col) => yearCols[col]?.length > 0
    );

    if (!hasAny) {
      addCompulsoryCourses();
    }
  }, [
    selectedProgramCode,
    selectedYear,
    courses,
    columns,
    addCompulsoryCourses,
  ]);

  const updateColumns = (
    year: Year,
    column: ColumnType,
    course: Course | null
  ) => {
    setColumns((prev) => {
      return {
        ...prev,
        [year]: { ...prev[year], [column]: [...prev[year][column], course] },
      };
    });
  };
  const addCourseToColumn = (
    year: Year,
    course: Course,
    column: ColumnType
  ) => {
    if (courseExistsInColumns(year, course.code, columns)) {
      setOpenDrawer(null);
      setShowDuplicateDialog(true);
      return;
    }

    const prereqCodes = course.corequisites_list
      ? splitCourseCodes(course.corequisites_list)
      : [];

    const missing = prereqCodes
      .filter((code) => !courseExistsInColumns(year, code, columns))
      .map((code) => courses[code])
      .filter(Boolean);

    if (missing.length > 0) {
      setPendingCourse(course);
      setPendingColumn(column);
      setMissingPrereqs(missing);
      setPrereqDialogOpen(true);
      return;
    } else {
      updateColumns(year, column, course);
    }

    setOpenDrawer(null);
  };

  const removeCourseFromColumn = (course: Course, column: ColumnType) => {
    setColumns((prev) => {
      const updated = {
        ...prev,
        [selectedYear]: {
          ...prev[selectedYear],
          [column]: prev[selectedYear][column].filter(
            (c) => c.code !== course.code
          ),
        },
      };
      return updated;
    });
    setOpenDrawer(null);
  };
  function splitCourseCodes(codes: string): string[] {
    return codes.split(",");
  }
  const getFilteredCourses = (type: string) => {
    if (!selectedProgramCode || !selectedYear) return [];

    const program = programs[selectedProgramCode];
    if (!program) return [];

    // Map year + semester to the relevant program property
    const optionalLists: Record<Year, Record<ColumnType, string[]>> = {
      1: {
        year: program.firstyrfyop || [],
        sem1: program.firstyrs1op || [],
        sem2: program.firstyrs2op || [],
      },
      2: {
        year: program.secondyrfyop || [],
        sem1: program.secondyrs1op || [],
        sem2: program.secondyrs2op || [],
      },
      3: {
        year: program.thirdyrfyop || [],
        sem1: program.thirdyrs1op || [],
        sem2: program.thirdyrs2op || [],
      },
      4: {
        year: program.fourthyrfyop || [],
        sem1: program.fourthyrs1op || [],
        sem2: program.fourthyrs2op || [],
      },
    };

    const allowedCodes = optionalLists[selectedYear]?.[type as ColumnType] || [];

    return Object.values(courses).filter(
        (course) =>
            course.level === selectedYear &&
            allowedCodes.includes(course.code) &&
            (
                (type === "sem1" && course.semesters?.includes("Semester 1")) ||
                (type === "sem2" && course.semesters?.includes("Semester 2")) ||
                (type === "year" && course.semesters?.includes("Full year"))
            )
    );
  };


  // Build a summary of selected modules for the current program/year
  // Summary for all years, each with its columns
  const allYearsSummary = React.useMemo(() => {
    if (!selectedProgramCode) return null;

    type YearSummary = {
      year: Year;
      columns: {
        column: ColumnType;
        courses: Course[];
        totalCredits: number;
      }[];
    };

    const summaries: YearSummary[] = ([1, 2, 3, 4] as Year[]).map((yr) => {
      const yearCols =
        columns[yr] ||
        ({
          year: [],
          sem1: [],
          sem2: [],
        } as Record<ColumnType, Course[]>);

      const columnSummaries = (["year", "sem1", "sem2"] as ColumnType[]).map(
        (col) => {
          const coursesInCol = yearCols[col] ?? [];
          const totalCredits = coursesInCol.reduce(
            (sum, c) => sum + (c?.credits ?? 0),
            0
          );
          return {
            column: col,
            courses: coursesInCol.filter(Boolean) as Course[],
            totalCredits,
          };
        }
      );

      return {
        year: yr,
        columns: columnSummaries,
      };
    });

    return summaries;
  }, [columns, selectedProgramCode]);

  function SummaryTableAllYears({
    allSummary,
    programs,
    selectedProgramCode,
  }: {
    allSummary:
      | {
          year: Year;
          columns: {
            column: ColumnType;
            courses: Course[];
            totalCredits: number;
          }[];
        }[]
      | null;
    programs: Record<string, Program>;
    selectedProgramCode: string;
  }) {
    if (!allSummary) return null;
    const programTitle = programs[selectedProgramCode]?.title ?? "Program";

    return (
      <Card className="mt-6">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-baseline gap-2">
            <CardTitle className="m-0">
              Full Summary for {programTitle}
            </CardTitle>
            <Button
              size="sm"
              onClick={() => downloadCsv(allYearsSummary!, programTitle)}
            >
              Export CSV
            </Button>
          </div>
        </div>

        <CardContent className="overflow-x-auto">
          {allSummary.map(({ year, columns }) => (
            <div key={year} className="mb-6">
              <div className="font-bold text-lg mb-2">Year {year}</div>
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">Column</th>
                    <th className="border p-2 text-left">Course Code</th>
                    <th className="border p-2 text-left">Title</th>
                    <th className="border p-2 text-left">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map(({ column, courses, totalCredits }) => (
                    <React.Fragment key={`${year}-${column}`}>
                      {courses.map((course, idx) => (
                        <tr
                          key={`${year}-${column}-${course.code}-${idx}`}
                          className=""
                        >
                          <td className="border p-2 align-top">
                            {column === "year"
                              ? "Year-long"
                              : column === "sem1"
                              ? "Semester 1"
                              : "Semester 2"}
                          </td>
                          <td className="border p-2">{course.code}</td>
                          <td className="border p-2">{course.title}</td>
                          <td className="border p-2">{course.credits}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100">
                        <td className="border p-2 font-semibold">
                          {column === "year"
                            ? "Year-long total"
                            : column === "sem1"
                            ? "Semester 1 total"
                            : "Semester 2 total"}
                        </td>
                        <td className="border p-2" />
                        <td className="border p-2" />
                        <td className="border p-2 font-semibold">
                          {totalCredits}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Flatten the all-years summary into CSV rows
  function buildCsvRows(
    allSummary: {
      year: Year;
      columns: {
        column: ColumnType;
        courses: Course[];
        totalCredits: number;
      }[];
    }[]
  ) {
    const rows: string[][] = [];
    // Header
    rows.push(["Year", "Column", "Course Code", "Title", "Credits"]);

    allSummary.forEach(({ year, columns }) => {
      columns.forEach(({ column, courses }) => {
        courses.forEach((course) => {
          rows.push([
            String(year),
            column === "year"
              ? "Year-long"
              : column === "sem1"
              ? "Semester 1"
              : "Semester 2",
            course.code,
            course.title,
            String(course.credits),
          ]);
        });
        // subtotal row per column
        rows.push([
          String(year),
          column === "year"
            ? "Year-long total"
            : column === "sem1"
            ? "Semester 1 total"
            : "Semester 2 total",
          "",
          "",
          String(courses.reduce((sum, c) => sum + (c?.credits ?? 0), 0)),
        ]);
      });
    });

    return rows;
  }

  // Converts rows to a CSV blob and triggers download
  function downloadCsv(
    allSummary: {
      year: Year;
      columns: {
        column: ColumnType;
        courses: Course[];
        totalCredits: number;
      }[];
    }[],
    programTitle: string
  ) {
    const rows = buildCsvRows(allSummary);
    const csvContent = rows
      .map((r) =>
        r
          .map((cell) => {
            // escape quotes
            const escaped = String(cell).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const filename = `${programTitle
      .replace(/\s+/g, "_")
      .toLowerCase()}_summary_all_years.csv`;

    // create invisible link and click
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const renderColumn = (label: string | null, type: ColumnType) => {
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
            {label ? label + " –" : null} {currentCredits}/{requiredCredits}{" "}
            credits
          </CardTitle>
          <Button size="sm" onClick={() => setOpenDrawer(type)}>
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
                    </div>
                    <div>
                      {course.mandatory === "Optional" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            removeCourseFromColumn(course, type);
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

        <Drawer
          open={openDrawer === type}
          onOpenChange={() => setOpenDrawer(null)}
        >
          <DrawerContent className="max-h-[80vh] overflow-hidden flex flex-col">
            <DrawerHeader>
              <DrawerTitle>Select Course for {label}</DrawerTitle>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4">
              <ScrollArea className="h-full">
                <div className="space-y-2 pb-4">
                  {getFilteredCourses(type).map((course) => (
                    <Card
                      key={course.code}
                      className="p-2 cursor-pointer hover:bg-muted"
                      onClick={() =>
                        addCourseToColumn(course.level as Year, course, type)
                      }
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
      </Card>
    );
  };

  const renderColumnsMobile = () => {
    return (
      <>
        <select
          className="border rounded px-3 py-2 font-bold"
          value={selectedSemester}
          onChange={(e) =>
            setSelectedSemester(e.target.value as keyof typeof Semester)
          }
        >
          {Object.keys(Semester).map((key) => (
            <option key={key} value={key}>
              {Semester[key as keyof typeof Semester]}
            </option>
          ))}
        </select>
        {renderColumn(null, selectedSemester.toString() as ColumnType)}
      </>
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Course of Study</label>
            <select
              className="border rounded px-3 py-2"
              value={selectedProgramCode}
              onChange={(e) => setSelectedProgramCode(e.target.value)}
            >
              <option value="">Select Program</option>
              {Object.values(programs).map((prog) => (
                <option key={prog.program_id} value={prog.program_id}>
                  {prog.title}
                </option>
              ))}
              ))
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Year of Study</label>
            <select
              className="border rounded px-3 py-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value) as Year)}
            >
              <option value="">Select Year</option>
              {[1, 2, 3, 4].map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end"></div>
        </div>
      </div>
      {selectedProgramCode && selectedYear ? (
        <>
          <Button onClick={clearLocalStorageColumns}>
            <RefreshCwIcon /> Reset Choices
          </Button>
          <div className="hidden sm:flex flex-col sm:flex-row gap-4">
            {renderColumn("Year-Long", "year")}
            {renderColumn("Semester 1", "sem1")}
            {renderColumn("Semester 2", "sem2")}
          </div>
          <div className="flex flex-col sm:hidden gap-4">
            {renderColumnsMobile()}
          </div>

          <div className="hidden md:block">
            {selectedProgramCode && allYearsSummary && (
              <SummaryTableAllYears
                allSummary={allYearsSummary}
                programs={programs}
                selectedProgramCode={selectedProgramCode}
              />
            )}
          </div>
        </>
      ) : null}

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
            <Button
              variant="secondary"
              onClick={() => {
                if (!pendingCourse) return;
                if (pendingCourse && pendingColumn) {
                  updateColumns(selectedYear, pendingColumn, pendingCourse);
                }

                setPendingCourse(null);
                setMissingPrereqs([]);
                setPrereqDialogOpen(false);
                setOpenDrawer(null);
              }}
            >
              Add Course Only
            </Button>
            <Button onClick={handleAddWithPrereqs}>
              Add with Prerequisites
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
