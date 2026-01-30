import CourseDependencyGraph from "@/app/components/CourseDependencyGraph";


import GradeChart from "@/app/components/GradeChart";
import HeaderBar from "@/app/components/HeaderBar";

import AssessmentSplit from "@/app/components/AssessmentSplit";
import RatingsSection from "@/app/components/RatingsSection";
import { Toaster } from "@/components/ui/sonner";
import {courses} from "@/lib/courses";
import ProgramTabs from "@/app/components/ProgramTabs";
import {summaries} from "@/lib/summaries";
const Page = async ({
  params,
}: {
  params: Promise<{ courseCode: string }>;
}) => {
  const { courseCode } = await params;
  const code = courseCode.toUpperCase();

  // 2. Find the course in your local array instead of using fetch()
  const course = courses.find((c) => c.code?.toUpperCase() === code);
  const summary = summaries.find((s) => s.code === code);
  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-gray-800">
        <HeaderBar />
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold">Course Not Found</h1>
          <p>
            We couldn’t find a course with the code <code>{code}</code>.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-gray-800">
      <header>
        <HeaderBar />
      </header>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">{course.code}</h1>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground">
          {course.credits} Units
        </p>
        <p>Offered in: {course.semester}</p>

        {summary && (
            <>
              <h2 className="text-xl font-semibold mt-4">Summary</h2>
              <p className="text-m text-muted-foreground mt-2">{summary.summary}</p>

              <h2 className="text-xl font-semibold mt-4">Why take this course?</h2>
              <p className="text-m text-muted-foreground mt-2">{summary.take}</p>

              <h2 className="text-xl font-semibold mt-4">Why not take this course?</h2>
              <p className="text-m text-muted-foreground mt-2">{summary.donttake}</p>
            </>
        )}

        {/*<WorkloadChart courseCode={course.code} />*/}
        <h2 className="text-xl font-semibold">Assessment weightage</h2>
        <AssessmentSplit courseCode={course.code} />
        {course.gradestats && (
          <h2 className="text-xl font-semibold">Historical Grade Statistics</h2>
        )}
        {course.gradestats && (
          <GradeChart
            data={course.gradestats}
            overallMean={course.overallmean}
          />
        )}

        <h2 className="text-xl font-semibold">Course Dependency Graph</h2>
        <CourseDependencyGraph courseCode={course.code} />

        <ProgramTabs initialProgramId="G400" selectedcourseid={course.code} />

        <RatingsSection courseCode={course.code} />
      </div>
      <Toaster />
    </div>
  );
};

export default Page;
