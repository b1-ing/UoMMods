import dynamic from "next/dynamic";
import HeaderBar from "@/app/components/HeaderBar";
import Planner from "../components/Planner";
import { supabase } from "@/lib/supabase";
import { unstable_cache } from "next/cache";
import { Program } from "@/lib/programs";
import test from "node:test";

const getPrograms = unstable_cache(async () => {
  return await supabase.from("programs").select("*");
});


export default async function CoursePlanner() {
  const { data, error } = await getPrograms();
  if (error) {
    console.error("Error fetching programs:", error);
    return;
  }
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
