import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const DEBUG = process.env.NODE_ENV === "development";

/* ---------------- QUERY HELPERS ---------------- */

const fetchCourseByCode = async (courseCode: string) => {
  const cleanCode = courseCode.trim().toUpperCase();
  if (DEBUG) {
    console.log("[DB] Fetching single course from 'courses':", cleanCode);
  }

  const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("code", cleanCode)
      .single();

  if (error) {
    // Throwing ensures unstable_cache does NOT store database errors
    throw new Error(`[Supabase Error]: ${error.message}`);
  }

  return data;
};

const fetchCoursesByProgram = async (programCode: string) => {
  const cleanCode = programCode.trim().toUpperCase();
  const tableName = `${cleanCode}_courses`;

  if (DEBUG) {
    console.log(`[DB] Fetching program courses from table: "${tableName}"`);
  }

  // 1. Try dedicated program table
  const { data: tableData, error: tableError } = await supabase
      .from(tableName)
      .select("*");

  if (!tableError && tableData && tableData.length > 0) {
    return tableData;
  }

  // 2. Fall back to master 'courses' table if dedicated table missing/empty
  const { data: generalData, error: generalError } = await supabase
      .from("courses")
      .select("*")
      .contains("program_id", [cleanCode]);

  if (generalError) {
    throw new Error(`[Supabase Fallback Error]: ${generalError.message}`);
  }

  return generalData ?? [];
};

/* ---------------- CACHED FUNCTIONS (TOP LEVEL) ---------------- */

// Declared at top level with static key identifiers + tags
// const getCachedCourseByCode = (code: string) =>
//     unstable_cache(
//         async () => fetchCourseByCode(code),
//         ["single-course-by-code", code.trim().toUpperCase()],
//         { tags: ["courses", `course-${code.trim().toUpperCase()}`] }
//     )();
//
// const getCachedCoursesByProgram = (programCode: string) =>
//     unstable_cache(
//         async () => fetchCoursesByProgram(programCode),
//         ["program-courses-by-code", programCode.trim().toUpperCase()],
//         { tags: ["courses", `program-${programCode.trim().toUpperCase()}`] }
//     )();

/* ---------------- ROUTE HANDLERS ---------------- */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const programCode = searchParams.get("programCode");
  const courseCode = searchParams.get("courseCode");

  try {
    // 1. Fetch Single Course Card Data
    if (courseCode) {
      const course = await fetchCourseByCode(courseCode);
      return NextResponse.json(course, { status: 200 });
    }

    // 2. Fetch All Courses for Program Flow
    if (programCode) {
      const courses = await fetchCoursesByProgram(programCode);
      return NextResponse.json(courses, { status: 200 });
    }

    return new Response("Bad request: no program or course code provided", {
      status: 400,
    });
  } catch (err: unknown) {
    console.error("[API /api/courses] Query Error:", err);
    return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to fetch course data" },
        { status: 500 }
    );
  }
}

export async function PUT() {
  // Properly purges all data cached via unstable_cache using tag 'courses'
  revalidateTag("courses");

  return NextResponse.json(
      { message: "Cache successfully invalidated for all courses" },
      { status: 200 }
  );
}