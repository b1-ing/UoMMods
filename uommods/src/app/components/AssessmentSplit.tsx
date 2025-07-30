'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
    courseCode: string;
};


type AssessmentRowRaw = {
    percentage: number;
    assessment_types: { name: string }[]; // ← note: it's an array!
};


const COLORS = [
    "bg-blue-600",
    "bg-green-600",
    "bg-purple-600",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-orange-400",
];

export default function AssessmentSplit({ courseCode }: Props) {
    const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
    type AssessmentRow = {
        percentage: number;
        assessment_types: { name: string } | null;
    };


    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("course_assessments")
                .select("percentage, assessment_types(name)")
                .eq("course_code", courseCode);

            if (error || !data) {
                console.error("Failed to fetch assessment data", error);
                return;
            }

            console.log(data[0].assessment_types.name)

            // Normalize: use first item in array or null
            const normalized = data.map((item: AssessmentRowRaw): AssessmentRow => ({
                percentage: item.percentage,
                assessment_types: item.assessment_types.name ?? null
            }));

            setAssessments(normalized);
        };

        fetchData();
    }, [courseCode]);

    if (assessments.length === 0) {
        return <p>No assessment breakdown available.</p>;
    }

    return (
        <div className="space-y-1 w-full max-w-xl mx-auto">
            {/* Labels row */}
            <div className="flex justify-start gap-1 px-1">
                {assessments.map((item, idx) => {
                    const color = COLORS[idx % COLORS.length];
                    console.log(item.assessment_types)
                    const typeName = item.assessment_types?.name ?? "Unknown";

                    return (
                        <div
                            key={idx}
                            style={{ width: `${item.percentage * 100}%` }}
                            className="text-xs font-semibold text-center truncate"
                        >
            <span className={`text-gray-700 ${color.replace('bg-', 'text-')}`}>
                {typeName}: {item.percentage * 100}%
            </span>
                        </div>
                    );
                })}

            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-8 flex overflow-hidden relative">
                {assessments.map((item, idx) => {
                    const color = COLORS[idx % COLORS.length];
                    const showLabel = item.percentage > 0.07; // display only if > 7%
                    const label = item.assessment_types?.name

                    return (
                        <div
                            key={idx}
                            className={`${color} h-full relative flex items-center justify-center text-white text-xs font-semibold whitespace-nowrap
                                transition-transform duration-200 ease-in-out hover:brightness-110 hover:scale-105 cursor-pointer`}
                            style={{ width: `${item.percentage * 100}%` }}
                            title={`${label}: ${item.percentage * 100}%`}
                        >
                            {showLabel && (
                                <span className="pointer-events-none select-none">
                                    {item.percentage * 100}%
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
