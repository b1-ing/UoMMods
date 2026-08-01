import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Plus, RefreshCw, Search, X, AlertCircle } from "lucide-react";
import { usePlanner, Year } from "@/hooks/usePlanner";
import PlannerDialogs from "@/app/components/PlannerDialogs";
import { Course, Program } from "@/lib/types";

const SEMESTERS = ["Full year", "Semester 1", "Semester 2"] as const;
type Semester = (typeof SEMESTERS)[number];

const COLUMN_THEME: Record<Semester, { color: string; bg: string; label: string }> = {
    "Full year":   { color: "#6366f1", bg: "#6366f110", label: "Year-Long" },
    "Semester 1":  { color: "#0ea5e9", bg: "#0ea5e910", label: "Semester 1" },
    "Semester 2":  { color: "#8b5cf6", bg: "#8b5cf610", label: "Semester 2" },
};

const YEARLY_CREDIT_LIMIT = 120;

function getCreditTarget(program: Program | undefined, year: Year, type: Semester): number {
    if (!program) return 0;
    const colKey = type === "Full year" ? "year" : type === "Semester 1" ? "sem1" : "sem2";
    return (program[`y${year}${colKey}cred` as keyof Program] as number | undefined) ?? 0;
}

// ── Credit Ring ───────────────────────────────────────────────────────────────
function CreditRing({ current, target, color }: { current: number; target: number; color: string }) {
    const r = 24;
    const stroke = 5;
    const nr = r - stroke / 2;
    const circ = nr * 2 * Math.PI;
    const pct = target > 0 ? Math.min(current / target, 1) : 0;
    const offset = circ - pct * circ;
    const done = pct >= 1;

    return (
        <div className="relative flex-shrink-0">
            <svg width={r * 2} height={r * 2}>
                <circle cx={r} cy={r} r={nr} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                <circle
                    cx={r} cy={r} r={nr}
                    fill="none"
                    stroke={done ? "#22c55e" : color}
                    strokeWidth={stroke}
                    strokeDasharray={`${circ} ${circ}`}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${r} ${r})`}
                    style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1), stroke 0.4s" }}
                />
                <text x={r} y={r + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#334155">
                    {current}
                </text>
            </svg>
            {done && (
                <span className="absolute -top-0.5 -right-0.5 text-[9px] bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm">
                    ✓
                </span>
            )}
        </div>
    );
}

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({
                        course, type, onRemove, allColumns,
                    }: {
    course: Course; type: Semester; onRemove?: () => void;
    allColumns: Record<Year, Record<string, Course[]>>;
}) {
    const { color } = COLUMN_THEME[type];

    // Find missing prerequisite course codes across all years (1, 2, and 3)
    const missing = (course.prerequisites_list ?? []).filter(
        (code) => !([1, 2, 3] as Year[]).some((yr) =>
            Object.values(allColumns[yr] ?? {}).flat().some((c) => c?.code === code),
        ),
    );

    return (
        <Link href={`/route/${course.code}`}>
            <div className="group relative flex items-start gap-2 pl-4 pr-2 py-2.5 rounded-xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
                <div
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                    style={{ backgroundColor: course.mandatory ? color : `${color}55` }}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wide">{course.code}</span>
                        {course.mandatory && (
                            <span
                                className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: `${color}18`, color }}
                            >
                                Required
                            </span>
                        )}
                    </div>
                    <p className="text-[13px] font-semibold text-slate-700 leading-snug mt-0.5 truncate">
                        {course.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400 font-medium">{course.credits} credits</span>

                        {/* Render missing prerequisite course codes */}
                        {missing.length > 0 && (
                            <div
                                className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md font-medium"
                                title={`Missing prerequisites: ${missing.join(", ")}`}
                            >
                                <AlertCircle size={10} className="text-amber-500 flex-shrink-0" />
                                <span>Needs:</span>
                                <span className="font-mono font-bold text-amber-800">
                                    {missing.join(", ")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                {!course.mandatory && onRemove && (
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 flex-shrink-0 self-start mt-0.5"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>
        </Link>
    );
}

// ── Semester Column ───────────────────────────────────────────────────────────
function SemesterColumn({
                            type, year, columns, program, onAdd, onRemove,
                        }: {
    type: Semester; year: Year;
    columns: Record<Year, Record<string, Course[]>>;
    program: Program | undefined;
    onAdd: () => void;
    onRemove: (course: Course) => void;
}) {
    const { color, bg, label } = COLUMN_THEME[type];
    const courses = columns[year]?.[type] ?? [];
    const total = courses.reduce((s, c) => s + (c?.credits ?? 0), 0);
    const target = getCreditTarget(program, year, type);

    return (
        <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-200 flex-1 min-h-0 bg-slate-50/60">
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
                <CreditRing current={total} target={target} color={color} />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800">{label}</h3>
                    <p className="text-[11px] text-slate-400">
                        {total}{target > 0 ? ` / ${target}` : ""} credits · {courses.length} course{courses.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80 flex-shrink-0"
                    style={{ backgroundColor: bg, color }}
                >
                    <Plus size={13} /> Add
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {courses.length === 0 ? (
                    <button
                        onClick={onAdd}
                        className="w-full h-28 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-300 hover:border-slate-300 hover:text-slate-400 transition-colors"
                    >
                        <Plus size={20} />
                        <span className="text-xs font-medium">Add a course</span>
                    </button>
                ) : (
                    courses.map((course) =>
                        course ? (
                            <CourseCard
                                key={course.code}
                                course={course}
                                type={type}
                                onRemove={() => onRemove(course)}
                                allColumns={columns}
                            />
                        ) : null,
                    )
                )}
            </div>
        </div>
    );
}

// ── Course Search Panel ───────────────────────────────────────────────────────
function CourseSearchPanel({
                               open, onClose, targetSemester, courses, onSelect,
                           }: {
    open: boolean; onClose: () => void;
    targetSemester: Semester | null;
    courses: Course[];
    onSelect: (course: Course) => void;
}) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return courses.slice(0, 80);
        return courses
            .filter((c) => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q))
            .slice(0, 80);
    }, [courses, query]);

    const theme = targetSemester ? COLUMN_THEME[targetSemester] : null;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            <div
                className="flex-1 bg-black/20 backdrop-blur-[2px]"
                onClick={() => { onClose(); setQuery(""); }}
            />
            <div className="w-[380px] bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
                    <Search size={16} className="text-slate-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        autoFocus
                        placeholder="Search by code or title…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 text-sm outline-none text-slate-700 placeholder:text-slate-400"
                    />
                    {query ? (
                        <button onClick={() => setQuery("")} className="text-slate-300 hover:text-slate-500 transition-colors">
                            <X size={14} />
                        </button>
                    ) : (
                        <button onClick={() => { onClose(); setQuery(""); }} className="text-slate-300 hover:text-slate-500 transition-colors">
                            <X size={16} />
                        </button>
                    )}
                </div>

                {theme && targetSemester && (
                    <div className="px-4 py-2 border-b flex items-center justify-between" style={{ backgroundColor: theme.bg }}>
                        <p className="text-[11px] font-semibold" style={{ color: theme.color }}>
                            Adding to {theme.label}
                        </p>
                        <span className="text-[10px] text-slate-400 italic">Strictly showing {theme.label} courses</span>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-300">
                            <BookOpen size={32} strokeWidth={1.5} />
                            <p className="text-sm mt-2">No matching {targetSemester} courses</p>
                        </div>
                    ) : (
                        filtered.map((course) => (
                            <button
                                key={course.code}
                                onClick={() => { onSelect(course); setQuery(""); onClose(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-mono font-bold text-slate-500">{course.code}</span>
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">
                                            {course.credits}cr
                                        </span>
                                        {course.mandatory && (
                                            <span className="text-[9px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                                                Req
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[13px] text-slate-700 truncate leading-snug mt-0.5">{course.title}</p>
                                </div>
                                <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                            </button>
                        ))
                    )}
                </div>

                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <p className="text-[11px] text-slate-400">
                        {filtered.length} course{filtered.length !== 1 ? "s" : ""} · Click to add
                    </p>
                </div>
            </div>
        </div>
    );
}
// ── Year Selector + Progress Bar ──────────────────────────────────────────────
function YearStrip({
                       year, setYear, allYearsSummary,
                   }: {
    year: Year; setYear: (y: Year) => void;
    allYearsSummary: ReturnType<typeof usePlanner>["allYearsSummary"];
}) {
    return (
        <div className="flex items-center gap-2 bg-white border-b border-slate-200 px-6 py-2.5 flex-shrink-0 overflow-x-auto">
            {([1, 2, 3] as Year[]).map((y) => {
                const summary = allYearsSummary?.find((s) => s.year === y);
                const total = summary?.columns.reduce((s, c) => s + c.totalCredits, 0) ?? 0;

                // Cap progress percentage at 120 credits limit
                const pct = Math.min(total / YEARLY_CREDIT_LIMIT, 1);
                const active = y === year;
                const isOverLimit = total > YEARLY_CREDIT_LIMIT;

                return (
                    <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all flex-shrink-0 font-semibold ${
                            active ? "bg-slate-900 text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"
                        }`}
                    >
                        <span className="text-xs">Year {y}</span>
                        <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${pct * 100}%`,
                                    backgroundColor: isOverLimit ? "#ef4444" : active ? "#94a3b8" : total === YEARLY_CREDIT_LIMIT ? "#22c55e" : "#6366f1",
                                }}
                            />
                        </div>
                        <span className={`text-[11px] font-medium flex items-center gap-1 ${
                            isOverLimit ? "text-red-400 font-bold" : active ? "text-slate-300" : "text-slate-400"
                        }`}>
                            {total}/{YEARLY_CREDIT_LIMIT}cr
                            {isOverLimit && <AlertCircle size={12} className="text-red-400" />}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
// ── Root Component ────────────────────────────────────────────────────────────
export default function PlannerV2({ programs }: { programs: Record<string, Program> }) {
    const planner = usePlanner(programs);
    const {
        courses, columns, selectedYear, selectedProgramCode, allYearsSummary, isLoadingCourses,
        showDuplicateDialog, prereqDialogOpen, pendingCourse, missingPrereqs,
        setSelectedYear, setSelectedProgramCode, setShowDuplicateDialog, setPrereqDialogOpen,
        addCourseToColumn, removeCourseFromColumn, handleAddWithPrereqs, handleAddCourseOnly, clearAll,
    } = planner;

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTarget, setSearchTarget] = useState<Semester | null>(null);

    // Auto-select first program if nothing is stored
    const firstProgramId = Object.keys(programs)[0];
    useEffect(() => {
        if (!selectedProgramCode && firstProgramId) {
            setSelectedProgramCode(firstProgramId);
        }
    }, [selectedProgramCode, firstProgramId, setSelectedProgramCode]);

    const program = programs[selectedProgramCode];

    const openSearch = (sem: Semester) => {
        setSearchTarget(sem);
        setSearchOpen(true);
    };

    // Filter courses strictly by selected semester and year level
    const searchableCourses = useMemo(() => {
        if (!searchTarget) return [];

        const yearCols = columns[selectedYear] ?? {};
        const placed = new Set(SEMESTERS.flatMap((s) => (yearCols[s] ?? []).map((c) => c?.code)));

        return Object.values(courses).filter((c) => {
            const isNotPlaced = !placed.has(c.code);
            const isCorrectYear = c.level === selectedYear;

            // STRICT SEMESTER FILTERING REQUIREMENT
            const isCorrectSemester = (c.semester || "").toLowerCase() === searchTarget.toLowerCase();

            return isNotPlaced && isCorrectYear && isCorrectSemester;
        });
    }, [courses, columns, selectedYear, searchTarget]);

    const handleSelectCourse = (course: Course) => {
        if (!searchTarget) return;
        addCourseToColumn(selectedYear, course, searchTarget);
    };

    return (
        <div className="flex flex-col bg-slate-50" style={{ height: "calc(100vh - 56px)" }}>
            {/* Program selector bar */}
            <div className="flex items-center justify-between gap-4 px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    {Object.values(programs).map((p) => (
                        <button
                            key={p.program_id}
                            onClick={() => setSelectedProgramCode(p.program_id)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                                selectedProgramCode === p.program_id
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {p.program_id}
                            <span className={`ml-1.5 font-normal ${selectedProgramCode === p.program_id ? "opacity-50" : "text-slate-400"}`}>
                                {p.title.replace(/^(BSc|MEng|MSci)\s+/, "")}
                            </span>
                        </button>
                    ))}
                    {isLoadingCourses && (
                        <span className="text-[11px] text-slate-400 animate-pulse ml-1">Loading…</span>
                    )}
                </div>

                {selectedProgramCode && (
                    <button
                        onClick={clearAll}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                    >
                        <RefreshCw size={12} /> Reset
                    </button>
                )}
            </div>

            {/* Year strip */}
            <YearStrip
                year={selectedYear}
                setYear={setSelectedYear}
                allYearsSummary={allYearsSummary}
            />

            {/* Columns */}
            {selectedProgramCode ? (
                <div className="flex-1 flex gap-4 px-6 py-5 min-h-0">
                    {SEMESTERS.map((sem) => (
                        <SemesterColumn
                            key={sem}
                            type={sem}
                            year={selectedYear}
                            columns={columns}
                            program={program}
                            onAdd={() => openSearch(sem)}
                            onRemove={(course) => removeCourseFromColumn(course, sem)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-3">
                    <BookOpen size={52} strokeWidth={1.2} />
                    <p className="text-base font-medium text-slate-400">Select a program above to start planning</p>
                </div>
            )}

            {/* Search panel */}
            <CourseSearchPanel
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                targetSemester={searchTarget}
                courses={searchableCourses}
                onSelect={handleSelectCourse}
            />

            {/* Prereq / duplicate dialogs */}
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
}