import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course } from "@/lib/mockcourses";
import { Program } from "@/lib/programs";
import { Year } from "./PlannerControls";
import { ColumnType } from "./CourseColumn";

type AllYearsSummary = {
  year: Year;
  columns: {
    column: ColumnType;
    courses: Course[];
    totalCredits: number;
  }[];
}[];

interface SummaryTableProps {
  allSummary: AllYearsSummary | null;
  programs: Record<string, Program>;
  selectedProgramCode: string;
}

// Flatten the all-years summary into CSV rows
function buildCsvRows(allSummary: AllYearsSummary) {
  const rows: string[][] = [];
  // Header
  rows.push(["Year", "Column", "Course Code", "Title", "Credits"]);

  allSummary.forEach(({ year, columns }) => {
    columns.forEach(({ column, courses }) => {
      courses.forEach((course) => {
        rows.push([
          String(year),
          column === "year"
            ? "Year-long"
            : column === "sem1"
            ? "Semester 1"
            : "Semester 2",
          course.code,
          course.title,
          String(course.credits),
        ]);
      });
      // subtotal row per column
      rows.push([
        String(year),
        column === "year"
          ? "Year-long total"
          : column === "sem1"
          ? "Semester 1 total"
          : "Semester 2 total",
        "",
        "",
        String(courses.reduce((sum, c) => sum + (c?.credits ?? 0), 0)),
      ]);
    });
  });

  return rows;
}

// Converts rows to a CSV blob and triggers download
function downloadCsv(allSummary: AllYearsSummary, programTitle: string) {
  const rows = buildCsvRows(allSummary);
  const csvContent = rows
    .map((r) =>
      r
        .map((cell) => {
          // escape quotes
          const escaped = String(cell).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
    .join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const filename = `${programTitle
    .replace(/\s+/g, "_")
    .toLowerCase()}_summary_all_years.csv`;

  // create invisible link and click
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SummaryTable({
  allSummary,
  programs,
  selectedProgramCode,
}: SummaryTableProps) {
  if (!allSummary) return null;
  const programTitle = programs[selectedProgramCode]?.title ?? "Program";

  return (
    <Card className="mt-6">
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-baseline gap-2">
          <CardTitle className="m-0">
            Full Summary for {programTitle}
          </CardTitle>
          <Button
            size="sm"
            onClick={() => downloadCsv(allSummary, programTitle)}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <CardContent className="overflow-x-auto">
        {allSummary.map(({ year, columns }) => (
          <div key={year} className="mb-6">
            <div className="font-bold text-lg mb-2">Year {year}</div>
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Column</th>
                  <th className="border p-2 text-left">Course Code</th>
                  <th className="border p-2 text-left">Title</th>
                  <th className="border p-2 text-left">Credits</th>
                </tr>
              </thead>
              <tbody>
                {columns.map(({ column, courses, totalCredits }) => (
                  <React.Fragment key={`${year}-${column}`}>
                    {courses.map((course, idx) => (
                      <tr
                        key={`${year}-${column}-${course.code}-${idx}`}
                        className=""
                      >
                        <td className="border p-2 align-top">
                          {column === "year"
                            ? "Year-long"
                            : column === "sem1"
                            ? "Semester 1"
                            : "Semester 2"}
                        </td>
                        <td className="border p-2">{course.code}</td>
                        <td className="border p-2">{course.title}</td>
                        <td className="border p-2">{course.credits}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100">
                      <td className="border p-2 font-semibold">
                        {column === "year"
                          ? "Year-long total"
                          : column === "sem1"
                          ? "Semester 1 total"
                          : "Semester 2 total"}
                      </td>
                      <td className="border p-2" />
                      <td className="border p-2" />
                      <td className="border p-2 font-semibold">
                        {totalCredits}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}