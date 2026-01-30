import HeaderBar from "@/app/components/HeaderBar";
import Planner from "../components/Planner";
import { Program } from "@/lib/types";
import {programs} from "@/lib/programs";



export default async function CoursePlanner() {
  const data = programs;
  const programMap: Record<string, Program> = {};
  data?.forEach((program: Program) => {
    programMap[program.program_id] = program;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-gray-800">
      <HeaderBar />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Course Planner</h1>
        <Planner programs={programMap} />
      </div>
    </div>
  );
}
