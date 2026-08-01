import { useEffect, useMemo, useState } from 'react';
import { Course, Program } from '@/lib/types';
import { fetchCoursesByProgram } from '@/lib/api';
import { courses as staticCourses } from '@/lib/courses';

function staticCourseMap(programCode: string): Record<string, Course> {
    const map: Record<string, Course> = {};
    for (const c of staticCourses) {
        if (c.program_ids?.includes(programCode)) map[c.code] = c;
    }
    return map;
}

export type Year = 1 | 2 | 3;

type Columns = Record<Year, Record<string, Course[]>>;

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
    return Object.values(cols[year]).some((col) => col.some((c) => c?.code === code));
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

export function usePlanner(programs: Record<string, Program>): PlannerState {
    const [ready, setReady] = useState(false);

    const [courses, setCourses] = useState<Record<string, Course>>({});
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);

    const [columns, setColumns] = useState<Columns>(defaultColumns);
    const [programSelections, setProgramSelections] = useState<Record<string, Columns>>({});
    const [prevProgramCode, setPrevProgramCode] = useState('');

    const [selectedYear, setSelectedYear] = useState<Year>(1);
    const [selectedProgramCode, setSelectedProgramCode] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('Full year');

    const [openDrawer, setOpenDrawer] = useState<string | null>(null);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [prereqDialogOpen, setPrereqDialogOpen] = useState(false);
    const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
    const [pendingColumn, setPendingColumn] = useState('Full year');
    const [missingPrereqs, setMissingPrereqs] = useState<Course[]>([]);

    // ── Restore preferences from localStorage on mount ──────────────────────
    useEffect(() => {
        setSelectedYear((loadJson<number>('selectedYear', 1) as Year) || 1);
        setSelectedProgramCode(localStorage.getItem('selectedProgramCode') ?? '');
        setColumns(loadJson<Columns>('columns', defaultColumns()));
        setProgramSelections(loadJson('programSelections', {}));
        setReady(true);
    }, []);

    // ── Persist preferences whenever they change ─────────────────────────────
    useEffect(() => {
        if (!ready) return;
        localStorage.setItem('selectedYear', String(selectedYear));
        localStorage.setItem('selectedProgramCode', selectedProgramCode);
        localStorage.setItem('columns', JSON.stringify(columns));
        localStorage.setItem('programSelections', JSON.stringify(programSelections));
    }, [ready, selectedYear, selectedProgramCode, columns, programSelections]);

    // ── Keep programSelections in sync when columns change ───────────────────
    useEffect(() => {
        if (!ready || !selectedProgramCode) return;
        setProgramSelections((prev) => ({
            ...prev,
            [selectedProgramCode]: JSON.parse(JSON.stringify(columns)),
        }));
    }, [columns, selectedProgramCode, ready]);

    // ── Fetch courses whenever the selected program changes ───────────────────
    useEffect(() => {
        if (!selectedProgramCode) return;
        setIsLoadingCourses(true);
        fetchCoursesByProgram(selectedProgramCode)
            .then((map) => {
                // Fall back to bundled static data if DB hasn't been populated yet
                if (Object.keys(map).length === 0) {
                    setCourses(staticCourseMap(selectedProgramCode));
                } else {
                    setCourses(map);
                }
            })
            .catch(() => {
                // API unavailable — use static data so the planner still works
                setCourses(staticCourseMap(selectedProgramCode));
            })
            .finally(() => setIsLoadingCourses(false));
    }, [selectedProgramCode]);

    // ── Handle program switching: save/restore per-program column state ───────
    useEffect(() => {
        if (!ready || !selectedProgramCode) return;

        if (prevProgramCode && prevProgramCode !== selectedProgramCode) {
            setProgramSelections((prev) => ({
                ...prev,
                [prevProgramCode]: columns,
            }));
        }

        const saved = programSelections[selectedProgramCode];
        if (saved) {
            setColumns(saved);
        } else {
            setColumns(defaultColumns());
        }
        setPrevProgramCode(selectedProgramCode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProgramCode, ready]);

    // ── Auto-populate compulsory units when program/year/courses first load ───
    useEffect(() => {
        if (!selectedProgramCode || !selectedYear || Object.keys(courses).length === 0) return;

        const program = programs[selectedProgramCode];
        if (!program) return;

        const resolve = (codes: string[] | undefined): Course[] =>
            (codes ?? [])
                .map((c) => (courses[c] ? { ...courses[c], mandatory: true } : null))
                .filter(Boolean) as Course[];

        const compulsory: Record<string, Course[]> = {
            'Full year': resolve(
                selectedYear === 1 ? program.firstyrfy
                    : selectedYear === 2 ? program.secondyrfy
                        : program.thirdyrfy,
            ),
            'Semester 1': resolve(
                selectedYear === 1 ? program.firstyrs1comp
                    : selectedYear === 2 ? program.secondyrs1comp
                        : program.thirdyrs1comp,
            ),
            'Semester 2': resolve(
                selectedYear === 1 ? program.firstyrs2comp
                    : selectedYear === 2 ? program.secondyrs2comp
                        : program.thirdyrs2comp,
            ),
        };

        setColumns((prev) => {
            const yearCols = prev[selectedYear];
            const alreadyHasEntries = SEMESTERS.some((s) => yearCols?.[s]?.length > 0);

            // If columns already have courses, return unchanged state
            if (alreadyHasEntries) return prev;

            return { ...prev, [selectedYear]: compulsory };
        });
    }, [selectedProgramCode, selectedYear, courses, programs]);

    // ── Column mutations ──────────────────────────────────────────────────────
    const updateColumn = (year: Year, column: string, course: Course) => {
        setColumns((prev) => ({
            ...prev,
            [year]: { ...prev[year], [column]: [...prev[year][column], course] },
        }));
    };

    const addCourseToColumn = (year: Year, course: Course, column: string) => {
        if (courseExistsInYear(year, course.code, columns)) {
            setOpenDrawer(null);
            setShowDuplicateDialog(true);
            return;
        }

        const missing = (course.corequisites_list ?? [])
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
        setColumns((prev) => ({
            ...prev,
            [selectedYear]: {
                ...prev[selectedYear],
                [column]: prev[selectedYear][column].filter((c) => c.code !== course.code),
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
        setProgramSelections({});
        localStorage.setItem('columns', JSON.stringify(empty));
        localStorage.setItem('programSelections', JSON.stringify({}));
    };

    // ── Optional courses for the drawer ──────────────────────────────────────
    const getOptionalCourses = (semester: string): Course[] => {
        if (!selectedProgramCode || !selectedYear) return [];
        const program = programs[selectedProgramCode];
        if (!program) return [];

        const optMap: Record<Year, Record<string, string[]>> = {
            1: { 'Full year': [], 'Semester 1': program.firstyrs1op ?? [], 'Semester 2': program.firstyrs2op ?? [] },
            2: { 'Full year': [], 'Semester 1': program.secondyrs1op ?? [], 'Semester 2': program.secondyrs2op ?? [] },
            3: { 'Full year': [], 'Semester 1': program.thirdyrs1op ?? [], 'Semester 2': program.thirdyrs2op ?? [] },
        };

        const allowed = new Set(optMap[selectedYear]?.[semester] ?? []);
        if (allowed.size === 0) return [];

        const yearCols = columns[selectedYear] ?? emptyYear();
        const alreadyAdded = new Set(
            SEMESTERS.flatMap((s) => (yearCols[s] ?? []).map((c) => c.code)),
        );

        return Object.values(courses).filter(
            (c) => allowed.has(c.code) && c.level === selectedYear && !alreadyAdded.has(c.code),
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
                        totalCredits: list.reduce((s, c) => s + (c?.credits ?? 0), 0),
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
