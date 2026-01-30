"use client";

import React, { useEffect, useState } from "react";
import { Program, Course } from "@/lib/types";
import PlannerControls, { Year } from "@/app/components/PlannerControls";
import CourseColumn from "@/app/components/CourseColumn";
import CourseDrawer from "@/app/components/CourseDrawer";
import SummaryTable from "@/app/components/SummaryTable";
import PlannerDialogs from "@/app/components/PlannerDialogs";

// Custom hook for responsive behavior
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const defaultColumns = {
  1: {
    "Full year": [],
    "Semester 1": [],
    "Semester 2": [],
  },
  2: {
    "Full year": [],
    "Semester 1": [],
    "Semester 2": [],
  },
  3: {
    "Full year": [],
    "Semester 1": [],
    "Semester 2": [],
  },
};

type PlannerProps = {
  programs: Record<string, Program>;
};

const Planner = ({ programs }: PlannerProps) => {
  const isMobile = useIsMobile();
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [selectedSemester, setSelectedSemester] = useState<string>("Full year");
  const [selectedYear, setSelectedYear] = useState<Year>(1 as Year);
  const [selectedProgramCode, setSelectedProgramCode] = useState<string>("");
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const [missingPrereqs, setMissingPrereqs] = useState<Course[]>([]);
  const [prereqDialogOpen, setPrereqDialogOpen] = useState(false);
  const [pendingColumn, setPendingColumn] = useState<string>("Full year");
  const [isPreferencesFetched, setIsPreferencesFetched] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const [columns, setColumns] = useState<Record<Year, Record<string, Course[]>>>(defaultColumns);
  const [programSelections, setProgramSelections] = useState<Record<string, Record<Year, Record<string, Course[]>>>>({});
  const [previousProgramCode, setPreviousProgramCode] = useState<string>("");

  const resetColumns = () => {
    setColumns(JSON.parse(JSON.stringify(defaultColumns)));
  };

  const clearLocalStorageColumns = () => {
    localStorage.setItem("columns", JSON.stringify(defaultColumns));
    localStorage.setItem("programSelections", JSON.stringify({}));
    resetColumns();
    setProgramSelections({});
  };

  const fetchPreferences = async () => {
    const savedYear = localStorage.getItem("selectedYear");
    const savedProgramCode = localStorage.getItem("selectedProgramCode");
    const savedColumns = localStorage.getItem("columns");
    const savedProgramSelections = localStorage.getItem("programSelections");

    if (savedYear) {
      setSelectedYear(Number(savedYear) as Year);
    }
    if (savedProgramCode) {
      setSelectedProgramCode(savedProgramCode);
    }
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch (e) {
        console.error("Error parsing saved columns:", e);
      }
    }
    if (savedProgramSelections) {
      try {
        setProgramSelections(JSON.parse(savedProgramSelections));
      } catch (e) {
        console.error("Error parsing saved program selections:", e);
      }
    }
    setIsPreferencesFetched(true);
  };

  const handleAddWithPrereqs = () => {
    if (!pendingCourse || !pendingColumn) return;

    updateColumns(selectedYear, pendingColumn, pendingCourse);

    missingPrereqs.forEach((prereqCourse) => {
      if (!prereqCourse) return;

      // Decide which column based on its semester
      const semesters = prereqCourse.semester ?? [];

      let targetColumn: string | null = null;
      if (semesters.includes("Full year")) targetColumn = "Full year";
      else if (semesters.includes("Semester 1")) targetColumn = "Semester 1";
      else if (semesters.includes("Semester 2")) targetColumn = "Semester 2";

      if (targetColumn) {
        updateColumns(selectedYear, targetColumn, prereqCourse);
      }
    });

    setPendingCourse(null);
    setMissingPrereqs([]);
    setPrereqDialogOpen(false);
    setOpenDrawer(null);
  };

  const handleAddCourseOnly = () => {
    if (!pendingCourse || !pendingColumn) return;

    updateColumns(selectedYear, pendingColumn, pendingCourse);

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
      try {
        const response = await fetch(`/api/courses?programCode=${selectedProgramCode}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error fetching courses:", errorText);
          return;
        }
        const data: { course_code: string; courses: Course[] }[] = await response.json();
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
            } else if (courses && typeof courses === "object" && "code" in courses) {
              const singleCourse = courses as Course;
              courseMap[singleCourse.code] = {
                ...singleCourse,
                code: singleCourse.code,
              };
            }
          });
        }

        setCourses(courseMap);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    if (selectedProgramCode) {
      fetchCourses();
    }
  }, [selectedProgramCode]);

  // Handle program switching with state management
  useEffect(() => {
    if (!selectedProgramCode || !isPreferencesFetched) return;

    // Save current program's selections before switching
    if (previousProgramCode && previousProgramCode !== selectedProgramCode) {
      setProgramSelections(prev => ({
        ...prev,
        [previousProgramCode]: JSON.parse(JSON.stringify(columns))
      }));
    }

    // Load selections for the new program
    const savedSelections = programSelections[selectedProgramCode];
    if (savedSelections) {
      setColumns(JSON.parse(JSON.stringify(savedSelections)));
    } else {
      resetColumns();
    }

    setPreviousProgramCode(selectedProgramCode);
  }, [selectedProgramCode, isPreferencesFetched]);

  useEffect(() => {
    const storePreferences = async () => {
      localStorage.setItem("selectedYear", selectedYear.toString());
      localStorage.setItem("selectedProgramCode", selectedProgramCode.toString());
      localStorage.setItem("columns", JSON.stringify(columns));
      localStorage.setItem("programSelections", JSON.stringify(programSelections));
    };

    if (isPreferencesFetched) {
      storePreferences();
    }
  }, [selectedYear, selectedProgramCode, columns, programSelections, isPreferencesFetched]);

  // Update programSelections whenever columns change
  useEffect(() => {
    if (selectedProgramCode && isPreferencesFetched) {
      setProgramSelections(prev => ({
        ...prev,
        [selectedProgramCode]: JSON.parse(JSON.stringify(columns))
      }));
    }
  }, [columns, selectedProgramCode, isPreferencesFetched]);

  useEffect(() => {
    if (!selectedProgramCode || !selectedYear || !courses || Object.keys(courses).length === 0) return;

    // Only populate compulsory courses if nothing has been added yet for that year
    const yearCols = columns[selectedYear];
    const hasAny = (["Full year", "Semester 1", "Semester 2"] as string[]).some(
        (col) => yearCols[col]?.length > 0
    );
    const program = programs[selectedProgramCode];

    const toCourse = (code: string): Course | null => courses[code] ?? null;



    const safeMap = (arr: string[] | undefined) =>
        (arr || []).map(toCourse).filter((course): course is Course => course !== null);

    console.log((program.firstyrs2comp));

    if (hasAny) return;

    const addCompulsoryCourses = () => {

      if (!program || !selectedYear) return;

      const newColumns: Record<string, Course[]> = {
        "Full year": [],
        "Semester 1": [],
        "Semester 2": [],
      };



      switch (selectedYear) {
        case 1:
          newColumns["Full year"] = safeMap(program.firstyrfy);
          newColumns["Semester 1"] = safeMap(program.firstyrs1comp);
          newColumns["Semester 2"] = safeMap(program.firstyrs2comp);
          break;
        case 2:
          newColumns["Full year"] = safeMap(program.secondyrfy);
          newColumns["Semester 1"] = safeMap(program.secondyrs1comp);
          newColumns["Semester 2"] = safeMap(program.secondyrs2comp);
          break;
        case 3:
          newColumns["Full year"] = safeMap(program.thirdyrfy);
          newColumns["Semester 1"] = safeMap(program.thirdyrs1comp);
          newColumns["Semester 2"] = safeMap(program.thirdyrs2comp);
          break;
        default:
          return;
      }

      setColumns((prev) => ({
        ...prev,
        [selectedYear]: newColumns,
      }));
    };


    addCompulsoryCourses();
    console.log(columns)
  }, [selectedProgramCode, selectedYear, courses, programs]);

  const updateColumns = (year: Year, column: string, course: Course) => {
    setColumns((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [column]: [...prev[year][column], course]
      },
    }));
  };

  const addCourseToColumn = (year: Year, course: Course, column: string) => {
    if (courseExistsInColumns(year, course.code, columns)) {
      setOpenDrawer(null);
      setShowDuplicateDialog(true);
      return;
    }

    const prereqCodes = course.corequisites_list || [];

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

  const removeCourseFromColumn = (course: Course, column: string) => {
    setColumns((prev) => ({
      ...prev,
      [selectedYear]: {
        ...prev[selectedYear],
        [column]: prev[selectedYear][column].filter((c) => c.code !== course.code),
      },
    }));
    setOpenDrawer(null);
  };

  const getFilteredCourses = (type: string) => {
    if (!selectedProgramCode || !selectedYear) return [];

    const program = programs[selectedProgramCode];
    if (!program) return [];

    // Map year + semester to the relevant program property
    const optionalLists: Record<Year, Record<string, string[]>> = {
      1: {
        "Full year": [],
        "Semester 1": program.firstyrs1op || [],
        "Semester 2": program.firstyrs2op || [],
      },
      2: {
        "Full year": [],
        "Semester 1": program.secondyrs1op || [],
        "Semester 2": program.secondyrs2op || [],
      },
      3: {
        "Full year": [],
        "Semester 1": program.thirdyrs1op || [],
        "Semester 2": program.thirdyrs2op || [],
      },
    };

    const allowedCodes = optionalLists[selectedYear]?.[type] || [];

    // Debug logging
    console.log('getFilteredCourses called:', {
      type,
      selectedYear,
      allowedCodesCount: allowedCodes.length,
      allowedCodes: allowedCodes.slice(0, 5), // First 5 codes
    });

    // If no allowed codes for this semester, return empty
    if (allowedCodes.length === 0) return [];

    const filtered = Object.values(courses).filter((course) => {
      // Must be in the allowed codes list
      if (!allowedCodes.includes(course.code)) return false;

      // Must be the correct year level
      if (course.level !== selectedYear) return false;

      // Must be offered in the correct semester


    });

    console.log('Filtered courses:', filtered.length);

    return filtered;
  };

  function courseExistsInColumns(
      year: Year,
      code: string,
      columns: Record<Year, Record<string, Course[]>>
  ): boolean {
    return Object.values(columns[year]).some((column) =>
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
        column: string;
        courses: Course[];
        totalCredits: number;
      }[];
    };

    const summaries: YearSummary[] = ([1, 2, 3] as Year[]).map((yr) => {
      const yearCols = columns[yr] || {
        "Full year": [],
        "Semester 1": [],
        "Semester 2": [],
      };

      const columnSummaries = (["Full year", "Semester 1", "Semester 2"] as string[]).map(
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

  const handleOpenDrawer = (type: string) => {
    setOpenDrawer(type);
  };

  const handleSelectCourse = (course: Course, type: string) => {
    addCourseToColumn(course.level as Year, course, type);
  };

  const getDrawerLabel = (type: string) => {
    switch (type) {
      case "Full year":
        return "Full year";
      case "Semester 1":
        return "Semester 1";
      case "Semester 2":
        return "Semester 2";
      default:
        return null;
    }
  };

  const renderColumnsMobile = () => {
    return (
        <CourseColumn
            label={null}
            type={selectedSemester}
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
            isMobileView={isMobile}
        />

        {selectedProgramCode && selectedYear ? (
            <>
              <div className="hidden sm:flex flex-col sm:flex-row gap-4">
                <CourseColumn
                    label="Year-Long"
                    type="Full year"
                    selectedYear={selectedYear}
                    selectedProgramCode={selectedProgramCode}
                    programs={programs}
                    columns={columns}
                    onAddCourse={handleOpenDrawer}
                    onRemoveCourse={removeCourseFromColumn}
                />
                <CourseColumn
                    label="Semester 1"
                    type="Semester 1"
                    selectedYear={selectedYear}
                    selectedProgramCode={selectedProgramCode}
                    programs={programs}
                    columns={columns}
                    onAddCourse={handleOpenDrawer}
                    onRemoveCourse={removeCourseFromColumn}
                />
                <CourseColumn
                    label="Semester 2"
                    type="Semester 2"
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