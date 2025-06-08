// programs.ts

export type Program = {
  code: string;
  title: string;
  firstyrfy: string[];
  firstyrs1: string[];
  firstyrs2: string[];
  secondyrfy: string[];
  secondyrs1comp: string[];
  secondyrs1op: string[];
  secondyrs2comp: string[];
  secondyrs2op: string[];
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
    secondyrfy: ["COMP26120", "COMP26020"],
    secondyrs1comp: ["COMP23311"],
    secondyrs1op: ["COMP21111", "COMP22111", "COMP24011", "COMP23111"],
    secondyrs2comp: ["COMP23412"],
    secondyrs2op: ["COMP22712", "COMP24112", "COMP24412", "COMP25212", "COMP27112", "COMP28112"],
    thirdyrfy: [],
    thirdyrs1: [],
    thirdyrs2: [],
  },
};
