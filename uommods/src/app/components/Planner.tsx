"use client"

import React, {useState} from 'react';
import {Card, CardContent, CardTitle} from '@/components/ui/card'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import {Button} from '@/components/ui/button'
import {programs} from '@/lib/programs'
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



type ColumnType = 'year' | 'sem1' | 'sem2'

export default function Planner() {
    const [selectedProgramCode, setSelectedProgramCode] = useState<string>('')
    const [selectedYear, setSelectedYear] = useState<number | ''>('')
    const [dialogCourse, setDialogCourse] = useState<Course | null>(null);


    const closeDialog = () => setDialogCourse(null);



    const [openDrawer, setOpenDrawer] = useState<ColumnType | null>(null)
    const [columns, setColumns] = useState<Record<ColumnType, Course[]>>({
        year: [],
        sem1: [],
        sem2: [],
    })




    const addCourseToColumn = (course: Course, column: ColumnType) => {
        setColumns(prev => {
            const updated = {
                ...prev,
                [column]: [...prev[column], course],
            };
            console.log("Adding course to column:", column);
            console.log("Updated columns:", updated);
            return updated;
        });
        setOpenDrawer(null)
    }

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
                console.log(newColumns.year)
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
    }


    type PlannerProps = {
        prerequisites: string | undefined
        corequisites: string| undefined
        columns: Record<ColumnType, Course[]>
    }
    function courseExistsInColumns(code: string, columns: Record<ColumnType, Course[]>): boolean {
        return Object.values(columns).some(column =>
            column.some(course => course.code === code)
        )
    }


    const PrereqDisplay = ({
                                      prerequisites,
                                      corequisites,
                                      columns,
                                  }: PlannerProps)=> {

        const prereqList = prerequisites? splitCourseCodes(prerequisites):[]
        const coreqList = corequisites? splitCourseCodes(corequisites):[]

        return (
            <div className="space-y-4">
                {prereqList.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-1">Prerequisites:</h4>
                        <div className="flex flex-wrap gap-2">
                            {prereqList.map(code => {
                                return (
                                    <Button
                                        key={code}
                                        variant="outline"
                                        className={""}
                                    >
                                        {code}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {coreqList.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-1">Corequisites:</h4>
                        <div className="flex flex-wrap gap-2">
                            {coreqList.map(code => {
                                const exists = courseExistsInColumns(code, columns)
                                return (
                                    <Button
                                        key={code}
                                        variant="outline"
                                        className={exists ? "" : "border-red-500 text-red-600"}
                                    >
                                        {code}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const getFilteredCourses = (type: string) => {
        switch (type) {
            case 'sem1':
                return Object.values(courses).filter(course =>
                    course.semesters?.includes('Semester 1')
                );
            case 'sem2':
                return Object.values(courses).filter(course =>
                    course.semesters?.includes('Semester 2')
                );
            case 'year':
            default:
                return Object.values(courses);
        }
    };






    const renderColumn = (label: string, type: ColumnType) => (
        <Card className="w-full sm:w-1/3 p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <CardTitle>{label}</CardTitle>
                <Button size="sm" onClick={() => setOpenDrawer(type)}>
                    + Add
                </Button>
            </div>

            <CardContent className="space-y-2 p-2">
                {columns[type].map(course => (
                    <Card key={`${type}-${course.code}`} className="p-2" onClick={()=>setDialogCourse(course)}>
                        <div className="flex justify-between items-start">
                        <div className="font-semibold">{course.code} - {course.title}</div>
                            <div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevent triggering dialog
                                        removeCourseFromColumn(course, type);
                                    }}
                                >
                                    <Trash></Trash>
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
                ))}
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
    )

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
                        <Button onClick={addCompulsoryCourses} disabled={!selectedProgramCode || !selectedYear}>
                            Load
                        </Button>
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
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{dialogCourse.code} - {dialogCourse.title}</DialogTitle>
                            <DialogDescription>
                                {dialogCourse.units} units
                            </DialogDescription>
                            <DialogTitle>Course Dependency Graph</DialogTitle>
                                <CourseDependencyGraph courseCode={dialogCourse.code} />

                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            )}

            </div>
            )

            };