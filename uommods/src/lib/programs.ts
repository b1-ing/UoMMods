// programs.ts

export type Program = {
  code: string;
  title: string;
  firstyrfy: string[];
  firstyrs1: string[];
  firstyrs2: string[];
  y1yearcred: number;
  y1sem1cred: number;
  y1sem2cred: number;
  secondyrfy: string[];
  secondyrs1comp: string[];
  secondyrs1op: string[];
  secondyrs2comp: string[];
  secondyrs2op: string[];
  y2yearcred: number;
  y2sem1cred: number;
  y2sem2cred: number;
  thirdyrfy: string[];
  thirdyrs1: string[];
  thirdyrs2: string[];
};

export const programs: Record<string, Program> = {
  CompSci: {
    code: "CompSci",
    title: "BSc Computer Science",
    firstyrfy: [],
    firstyrs1: [],
    firstyrs2: [],
    y1yearcred: 40,
    y1sem1cred: 40,
    y1sem2cred: 40,
    secondyrfy: ["COMP26120", "COMP26020"],
    secondyrs1comp: ["COMP23311"],
    secondyrs1op: ["COMP21111", "COMP22111", "COMP24011", "COMP23111"],
    secondyrs2comp: ["COMP23412"],
    secondyrs2op: ["COMP22712", "COMP24112", "COMP24412", "COMP25212", "COMP27112", "COMP28112"],
    y2yearcred: 60,
    y2sem1cred: 30,
    y2sem2cred: 30,
    thirdyrfy: [],
    thirdyrs1: [],
    thirdyrs2: [],
  },
};
