
import { supabase } from '@/lib/supabase'
import CourseDependencyGraph from "@/app/components/CourseDependencyGraph";

import WorkloadChart from "@/app/components/WorkloadChart"
import GradeChart from "@/app/components/GradeChart"
import HeaderBar from "@/app/components/HeaderBar";

import AssessmentSplit from "@/app/components/AssessmentSplit";
import RatingsSection from "@/app/components/RatingsSection";
import {Toaster} from "@/components/ui/sonner";
import ProgramTabs from "@/app/components/ProgramTabs";




const Page = async({
                                       params,
                                   }: {
    params: Promise<{ data: string }>;

}) => {

    const resolvedParams = await params;
    const code = (resolvedParams.data as string)?.toUpperCase()
    const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('code', code)
        .single()




    if (error || !course) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-gray-800">
                <HeaderBar />
                <div className="max-w-4xl mx-auto p-6">
                    <h1 className="text-2xl font-bold">Course Not Found</h1>
                    <p>We couldn’t find a course with the code <code>{code}</code>.</p>
                </div>
            </div>
        )
    }






    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-gray-800">

            <header>
                <HeaderBar />
            </header>
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <h1 className="text-3xl font-bold">{course.code}</h1>
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <p className="text-muted-foreground">{course.faculty} - {course.credits} Units</p>
                <p>Offered in: {course.semesters}</p>

                <h2 className="font-semibold text-lg">Description</h2>
                <p className="text-m text-muted-foreground mt-2">{course.description}</p>


                <WorkloadChart courseCode={code}/>
                <h2 className="text-xl font-semibold">Assessment weightage</h2>
                <AssessmentSplit courseCode={code}/>
                {course.gradestats && (<h2 className="text-xl font-semibold">Historical Grade Statistics</h2>)}
                {course.gradestats && (
                    <GradeChart data={course.gradestats} overallMean={course.overallmean}/>)}

                <h2 className="text-xl font-semibold">Course Dependency Graph</h2>
                <CourseDependencyGraph courseCode={course.code} />

                    <ProgramTabs initialProgramId="G400" selectedcourseid={course.code}/>


                <RatingsSection courseCode={course.code} />
            </div>
            <Toaster />
        </div>
    )


}


export default Page;