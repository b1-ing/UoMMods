// mockCourses.ts



export type Course =  {
    code: string;
    title: string;
    units: number;
    faculty: string;
    semesters: string;
    description: string;
    aims?: string;
    level: number;
    exam: number,
    coursework: number,
    Study: number,
    Lectures: number,
    Workshops: number,
    Placement?: number,
    Lab? : number;
    corequisitesList?: string;       // 👈 NEW
    prerequisitesList?: string; // 👈 NEW (course codes)
    requiredBy?: string;        // 👈 NEW (course code
    locations?: string[];
    prereqnotes?: string;
    timetable?: { type: string; location: string; weeks: string }[];
}



export const courses: Record<string, Course> = {
    COMP24112: {
        code: "COMP24112",
        title: "Machine Learning",
        units: 10,
        level: 2,
        faculty: "Computer Science • Computing",
        semesters: "Semester 2",
        description: "The world is filling up with data... [truncated]",
        aims: "The unit aims to introduce the essential concepts... [truncated]",
        exam: 0.7,
        coursework: 0.3,
        Lectures: 2,
        Workshops: 1,
        Study: 6,
        Placement: 0,
        prerequisitesList: "COMP11120, COMP13212, MATH11121",
        corequisitesList: "COMP24011",
        requiredBy: "CS3235,CS4218",
        locations: ["AS6-020607", "COM1-B113"],
        timetable: [
            { type: "LAB [06]", location: "COM1-B113", weeks: "Weeks 3-13" },
            { type: "TUT [10]", location: "AS6-020607", weeks: "Weeks 3-13" }
        ]
    },

    COMP21111: {
        code: "COMP21111",
        title: "Logic and Modelling",
        units: 10,
        level: 2,
        faculty: "Computer Science • Computing",
        semesters: "Semester 1",
        description: "This is a unique course developed... [truncated]",
        aims: "This course intends to build an understanding... [truncated]",
        exam: 0.7,
        coursework: 0.3,
        Lectures: 2,
        Workshops: 1,
        Study: 6,
        Placement: 0,
        prerequisitesList: "COMP11120, MATH11022, MATH11121"
    },

    COMP22111: {
        code: "COMP22111",
        title: "Processor Microarchitecture",
        units: 10,
        level: 2,
        faculty: "Computer Science • Computing",
        semesters: "Semester 1",
        description: "This course unit aims to reinforce... [truncated]",
        aims: "The unit aims to build upon the concepts... [truncated]",
        exam: 0.5,
        coursework: 0.5,
        Lectures: 2,
        Workshops: 1,
        Study: 6,
        Placement: 0,
        prerequisitesList: "COMP12111",
        requiredBy: "COMP32211"
    },

    COMP23111: {
        code: "COMP23111",
        title: "Database Systems",
        units: 10,
        level: 2,
        faculty: "Computer Science • Computing",
        semesters: "Semester 1",
        description: "This course provides a comprehensive exploration... [truncated]",
        exam: 0.3,
        coursework: 0.7,
        Lectures: 0,
        Workshops: 1,
        Study: 6,
        Placement: 0,
        requiredBy: "COMP38311"
    },

    COMP24011: {
        code: "COMP24011",
        title: "Introduction to AI",
        units: 10,
        level: 2,
        faculty: "Computer Science • Computing",
        semesters: "Semester 1",
        description: "The Unit aims to make students familiar... [truncated]",
        exam: 0.8,
        coursework: 0.2,
        Lectures: 2,
        Workshops: 1,
        Study: 6,
        Placement: 0,
        Lab: 1,
        requiredBy: "COMP24112,COMP24412"
    },

    COMP23412: {
        code: "COMP23412",
        title: "Software Engineering 2",
        units: 10,
        level: 2,
        faculty: "Computer Science • Computing",
        semesters: "Semester 2",
        description: "This course prepares you to build interactive... [truncated]",
        exam: 0.5,
        coursework: 0.5,
        Lectures: 1,
        Workshops: 2,
        Study: 5,
        Placement: 0,
        prerequisitesList: "COMP23311"
    },

    COMP23311: {
        code: "COMP23311",
        title: "Software Engineering 1",
        units: 10,
        level: 2,
        faculty: "Computer Science • Computing",
        semesters: "Semester 1",
        description: "This course covers many aspects of software engineering... [truncated]",
        exam: 0.5, // you may need to fill this in
        coursework: 0.5, // or adjust the Course type if you prefer optional fields
        Lectures: 2,
        Workshops: 1,
        Study: 6,
        Placement: 0,
        prerequisitesList: "COMP16321, COMP16421",
        requiredBy: "CS24112",
        locations: ["AS6-020607", "COM1-B113"],
        timetable: [
            { type: "LAB [06]", location: "COM1-B113", weeks: "Weeks 3-13" },
            { type: "TUT [10]", location: "AS6-020607", weeks: "Weeks 3-13" }
        ]
    }
};
