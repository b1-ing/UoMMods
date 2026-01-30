export type CourseSummary = {
    code: string;
    summary: string;
    take: string;
    donttake: string;
};


export const summaries: CourseSummary[] = [
    {
        code: "COMP23311",
        summary: "Software Engineering 1: Focuses on the professional lifecycle of software, covering Git workflows, automated testing (unit/integration), CI/CD, and design patterns.",
        take: "Essential for learning industry-standard tools like Jira and understanding how to maintain 'brownfield' codebases.",
        donttake: "The 70% exam weight is high for a practical subject; it may be stressful if you prefer being graded on coding projects."
    },
    {
        code: "COMP23412",
        summary: "Software Engineering 2: A 'simulated company' experience where teams build web applications using modern frameworks and handle evolving customer requirements.",
        take: "Provides high-value CV experience in team-based agile development and full-stack web skills.",
        donttake: "Avoid if you dislike group work, as the team project is 50% of your grade. Requires COMP23311."
    },
    {
        code: "COMP26020",
        summary: "Programming Languages & Paradigms: An advanced tour of C, C++, Haskell, and Solidity, covering memory safety, functional programming, and compilation.",
        take: "Perfect for becoming a polyglot programmer and understanding low-level system safety vs. high-level functional abstraction.",
        donttake: "Broad and fast-paced; jumping between C and Haskell syntax within one module can be mentally exhausting."
    },
    {
        code: "COMP26120",
        summary: "Algorithms and Data Structures: A deep dive into efficiency, asymptotic complexity, and problem-solving (trees, graphs, and NP-completeness).",
        take: "The gold standard for passing big-tech technical interviews.     ",
        donttake: "A heavy, year-long 20-credit commitment. Requires a high level of mathematical reasoning and patience for pseudocode."
    },
    {
        code: "COMP21111",
        summary: "Logic and Modelling: Uses propositional and temporal logic to solve combinatorial problems and verify that computer systems are error-free.",
        take: "Intellectually unique; great for those interested in AI reasoning, formal verification, or high-level system modeling.",
        donttake: "Highly abstract and math-heavy. It builds significantly on Year 1 logic, so skip if you found COMP11120 difficult."
    },
    {
        code: "COMP22111",
        summary: "Processor Microarchitecture: A hardware-focused module where you design and implement an ARM-like processor using Verilog and FPGA boards.",
        take: "Essential for silicon-level careers (ARM/Imagination Technologies). Very rewarding to build a working CPU from scratch.",
        donttake: "Requires a strong interest in digital logic and CMOS implementation. Usually restricted to specific program IDs (like G400)."
    },
    {
        code: "COMP22712",
        summary: "Microcontrollers: A 100% practical module on the software/hardware interface, writing assembly and C for embedded controllers.",
        take: "The best choice for exam-phobes—it's 100% coursework. Teaches valuable 'close-to-the-metal' bit-fiddling skills.",
        donttake: "Not for those who find assembly language tedious or prefer high-level software application development."
    },
    {
        code: "COMP23111",
        summary: "Fundamentals of Databases: Covers (E)ER modeling, SQL, Normalization, and modern NoSQL/Data Mining techniques.",
        take: "Universal utility; every developer needs to know how to store and retrieve data efficiently.",
        donttake: "The pace is very fast, moving from SQL to NoSQL to Data Warehousing in a single semester."
    }

];
