import { supabase } from "@/lib/supabase";
import { unstable_cache } from "next/cache";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const programCode = searchParams.get("programCode");
  if (!programCode) {
    return new Response("Bad request: no program code provided", {
      status: 400,
    });
  }
  const getCourses = unstable_cache(
    async (programCode: string) => {
      return await supabase
        .from("course_programs")
        .select(
          `
            course_code,
            courses (
            *)`
        )
        .eq("program_id", programCode);
    },
    [programCode]
  );
  const { data } = await getCourses(programCode);
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
