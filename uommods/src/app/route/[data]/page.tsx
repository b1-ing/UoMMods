"use client"
import { usePathname, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { courses } from "@/lib/mockcourses";
import CourseDependencyGraph from "@/app/components/CourseDependencyGraph";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import WorkloadChart from "@/app/components/WorkloadChart"
import Component from "@/app/components/Comments"
import GradeChart from "@/app/components/GradeChart"
import HeaderBar from "@/app/components/HeaderBar";
const gradeStats = [
    { year: '2022', mean: 68, stdDev: 5, n: 120 },
    { year: '2023', mean: 72, stdDev: 6, n: 130 }
];


export default function DynamicRoute() {
    const pathname = usePathname()
    const params = useParams()
    let code = (params.data as string)?.toUpperCase()
    let course = courses[code]





    return (
        <div className="w-full mx-auto p-6 space-y-6">
            <header>
                <HeaderBar />
            </header>
            <div className="max-w-6xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">{course.code}</h1>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">{course.faculty} - {course.units} Units</p>
            <p>Offered in: {course.semesters}</p>

            <h2 className="font-semibold text-lg">Description</h2>
            <p className="text-m text-muted-foreground mt-2">{course.description}</p>


            <WorkloadChart courseName={course.title} Lecture={course.lecture} Placement={course.placement}
                           Study={course.study} Workshops={course.workshops}/>
            <h2 className="text-xl font-semibold">Historical Grade Statistics</h2>
            <GradeChart data={gradeStats} />
            <h2 className="text-xl font-semibold">Course Dependency Graph</h2>
            <CourseDependencyGraph courseCode={course.code}/>
            <Component/>
            </div>
        </div>
    )
}