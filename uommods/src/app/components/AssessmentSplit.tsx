"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

// 1. Define a strict interface representing the pivoted view row structure
interface AssessmentRecord {
    code: string;
    exam: number;
    coursework: number;
    project: number;
    practical: number;
    presentation: number;
    other: number;
}

interface AssessmentSplitProps {
    courseCode: string;
    // 2. Swapped Record<string, any> for the explicit type or standard number mapping
    assessmentData?: AssessmentRecord | Record<string, number> | null;
}

export default function AssessmentSplit({ courseCode, assessmentData }: AssessmentSplitProps) {
    // 3. Typed the state cleanly using the precise database layout shape
    const [fetchedAssessment, setFetchedAssessment] = useState<AssessmentRecord | Record<string, number> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (assessmentData) {
            setFetchedAssessment(assessmentData);
            return;
        }

        async function fetchFromPivotedView() {
            if (!courseCode) return;
            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from("global_courses_assessments")
                    .select("*")
                    .eq("code", courseCode.toUpperCase())
                    .maybeSingle();

                if (error) throw error;
                if (data) {
                    setFetchedAssessment(data as AssessmentRecord);
                }
            } catch (err) {
                console.error("Failed to query global pivoted assessment view:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchFromPivotedView();
    }, [courseCode, assessmentData]);

    const assessmentEntries = useMemo(() => {
        if (!fetchedAssessment) return [];

        return Object.entries(fetchedAssessment).filter(([key, value]) => {
            // Safe filter out of structural string properties like 'code' or tracking IDs
            const internalKeys = ["id", "code", "program_id", "created_at", "updated_at"];
            return !internalKeys.includes(key) && typeof value === "number" && value > 0;
        });
    }, [fetchedAssessment]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span>Loading assessment split...</span>
            </div>
        );
    }

    if (assessmentEntries.length === 0) {
        return <p className="text-muted-foreground text-sm italic py-2">No assessment data available.</p>;
    }

    return (
        <div>
            <ul className="mt-2 space-y-2">
                {assessmentEntries.map(([name, percentage], idx) => {
                    const cleanName = name.charAt(0).toUpperCase() + name.slice(1);

                    return (
                        <li
                            key={`${name}-${idx}`}
                            className="border p-3 rounded-xl shadow-sm flex justify-between items-center bg-white border-slate-200 hover:border-slate-300 transition-all"
                        >
                            <span className="font-medium text-slate-700 text-sm">{cleanName}</span>
                            <span className="font-semibold text-indigo-600 text-sm">{percentage}%</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}