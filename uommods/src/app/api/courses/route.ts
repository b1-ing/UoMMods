import { supabase } from "@/lib/supabase";
import { revalidatePath, unstable_cache } from "next/cache";
import { NextRequest } from "next/server";

const DEBUG = false;

const queryCourseByCode = async (courseCode: string) => {
  if (DEBUG) {
    console.log("CACHE DEBUG:", "Supabase hit for course by code");
  }
  return await supabase
    .from("courses")
    .select("*")
    .eq("code", courseCode)
    .single();
};

const queryCourses = async (programCode: string) => {
  if (DEBUG) {
    console.log("CACHE DEBUG:", "Supabase hit for all courses");
  }
  return await supabase
    .from("course_programs")
    .select(
      `
            course_code,
            courses (
            *)`
    )
    .eq("program_id", programCode);
};
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const programCode = searchParams.get("programCode");
  const courseCode = searchParams.get("courseCode");
  if (!!courseCode) {
    const getCourseByCode = unstable_cache(queryCourseByCode, [courseCode]);
    const { data, error } = await getCourseByCode(courseCode);
    if (error) {
      return new Response(JSON.stringify(error), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!!programCode) {
    const getCourses = unstable_cache(queryCourses, [programCode]);
    const { data, error } = await getCourses(programCode);
    if (error) {
      return new Response(JSON.stringify(error), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Bad request: no program or course code provided", {
    status: 400,
  });
}

// When the database is updated, by the scraper for example, this invalidates
// the cache so clients get up-to-date information

export async function PUT() {
  revalidatePath("/api/courses");
  return new Response(
    JSON.stringify({ message: "Cache invalidated for all courses" }),
    { status: 200 }
  );
}
