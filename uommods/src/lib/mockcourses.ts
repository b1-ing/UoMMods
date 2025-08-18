// mockCourses.ts

import type { Year } from "@/app/components/PlannerControls";

export type Course = {
  code: string;
  title: string;
  credits: number;
  mandatory: string;
  url: string;
  description: string;
  faculty: string;
  semesters: string;
  level: Year;

  // Assessment methods
  assessment_assessment_task?: number;
  assessment_assignment_2000_words?: number;
  assessment_lectures?: number;
  assessment_oral_assessmentpresentation?: number;
  assessment_practical_skills_assessment?: number;
  assessment_project_output_not_dissn?: number;
  assessment_set_exercise?: number;
  assessment_written_assignment_inc_essay?: number;
  assessment_written_exam?: number;

  // Study hours
  independent_independent_study?: number;
  scheduled_demonstration?: number;
  scheduled_lectures?: number;
  scheduled_practical_classes__workshops?: number;
  scheduled_project_supervision?: number;
  scheduled_supervised_time_in_studiowksp?: number;
  scheduled_tutorials?: number;

  // Requirements
  corequisites_list?: string;
  prerequisites_list?: string;

  // Other fields
  freechoice?: boolean;

  // Optional fields used elsewhere
  aims?: string;
  exam?: number;
  coursework?: number;
  Study?: number;
  Lectures?: number;
  Workshops?: number;
  Placement?: number;
  Lab?: number;
  required_by?: string;
  locations?: string[];
  prereqnotes?: string;
  gradestats?: {
    year: string;
    mean: number;
    stdDev: number;
    n: number;
  }[];
  timetable?: {
    type: string;
    location: string;
    weeks: string;
  }[];
  overallmean: number;
};

//
// export const courses: Record<string, Course> = {
//     COMP24112: {
//         code: "COMP24112",
//         title: "Machine Learning",
//         units: 10,
//         level: 2,
//         faculty: "Computer Science • Computing",
//         semesters: "Semester 2",
//         description: "The world is filling up with data - billions of images online, billions of supermarket transactions, billions of events pouring out of our everyday lives.   Machine Learning is about designing algorithms capable of automatically learning patterns from this supplied data. Examples of this are in online shopping like Amazon.com - which learns what products you like to buy, or in spam detection systems, which learn what spam looks like as you tag it in your spam folder.\n" +
//             " \n" +
//             "In this course unit we will introduce you to the basics of these algorithms, implementing a basic spam filter and a handwriting recognition engine.",
//
//         exam: 0.7,
//         coursework: 0.3,
//         Lectures: 2,
//         Workshops: 1,
//         Study: 6,
//         Placement: 0,
//         prerequisitesList: "COMP11120, COMP13212, MATH11121",
//         corequisitesList: "COMP24011",
//         requiredBy: "CS3235,CS4218",
//         locations: ["AS6-020607", "COM1-B113"],
//         timetable: [
//             { type: "LAB [06]", location: "COM1-B113", weeks: "Weeks 3-13" },
//             { type: "TUT [10]", location: "AS6-020607", weeks: "Weeks 3-13" }
//         ],
//         gradestats:[
//             { year: '2022', mean: 68, stdDev: 5, n: 120 },
//             { year: '2023', mean: 72, stdDev: 6, n: 130 }
//         ],
//         overallmean: 61.7,
//
//     },
//
//     COMP21111: {
//         code: "COMP21111",
//         title: "Logic and Modelling",
//         units: 10,
//         level: 2,
//         faculty: "Computer Science • Computing",
//         semesters: "Semester 1",
//         description: "This is a unique course developed at the University of Manchester. It explains how implementations of logic can be used to solve a number a number of problems, such as solving hardest Sudoku puzzles in no time, analysing two-player games, or finding serious errors in computer systems",
//         exam: 0.7,
//         coursework: 0.3,
//         Lectures: 2,
//         Workshops: 1,
//         Study: 6,
//         Placement: 0,
//         prerequisitesList: "COMP11120, MATH11022, MATH11121",
//         gradestats:[
//             { year: '24/25', mean: 64.9, stdDev: 17.4, n: 161 },
//             { year: '23/24', mean: 70.9, stdDev: 17.6, n: 160 },
//             { year: '22/23', mean: 71.5, stdDev: 16.4, n: 301 },
//             { year: '21/22', mean: 69.4, stdDev: 17.5, n: 177 },
//         ],
//         overallmean: 61.7,
//     },
//
//     COMP22111: {
//         code: "COMP22111",
//         title: "Processor Microarchitecture",
//         units: 10,
//         level: 2,
//         faculty: "Computer Science • Computing",
//         semesters: "Semester 1",
//         description: "This course unit aims to reinforce and extend digital hardware development skills which are introduced in the first year. It employs industry-standard tools and languages which are used worldwide for silicon development. The UK has perhaps the strongest expertise in Europe in these areas and skills are in high demand from employers such as ARM and Imagination Technologies who provide much of the digital design for devices such as smartphones and tablet computers.",
//         exam: 0.5,
//         coursework: 0.5,
//         Lectures: 2,
//         Workshops: 1,
//         Study: 6,
//         Placement: 0,
//         prerequisitesList: "COMP12111",
//         requiredBy: "COMP32211",
//         gradestats:[
//             { year: '24/25', mean: 72.3, stdDev:10.8 , n: 62 },
//             { year: '23/24', mean: 61.8, stdDev: 20.4, n: 49 },
//             { year: '22/23', mean: 68.1, stdDev: 18.6, n: 136 },
//             { year: '21/22', mean: 67.6, stdDev: 17.3, n: 115 },
//         ],
//         overallmean: 61.7,
//     },
//
//     COMP23111: {
//         code: "COMP23111",
//         title: "Database Systems",
//         units: 10,
//         level: 2,
//         faculty: "Computer Science • Computing",
//         semesters: "Semester 1",
//         description: "This course provides a comprehensive exploration of databases, emphasizing their pivotal role in modern computing and data management. Students will learn the principles of database design, implementation, and management, with a focus on the relational model, SQL, and normalization. The curriculum also covers database integration with web and front-end systems, transaction management, security, and emerging paradigms like NoSQL. By blending theory with hands-on practice, students will develop essential skills in designing robust databases, writing advanced queries, and leveraging database technologies for real-world applications.",
//         exam: 0.3,
//         coursework: 0.7,
//         Lectures: 0,
//         Workshops: 1,
//         Study: 6,
//         Placement: 0,
//         requiredBy: "COMP38311",
//         gradestats:[
//             { year: '24/25', mean: 72.3, stdDev:10.8 , n: 62 },
//             { year: '23/24', mean: 61.8, stdDev: 20.4, n: 49 },
//             { year: '22/23', mean: 68.1, stdDev: 18.6, n: 136 },
//             { year: '21/22', mean: 67.6, stdDev: 17.3, n: 115 },
//         ],
//         overallmean: 61.7,
//     },
//
//     COMP24011: {
//         code: "COMP24011",
//         title: "Introduction to AI",
//         units: 10,
//         level: 2,
//         faculty: "Computer Science • Computing",
//         semesters: "Semester 1",
//         description: "The Unit aims to make students familiar with the basic concepts and techniques of Artificial Intelligence. It provides the knowledge and understanding that underpins later course units in the subject taught in the Department.",
//         exam: 0.8,
//         coursework: 0.2,
//         Lectures: 2,
//         Workshops: 1,
//         Study: 6,
//         Placement: 0,
//         Lab: 1,
//         requiredBy: "COMP24112,COMP24412",
//         overallmean: 61.7,
//     },
//     COMP24412: {
//         code: "COMP24412",
//         title: "Knowledge Based AI",
//         units: 10,
//         level: 2,
//         faculty: "Computer Science • Computing",
//         semesters: "Semester 2",
//         description: "Intelligent systems need to be able to represent and reason about the world. This course provides an introduction to the key ideas in knowledge representation and different types of automated reasoning. The course is a mixture of theoretical and practical work: at the end of the course students will know the principles that such systems use, and they will have experience of implementing those principles in running systems.",
//         exam: 0.7,
//         coursework: 0.3,
//         Lectures: 1,
//         Study: 7,
//         Placement: 0,
//         Lab: 1,
//         corequisitesList: "COMP24011",
//         overallmean: 61.7,
//     },
//
//     COMP25212: {
//         code: "COMP25212",
//         title: "System Architecture",
//         units: 10,
//         level: 2,
//         faculty: "Computer Science • Computing",
//         semesters: "Semester 2",
//         description: "The basic architecture of computer systems has been covered in first year course units which detailed both the instruction set architecture and the micro-architecture (hardware structure) of simple processors. Although these principles underlie the vast majority of modern computers, there is a wide range of both hardware and software techniques which are employed to increase the performance, reliability and flexibility of systems.",
//         exam: 0.7,
//         coursework: 0.3,
//         Lectures: 2,
//         Workshops: 1,
//         Study: 6,
//         Placement: 0,
//         Lab: 1,
//         prerequisitesList: "COMP15111",
//         requiredBy: "COMP35112",
//         overallmean: 61.7,
//     },
//
//     COMP27112: {
//         code: "COMP27112",
//         title: "Introduction to Visual Computing",
//         units: 10,
//         level: 2,
//         faculty: "Computer Science • Computing",
//         semesters: "Semester 2",
//         description: "Visual Computing brings together two fundamentally important aspects of modern computing: Computer Graphics - concerned with the synthesis of images from computer models - and Image Processing, which deals with analysis and understanding of images by computers. There are now considerable overlaps between these two, traditionally separate, fields of research and their applications.\n" +
//             "The Visual Computing theme consists of the following course units:\n" +
//             "• Year 2: Computer Graphics and Image Processing (10 credits)\n" +
//             "• Year 3: Advanced Computer Graphics (10 credits)\n" +
//             "• Year 3: Computer Vision (10 credits)",
//         exam: 0.7,
//         coursework: 0.3,
//         Lectures: 2,
//         Lab: 1,
//         Study: 6,
//         Placement: 0,
//         prerequisitesList: "COMP15111",
//         requiredBy: "COMP37111,COMP37212",
//         overallmean: 61.7,
//     },
//
//     COMP28112: {
//         code: "COMP28112",
//         title: "Distributed Systems",
//         units: 10,
//         level: 2,
//         faculty: "Computer Science • Computing",
//         semesters: "Semester 2",
//         description: "The course unit assumes that students already have a solid understanding of the main principles of computing within a single machine, have a basic understanding of the issues related to machine communication and networking, and have a notion of what distributed computing is. The syllabus will contain topics covering the fundamentals of distributed computing, its application in modern systems and issues to be considered when designing distributed systems.",
//         exam: 0.5,
//         coursework: 0.5,
//         Lectures: 2,
//         Workshops: 1,
//         Study: 6,
//         Placement: 0,
//         prerequisitesList: "COMP15212, COMP16412",
//         requiredBy: "COMP38311,COMP32412,COMP38412",
//         overallmean: 61.7,
//     },
//
//     COMP22712: {
//         code: "COMP22712",
//         title: "Microcontrollers",
//         units: 10,
//         level: 2,
//         faculty: "Computer Science • Computing",
//         semesters: "Semester 2",
//         description: "The module is a strong practical reinforcement of the software/hardware interface.  It provides experience in hardware/software codesign as well as dealing with interfacing techniques, from 'bit fiddling' to interrupt routines.  There is also an underpinning of operating systems and their implications in machine architecture.  The module uses custom designed hardware and software tools developed locally for this specific purpose.",
//         exam: 1.0,
//         coursework: 0,
//         Lectures: 0,
//         Lab: 2,
//         Study: 7,
//         Placement: 0,
//         prerequisitesList: "COMP15111",
//         overallmean: 61.7,
//     },
//
//
//     COMP23412: {
//         code: "COMP23412",
//         title: "Software Engineering 2",
//         units: 10,
//         level: 2,
//         faculty: "Computer Science • Computing",
//         semesters: "Semester 2",
//         description: "This course prepares you to build interactive, real-world web applications using modern development frameworks and team-based agile practices. You will work in a simulated software company, with weekly requirements from ‘customers’ (your lecturers) that range from precise to deliberately ambiguous – just like the real world.\n" +
//             "\n" +
//             "Working in teams, you will learn to break down requirements, clarify ambiguity through customer engagement, and deliver high-quality software through continuous integration and testing. Along the way, you will develop fluency in an industry-standard framework, navigating documentation and architectural patterns to solve evolving challenges.",
//
//         exam: 0.5,
//         coursework: 0.5,
//         Lectures: 1,
//         Workshops: 2,
//         Study: 5,
//         Placement: 0,
//         prerequisitesList: "COMP23311",
//         overallmean: 61.7,
//     },
//
//     COMP23311: {
//         code: "COMP23311",
//         title: "Software Engineering 1",
//         units: 10,
//         level: 2,
//         faculty: "Computer Science • Computing",
//         semesters: "Semester 1",
//         description: "This course covers many aspects of software engineering... [truncated]",
//         exam: 0.5, // you may need to fill this in
//         coursework: 0.5, // or adjust the Course type if you prefer optional fields
//         Lectures: 2,
//         Workshops: 1,
//         Study: 6,
//         Placement: 0,
//         prerequisitesList: "COMP16321, COMP16421",
//         requiredBy: "CS24112",
//         locations: ["AS6-020607", "COM1-B113"],
//         timetable: [
//             { type: "LAB [06]", location: "COM1-B113", weeks: "Weeks 3-13" },
//             { type: "TUT [10]", location: "AS6-020607", weeks: "Weeks 3-13" }
//         ],
//         overallmean: 61.7,
//
//     }
// };
