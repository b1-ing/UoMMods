"use client";

import React, { useEffect, useState } from "react";
import { Program } from "@/lib/programs";
import { Course } from "@/lib/mockcourses";
import { Semester } from "@/lib/semesters";
import PlannerControls, { Year } from "@/app/components/PlannerControls";
import CourseColumn, { ColumnType } from "@/app/components/CourseColumn";
import CourseDrawer from "@/app/components/CourseDrawer";
import SummaryTable from "@/app/components/SummaryTable";
import PlannerDialogs from "@/app/components/PlannerDialogs";

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
};

type PlannerProps = {
  programs: Record<string, Program>;
};

const Planner = ({ programs }: PlannerProps) => {
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [selectedSemester, setSelectedSemester] =
    useState<keyof typeof Semester>("sem1");
  const [selectedYear, setSelectedYear] = useState<Year>(Number("") as Year);
  const [selectedProgramCode, setSelectedProgramCode] = useState<string>("");
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const [missingPrereqs, setMissingPrereqs] = useState<Course[]>([]);
  const [prereqDialogOpen, setPrereqDialogOpen] = useState(false);
  const [pendingColumn, setPendingColumn] = useState<ColumnType>("year");
  const [isPreferencesFetched, setIsPreferencesFetched] =
    useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<ColumnType | null>(null);
  const [columns, setColumns] =
    useState<Record<Year, Record<ColumnType, Course[]>>>(defaultColumns);

  const resetColumns = () => {
    setColumns(defaultColumns);
  };

  const clearLocalStorageColumns = () => {
    localStorage.setItem("columns", JSON.stringify(defaultColumns));
    resetColumns();
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
    setIsPreferencesFetched(true);
  };

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

  const handleAddCourseOnly = () => {
    if (!pendingCourse) return;
    if (pendingCourse && pendingColumn) {
      updateColumns(selectedYear, pendingColumn, pendingCourse);
    }

    setPendingCourse(null);
    setMissingPrereqs([]);
    setPrereqDialogOpen(false);
    setOpenDrawer(null);
  };

  useEffect(() => {
    console.log("Fetching prefs");
    fetchPreferences();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      const response = await fetch(
        `/api/courses?programCode=${selectedProgramCode}`
      );
      if (!response.ok) {
        console.log("Error fetching courses: ", response.text);
      }
      const data: {
        course_code: string;
        courses: Course[];
      }[] = await response.json();
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
    if (!!selectedProgramCode) fetchCourses();
  }, [selectedProgramCode]);

  useEffect(() => {
    resetColumns();
  }, [selectedProgramCode]);

  useEffect(() => {
    const storePreferences = async () => {
      localStorage.setItem("selectedYear", selectedYear.toString());
      localStorage.setItem(
        "selectedProgramCode",
        selectedProgramCode.toString()
      );
      localStorage.setItem("columns", JSON.stringify(columns));
    };
    if (isPreferencesFetched) storePreferences();
  }, [selectedYear, selectedProgramCode, columns, isPreferencesFetched]);

  useEffect(() => {
    if (!selectedProgramCode || !selectedYear || !courses) return;

    // only populate compulsory courses if nothing has been added yet for that year
    const yearCols = columns[selectedYear];
    const hasAny = (["year", "sem1", "sem2"] as ColumnType[]).some(
      (col) => yearCols[col]?.length > 0
    );

    const addCompulsoryCourses = () => {
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
    };

    if (!hasAny) {
      addCompulsoryCourses();
    }
  }, [selectedProgramCode, selectedYear, courses, columns, programs]);

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
        year: [],
        sem1: program.firstyrs1op || [],
        sem2: program.firstyrs2op || [],
      },
      2: {
        year: [],
        sem1: program.secondyrs1op || [],
        sem2: program.secondyrs2op || [],
      },
      3: {
        year: [],
        sem1: program.thirdyrs1op || [],
        sem2: program.thirdyrs2op || [],
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

  function courseExistsInColumns(
      year: Year,
      code: string,
      columns: Record<Year, Record<ColumnType, Course[]>>
  ): boolean {
    return Object.values(columns[year]!).some((column) =>
        column.some((course) => course?.code === code)
    );
  }

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

    const summaries: YearSummary[] = ([1, 2, 3] as Year[]).map((yr) => {
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

  const handleOpenDrawer = (type: ColumnType) => {
    setOpenDrawer(type);
  };

  const handleSelectCourse = (course: Course, type: ColumnType) => {
    addCourseToColumn(course.level as Year, course, type);
  };

  const getDrawerLabel = (type: ColumnType) => {
    switch (type) {
      case "year":
        return "Year-Long";
      case "sem1":
        return "Semester 1";
      case "sem2":
        return "Semester 2";
      default:
        return null;
    }
  };

  const renderColumnsMobile = () => {
    return (
      <CourseColumn
        label={null}
        type={selectedSemester.toString() as ColumnType}
        selectedYear={selectedYear}
        selectedProgramCode={selectedProgramCode}
        programs={programs}
        columns={columns}
        onAddCourse={handleOpenDrawer}
        onRemoveCourse={removeCourseFromColumn}
      />
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">
      <PlannerControls
        programs={programs}
        selectedProgramCode={selectedProgramCode}
        setSelectedProgramCode={setSelectedProgramCode}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedSemester={selectedSemester}
        setSelectedSemester={setSelectedSemester}
        onResetChoices={clearLocalStorageColumns}
        isMobileView={true}
      />

      {selectedProgramCode && selectedYear ? (
        <>
          <div className="hidden sm:flex flex-col sm:flex-row gap-4">
            <CourseColumn
              label="Year-Long"
              type="year"
              selectedYear={selectedYear}
              selectedProgramCode={selectedProgramCode}
              programs={programs}
              columns={columns}
              onAddCourse={handleOpenDrawer}
              onRemoveCourse={removeCourseFromColumn}
            />
            <CourseColumn
              label="Semester 1"
              type="sem1"
              selectedYear={selectedYear}
              selectedProgramCode={selectedProgramCode}
              programs={programs}
              columns={columns}
              onAddCourse={handleOpenDrawer}
              onRemoveCourse={removeCourseFromColumn}
            />
            <CourseColumn
              label="Semester 2"
              type="sem2"
              selectedYear={selectedYear}
              selectedProgramCode={selectedProgramCode}
              programs={programs}
              columns={columns}
              onAddCourse={handleOpenDrawer}
              onRemoveCourse={removeCourseFromColumn}
            />
          </div>
          <div className="flex flex-col sm:hidden gap-4">
            {renderColumnsMobile()}
          </div>

          <div className="hidden md:block">
            {selectedProgramCode && allYearsSummary && (
              <SummaryTable
                allSummary={allYearsSummary}
                programs={programs}
                selectedProgramCode={selectedProgramCode}
              />
            )}
          </div>

          {openDrawer && (
            <CourseDrawer
              open={openDrawer !== null}
              onOpenChange={() => setOpenDrawer(null)}
              label={getDrawerLabel(openDrawer)}
              type={openDrawer}
              selectedYear={selectedYear}
              columns={columns}
              filteredCourses={getFilteredCourses(openDrawer)}
              onSelectCourse={handleSelectCourse}
            />
          )}
        </>
      ) : null}

      <PlannerDialogs
        showDuplicateDialog={showDuplicateDialog}
        setShowDuplicateDialog={setShowDuplicateDialog}
        prereqDialogOpen={prereqDialogOpen}
        setPrereqDialogOpen={setPrereqDialogOpen}
        pendingCourse={pendingCourse}
        missingPrereqs={missingPrereqs}
        onAddCourseOnly={handleAddCourseOnly}
        onAddWithPrereqs={handleAddWithPrereqs}
      />
    </div>
  );
};

export default Planner;