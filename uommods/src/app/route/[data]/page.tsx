

import { courses } from "@/lib/mockcourses";
import CourseDependencyGraph from "@/app/components/CourseDependencyGraph";

import WorkloadChart from "@/app/components/WorkloadChart"
import Component from "@/app/components/Comments"
import GradeChart from "@/app/components/GradeChart"
import HeaderBar from "@/app/components/HeaderBar";

import AssessmentSplit from "@/app/components/AssessmentSplit";





const Page = async({
                                       params,
                                   }: {
    params: Promise<{ data: string }>;

}) => {
    const resolvedParams = await params;
    const code = (resolvedParams.data as string)?.toUpperCase()
    const course = courses[code]





    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-gray-800">

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


                <WorkloadChart Lectures={course.Lectures} Placement={course.Placement}
                               Study={course.Study} Workshops={course.Workshops} Labs={course.Lab}/>
                <h2 className="text-xl font-semibold">Assessment weightage</h2>
                <AssessmentSplit exam={course.exam} coursework={course.coursework}/>
                <h2 className="text-xl font-semibold">Historical Grade Statistics</h2>
                <GradeChart data={course.gradestats} overallMean={course.overallmean}/>
                <h2 className="text-xl font-semibold">Course Dependency Graph</h2>
                <CourseDependencyGraph courseCode={course.code}/>
                <Component/>
            </div>
        </div>
    )


}


export default Page;