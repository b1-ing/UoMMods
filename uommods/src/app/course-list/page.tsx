"use client";
import Link from "next/link"
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courses } from "@/lib/mockcourses";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HeaderBar from "@/app/components/HeaderBar";
type Course = (typeof courses)[string];

export default function CourseListPage() {
    const allCourses: Course[] = Object.values(courses);
    const [search, setSearch] = useState("");
    const [yearFilter, setYearFilter] = useState("");

    const filteredCourses = allCourses.filter((course) => {
        const matchesSearch =
            course.title.toLowerCase().includes(search.toLowerCase()) ||
            course.code.toLowerCase().includes(search.toLowerCase());

        const courseYear = parseInt(course.code.slice(4, 5)); // e.g., COMP11120 => 1st year
        const matchesYear = yearFilter === "" || courseYear.toString() === yearFilter;

        return matchesSearch && matchesYear;
    });

    return (
<div className="w-full mx-auto p-6 space-y-6">
        <header>
            <HeaderBar/>
        </header>
    <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Course List</h1>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-full md:w-1/2">
                <Label>Search by name or code</Label>
                <Input
                    placeholder="e.g., COMP11120 or Programming"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="w-full md:w-1/4">
                <Label>Filter by Year</Label>
                <Select onValueChange={(val) => setYearFilter(val)} value={yearFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Years"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
                <Link
                    key={course.code}
                    href={`/route/${course.code}`}
                    className="transition-colors hover:text-foreground/80"
                >
                <Card key={course.code} className="hover:shadow-md cursor-pointer transition-all">
                    <CardHeader>
                        <CardTitle>{course.code}</CardTitle>
                        <p className="text-muted-foreground text-sm">{course.title}</p>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>{course.faculty}</p>
                        <p>{course.units} Units</p>
                        <p>Offered in: {course.semesters}</p>
                    </CardContent>
                </Card>
                </Link>
            ))}
        </div>
    </div>
</div>
)
    ;
}
