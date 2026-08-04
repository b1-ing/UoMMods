import { useEffect, useMemo, useState } from 'react';
import { Course, Program } from '@/lib/types';
import { fetchCoursesByProgram } from '@/lib/api';
import { courses as staticCourses } from '@/lib/courses';

// Helper: Safely parse database array representations into string arrays
function parseList(raw: unknown): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {
            // Fallback for Postgres array syntax e.g. "{COMP10120,COMP10220}" or comma-separated strings
            return raw
                .replace(/[{}]/g, '')
                .split(',')
                .map((s) => s.trim().replace(/^"|"$/g, ''))
                .filter(Boolean);
        }
    }
    return [];
}

function staticCourseMap(programCode: string): Record<string, Course> {
    const map: Record<string, Course> = {};
    for (const c of staticCourses) {
        if (c.program_ids?.includes(programCode)) map[c.code] = c;
    }
    return map;
}

export type Year = 1 | 2 | 3;

export type Columns = Record<Year, Record<string, Course[]>>;

// LocalStorage shape: Year -> Semester -> Array of stored course representations
type StoredCourse = { code: string; mandatory?: boolean };
type StoredColumns = Record<Year, Record<string, StoredCourse[]>>;

const SEMESTERS = ['Full year', 'Semester 1', 'Semester 2'] as const;

const emptyYear = (): Record<string, Course[]> => ({
    'Full year': [],
    'Semester 1': [],
    'Semester 2': [],
});

const defaultColumns = (): Columns => ({ 1: emptyYear(), 2: emptyYear(), 3: emptyYear() });

function loadJson<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function courseExistsInYear(year: Year, code: string, cols: Columns): boolean {
    return Object.values(cols[year] ?? {}).some((col) => col.some((c) => c?.code === code));
}

// Convert runtime columns state to code-only structure for localStorage
function serializeColumns(cols: Columns): StoredColumns {
    const result: StoredColumns = { 1: {}, 2: {}, 3: {} };
    ([1, 2, 3] as Year[]).forEach((yr) => {
        SEMESTERS.forEach((sem) => {
            result[yr][sem] = (cols[yr]?.[sem] ?? []).map((c) => ({
                code: c.code,
                mandatory: Boolean(c.mandatory),
            }));
        });
    });
    return result;
}

// Hydrate stored course codes with fresh course metadata from Supabase/static state
function hydrateColumns(
    stored: StoredColumns | null,
    coursesMap: Record<string, Course>
): Columns {
    const result = defaultColumns();
    if (!stored) return result;

    ([1, 2, 3] as Year[]).forEach((yr) => {
        SEMESTERS.forEach((sem) => {
            const list = stored[yr]?.[sem] ?? [];
            result[yr][sem] = list
                .map((item) => {
                    const found = coursesMap[item.code];
                    if (!found) return null;
                    return {
                        ...found,
                        credits: Number(found.credits) || 0, // Guarantees numeric credits
                        mandatory: item.mandatory ?? found.mandatory,
                    };
                })
                .filter(Boolean) as Course[];
        });
    });

    return result;
}

export interface PlannerState {
    courses: Record<string, Course>;
    isLoadingCourses: boolean;

    columns: Columns;
    selectedYear: Year;
    selectedProgramCode: string;
    selectedSemester: string;

    openDrawer: string | null;
    showDuplicateDialog: boolean;
    prereqDialogOpen: boolean;
    pendingCourse: Course | null;
    missingPrereqs: Course[];

    setSelectedYear: (y: Year) => void;
    setSelectedProgramCode: (code: string) => void;
    setSelectedSemester: (s: string) => void;
    setOpenDrawer: (drawer: string | null) => void;
    setShowDuplicateDialog: (v: boolean) => void;
    setPrereqDialogOpen: (v: boolean) => void;

    addCourseToColumn: (year: Year, course: Course, column: string) => void;
    removeCourseFromColumn: (course: Course, column: string) => void;
    handleAddWithPrereqs: () => void;
    handleAddCourseOnly: () => void;
    clearAll: () => void;

    getOptionalCourses: (semester: string) => Course[];
    allYearsSummary: YearSummary[] | null;
}

export interface YearSummary {
    year: Year;
    columns: { column: string; courses: Course[]; totalCredits: number }[];
}


function isMandatory(course: Course): boolean {
    return course.mandatory === "Mandatory";
}
function codes(
    courses: Course[],
    level: number,
    semester: (typeof SEMESTERS)[number],
    mandatory: boolean
): string[] {
    return courses
        .filter((course) => {
            return (
                Number(course.level) === level &&
                course.semester === semester &&
                isMandatory(course) === mandatory
            );
        })
        .map((course) => course.code)
        .sort();
}

export function buildProgramFromCourses(
    programId: string,
    courses: Course[]
): Program {
    return {
        program_id: programId,

        firstyrfy: codes(courses, 1, "Full year", true),
        firstyrs1comp: codes(courses, 1, "Semester 1", true),
        firstyrs2comp: codes(courses, 1, "Semester 2", true),

        secondyrfy: codes(courses, 2, "Full year", true),
        secondyrs1comp: codes(courses, 2, "Semester 1", true),
        secondyrs2comp: codes(courses, 2, "Semester 2", true),

        thirdyrfy: codes(courses, 3, "Full year", true),
        thirdyrs1comp: codes(courses, 3, "Semester 1", true),
        thirdyrs2comp: codes(courses, 3, "Semester 2", true),

        firstyrfyop: codes(courses, 1, "Full year", false),
        firstyrs1op: codes(courses, 1, "Semester 1", false),
        firstyrs2op: codes(courses, 1, "Semester 2", false),

        secondyrfyop: codes(courses, 2, "Full year", false),
        secondyrs1op: codes(courses, 2, "Semester 1", false),
        secondyrs2op: codes(courses, 2, "Semester 2", false),

        thirdyrfyop: codes(courses, 3, "Full year", false),
        thirdyrs1op: codes(courses, 3, "Semester 1", false),
        thirdyrs2op: codes(courses, 3, "Semester 2", false)
    } as unknown as Program;
}

export function usePlanner(programs: Record<string, Program>): PlannerState {
    const [ready, setReady] = useState(false);

    const [courses, setCourses] = useState<Record<string, Course>>({});
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);

    const [columns, setColumns] = useState<Columns>(defaultColumns);
    const [storedSelections, setStoredSelections] = useState<Record<string, StoredColumns>>({});
    const [currentProgram, setCurrentProgram] = useState<Program | null>(null);

    const [selectedYear, setSelectedYear] = useState<Year>(1);
    const [selectedProgramCode, setSelectedProgramCode] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('Full year');

    const [openDrawer, setOpenDrawer] = useState<string | null>(null);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [prereqDialogOpen, setPrereqDialogOpen] = useState(false);
    const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
    const [pendingColumn, setPendingColumn] = useState('Full year');
    const [missingPrereqs, setMissingPrereqs] = useState<Course[]>([]);

    // ── 1. Load preferences and stored selections on mount ───────────────────
    useEffect(() => {
        setSelectedYear((loadJson<number>('selectedYear', 1) as Year) || 1);
        setSelectedProgramCode(localStorage.getItem('selectedProgramCode') ?? '');
        setStoredSelections(loadJson<Record<string, StoredColumns>>('programSelections', {}));
        setReady(true);
    }, []);

    // ── 2. Persist basic state changes ────────────────────────────────────────
    useEffect(() => {
        if (!ready) return;
        localStorage.setItem('selectedYear', String(selectedYear));
        localStorage.setItem('selectedProgramCode', selectedProgramCode);
        localStorage.setItem('programSelections', JSON.stringify(storedSelections));
    }, [ready, selectedYear, selectedProgramCode, storedSelections]);

    // ── 3. Fetch fresh courses when program selection changes ────────────────
    useEffect(() => {
        if (!selectedProgramCode) return;
        setIsLoadingCourses(true);

        fetchCoursesByProgram(selectedProgramCode)
            .then((map) => {
                setCourses(map);

                const program = buildProgramFromCourses(
                    selectedProgramCode,
                    Object.values(map)
                );

                // instead of reading from props,
                // store this in local state
                setCurrentProgram(program);
            })
            .catch(() => {
                setCourses(staticCourseMap(selectedProgramCode));
            })
            .finally(() => setIsLoadingCourses(false));
    }, [selectedProgramCode]);

    // ── 4. Hydrate columns from stored course codes when courses/program ready
    useEffect(() => {
        if (!ready || !selectedProgramCode || Object.keys(courses).length === 0) return;

        const stored = storedSelections[selectedProgramCode];
        if (stored) {
            setColumns(hydrateColumns(stored, courses));
        } else {
            setColumns(defaultColumns());
        }
    }, [selectedProgramCode, courses, ready]);

    // ── 5. Auto-populate compulsory courses if columns are empty ─────────────
    useEffect(() => {
        if (!selectedProgramCode || !selectedYear || Object.keys(courses).length === 0) return;

        const program = currentProgram;
        if (!program) return;

        const resolve = (rawCodes: unknown): Course[] =>
            parseList(rawCodes)
                .map((c) => {
                    const found = courses[c];
                    if (!found) return null;
                    return {
                        ...found,
                        credits: Number(found.credits) || 0,
                        mandatory: "Mandatory",
                    };
                })
                .filter(Boolean) as Course[];
        const compulsory: Record<string, Course[]> = {
            'Full year': resolve(
                selectedYear === 1
                    ? program.firstyrfy
                    : selectedYear === 2
                        ? program.secondyrfy
                        : program.thirdyrfy,
            ),
            'Semester 1': resolve(
                selectedYear === 1
                    ? program.firstyrs1comp
                    : selectedYear === 2
                        ? program.secondyrs1comp
                        : program.thirdyrs1comp,
            ),
            'Semester 2': resolve(
                selectedYear === 1
                    ? program.firstyrs2comp
                    : selectedYear === 2
                        ? program.secondyrs2comp
                        : program.thirdyrs2comp,
            ),
        };

        setColumns((prev) => {
            const yearCols = prev[selectedYear];
            const alreadyHasEntries = SEMESTERS.some((s) => (yearCols?.[s]?.length ?? 0) > 0);

            if (alreadyHasEntries) return prev;

            const updated = { ...prev, [selectedYear]: compulsory };

            // Immediately sync updated compulsory columns to stored selections
            setStoredSelections((sPrev) => ({
                ...sPrev,
                [selectedProgramCode]: serializeColumns(updated),
            }));

            return updated;
        });
    }, [selectedProgramCode, selectedYear, courses, programs]);

    // ── Helper to mutate columns state and keep storedSelections in sync ─────
    const updateColumnsAndStore = (fn: (prev: Columns) => Columns) => {
        setColumns((prev) => {
            const next = fn(prev);
            if (selectedProgramCode) {
                setStoredSelections((sPrev) => ({
                    ...sPrev,
                    [selectedProgramCode]: serializeColumns(next),
                }));
            }
            return next;
        });
    };

    // ── Column mutations ──────────────────────────────────────────────────────
    const updateColumn = (year: Year, column: string, course: Course) => {
        updateColumnsAndStore((prev) => ({
            ...prev,
            [year]: { ...prev[year], [column]: [...(prev[year]?.[column] ?? []), course] },
        }));
    };

    const addCourseToColumn = (year: Year, course: Course, column: string) => {
        if (courseExistsInYear(year, course.code, columns)) {
            setOpenDrawer(null);
            setShowDuplicateDialog(true);
            return;
        }

        // Safely parse corequisites list before filtering
        const coreqs = parseList(course.corequisites_list);
        const missing = coreqs
            .filter((code) => !courseExistsInYear(year, code, columns))
            .map((code) => courses[code])
            .filter(Boolean) as Course[];

        if (missing.length > 0) {
            setPendingCourse(course);
            setPendingColumn(column);
            setMissingPrereqs(missing);
            setPrereqDialogOpen(true);
            return;
        }

        updateColumn(year, column, course);
        setOpenDrawer(null);
    };

    const removeCourseFromColumn = (course: Course, column: string) => {
        updateColumnsAndStore((prev) => ({
            ...prev,
            [selectedYear]: {
                ...prev[selectedYear],
                [column]: (prev[selectedYear]?.[column] ?? []).filter((c) => c.code !== course.code),
            },
        }));
        setOpenDrawer(null);
    };

    const handleAddWithPrereqs = () => {
        if (!pendingCourse || !pendingColumn) return;
        updateColumn(selectedYear, pendingColumn, pendingCourse);
        missingPrereqs.forEach((prereq) => {
            const target = prereq.semester?.includes('Full year')
                ? 'Full year'
                : prereq.semester?.includes('Semester 1')
                    ? 'Semester 1'
                    : prereq.semester?.includes('Semester 2')
                        ? 'Semester 2'
                        : null;
            if (target) updateColumn(selectedYear, target, prereq);
        });
        setPendingCourse(null);
        setMissingPrereqs([]);
        setPrereqDialogOpen(false);
        setOpenDrawer(null);
    };

    const handleAddCourseOnly = () => {
        if (!pendingCourse || !pendingColumn) return;
        updateColumn(selectedYear, pendingColumn, pendingCourse);
        setPendingCourse(null);
        setMissingPrereqs([]);
        setPrereqDialogOpen(false);
        setOpenDrawer(null);
    };

    const clearAll = () => {
        const empty = defaultColumns();
        setColumns(empty);
        setStoredSelections({});
        localStorage.removeItem('columns');
        localStorage.setItem('programSelections', JSON.stringify({}));
    };

    // ── Optional courses for the drawer ──────────────────────────────────────
    const getOptionalCourses = (semester: string): Course[] => {
        if (!selectedProgramCode || !selectedYear) return [];
        const program = currentProgram;
        if (!program) return [];

        const optMap: Record<Year, Record<string, unknown>> = {
            1: {
                'Semester 1': program.firstyrs1op,
                'Semester 2': program.firstyrs2op,
            },
            2: {
                'Semester 1': program.secondyrs1op ,
                'Semester 2': program.secondyrs2op ,
            },
            3: {
                'Semester 1': program.thirdyrs1op  ,
                'Semester 2': program.thirdyrs2op ,
            },
        };

        const rawAllowed = optMap[selectedYear]?.[semester];
        const allowed = new Set(parseList(rawAllowed));
        if (allowed.size === 0) return [];

        const yearCols = columns[selectedYear] ?? emptyYear();
        const alreadyAdded = new Set(
            SEMESTERS.flatMap((s) => (yearCols[s] ?? []).map((c) => c?.code)).filter(Boolean),
        );

        return Object.values(courses).filter(
            (c) =>
                allowed.has(c.code) &&
                Number(c.level) === Number(selectedYear) &&
                !alreadyAdded.has(c.code),
        );
    };

    // ── Summary for all years ─────────────────────────────────────────────────
    const allYearsSummary = useMemo<YearSummary[] | null>(() => {
        if (!selectedProgramCode) return null;
        return ([1, 2, 3] as Year[]).map((yr) => {
            const yearCols = columns[yr] ?? emptyYear();
            return {
                year: yr,
                columns: SEMESTERS.map((col) => {
                    const list = yearCols[col] ?? [];
                    return {
                        column: col,
                        courses: list.filter(Boolean),
                        totalCredits: list.reduce((s, c) => s + (Number(c?.credits) || 0), 0),
                    };
                }),
            };
        });
    }, [columns, selectedProgramCode]);

    return {
        courses,
        isLoadingCourses,
        columns,
        selectedYear,
        selectedProgramCode,
        selectedSemester,
        openDrawer,
        showDuplicateDialog,
        prereqDialogOpen,
        pendingCourse,
        missingPrereqs,
        setSelectedYear,
        setSelectedProgramCode,
        setSelectedSemester,
        setOpenDrawer,
        setShowDuplicateDialog,
        setPrereqDialogOpen,
        addCourseToColumn,
        removeCourseFromColumn,
        handleAddWithPrereqs,
        handleAddCourseOnly,
        clearAll,
        getOptionalCourses,
        allYearsSummary,
    };
}