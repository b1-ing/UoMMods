
import Planner from "@/app/components/Planner"
import HeaderBar from "@/app/components/HeaderBar";
export default function CoursePlanner(){


    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-gray-800">
            <HeaderBar />
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Course Planner</h1>
            <p className="text-muted-foreground">
                Drag and drop your courses into semesters. Max 60 units per semester.
            </p>

            <Planner/>
        </div>
        </div>

    );
}