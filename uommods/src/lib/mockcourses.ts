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
        description: "The world is filling up with data - billions of images online, billions of supermarket transactions, billions of events pouring out of our everyday lives.   Machine Learning is about designing algorithms capable of automatically learning patterns from this supplied data. Examples of this are in online shopping like Amazon.com - which learns what products you like to buy, or in spam detection systems, which learn what spam looks like as you tag it in your spam folder.\n" +
            " \n" +
            "In this course unit we will introduce you to the basics of these algorithms, implementing a basic spam filter and a handwriting recognition engine.",

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
        description: "This is a unique course developed at the University of Manchester. It explains how implementations of logic can be used to solve a number a number of problems, such as solving hardest Sudoku puzzles in no time, analysing two-player games, or finding serious errors in computer systems",
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
        description: "This course unit aims to reinforce and extend digital hardware development skills which are introduced in the first year. It employs industry-standard tools and languages which are used worldwide for silicon development. The UK has perhaps the strongest expertise in Europe in these areas and skills are in high demand from employers such as ARM and Imagination Technologies who provide much of the digital design for devices such as smartphones and tablet computers.",
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
        description: "This course provides a comprehensive exploration of databases, emphasizing their pivotal role in modern computing and data management. Students will learn the principles of database design, implementation, and management, with a focus on the relational model, SQL, and normalization. The curriculum also covers database integration with web and front-end systems, transaction management, security, and emerging paradigms like NoSQL. By blending theory with hands-on practice, students will develop essential skills in designing robust databases, writing advanced queries, and leveraging database technologies for real-world applications.",
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
        description: "The Unit aims to make students familiar with the basic concepts and techniques of Artificial Intelligence. It provides the knowledge and understanding that underpins later course units in the subject taught in the Department.",
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
        description: "This course prepares you to build interactive, real-world web applications using modern development frameworks and team-based agile practices. You will work in a simulated software company, with weekly requirements from ‘customers’ (your lecturers) that range from precise to deliberately ambiguous – just like the real world.\n" +
            "\n" +
            "Working in teams, you will learn to break down requirements, clarify ambiguity through customer engagement, and deliver high-quality software through continuous integration and testing. Along the way, you will develop fluency in an industry-standard framework, navigating documentation and architectural patterns to solve evolving challenges.",

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
