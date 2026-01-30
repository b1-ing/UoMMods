
export interface AssessmentWeights {
    // Using an index signature since assessment names vary by course
    [method: string]: number;
}

export type Course = {
    code: string;
    title: string;
    credits: number;
    mandatory?: boolean;
    description?: string;
    semester: string;
    level: number;
    assessment: AssessmentWeights;

    // Assessment methods
    // assessment_assessment_task?: number;
    // assessment_assignment_2000_words?: number;
    // assessment_lectures?: number;
    // assessment_oral_assessmentpresentation?: number;
    // assessment_practical_skills_assessment?: number;
    // assessment_project_output_not_dissn?: number;
    // assessment_set_exercise?: number;
    // assessment_written_assignment_inc_essay?: number;
    // assessment_written_exam?: number;

    // Study hours
    independent_independent_study?: number;
    scheduled_demonstration?: number;
    scheduled_lectures?: number;
    scheduled_practical_classes__workshops?: number;
    scheduled_project_supervision?: number;
    scheduled_supervised_time_in_studiowksp?: number;
    scheduled_tutorials?: number;


    // Requirements
    corequisites_list?: string[];
    prerequisites_list?: string[];
    required_by?: string[];

    // Other fields
    freechoice?: boolean;

    // Optional fields used elsewhere
    program_ids: string[];
    aims?: string;
    exam?: number;
    coursework?: number;
    Study?: number;
    Lectures?: number;
    Workshops?: number;
    Placement?: number;
    Lab?: number;
    locations?: string[];
    prereqnotes?: string;
    gradestats?: {
        year: string;
        mean: number;
        stdDev: number|null;
        n: number;
        marks: number|null;
    }[] | null;
    timetable?: {
        type: string;
        location: string;
        weeks: string;
    }[];
    overallmean?: number | null;
};



export type Program = {
    program_id: string;
    title: string;
    firstyrfy: string[];
    firstyrs1comp: string[];
    firstyrs1op: string[];
    firstyrs2comp: string[];
    firstyrs2op: string[];
    y1yearcred?: number;
    y1sem1cred?: number;
    y1sem2cred?: number;
    secondyrfy: string[];
    secondyrs1comp: string[];
    secondyrs1op: string[];
    secondyrs2comp: string[];
    secondyrs2op: string[];
    y2yearcred?: number;
    y2sem1cred?: number;
    y2sem2cred?: number;
    thirdyrfy: string[];
    thirdyrs1comp: string[];
    thirdyrs1op: string[];
    thirdyrs2comp: string[];
    thirdyrs2op: string[];
    y3yearcred?: number;
    y3sem1cred?: number;
    y3sem2cred?: number;
    courseCodes: string[];

};


