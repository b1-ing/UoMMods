"use client"

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Define the type
type AssessmentRow = {
    percentage: number;
    assessment_types: {
        name: string;
    };
};

// Setup Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AssessmentSplit({ courseCode }: { courseCode: string }) {
    const [assessments, setAssessments] = useState<AssessmentRow[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("course_assessments")
                .select(`
          percentage,
          assessment_types (
            name
          )
        `)
                .eq("course_code", courseCode);

            if (error) {
                console.error("Supabase error:", error);
                return;
            }

            if (!data || !Array.isArray(data)) {
                console.error("Data is not an array:", data);
                return;
            }

            // Normalize into AssessmentRow[]
            type RawAssessment = {
                percentage: number;
                assessment_types: { name: string } | { name: string }[];
            };

            type AssessmentRow = {
                percentage: number;
                assessment_types: { name: string };
            };

            const normalized: AssessmentRow[] = (data as RawAssessment[]).map((item) => {
                const at = Array.isArray(item.assessment_types)
                    ? item.assessment_types[0]?.name ?? "Unknown"
                    : item.assessment_types?.name ?? "Unknown";

                return {
                    percentage: item.percentage,
                    assessment_types: {
                        name: at,
                    },
                };
            });



            setAssessments(normalized);
        };

        fetchData();
    }, [courseCode]);

    return (
        <div>
            <h2 className="text-xl font-semibold">Assessment Breakdown</h2>
            <ul className="mt-2 space-y-2">
                {assessments.map((item, idx) => (
                    <li key={idx} className="border p-2 rounded shadow">
                        <strong>{item.assessment_types.name}</strong>: {item.percentage * 100}%
                    </li>
                ))}
            </ul>
        </div>
    );
}
