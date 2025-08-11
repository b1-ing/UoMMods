"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HeaderBar from "@/app/components/HeaderBar";
import { supabase } from "@/lib/supabase";
import { Course } from "@/lib/mockcourses";
import Fuse from "fuse.js";

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from("courses").select("*");
      if (data) setCourses(data);
    };

    fetchCourses();
  }, []);

  const fuse = new Fuse(courses, {
    keys: ["title", "code"],
    threshold: 0.5,
  });
  const result =
    search.trim() === ""
      ? courses.map((course) => ({ item: course }))
      : fuse.search(search);

  let filteredCourses = null;
  if (search.trim() === "") {
    filteredCourses = result.sort((a, b) =>
      a.item.code.localeCompare(b.item.code)
    );
  } else {
    filteredCourses = result.filter((course) => {
      const courseYear = parseInt(course.item.code.slice(4, 5)); // e.g., COMP11120 => 1st year
      return yearFilter === "" || courseYear.toString() === yearFilter;
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-gray-800">
      <header>
        <HeaderBar />
      </header>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Course List</h1>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-full md:w-1/2">
            <Label className="mt-4">Search by name or code</Label>
            <Input
              className="mt-4"
              placeholder="e.g., COMP11120 or Programming"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-1/4">
            <Label className="mt-4">Filter by Year</Label>
            <Select
              onValueChange={(val) => setYearFilter(val)}
              value={yearFilter}
            >
              <SelectTrigger className="mt-4">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st Year</SelectItem>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
                <SelectItem value="4">4th Year</SelectItem>
                <SelectItem value="all">All Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <Link
              key={course.item.code}
              href={`/route/${course.item.code}`}
              className="transition-colors hover:text-foreground/80"
            >
              <Card
                key={course.item.code}
                className="hover:shadow-md cursor-pointer transition-all"
              >
                <CardHeader>
                  <CardTitle>{course.item.code}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {course.item.title}
                  </p>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>{course.item.faculty}</p>
                  <p>{course.item.credits} Units</p>
                  <p>Offered in: {course.item.semesters}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
