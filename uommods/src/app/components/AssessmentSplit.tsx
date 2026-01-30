"use client"

import { courses } from "@/lib/courses";

export default function AssessmentSplit({ courseCode }: { courseCode: string }) {
    // 1. Find the course locally
    const currentCourse = courses.find(c => c.code?.toUpperCase() === courseCode?.toUpperCase());

    // 2. If no course or no assessment data, return null or a message
    if (!currentCourse || !currentCourse.assessment) {
        return <p className="text-muted-foreground italic">No assessment data available.</p>;
    }

    // 3. Convert the assessment object { "Exam": 80 } into an array for mapping
    const assessmentEntries = Object.entries(currentCourse.assessment);

    return (
        <div>
            <ul className="mt-2 space-y-2">
                {assessmentEntries.map(([name, percentage], idx) => (
                    <li key={`${name}-${idx}`} className="border p-2 rounded shadow flex justify-between">
                        <span className="font-semibold">{name}</span>
                        <span>{percentage}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}