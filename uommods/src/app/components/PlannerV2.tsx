import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Plus, RefreshCw, Search, X, AlertCircle, ShieldCheck, Lock, Unlock, Zap, Network } from "lucide-react";
import { usePlanner, Year } from "@/hooks/usePlanner";
import PlannerDialogs from "@/app/components/PlannerDialogs";
import ProgramDependencyGraph from "@/app/components/ProgramDependencyGraph";
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

// Helper: Get set of all completed course codes up to a given year
function getCompletedCourseCodes(columns: Record<Year, Record<string, Course[]>>, includeCurrentYear = false, targetYear: Year = 1): Set<string> {
    const codes = new Set<string>();
    ([1, 2, 3] as Year[]).forEach((yr) => {
        if (includeCurrentYear ? yr <= targetYear : yr < targetYear) {
            Object.values(columns[yr] ?? {}).flat().forEach((c) => {
                if (c?.code) codes.add(c.code);
            });
        }
    });
    return codes;
}

// ── Credit Ring ───────────────────────────────────────────────────────────────
function CreditRing({ current, target, color }: { current: number; target: number; color: string }) {
    const r = 22;
    const stroke = 4.5;
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
    const missing = (course.prerequisites_list ?? []).filter(
        (code) => !([1, 2, 3] as Year[]).some((yr) =>
            Object.values(allColumns[yr] ?? {}).flat().some((c) => c?.code === code),
        ),
    );

    return (
        <Link href={`/route/${course.code}`}>
            <div className="group relative flex items-start gap-2 pl-3.5 pr-2 py-2.5 rounded-xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
                <div
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                    style={{ backgroundColor: course.mandatory ? color : `${color}55` }}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
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
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-400 flex-shrink-0 self-start -mr-1 -mt-1"
                        aria-label="Remove course"
                    >
                        <X size={14} />
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
        <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-200 flex-1 min-h-0 bg-slate-50/60 w-full sm:w-auto">
            <div className="flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-white border-b border-slate-200 flex-shrink-0">
                <CreditRing current={total} target={target} color={color} />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800">{label}</h3>
                    <p className="text-[11px] text-slate-400">
                        {total}{target > 0 ? ` / ${target}` : ""} credits · {courses.length} course{courses.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1.5 rounded-lg transition-all active:scale-95 sm:hover:opacity-80 flex-shrink-0"
                    style={{ backgroundColor: bg, color }}
                >
                    <Plus size={13} /> Add
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2">
                {courses.length === 0 ? (
                    <button
                        onClick={onAdd}
                        className="w-full h-28 sm:h-32 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-300 hover:border-slate-300 hover:text-slate-400 transition-colors"
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
                               open, onClose, targetSemester, courses, columns, selectedYear, onSelect,
                           }: {
    open: boolean; onClose: () => void;
    targetSemester: Semester | null;
    courses: Course[];
    columns: Record<Year, Record<string, Course[]>>;
    selectedYear: Year;
    onSelect: (course: Course) => void;
}) {
    const [query, setQuery] = useState("");
    const [filterState, setFilterState] = useState<"all" | "unlocked" | "locked">("all");
    const inputRef = useRef<HTMLInputElement>(null);

    const completedCodes = useMemo(() => getCompletedCourseCodes(columns, false, selectedYear), [columns, selectedYear]);

    const processedCourses = useMemo(() => {
        return courses.map((c) => {
            const prereqs = c.prerequisites_list ?? [];
            const missing = prereqs.filter((code) => !completedCodes.has(code));
            return { course: c, isUnlocked: missing.length === 0, missingPrereqs: missing };
        });
    }, [courses, completedCodes]);

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        return processedCourses
            .filter(({ course, isUnlocked }) => {
                const matchesQuery = !q || course.code.toLowerCase().includes(q) || course.title.toLowerCase().includes(q);
                if (!matchesQuery) return false;
                if (filterState === "unlocked") return isUnlocked;
                if (filterState === "locked") return !isUnlocked;
                return true;
            })
            .sort((a, b) => (a.isUnlocked === b.isUnlocked ? 0 : a.isUnlocked ? -1 : 1))
            .slice(0, 80);
    }, [processedCourses, query, filterState]);

    const theme = targetSemester ? COLUMN_THEME[targetSemester] : null;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
                onClick={() => { onClose(); setQuery(""); }}
            />
            <div className="relative w-full sm:w-[420px] h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 z-10 animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
                    <Search size={16} className="text-slate-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        autoFocus
                        placeholder="Search code or title…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
                    />
                    {query ? (
                        <button onClick={() => setQuery("")} className="p-1 text-slate-300 hover:text-slate-500">
                            <X size={16} />
                        </button>
                    ) : (
                        <button onClick={() => { onClose(); setQuery(""); }} className="p-1 text-slate-300 hover:text-slate-500">
                            <X size={18} />
                        </button>
                    )}
                </div>

                {theme && targetSemester && (
                    <div className="px-4 py-2 border-b flex items-center justify-between gap-2 bg-slate-50">
                        <p className="text-[11px] font-semibold" style={{ color: theme.color }}>
                            Adding to {theme.label}
                        </p>
                        <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[10px] font-semibold">
                            <button
                                onClick={() => setFilterState("all")}
                                className={`px-2 py-0.5 rounded-md ${filterState === "all" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterState("unlocked")}
                                className={`px-2 py-0.5 rounded-md ${filterState === "unlocked" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"}`}
                            >
                                Unlocked
                            </button>
                            <button
                                onClick={() => setFilterState("locked")}
                                className={`px-2 py-0.5 rounded-md ${filterState === "locked" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500"}`}
                            >
                                Locked
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-300 px-4 text-center">
                            <BookOpen size={32} strokeWidth={1.5} />
                            <p className="text-sm mt-2">No matching {targetSemester} courses</p>
                        </div>
                    ) : (
                        filtered.map(({ course, isUnlocked, missingPrereqs }) => (
                            <button
                                key={course.code}
                                onClick={() => { onSelect(course); setQuery(""); onClose(); }}
                                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 text-left transition-colors group"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[11px] font-mono font-bold text-slate-500">{course.code}</span>
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">
                                            {course.credits}cr
                                        </span>

                                        {isUnlocked ? (
                                            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                <Unlock size={9} /> Ready
                                            </span>
                                        ) : (
                                            <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                <Lock size={9} /> Needs {missingPrereqs.join(", ")}
                                            </span>
                                        )}

                                        {course.mandatory && (
                                            <span className="text-[9px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                                                Req
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[13px] text-slate-700 truncate leading-snug mt-0.5">{course.title}</p>
                                </div>
                                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                            </button>
                        ))
                    )}
                </div>

                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <p className="text-[11px] text-slate-400">
                        {filtered.length} course{filtered.length !== 1 ? "s" : ""} · Tap to add
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Prerequisite Breakdown Drawer ─────────────────────────────────────────────
function PrereqStatusDrawer({
                                open, onClose, year, courses, columns, onSelectCourse,
                            }: {
    open: boolean; onClose: () => void;
    year: Year;
    courses: Record<string, Course>;
    columns: Record<Year, Record<string, Course[]>>;
    onSelectCourse: (course: Course) => void;
}) {
    if (!open) return null;

    const completedCodes = getCompletedCourseCodes(columns, false, year);
    const placedCodes = getCompletedCourseCodes(columns, true, year);

    const yearCourses = Object.values(courses).filter((c) => c.level === year && !placedCodes.has(c.code));

    const unlocked: Course[] = [];
    const locked: { course: Course; missing: string[] }[] = [];

    yearCourses.forEach((c) => {
        const prereqs = c.prerequisites_list ?? [];
        const missing = prereqs.filter((code) => !completedCodes.has(code));
        if (missing.length === 0) {
            unlocked.push(c);
        } else {
            locked.push({ course: c, missing });
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />
            <div className="relative w-full sm:w-[450px] h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 z-10 animate-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Zap size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">Year {year} Availability Breakdown</h2>
                            <p className="text-[11px] text-slate-400">Based on completed prerequisites</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-slate-500 rounded-lg">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Ready to Take ({unlocked.length})
                            </h3>
                        </div>
                        {unlocked.length === 0 ? (
                            <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">No unplaced modules unlocked for Year {year}.</p>
                        ) : (
                            <div className="space-y-2">
                                {unlocked.map((c) => (
                                    <div
                                        key={c.code}
                                        onClick={() => { onSelectCourse(c); onClose(); }}
                                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-all group"
                                    >
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-mono font-bold text-slate-500">{c.code}</span>
                                                <span className="text-[10px] font-medium text-slate-400">· {c.semester}</span>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-700 mt-0.5">{c.title}</p>
                                        </div>
                                        <Plus size={14} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Lock size={15} className="text-amber-500" />
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Locked ({locked.length})
                            </h3>
                        </div>
                        {locked.length === 0 ? (
                            <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">No locked modules found for Year {year}.</p>
                        ) : (
                            <div className="space-y-2">
                                {locked.map(({ course: c, missing }) => (
                                    <div
                                        key={c.code}
                                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold text-slate-500">{c.code}</span>
                                            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full font-semibold">
                                                Missing {missing.length}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{c.title}</p>
                                        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 flex-wrap">
                                            <span>Requires:</span>
                                            {missing.map((code) => (
                                                <span key={code} className="font-mono font-bold bg-white border border-slate-200 px-1 py-0.5 rounded text-amber-800">
                                                    {code}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Dependency Graph Container Modal ──────────────────────────────────────────
function ProgramGraphModal({
                               open, onClose, program,
                               //courses,
                               // selectedCodes,
                               //onSelectCourse,
                           }: {
    open: boolean; onClose: () => void;
    program?: Program;
    courses: Record<string, Course>;
    // selectedCodes: Set<string>;
    onSelectCourse: (course: Course) => void;

}) {
    if (!open || !program) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
                            <Network size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">{program.title} Dependency Graph</h2>
                            <p className="text-[11px] text-slate-400">Interactive curriculum prerequisite & dependency flow</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-slate-500 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body embedding ProgramDependencyGraph */}
                <div className="flex-1 overflow-hidden relative bg-slate-50">
                        <ProgramDependencyGraph
                            program_id={"G400"}
                        />
                </div>
            </div>
        </div>
    );
}

// ── Year Selector Strip ──────────────────────────────────────────────────────
function YearStrip({
                       year, setYear, allYearsSummary,
                   }: {
    year: Year; setYear: (y: Year) => void;
    allYearsSummary: ReturnType<typeof usePlanner>["allYearsSummary"];
}) {
    return (
        <div className="flex items-center gap-2 bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex-shrink-0 overflow-x-auto no-scrollbar">
            {([1, 2, 3] as Year[]).map((y) => {
                const summary = allYearsSummary?.find((s) => s.year === y);
                const total = summary?.columns.reduce((s, c) => s + c.totalCredits, 0) ?? 0;
                const pct = Math.min(total / YEARLY_CREDIT_LIMIT, 1);
                const active = y === year;
                const isOverLimit = total > YEARLY_CREDIT_LIMIT;

                return (
                    <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all flex-shrink-0 font-semibold ${
                            active ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 border border-slate-100 sm:border-none sm:bg-transparent text-slate-600"
                        }`}
                    >
                        <span className="text-xs whitespace-nowrap">Year {y}</span>
                        <div className="w-12 sm:w-16 h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${pct * 100}%`,
                                    backgroundColor: isOverLimit ? "#ef4444" : active ? "#94a3b8" : total === YEARLY_CREDIT_LIMIT ? "#22c55e" : "#6366f1",
                                }}
                            />
                        </div>
                        <span className={`text-[10px] sm:text-[11px] font-medium flex items-center gap-0.5 ${
                            isOverLimit ? "text-red-400 font-bold" : active ? "text-slate-300" : "text-slate-400"
                        }`}>
                            {total}cr
                            {isOverLimit && <AlertCircle size={11} className="text-red-400" />}
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
    const [statusDrawerOpen, setStatusDrawerOpen] = useState(false);
    const [graphModalOpen, setGraphModalOpen] = useState(false);
    const [searchTarget, setSearchTarget] = useState<Semester | null>(null);
    const [activeMobileTab, setActiveMobileTab] = useState<Semester>("Semester 1");

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

    const searchableCourses = useMemo(() => {
        if (!searchTarget) return [];

        const yearCols = columns[selectedYear] ?? {};
        const placed = new Set(SEMESTERS.flatMap((s) => (yearCols[s] ?? []).map((c) => c?.code)));

        return Object.values(courses).filter((c) => {
            const isNotPlaced = !placed.has(c.code);
            const isCorrectYear = c.level === selectedYear;
            const isCorrectSemester = (c.semester || "").toLowerCase() === searchTarget.toLowerCase();

            return isNotPlaced && isCorrectYear && isCorrectSemester;
        });
    }, [courses, columns, selectedYear, searchTarget]);

    const handleSelectCourse = (course: Course) => {
        if (!searchTarget) {
            const defaultSem = (course.semester as Semester) || "Semester 1";
            addCourseToColumn(selectedYear, course, defaultSem);
            return;
        }
        addCourseToColumn(selectedYear, course, searchTarget);
    };


    return (
        <div className="flex flex-col bg-slate-50 h-[calc(100dvh-56px)] overflow-hidden">
            {/* Program Selector Bar */}
            <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-2.5 bg-white border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1">
                    {Object.values(programs).map((p) => (
                        <button
                            key={p.program_id}
                            onClick={() => setSelectedProgramCode(p.program_id)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
                                selectedProgramCode === p.program_id
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {p.program_id}
                            <span className={`ml-1.5 font-normal hidden sm:inline ${selectedProgramCode === p.program_id ? "opacity-50" : "text-slate-400"}`}>
                                {p.title.replace(/^(BSc|MEng|MSci)\s+/, "")}
                            </span>
                        </button>
                    ))}
                    {isLoadingCourses && (
                        <span className="text-[11px] text-slate-400 animate-pulse ml-1 flex-shrink-0">Loading…</span>
                    )}
                </div>

                {selectedProgramCode && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Trigger for ProgramDependencyGraph Component */}
                        <button
                            onClick={() => setGraphModalOpen(true)}
                            className="flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                            <Network size={13} /> <span className="hidden sm:inline">🕸️ Graph</span>
                        </button>

                        {/* Strategy 1 Trigger Button */}
                        <button
                            onClick={() => setStatusDrawerOpen(true)}
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                            <Zap size={13} /> <span className="hidden sm:inline">⚡ Prereqs</span>
                        </button>

                        <button
                            onClick={clearAll}
                            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                            <RefreshCw size={12} /> <span className="hidden sm:inline">Reset</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Year Strip */}
            <YearStrip
                year={selectedYear}
                setYear={setSelectedYear}
                allYearsSummary={allYearsSummary}
            />

            {/* Mobile Semester Navigation Tabs */}
            {selectedProgramCode && (
                <div className="flex sm:hidden bg-slate-200/60 p-1 mx-4 mt-3 rounded-xl flex-shrink-0">
                    {SEMESTERS.map((sem) => {
                        const { color } = COLUMN_THEME[sem];
                        const active = activeMobileTab === sem;
                        const count = (columns[selectedYear]?.[sem] ?? []).length;

                        return (
                            <button
                                key={sem}
                                onClick={() => setActiveMobileTab(sem)}
                                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                    active ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                                }`}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                {sem === "Full year" ? "Year-Long" : sem}
                                {count > 0 && (
                                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${active ? "bg-slate-100 text-slate-600" : "bg-slate-300/50 text-slate-600"}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Columns Area */}
            {selectedProgramCode ? (
                <div className="flex-1 flex gap-4 px-4 sm:px-6 py-3 sm:py-5 min-h-0 overflow-hidden">
                    {/* Desktop Layout: Render all columns side-by-side */}
                    <div className="hidden sm:flex flex-1 gap-4 h-full">
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

                    {/* Mobile Layout: Render only active tab column */}
                    <div className="flex sm:hidden flex-1 h-full">
                        <SemesterColumn
                            type={activeMobileTab}
                            year={selectedYear}
                            columns={columns}
                            program={program}
                            onAdd={() => openSearch(activeMobileTab)}
                            onRemove={(course) => removeCourseFromColumn(course, activeMobileTab)}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-3 px-4 text-center">
                    <BookOpen size={44} strokeWidth={1.2} />
                    <p className="text-sm font-medium text-slate-400">Select a program above to start planning</p>
                </div>
            )}

            {/* Search Panel */}
            <CourseSearchPanel
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                targetSemester={searchTarget}
                courses={searchableCourses}
                columns={columns}
                selectedYear={selectedYear}
                onSelect={handleSelectCourse}
            />

            {/* Prereq Status Drawer */}
            <PrereqStatusDrawer
                open={statusDrawerOpen}
                onClose={() => setStatusDrawerOpen(false)}
                year={selectedYear}
                courses={courses}
                columns={columns}
                onSelectCourse={handleSelectCourse}
            />

            {/* Integrated Program Dependency Graph Modal */}
            <ProgramGraphModal
                open={graphModalOpen}
                onClose={() => setGraphModalOpen(false)}
                program={program}
                courses={courses}
                // selectedCourses={selectedCodes}
                onSelectCourse={handleSelectCourse}
            />

            {/* Prereq / Duplicate Dialogs */}
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