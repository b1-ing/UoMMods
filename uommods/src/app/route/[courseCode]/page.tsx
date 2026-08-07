"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, GraduationCap, Hash, AlertTriangle, Link2, Loader2 } from "lucide-react";
import CourseDependencyGraph from "@/app/components/CourseDependencyGraph";
import GradeChart from "@/app/components/GradeChart";
import HeaderBar from "@/app/components/HeaderBar";
import AssessmentSplit from "@/app/components/AssessmentSplit";
import RatingsSection from "@/app/components/RatingsSection";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";
import { Course, Program } from "@/lib/types";
import ProgramDependencyGraph from "@/app/components/ProgramDependencyGraph";

const SEMESTER_THEME: Record<string, { label: string; color: string; bg: string }> = {
    "Full year":  { label: "Full Year",   color: "#6366f1", bg: "#6366f115" },
    "Semester 1": { label: "Semester 1",  color: "#0ea5e9", bg: "#0ea5e915" },
    "Semester 2": { label: "Semester 2",  color: "#8b5cf6", bg: "#8b5cf615" },
};

function SemesterBadge({ semester }: { semester: string }) {
    const theme = SEMESTER_THEME[semester] ?? { label: semester, color: "#64748b", bg: "#64748b15" };
    return (
        <span
            className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ color: theme.color, backgroundColor: theme.bg }}
        >
            {theme.label}
        </span>
    );
}

function StatChip({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            <span className="text-slate-400">{icon}</span>
            {label}
        </div>
    );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">{title}</h3>
            {children}
        </div>
    );
}

// Helper to safely normalize Postgres array / CSV strings into string[]
function parseCourseList(raw: unknown): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
    if (typeof raw === "string") {
        return raw
            .replace(/[{}]/g, "")
            .split(",")
            .map((s) => s.trim().replace(/^"|"$/g, ""))
            .filter(Boolean);
    }
    return [];
}

function CourseChipList({ codes, emptyText }: { codes: string[] | unknown; emptyText: string }) {
    const parsedCodes = parseCourseList(codes);
    if (!parsedCodes.length) return <p className="text-[13px] text-slate-400 italic">{emptyText}</p>;

    return (
        <div className="flex flex-col gap-1.5">
            {parsedCodes.map((code) => (
                <Link
                    key={code}
                    href={`/route/${code}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all group"
                >
                    <div className="min-w-0">
                        <span className="text-[11px] font-mono font-bold text-slate-700">{code}</span>
                    </div>
                    <Link2 size={12} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0 ml-2" />
                </Link>
            ))}
        </div>
    );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h2>
            </div>
            <div className="px-6 py-5">{children}</div>
        </div>
    );
}

// function SummaryProCon({ summary }: { summary: { summary: string; take: string; donttake: string } }) {
//     return (
//         <SectionCard title="Overview">
//             <p className="text-sm text-slate-600 leading-relaxed">{summary.summary}</p>
//             <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div className="rounded-xl bg-green-50 border border-green-200 p-4">
//                     <p className="text-[11px] font-bold uppercase tracking-wider text-green-600 mb-1.5">Why take it</p>
//                     <p className="text-sm text-green-900 leading-relaxed">{summary.take}</p>
//                 </div>
//                 <div className="rounded-xl bg-red-50 border border-red-200 p-4">
//                     <p className="text-[11px] font-bold uppercase tracking-wider text-red-500 mb-1.5">Why not</p>
//                     <p className="text-sm text-red-900 leading-relaxed">{summary.donttake}</p>
//                 </div>
//             </div>
//         </SectionCard>
//     );
// }

interface CourseDetailPageProps {
    params: Promise<{ courseCode: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
    const resolvedParams = use(params);
    const code = (resolvedParams.courseCode || "").toUpperCase();

    const [course, setCourse] = useState<Course | null>(null);
    const [offeringPrograms, setOfferingPrograms] = useState<Program[]>([]);
    const [assessmentData, setAssessmentData] = useState<Record<string, number> | null>(null);
    const [loading, setLoading] = useState(true);

    // const summary = summaries.find((s) => s.code === code);

    useEffect(() => {
        async function fetchCourseData() {
            try {
                setLoading(true);

                // 1. Fetch target course from Supabase
                const { data: courseData, error: courseError } = await supabase
                    .from("courses")
                    .select("*")
                    .eq("code", code)
                    .maybeSingle();

                if (courseError) throw courseError;
                setCourse(courseData as Course);

                // 2. Fetch offering programs
                const { data: programData } = await supabase
                    .from("programs")
                    .select("*");

                let matchedPrograms: Program[] = [];
                if (programData) {
                    matchedPrograms = (programData as Program[]).filter((p) => {
                        const allCodes = [
                            ...(p.firstyrs1comp ?? []),
                            ...(p.firstyrs2comp ?? []),
                            ...(p.secondyrs1comp ?? []),
                            ...(p.secondyrs2comp ?? []),
                            ...(p.thirdyrs1comp ?? []),
                            ...(p.thirdyrs2comp ?? []),
                        ];
                        return allCodes.includes(code);
                    });
                    setOfferingPrograms(matchedPrograms);
                }

                // 3. Determine program assessment table (e.g., "g400_assessments")
                const primaryProgramId = matchedPrograms[0]?.program_id || courseData?.program_ids?.[0] || "g400";
                const tableName = `${primaryProgramId.toLowerCase().replace(/[^a-z0-9_]/g, "")}_assessments`;

                // 4. Fetch assessment breakdown from {program}_assessments table
                let { data: rawAssessment } = await supabase
                    .from(tableName)
                    .select("*")
                    .eq("code", code)
                    .maybeSingle();

                // Fallback check to generic table if primary program table fails
                if (!rawAssessment) {
                    const { data: fallbackAssessment } = await supabase
                        .from("courses_assessments")
                        .select("*")
                        .eq("code", code)
                        .maybeSingle();
                    rawAssessment = fallbackAssessment;
                }

                if (rawAssessment) {
                    setAssessmentData(rawAssessment);
                }
            } catch (err) {
                console.error("Error fetching course detail from Supabase:", err);
            } finally {
                setLoading(false);
            }
        }

        if (code) {
            fetchCourseData();
        }
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <HeaderBar />
                <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-3">
                    <Loader2 size={36} className="animate-spin text-indigo-600 mx-auto" />
                    <p className="text-sm font-medium text-slate-500">Loading course details...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-slate-50">
                <HeaderBar />
                <div className="max-w-3xl mx-auto px-6 py-16 text-center">
                    <BookOpen size={48} className="text-slate-300 mx-auto mb-4" strokeWidth={1.2} />
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Course not found</h1>
                    <p className="text-slate-500 mb-6">
                        No course matches the code <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{code}</code>.
                    </p>
                    <Link href="/course-list" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                        <ArrowLeft size={16} /> Back to Course List
                    </Link>
                </div>
            </div>
        );
    }

    const semTheme = SEMESTER_THEME[course.semester] ?? { color: "#64748b", bg: "#f1f5f9" };
    const prereqs = parseCourseList(course.prerequisites_list);
    const coreqs = parseCourseList(course.corequisites_list);
    const reqBy = parseCourseList(course.required_by);

    return (
        <div className="min-h-screen bg-slate-50">
            <HeaderBar />

            {/* Hero */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <Link
                        href="/course-list"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 mb-4 transition-colors"
                    >
                        <ArrowLeft size={14} /> Course List
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-mono font-bold text-slate-400 tracking-widest">{course.code}</span>
                                {course.semester && <SemesterBadge semester={course.semester} />}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{course.title}</h1>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <StatChip icon={<Hash size={13} />} label={`${course.credits ?? 0} credits`} />
                                <StatChip icon={<GraduationCap size={13} />} label={`Year ${course.level ?? "N/A"}`} />
                                <StatChip icon={<Calendar size={13} />} label={course.semester || "N/A"} />
                            </div>
                        </div>

                        {/* Colour accent ring */}
                        <div
                            className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black hidden sm:flex"
                            style={{ backgroundColor: semTheme.bg, color: semTheme.color }}
                        >
                            {course.level}
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ── Main column ──────────────────────────────────────────── */}
                    <div className="flex-1 min-w-0 space-y-6">

                        {/* AI summary */}


                        {/* Course aims */}
                        {course.description && (
                            <SectionCard title="Course Aims">
                                <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
                            </SectionCard>
                        )}

                        {/* Dynamic Assessment breakdown */}
                        <SectionCard title="Assessment">
                            <AssessmentSplit courseCode={course.code} assessmentData={assessmentData} />
                        </SectionCard>

                        {/* Grade history */}
                        {course.gradestats && course.gradestats.length > 0 && (
                            <SectionCard title="Historical Grade Statistics">
                                <GradeChart data={course.gradestats} overallMean={course.overallmean} />
                            </SectionCard>
                        )}

                        {/* Dependency graph */}
                        <SectionCard title="Course Dependencies">
                            <CourseDependencyGraph courseCode={course.code} />
                        </SectionCard>

                        <SectionCard title="Program Dependencies">
                            <ProgramDependencyGraph
                                program_id={offeringPrograms[0]?.program_id || course.program_ids?.[0] || "G400"}
                                selectedcourseid={course.code}
                            />
                        </SectionCard>

                        {/* Ratings */}
                        <SectionCard title="Student Ratings">
                            <RatingsSection courseCode={course.code} />
                        </SectionCard>
                    </div>

                    {/* ── Sidebar ──────────────────────────────────────────────── */}
                    <aside className="lg:w-72 flex-shrink-0 space-y-6">

                        {/* Study hours */}
                        {(course.scheduled_lectures || course.independent_independent_study) && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Study Hours</h3>
                                {[
                                    ["Lectures", course.scheduled_lectures],
                                    ["Tutorials", course.scheduled_tutorials],
                                    ["Practicals", course.scheduled_practical_classes__workshops],
                                    ["Independent study", course.independent_independent_study],
                                ]
                                    .filter(([, v]) => v)
                                    .map(([label, val]) => (
                                        <div key={label as string} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">{label as string}</span>
                                            <span className="font-semibold text-slate-800">{val}h</span>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Programs */}
                        {offeringPrograms.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                                <SidebarSection title="Offered In">
                                    <div className="flex flex-col gap-1.5">
                                        {offeringPrograms.map((p) => (
                                            <div key={p.program_id} className="flex items-center gap-2 text-sm">
                                                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                    {p.program_id}
                                                </span>
                                                <span className="text-slate-600 text-[12px] truncate">{p.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </SidebarSection>
                            </div>
                        )}

                        {/* Prerequisites */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
                            {prereqs.length > 0 && (
                                <SidebarSection title="Prerequisites">
                                    <CourseChipList codes={prereqs} emptyText="None" />
                                </SidebarSection>
                            )}
                            {coreqs.length > 0 && (
                                <SidebarSection title="Corequisites">
                                    <CourseChipList codes={coreqs} emptyText="None" />
                                </SidebarSection>
                            )}
                            {reqBy.length > 0 && (
                                <SidebarSection title="Required By">
                                    <CourseChipList codes={reqBy} emptyText="None" />
                                </SidebarSection>
                            )}
                            {!prereqs.length && !coreqs.length && !reqBy.length && (
                                <p className="text-[13px] text-slate-400 italic">No prerequisites or corequisites.</p>
                            )}
                        </div>

                        {/* Prereq notes */}
                        {course.prereqnotes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[13px] text-amber-800 leading-relaxed">{course.prereqnotes}</p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            <Toaster />
        </div>
    );
}