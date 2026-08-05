"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HeaderBar from "@/app/components/HeaderBar";
import Fuse from "fuse.js";
import { supabase } from "@/lib/supabase"; // 👈 Ensure your Supabase client path is correct
import { Course } from "@/lib/types"; // 👈 Ensure your Course interface path is correct
import { Search, RotateCcw, BookOpen, Clock, Award, ArrowUpDown, Loader2 } from "lucide-react";

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"code" | "title" | "credits">("code");

  // 1. Fetch courses directly from Supabase table 'courses'
  useEffect(() => {
    async function fetchCoursesFromSupabase() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
            .from("courses")
            .select("*");

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setCourses(data as Course[]);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses from the database.");
      } finally {
        setLoading(false);
      }
    }

    fetchCoursesFromSupabase();
  }, []);

  // 2. Memoize Fuse instance based on fetched courses
  const fuse = useMemo(() => {
    return new Fuse(courses, {
      keys: ["title", "code", "description"],
      threshold: 0.35,
    });
  }, [courses]);

  // 3. Filter & Search Logic
  const filteredCourses = useMemo(() => {
    const searchResults =
        search.trim() === ""
            ? courses.map((course) => ({ item: course }))
            : fuse.search(search);

    return searchResults
        .filter(({ item: course }) => {
          const matchesYear =
              yearFilter === "all" ||
              course.level?.toString() === yearFilter;

          const matchesSemester =
              semesterFilter === "all" ||
              course.semester?.toLowerCase().includes(semesterFilter.toLowerCase());

          return matchesYear && matchesSemester;
        })
        .sort((a, b) => {
          if (sortBy === "code") {
            return a.item.code.localeCompare(b.item.code);
          }
          if (sortBy === "title") {
            return a.item.title.localeCompare(b.item.title);
          }
          if (sortBy === "credits") {
            return (Number(b.item.credits) || 0) - (Number(a.item.credits) || 0);
          }
          return 0;
        });
  }, [search, yearFilter, semesterFilter, sortBy, fuse, courses]);

  const hasActiveFilters = search !== "" || yearFilter !== "all" || semesterFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setYearFilter("all");
    setSemesterFilter("all");
    setSortBy("code");
  };

  return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
          <HeaderBar />
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Course Directory</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Explore available modules, prerequisites, and program requirements.
              </p>
            </div>
            <Badge variant="outline" className="w-fit text-xs px-3 py-1 font-medium rounded-full">
              Showing {filteredCourses.length} of {courses.length} Courses
            </Badge>
          </div>

          {/* Filter Toolbar */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-card">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                {/* Search Bar */}
                <div className="lg:col-span-5 space-y-1.5">
                  <Label htmlFor="search" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Search
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search"
                        placeholder="Search code or title (e.g., COMP11120)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-background"
                    />
                  </div>
                </div>

                {/* Year Filter */}
                <div className="lg:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Year Level
                  </Label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Semester Filter */}
                <div className="lg:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Semester
                  </Label>
                  <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Semesters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                      <SelectItem value="full">Full Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="lg:col-span-3 space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" /> Sort By
                  </Label>
                  <Select value={sortBy} onValueChange={(val: "code" | "title" | "credits") => setSortBy(val)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="code">Course Code</SelectItem>
                      <SelectItem value="title">Course Title</SelectItem>
                      <SelectItem value="credits">Credits (High to Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filter Clear Action */}
              {hasActiveFilters && (
                  <div className="pt-2 border-t flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Reset Filters
                    </Button>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Loading Spinner */}
          {loading ? (
              <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Loading courses from database...</p>
              </div>
          ) : error ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-red-200 dark:border-red-900/50 space-y-3">
                <p className="text-sm text-red-500 font-medium">{error}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
          ) : filteredCourses.length > 0 ? (
              /* Course Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map(({ item: course }) => (
                    <Link
                        key={course.code}
                        href={`/route/${course.code}`}
                        className="group block h-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl"
                    >
                      <Card className="h-full flex flex-col transition-all duration-200 border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-md group-hover:-translate-y-0.5">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-sm font-bold tracking-tight text-primary px-2 py-0.5 rounded bg-primary/10">
                        {course.code}
                      </span>
                            {course.level && (
                                <Badge variant="secondary" className="text-[11px] font-medium">
                                  Year {course.level}
                                </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base font-semibold leading-snug line-clamp-2 pt-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 pb-4 text-xs text-muted-foreground">
                          <p className="line-clamp-2 leading-relaxed">
                            {course.description || "No description provided for this course."}
                          </p>
                        </CardContent>

                        <CardFooter className="pt-3 border-t bg-slate-50/50 dark:bg-slate-900/40 text-xs text-muted-foreground flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>{course.semester || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Award className="h-3.5 w-3.5 text-amber-500" />
                            <span>{course.credits ?? 0} Credits</span>
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                ))}
              </div>
          ) : (
              /* Empty Search State */
              <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">No courses found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    We couldn&apos;t find any courses matching your current search query or filter settings.
                  </p>
                </div>
                {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                )}
              </div>
          )}
        </main>
      </div>
  );
}