"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {Course} from "@/lib/mockcourses"


type ColumnType = 'year' | 'sem1' | 'sem2'
function splitCourseCodes(codes: string): string[] {
    console.log(codes)
    return codes.split(',')
}
function courseExistsInColumns(code: string, columns: Record<ColumnType, Course[]>): boolean {
    return Object.values(columns).some(column =>
        column.some(course => course?.code === code)
    );
}

export const PrereqDisplay = ({
                                  prerequisites,
                                  corequisites,
                                  columns,
                              }: {
    prerequisites?: string;
    corequisites?: string;
    columns: Record<string, Course[]>;
}) => {
    const prereqList = prerequisites ? splitCourseCodes(prerequisites) : [];
    const coreqList = corequisites ? splitCourseCodes(corequisites) : [];

    return (
        <div className="space-y-4">
            {prereqList.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-1">Prerequisites:</h4>
                    <div className="flex flex-wrap gap-2">
                        {prereqList.map((code) => (
                            <Button key={code} variant="outline">
                                {code}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {coreqList.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-1">Corequisites:</h4>
                    <div className="flex flex-wrap gap-2">
                        {coreqList.map((code) => {
                            const exists = courseExistsInColumns(code, columns);
                            return !exists ? (
                                <Tooltip key={code}>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" className="border-red-500 text-red-600">
                                            {code}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Corequisite not met</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <Button key={code} variant="outline">
                                    {code}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
