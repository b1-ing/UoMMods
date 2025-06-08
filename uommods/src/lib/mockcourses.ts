// mockCourses.ts



export type Course =  {
    code: string;
    title: string;
    units: number;
    faculty: string;
    semesters: string[];
    description: string;
    aims?: string;
    level: number;
    workload: string;
    exam: number,
    coursework: number,
    corequisitesList?: string;       // 👈 NEW
    prerequisitesList?: string; // 👈 NEW (course codes)
    requiredBy?: string;        // 👈 NEW (course code
    locations?: string[];
    prereqnotes?: string;
    timetable?: { type: string; location: string; weeks: string }[];
}


export const courses = {

COMP24112: {
    code: "COMP24112",
    title: "Machine Learning",
    units: 10,
    level: 2,
    faculty: "Computer Science • Computing",
    semesters: "Semester 2",
    description:
        "The world is filling up with data - billions of images online, billions of supermarket transactions, billions of events pouring out of our everyday lives.   Machine Learning is about designing algorithms capable of automatically learning patterns from this supplied data. Examples of this are in online shopping like Amazon.com - which learns what products you like to buy, or in spam detection systems, which learn what spam looks like as you tag it in your spam folder.\n" +
        " \n" +
        "In this course unit we will introduce you to the basics of these algorithms, implementing a basic spam filter and a handwriting recognition engine.",
    aims:"The unit aims to introduce of the essential concepts behind key machine learning techniques, the methodologies for building machine learning systems, the approaches for learning from data, and the experimental methods on how to evaluate the performance of a learning system and get the best performance from it. Also, we aim to provide the necessary mathematical background required to understand how the methods work. This course covers basics on both supervised and unsupervised learning paradigms and is pitched towards students with scientific/mathematical background interested in adaptive techniques for learning from data as well as data analysis and modelling.\n" +
        " \n" +
        "Specifically, the course will cover the following. A general introduction to key concepts in machine learning and the development of the field. Essential knowledge on how to build a supervised machine learning system, " +
        "including classification and regression, with respect to model architecture (e.g., instance-based model, linear model, linear basis function model, kernel methods, single- and multi-layer perceptrons, etc.), loss functions (e.g., sum of squares error, regularisation, cross-entropy, etc.), and optimisation approaches for training (e.g., basic optimality conditions, (stochastic) gradient descent, etc.). Basic knowledge on parametric, non-parametric, deterministic and probabilistic models. Essential knowledge on clustering analysis. Essentials on how to measure performance of a machine learning system for classification, regression and clustering. Basics on bias and variance issues, over-fitting and under-fitting. " +
        "Essential knowledge and practical skills on how to perform machine learning experiments, data usage for model training, model selection and model testing.",
    exam: 0.7,
    coursework:0.3,

    Lectures: 2,
    Workshops: 1,
    Study: 6,
    Placement: 0,
    examDates: {
        "Semester 1": "28-Nov-2024 5:00 PM • 2 hrs",
        "Semester 2": "02-May-2025 9:00 AM • 2 hrs",
    },
    prerequisitesList: "COMP11120, COMP13212, MATH11121",   // 👈 list of actual course codes
    corequisitesList: "COMP24011",
    requiredBy: "CS3235,CS4218",
    locations: ["AS6-020607", "COM1-B113"],
    timetable: [
        { type: "LAB [06]", location: "COM1-B113", weeks: "Weeks 3-13" },
        { type: "TUT [10]", location: "AS6-020607", weeks: "Weeks 3-13" },
    ],


},

    COMP21111: {
        code: "COMP21111",
        title: "Logic and Modelling",
        units: 10,
        level: 2,
        faculty: "Computer Science • Computing",
        semesters: "Semester 1",
        description:
            "This is a unique course developed at the University of Manchester. It explains how implementations of logic can be used to solve a number a number of problems, such as solving hardest Sudoku puzzles in no time, analysing two-player games, or finding serious errors in computer systems",
        aims: "This course intends to build an understanding of fundamentals of (mathematical) logic as well as some of the applications of logic in modern computer science, including hardware verification, finite domain constraint satisfaction and verification of concurrent systems.",
        exam: 0.7,
        coursework:0.3,

        Lectures: 2,
        Workshops: 1,
        Study: 6,
        Placement: 0,
        examDates: {
            "Semester 1": "28-Nov-2024 5:00 PM • 2 hrs",
            "Semester 2": "02-May-2025 9:00 AM • 2 hrs",
        },
        prerequisitesList: "COMP11120, MATH11022, MATH11121",   // 👈 list of actual course codes



    },

    COMP22111: {
        code: "COMP22111",
        title: "Processor Microarchitecture",
        units: 10,
        level: 2,
        faculty: "Computer Science • Computing",
        semesters: "Semester 1",
        description:
        "This course unit aims to reinforce and extend digital hardware development skills which are introduced in the first year. It employs industry-standard tools and languages which are used worldwide for silicon development. The UK has perhaps the strongest expertise in Europe in these areas and skills are in high demand from employers such as ARM and Imagination Technologies who provide much of the digital design for devices such as smartphones and tablet computers.",

        aims: "The unit aims to build upon the concepts introduced in COMP12111 by taking the material further and expanding students' understanding of the operation of modern computing systems.",
        exam: 0.5,
        coursework:0.5,

        Lectures: 2,
        Workshops: 1,
        Study: 6,
        Placement: 0,
        examDates: {
            "Semester 1": "28-Nov-2024 5:00 PM • 2 hrs",
            "Semester 2": "02-May-2025 9:00 AM • 2 hrs",
        },
        prerequisitesList: "COMP12111",   // 👈 list of actual course codes
        requiredBy: "COMP32211",



    },

    COMP23111
        : {
        code: "COMP23111",
        title: "Database Systems",
        units: 10,
        level: 2,
        faculty: "Computer Science • Computing",
        semesters: "Semester 1",
        description:
           "This course provides a comprehensive exploration of databases, emphasizing their pivotal role in modern computing and data management. Students will learn the principles of database design, implementation, and management, with a focus on the relational model, SQL, and normalization. The curriculum also covers database integration with web and front-end systems, transaction management, security, and emerging paradigms like NoSQL. By blending theory with hands-on practice, students will develop essential skills in designing robust databases, writing advanced queries, and leveraging database technologies for real-world applications.",
        exam: 0.3,
        coursework:0.7,

        Lectures: 0,
        Workshops: 1,
        Study: 6,
        Placement: 0,
        examDates: {
            "Semester 1": "28-Nov-2024 5:00 PM • 2 hrs",
            "Semester 2": "02-May-2025 9:00 AM • 2 hrs",
        },
        requiredBy: "COMP38311",



    },



    COMP11120: {
        code: "COMP11120",
        title: "Mathematics for Computer Science",
        units: 20,
        faculty: "Computer Science • Computing",
        semesters: "Full Year",
        description:
            "The world is filling up with data - billions of images online, billions of supermarket transactions, billions of events pouring out of our everyday lives.   Machine Learning is about designing algorithms capable of automatically learning patterns from this supplied data. Examples of this are in online shopping like Amazon.com - which learns what products you like to buy, or in spam detection systems, which learn what spam looks like as you tag it in your spam folder.\n" +
            " \n" +
            "In this course unit we will introduce you to the basics of these algorithms, implementing a basic spam filter and a handwriting recognition engine.",

        workload: "Lec/Tut/Lab/Prep: 6 hrs | Total: 10 hrs",
        examDates: {
            "Semester 1": "28-Nov-2024 5:00 PM • 2 hrs",
            "Semester 2": "02-May-2025 9:00 AM • 2 hrs",
        },
        prerequisitesList: "test",   // 👈 list of actual course codes
        corequisitesList: "",
        requiredBy: ["CS24112"],

        locations: ["AS6-020607", "COM1-B113"],
        timetable: [
            { type: "LAB [06]", location: "COM1-B113", weeks: "Weeks 3-13" },
            { type: "TUT [10]", location: "AS6-020607", weeks: "Weeks 3-13" },
        ],


    },

    COMP23311: {
        code: "COMP23311",
        title: "Software Engineering 1",
        units: 10,
        faculty: "Computer Science • Computing",
        semesters: "Semester 1",
        description:
           "This course covers many aspects of software engineering and contains much essential information about working with a large codebase authored by many programmers, most of whom are not around.",

        workload: "Lec/Tut/Lab/Prep: 6 hrs | Total: 10 hrs",
        examDates: {
            "Semester 1": "28-Nov-2024 5:00 PM • 2 hrs",
            "Semester 2": "02-May-2025 9:00 AM • 2 hrs",
        },
        prerequisitesList: "COMP16321, COMP16421",   // 👈 list of actual course codes
        corequisitesList: "",
        requiredBy: ["CS24112"],

        locations: ["AS6-020607", "COM1-B113"],
        timetable: [
            { type: "LAB [06]", location: "COM1-B113", weeks: "Weeks 3-13" },
            { type: "TUT [10]", location: "AS6-020607", weeks: "Weeks 3-13" },
        ],


    }
    // Add more courses here
}
