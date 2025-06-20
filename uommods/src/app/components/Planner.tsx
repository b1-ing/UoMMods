"use client"

import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardTitle} from '@/components/ui/card'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import {Button} from '@/components/ui/button'
import {Program, programs} from '@/lib/programs'
import { Trash } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,

} from "@/components/ui/dialog"
import CourseDependencyGraph from "@/app/components/CourseDependencyGraphMini";
import {Course, courses} from "@/lib/mockcourses"
import { ScrollArea } from "@/components/ui/scroll-area"
import {PrereqDisplay} from "@/app/components/PrereqDisplay";
import GradeChart from "@/app/components/GradeChart";
import Link from "next/link";


type ColumnType = 'year' | 'sem1' | 'sem2'

export default function Planner() {
    const [selectedProgramCode, setSelectedProgramCode] = useState<string>('')
    const [selectedYear, setSelectedYear] = useState<number | ''>('')
    const [dialogCourse, setDialogCourse] = useState<Course | null>(null);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
    const [missingPrereqs, setMissingPrereqs] = useState<Course[]>([]);
    const [prereqDialogOpen, setPrereqDialogOpen] = useState(false);
    const [pendingColumn, setPendingColumn] = useState<ColumnType>('year');




    const closeDialog = () => setDialogCourse(null);



    const [openDrawer, setOpenDrawer] = useState<ColumnType | null>(null)
    const [columns, setColumns] = useState<Record<ColumnType, Course[]>>({
        year: [],
        sem1: [],
        sem2: [],
    })




    const addCourseToColumn = (course: Course, column: ColumnType) => {
        if (courseExistsInColumns(course.code,columns)){
            setOpenDrawer(null)
            setShowDuplicateDialog(true)
            return;
        }

        const prereqCodes = course.corequisitesList
            ? splitCourseCodes(course.corequisitesList)
            : [];

        const missing = prereqCodes
            .filter(code => !courseExistsInColumns(code, columns))
            .map(code => courses[code])
            .filter(Boolean);

        if (missing.length > 0) {
            setPendingCourse(course);
            setPendingColumn(column);
            setMissingPrereqs(missing);
            setPrereqDialogOpen(true);
            console.log(pendingColumn, pendingCourse)
            return;
        }
        else {
            setColumns(prev => {
                const updated = {
                    ...prev,
                    [column]: [...prev[column], course],
                };
                console.log("Adding course to column:", column);
                console.log("Updated columns:", updated);
                return updated;
            });
        }

        setOpenDrawer(null)
    }

    useEffect(() => {
        if (selectedProgramCode && selectedYear) {
            addCompulsoryCourses();
        }
    }, [selectedProgramCode, selectedYear]);


    const removeCourseFromColumn = (course: Course, column: ColumnType) => {
        setColumns(prev => {
            const updated = {
                ...prev,
                [column]: prev[column].filter(c => c.code !== course.code),
            };
            console.log("Adding course to column:", column);
            console.log("Updated columns:", updated);
            return updated;
        });
        setOpenDrawer(null)
    }
    function splitCourseCodes(codes: string): string[] {
        console.log(codes)
        return codes.split(',')
    }
    function courseExistsInColumns(code: string, columns: Record<ColumnType, Course[]>): boolean {
        return Object.values(columns).some(column =>
            column.some(course => course?.code === code)
        );
    }



    const addCompulsoryCourses = () => {
        const program = programs[selectedProgramCode as keyof typeof programs]
        if (!program || !selectedYear) return

        const newColumns: Record<ColumnType, Course[]> = {
            year: [],
            sem1: [],
            sem2: [],
        }
        console.log(program.secondyrfy)
        const toCourse = (code: string): Course => (courses[code])

        switch (selectedYear) {
            case 1:
                newColumns.year = program.firstyrfy.map(toCourse)
                newColumns.sem1 = program.firstyrs1.map(toCourse)
                newColumns.sem2 = program.firstyrs2.map(toCourse)
                break
            case 2:
                newColumns.year = program.secondyrfy.map(toCourse)
                newColumns.sem1 = [...program.secondyrs1comp].map(toCourse)
                newColumns.sem2 = [...program.secondyrs2comp].map(toCourse)

                break
            case 3:
                newColumns.year = program.thirdyrfy.map(toCourse)
                newColumns.sem1 = program.thirdyrs1.map(toCourse)
                newColumns.sem2 = program.thirdyrs2.map(toCourse)
                break
            default:
                return
        }

        setColumns(newColumns)
        console.log(columns['year'])
    }


    type PlannerProps = {
        prerequisites: string | undefined
        corequisites: string| undefined
        columns: Record<ColumnType, Course[]>
    }




    const getFilteredCourses = (type: string) => {
        if(!selectedProgramCode || !selectedYear){

            return [];
        }



        switch (type) {
            case 'sem1':
                return Object.values(courses).filter(course =>
                    course.semesters?.includes('Semester 1') && course.level == selectedYear
                );
            case 'sem2':
                return Object.values(courses).filter(course =>
                    course.semesters?.includes('Semester 2')&& course.level == selectedYear
                );
            case 'year':
                return Object.values(courses).filter(course =>
                    course.semesters?.includes('Full Year')&& course.level == selectedYear
                );
            default:
                return Object.values(courses);
        }
    };






    const renderColumn = (label: string, type: ColumnType) => {
        const key = `y${selectedYear}${type}cred` as keyof Program;
        const requiredCredits = selectedProgramCode && selectedYear
            ? programs[selectedProgramCode][key]
            : 0;


        const currentCredits = columns[type].reduce(
            (sum, course) => sum + (course?.units || 0),
            0
        );



        return (
            <Card className="w-full sm:w-1/3 p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <CardTitle>
                        {label} – {currentCredits}/{requiredCredits} credits
                    </CardTitle>
                    <Button size="sm" onClick={() => setOpenDrawer(type)}>
                        + Add
                    </Button>
                </div>

                <CardContent className="space-y-2 p-2">
                    {columns[type].map(course =>
                        course ? (
                            <Card
                                key={`${type}-${course.code ?? "not found"}`}
                                className="p-2"
                                onClick={() => setDialogCourse(course)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="font-semibold">
                                        {course.code ?? "not found"} – {course.title}
                                    </div>
                                    <div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={e => {
                                                e.stopPropagation();
                                                removeCourseFromColumn(course, type);
                                            }}
                                        >
                                            <Trash />
                                        </Button>
                                    </div>
                                </div>
                                {course.prerequisitesList && (
                                    <PrereqDisplay
                                        prerequisites={course.prerequisitesList}
                                        corequisites={course.corequisitesList}
                                        columns={columns}
                                    />
                                )}
                                <div className="text-sm text-muted-foreground">
                                    {course.units} units
                                </div>
                            </Card>
                        ) : null
                    )}
                </CardContent>

                <Drawer open={openDrawer === type} onOpenChange={() => setOpenDrawer(null)}>
                    <DrawerContent className="max-h-[80vh] overflow-hidden flex flex-col">
                        <DrawerHeader>
                            <DrawerTitle>Select Course for {label}</DrawerTitle>
                        </DrawerHeader>

                        <div className="flex-1 overflow-y-auto px-4">
                            <ScrollArea className="h-full">
                                <div className="space-y-2 pb-4">
                                    {getFilteredCourses(type).map(course => (
                                        <Card
                                            key={course.code}
                                            className="p-2 cursor-pointer hover:bg-muted"
                                            onClick={() => addCourseToColumn(course, type)}
                                        >
                                            <div className="font-medium">
                                                {course.code}
                                                <p>
                                                    {course.title} ({course.units} units)
                                                </p>
                                            </div>
                                            {course.prerequisitesList && (
                                                <PrereqDisplay
                                                    prerequisites={course.prerequisitesList}
                                                    corequisites={course.corequisitesList}
                                                    columns={columns}
                                                />
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </DrawerContent>
                </Drawer>
            </Card>
        );
    };


    return (
        <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Course of Study</label>
                        <select
                            className="border rounded px-3 py-2"
                            value={selectedProgramCode}
                            onChange={(e) => setSelectedProgramCode(e.target.value)}
                        >
                            <option value="">Select Program</option>
                            {Object.values(programs).map((prog) => (
                                <option key={prog.code} value={prog.code}>
                                    {prog.title}
                                </option>
                            ))}
                            ))

                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Year of Study</label>
                        <select
                            className="border rounded px-3 py-2"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            <option value="">Select Year</option>
                            {[1, 2, 3, 4].map((year) => (
                                <option key={year} value={year}>
                                    Year {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        {/*<Button onClick={addCompulsoryCourses} disabled={!selectedProgramCode || !selectedYear}>*/}
                        {/*    Load*/}
                        {/*</Button>*/}
                    </div>
                </div>

                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    {renderColumn('Whole Year', 'year')}
                    {renderColumn('Semester 1', 'sem1')}
                    {renderColumn('Semester 2', 'sem2')}
                </div>
            {dialogCourse && (
                <Dialog open={!!dialogCourse} onOpenChange={closeDialog}>
                    <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>{dialogCourse.code} – {dialogCourse.title}</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                {dialogCourse.units} units • {dialogCourse.faculty} • Offered in: {dialogCourse.semesters}
                            </DialogDescription>
                        </DialogHeader>

                        {/* Scrollable content */}
                        <ScrollArea className="flex-1 pr-2">
                            <div className="space-y-4 mt-2 text-sm text-muted-foreground pr-2">
                                <div>
                                    <span className="font-medium text-foreground">Key Info:</span>
                                </div>

                                {(dialogCourse.prerequisitesList || dialogCourse.corequisitesList) && (
                                    <div>
                                        <PrereqDisplay
                                            prerequisites={dialogCourse.prerequisitesList}
                                            corequisites={dialogCourse.corequisitesList}
                                            columns={columns}
                                        />
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-semibold mb-1 mt-4">Historical Grade Data</h4>
                                    <GradeChart overallMean={dialogCourse.overallmean} />
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1 mt-4">Course Dependency Graph</h4>
                                    <CourseDependencyGraph courseCode={dialogCourse.code} />
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Sticky footer button */}
                        <div className="pt-4">
                            <Link href={`/route/${dialogCourse.code}`} passHref>
                                <button className="w-full bg-primary text-white rounded-md py-2 hover:bg-primary/90 transition">
                                    Go to Course Page
                                </button>
                            </Link>
                        </div>
                    </DialogContent>
                </Dialog>
            )}


            {showDuplicateDialog && (
                <Dialog open={true} onOpenChange={() => setShowDuplicateDialog(false)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Duplicate course</DialogTitle>
                            <DialogDescription>
                                This course has already been added.
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            )}
            <Dialog open={prereqDialogOpen} onOpenChange={setPrereqDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Missing Prerequisites</DialogTitle>
                        <DialogDescription>
                            {pendingCourse?.code} has unmet prerequisites:
                            <ul className="mt-2 list-disc ml-4">
                                {missingPrereqs.map(c => (
                                    <li key={c.code}>{c.code} – {c.title}</li>
                                ))}
                            </ul>
                            Would you like to add just the course, or both the course and prerequisites?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                if (!pendingCourse) return;
                                if (pendingCourse && pendingColumn) {
                                    setColumns(prev => ({
                                        ...prev,
                                        [pendingColumn]: [...prev[pendingColumn], pendingCourse],
                                    }));
                                }

                                setPendingCourse(null);
                                setMissingPrereqs([]);
                                setPrereqDialogOpen(false);
                                setOpenDrawer(null);
                            }}
                        >
                            Add Course Only
                        </Button>
                        <Button
                            onClick={() => {
                                if (!pendingCourse) return;
                                if (pendingCourse && pendingColumn) {
                                    setColumns(prev => ({
                                        ...prev,
                                        [pendingColumn]: [...prev[pendingColumn], pendingCourse],
                                    }));
                                }
                                missingPrereqs.forEach(prereqCourse => {
                                    if (!prereqCourse) return;


                                    // Decide which column based on its semester
                                    const semesters = prereqCourse.semesters ?? [];

                                    let targetColumn: ColumnType | null = null;
                                    if (semesters.includes("Full Year")) targetColumn = "year";
                                    else if (semesters.includes("Semester 1")) targetColumn = "sem1";
                                    else if (semesters.includes("Semester 2")) targetColumn = "sem2";

                                    if (targetColumn) {
                                        addCourseToColumn(prereqCourse, targetColumn);
                                    }
                                });

                                setPendingCourse(null);
                                setMissingPrereqs([]);
                                setPrereqDialogOpen(false);
                                setOpenDrawer(null);
                            }}
                        >
                            Add Course + Prereqs
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>



        </div>
            )

            };