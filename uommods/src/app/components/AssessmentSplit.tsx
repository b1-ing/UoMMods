'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
    courseCode: string;
};

const ASSESSMENT_COLUMNS: Record<string, { type: "exam" | "coursework"; label: string }> = {
    assessment_written_exam: { type: "exam", label: "Written Exam" },
    assessment_assessment_task: { type: "coursework", label: "Assessment Task" },
    assessment_assignment_2000_words: { type: "coursework", label: "2000-word Assignment" },
    assessment_lectures: { type: "coursework", label: "Lectures" },
    assessment_oral_assessmentpresentation: { type: "coursework", label: "Oral Presentation" },
    assessment_practical_skills_assessment: { type: "coursework", label: "Practical Skills" },
    assessment_project_output_not_dissn: { type: "coursework", label: "Project Output" },
    assessment_set_exercise: { type: "coursework", label: "Set Exercise" },
    assessment_written_assignment_inc_essay: { type: "coursework", label: "Written Assignment" },
};

export default function AssessmentSplit({ courseCode }: Props) {
    const [exam, setExam] = useState(0);
    const [coursework, setCoursework] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("courses")
                .select("*")
                .eq("code", courseCode)
                .single();

            if (error || !data) {
                console.error("Failed to fetch assessment data", error);
                return;
            }

            let examTotal = 0;
            let courseworkTotal = 0;

            for (const column in ASSESSMENT_COLUMNS) {
                const value = Number(data[column]);
                if (!isNaN(value)) {
                    if (ASSESSMENT_COLUMNS[column].type === "exam") examTotal += value;
                    else courseworkTotal += value;
                }
            }

            setExam(examTotal);
            setCoursework(courseworkTotal);
        };

        fetchData();
    }, [courseCode]);

    const total = exam + coursework;
    if (total === 0) return <p>No assessment breakdown available.</p>;

    const examPercentage = (exam / total) * 100;
    const courseworkPercentage = (coursework / total) * 100;

    return (
        <div className="space-y-2">


            <div className="w-full h-6 rounded-full bg-muted overflow-hidden flex">
                <div
                    className="bg-blue-500 h-full text-xs text-white flex items-center justify-center"
                    style={{ width: `${examPercentage}%` }}
                >
                    {examPercentage >= 15 && `Exam ${examPercentage.toFixed(0)}%`}
                </div>
                <div
                    className="bg-emerald-500 h-full text-xs text-white flex items-center justify-center"
                    style={{ width: `${courseworkPercentage}%` }}
                >
                    {courseworkPercentage >= 15 && `Coursework ${courseworkPercentage.toFixed(0)}%`}
                </div>
            </div>
        </div>
    );
}
