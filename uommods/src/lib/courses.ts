import { Course } from './types';

export const courses: Course[] = [
  {
    "code": "COMP10120",
    "credits": 20,
    "semester": "Full year",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Written assignment (inc essay)": 40,
      "Oral assessment/presentation": 40,
      "Set exercise": 20
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 60.0,
        "stdDev": null,
        "n": 272,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 64.5,
        "stdDev": null,
        "n": 255,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 62.0,
        "stdDev": null,
        "n": 230,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 63.1,
        "stdDev": null,
        "n": 485,
        "marks": null
      }
    ],
    "overallmean": 62.4,
    "title": "First Year Team Project",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP11120",
    "credits": 20,
    "semester": "Full year",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 80,
      "Written assignment (inc essay)": 20
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 53.6,
        "stdDev": null,
        "n": 280,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 55.6,
        "stdDev": null,
        "n": 261,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 61.9,
        "stdDev": null,
        "n": 231,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 59.8,
        "stdDev": null,
        "n": 500,
        "marks": null
      }
    ],
    "overallmean": 57.73,
    "title": "Mathematical Techniques for Computer Science",
    "program_ids": [
      "G400"
    ],
    "required_by": [
      "COMP11212",
      "COMP21111",
      "COMP24011",
      "COMP24112",
      "COMP31311",
      "COMP34111",
      "COMP34612",
      "COMP36111",
      "COMP36212",
      "COMP37212"
    ]
  },
  {
    "code": "COMP11212",
    "credits": 10,
    "semester": "Semester 2",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [
      "COMP11120"
    ],
    "assessment": {
      "Written exam": 80,
      "Written assignment (inc essay)": 20
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 67.9,
        "stdDev": null,
        "n": 352,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 69.7,
        "stdDev": null,
        "n": 322,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 71.1,
        "stdDev": null,
        "n": 275,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 66.8,
        "stdDev": null,
        "n": 532,
        "marks": null
      }
    ],
    "overallmean": 68.88,
    "title": "Fundamentals of Computation",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP36111"
    ]
  },
  {
    "code": "COMP12111",
    "credits": 10,
    "semester": "Semester 1",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 50,
      "Practical skills assessment": 50
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 66.7,
        "stdDev": null,
        "n": 274,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 68.8,
        "stdDev": null,
        "n": 254,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 68.8,
        "stdDev": null,
        "n": 222,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 72.8,
        "stdDev": null,
        "n": 459,
        "marks": null
      }
    ],
    "overallmean": 69.28,
    "title": "Fundamentals of Computer Engineering",
    "program_ids": [
      "G400"
    ],
    "required_by": [
      "COMP22111"
    ]
  },
  {
    "code": "COMP13212",
    "credits": 10,
    "semester": "Semester 2",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 80,
      "Practical skills assessment": 20
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 62.0,
        "stdDev": null,
        "n": 286,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 63.0,
        "stdDev": null,
        "n": 257,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 76.7,
        "stdDev": null,
        "n": 228,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 59.3,
        "stdDev": null,
        "n": 493,
        "marks": null
      }
    ],
    "overallmean": 65.25,
    "title": "Data Science",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP24011",
      "COMP24112",
      "COMP34111",
      "COMP34612"
    ]
  },
  {
    "code": "COMP15111",
    "credits": 10,
    "semester": "Semester 1",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 70,
      "Practical skills assessment": 30
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 55.5,
        "stdDev": null,
        "n": 369,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 65.3,
        "stdDev": null,
        "n": 318,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 70.3,
        "stdDev": null,
        "n": 280,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 66.1,
        "stdDev": null,
        "n": 529,
        "marks": null
      }
    ],
    "overallmean": 64.3,
    "title": "Fundamentals of Computer Architecture",
    "program_ids": [
      "G400"
    ],
    "required_by": [
      "COMP22712",
      "COMP25212"
    ]
  },
  {
    "code": "COMP15212",
    "credits": 10,
    "semester": "Semester 2",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 80,
      "Practical skills assessment": 20
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 55.0,
        "stdDev": null,
        "n": 362,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 63.0,
        "stdDev": null,
        "n": 348,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 59.1,
        "stdDev": null,
        "n": 279,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 60.6,
        "stdDev": null,
        "n": 561,
        "marks": null
      }
    ],
    "overallmean": 59.42,
    "title": "Operating Systems",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP28112"
    ]
  },
  {
    "code": "COMP16321",
    "credits": 20,
    "semester": "Semester 1",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [
      "COMP16412"
    ],
    "assessment": {
      "Written exam": 50,
      "Practical skills assessment": 50
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Introduction to Programming 1",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP16412",
      "COMP23311",
      "COMP26020",
      "COMP26120",
      "MATH36160"
    ]
  },
  {
    "code": "COMP16412",
    "credits": 10,
    "semester": "Semester 2",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [
      "COMP16321"
    ],
    "assessment": {
      "Written exam": 50,
      "Practical skills assessment": 50
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Introduction to Programming 2",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP16321",
      "COMP23311",
      "COMP26020",
      "COMP26120",
      "COMP28112"
    ]
  },
  {
    "code": "COMP23311",
    "credits": 10,
    "semester": "Semester 1",
    "level": 2,
    "prerequisites_list": [
      "COMP16321",
      "COMP16412"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 70,
      "Practical skills assessment": 30
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 56.8,
        "stdDev": null,
        "n": 299,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 65.8,
        "stdDev": null,
        "n": 436,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 62.6,
        "stdDev": null,
        "n": 337,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 64.3,
        "stdDev": null,
        "n": 361,
        "marks": null
      }
    ],
    "overallmean": 62.38,
    "title": "Software Engineering 1",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP23412",
      "COMP33312",
      "COMP33511"
    ]
  },
  {
    "code": "COMP23412",
    "credits": 10,
    "semester": "Semester 2",
    "level": 2,
    "prerequisites_list": [
      "COMP23311"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 50,
      "Project output (not diss/n)": 50
    },
    "gradestats": [
      {
        "year": "24/25",
        "mean": 66.5,
        "stdDev": null,
        "n": 273,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 68.6,
        "stdDev": null,
        "n": 340,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 64.1,
        "stdDev": null,
        "n": 286,
        "marks": null
      },
      {
        "year": "21/22",
        "mean": 71.2,
        "stdDev": null,
        "n": 378,
        "marks": null
      }
    ],
    "overallmean": 67.6,
    "title": "Software Engineering 2",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP33312",
      "COMP33511"
    ]
  },
  {
    "code": "COMP26020",
    "credits": 20,
    "semester": "Full year",
    "level": 2,
    "prerequisites_list": [
      "COMP16321",
      "COMP16412"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 70,
      "Written assignment (inc essay)": 30
    },
    "gradestats": [
      {
        "year": "24/25",
        "mean": 62.1,
        "stdDev": null,
        "n": 243,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 62.4,
        "stdDev": null,
        "n": 289,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 59.6,
        "stdDev": null,
        "n": 456,
        "marks": null
      },
      {
        "year": "21/22",
        "mean": 71.4,
        "stdDev": null,
        "n": 352,
        "marks": null
      }
    ],
    "overallmean": 63.9,
    "title": "Programming Languages & Paradigms",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP26120",
    "credits": 20,
    "semester": "Full year",
    "level": 2,
    "prerequisites_list": [
      "COMP16321",
      "COMP16412"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 50,
      "Practical skills assessment": 50
    },
    "gradestats": [
      {
        "year": "24/25",
        "mean": 65.7,
        "stdDev": null,
        "n": 284,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 65.2,
        "stdDev": null,
        "n": 336,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 65.5,
        "stdDev": null,
        "n": 492,
        "marks": null
      },
      {
        "year": "21/22",
        "mean": 71.7,
        "stdDev": null,
        "n": 374,
        "marks": null
      },
    ],
    "overallmean": 70.66,
    "title": "Algorithms and Data Structures",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP36111"
    ]
  },
  {
    "code": "COMP21111",
    "credits": 10,
    "semester": "Semester 1",
    "level": 2,
    "prerequisites_list": [
      "COMP11120",
      "MATH11022",
      "MATH11121"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 50,
      "Written assignment (inc essay)": 50
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 72.3,
        "stdDev": null,
        "n": 62,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 68.1,
        "stdDev": null,
        "n": 136,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 61.8,
        "stdDev": null,
        "n": 49,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 67.6,
        "stdDev": null,
        "n": 115,
        "marks": null
      }
    ],
    "overallmean": 67.45,
    "title": "Logic and Modelling",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP22111",
    "credits": 10,
    "semester": "Semester 1",
    "level": 2,
    "prerequisites_list": [
      "COMP12111"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 50,
      "Practical skills assessment": 50
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 63.8,
        "stdDev": null,
        "n": 208,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 67.9,
        "stdDev": null,
        "n": 325,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 64.3,
        "stdDev": null,
        "n": 235,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 63.5,
        "stdDev": null,
        "n": 302,
        "marks": null
      }
    ],
    "overallmean": 64.88,
    "title": "Processor Microarchitecture",
    "program_ids": [
      "G400"
    ],
    "required_by": [
      "COMP32211"
    ]
  },
  {
    "code": "COMP22712",
    "credits": 10,
    "semester": "Semester 2",
    "level": 2,
    "prerequisites_list": [
      "COMP15111"
    ],
    "corequisites_list": [],
    "assessment": {
      "Practical skills assessment": 100
    },
    "gradestats": [
      {
        "year": "24/25",
        "mean": 66.8,
        "stdDev": null,
        "n": 34,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 73.7,
        "stdDev": null,
        "n": 24,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 68.5,
        "stdDev": null,
        "n": 57,
        "marks": null
      },
      {
        "year": "21/22",
        "mean": 67.1,
        "stdDev": null,
        "n": 40,
        "marks": null
      }
    ],
    "overallmean": 276.1,
    "title": "Microcontrollers",
    "program_ids": [
      "G400"
    ],
    "required_by": []
  },
  {
    "code": "COMP23111",
    "credits": 10,
    "semester": "Semester 1",
    "level": 2,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 30,
      "Practical skills assessment": 70
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 67.7,
        "stdDev": null,
        "n": 273,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 71.1,
        "stdDev": null,
        "n": 475,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 66.3,
        "stdDev": null,
        "n": 337,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 70.7,
        "stdDev": null,
        "n": 380,
        "marks": null
      }
    ],
    "overallmean": 68.95,
    "title": "Database Systems",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP38311"
    ]
  },
  {
    "code": "COMP24011",
    "credits": 10,
    "semester": "Semester 1",
    "level": 2,
    "prerequisites_list": [
      "COMP11120",
      "COMP13212"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 80,
      "Written assignment (inc essay)": 20
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Introduction to AI",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP24112",
      "COMP24412"
    ]
  },
  {
    "code": "COMP24112",
    "credits": 10,
    "semester": "Semester 2",
    "level": 2,
    "prerequisites_list": [
      "COMP11120",
      "COMP13212",
      "MATH11121"
    ],
    "corequisites_list": [
      "COMP24011"
    ],
    "assessment": {
      "Written exam": 70,
      "Practical skills assessment": 30
    },
    "gradestats": [
      {
        "year": "24/25",
        "mean": 65.9,
        "stdDev": null,
        "n": 235,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 65.9,
        "stdDev": null,
        "n": 286,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 60.5,
        "stdDev": null,
        "n": 395,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 65.4,
        "stdDev": null,
        "n": 301,
        "marks": null
      }
    ],
    "overallmean": 64.4,
    "title": "Machine Learning",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP34312",
      "COMP34612",
      "COMP34711"
    ]
  },
  {
    "code": "COMP24412",
    "credits": 10,
    "semester": "Semester 2",
    "level": 2,
    "prerequisites_list": [],
    "corequisites_list": [
      "COMP24011"
    ],
    "assessment": {
      "Written exam": 30,
      "Practical skills assessment": 70
    },
    "gradestats": [
      {
        "year": "24/25",
        "mean": 59.1,
        "stdDev": null,
        "n": 44,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 60.3,
        "stdDev": null,
        "n": 62,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 57.7,
        "stdDev": null,
        "n": 135,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 59.4,
        "stdDev": null,
        "n": 119,
        "marks": null
      }
    ],
    "overallmean": 60.17,
    "title": "Knowledge Based AI",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP25212",
    "credits": 10,
    "semester": "Semester 2",
    "level": 2,
    "prerequisites_list": [
      "COMP15111"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 70,
      "Practical skills assessment": 30
    },
    "gradestats": [
      {
        "year": "24/25",
        "mean": 61.8,
        "stdDev": null,
        "n": 41,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 61.2,
        "stdDev": null,
        "n": 31,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 53.3,
        "stdDev": null,
        "n": 61,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 64.4,
        "stdDev": null,
        "n": 50,
        "marks": null
      }
    ],
    "overallmean": 60.2,
    "title": "System Architecture",
    "program_ids": [
      "G400"
    ],
    "required_by": [
      "COMP35112"
    ]
  },
  {
    "code": "COMP27112",
    "credits": 10,
    "semester": "Semester 2",
    "level": 2,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 70,
      "Practical skills assessment": 30
    },
    "gradestats": [
      {
        "year": "24/25 (Scaled)",
        "mean": 72.4,
        "stdDev": null,
        "n": 179,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 70.5,
        "stdDev": null,
        "n": 225,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 71.6,
        "stdDev": null,
        "n": 332,
        "marks": null
      },
      {
        "year": "21/22",
        "mean": 72.9,
        "stdDev": null,
        "n": 235,
        "marks": null
      }
    ],
    "overallmean": 71.9,
    "title": "Introduction to Visual Computing",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP37111",
      "COMP37212"
    ]
  },
  {
    "code": "COMP28112",
    "credits": 10,
    "semester": "Semester 2",
    "level": 2,
    "prerequisites_list": [
      "COMP16412",
      "COMP15212"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 50,
      "Practical skills assessment": 50
    },
    "gradestats": [
      {
        "year": "24/25",
        "mean": 69.0,
        "stdDev": null,
        "n": 149,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 61.7,
        "stdDev": null,
        "n": 162,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 61.9,
        "stdDev": null,
        "n": 261,
        "marks": null
      },
      {
        "year": "21/22",
        "mean": 71.6,
        "stdDev": null,
        "n": 218,
        "marks": null
      }
    ],
    "overallmean": null,
    "title": "Distributed Systems",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP32412",
      "COMP38311"
    ]
  },
  {
    "code": "COMP30040",
    "credits": 40,
    "semester": "Full year",
    "level": 3,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {},
    "gradestats": [
      {
        "year": "23/24",
        "mean": 53.8,
        "stdDev": null,
        "n": 63,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 58.7,
        "stdDev": null,
        "n": 113,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 63.0,
        "stdDev": null,
        "n": 63,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 56.2,
        "stdDev": null,
        "n": 120,
        "marks": null
      },
      {
        "year": "21/22",
        "mean": 61.7,
        "stdDev": null,
        "n": 102,
        "marks": null
      }
    ],
    "overallmean": 58.68,
    "title": "Third Year Project Laboratory",
    "program_ids": [
      "G400"
    ],
    "required_by": []
  },
  {
    "code": "COMP31311",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "MATH10111",
      "COMP11120",
      "MATH11121"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 80,
      "Practical skills assessment": 20
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 64.5,
        "stdDev": null,
        "n": 185,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 67.9,
        "stdDev": null,
        "n": 234,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 65.7,
        "stdDev": null,
        "n": 307,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 72.7,
        "stdDev": null,
        "n": 185,
        "marks": null
      }
    ],
    "overallmean": 67.7,
    "title": "Giving Meaning to Programs",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP32211",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "COMP22111"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 50,
      "Practical skills assessment": 50
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 71.4,
        "stdDev": null,
        "n": 247,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 72.3,
        "stdDev": null,
        "n": 215,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 69.1,
        "stdDev": null,
        "n": 299,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 71.2,
        "stdDev": null,
        "n": 198,
        "marks": null
      }
    ],
    "overallmean": 71.0,
    "title": "Implementing System-on-Chip Designs",
    "program_ids": [
      "G400"
    ],
    "required_by": []
  },
  {
    "code": "COMP32412",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "COMP28112"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 59.1,
        "stdDev": null,
        "n": 81,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 62.3,
        "stdDev": null,
        "n": 90,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 54.5,
        "stdDev": null,
        "n": 146,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 66.5,
        "stdDev": null,
        "n": 91,
        "marks": null
      }
    ],
    "overallmean": 60.6,
    "title": "The Internet of Things:  Architectures and Applications",
    "program_ids": [
      "G400"
    ],
    "required_by": []
  },
  {
    "code": "COMP33312",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "COMP23311",
      "COMP23412"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 65.6,
        "stdDev": null,
        "n": 234,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 68.2,
        "stdDev": null,
        "n": 205,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 63.6,
        "stdDev": null,
        "n": 313,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 69.4,
        "stdDev": null,
        "n": 97,
        "marks": null
      }
    ],
    "overallmean": 66.7,
    "title": "Agile Software Pipelines",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP33511",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "COMP23311",
      "COMP23412"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 50,
      "Written assignment (inc essay)": 50
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 60.5,
        "stdDev": null,
        "n": 57,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 62.0,
        "stdDev": null,
        "n": 77,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 57.3,
        "stdDev": null,
        "n": 104,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 56.2,
        "stdDev": null,
        "n": 60,
        "marks": null
      }
    ],
    "overallmean": 59.0,
    "title": "User Experience",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP34111",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "COMP11120",
      "COMP13212",
      "MATH11121",
      "MATH10111"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 50,
      "Written assignment (inc essay)": 50
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 62.2,
        "stdDev": null,
        "n": 230,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 61.8,
        "stdDev": null,
        "n": 175,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 60.2,
        "stdDev": null,
        "n": 243,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 62.7,
        "stdDev": null,
        "n": 156,
        "marks": null
      }
    ],
    "overallmean": 61.73,
    "title": "AI and Games",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP34612"
    ]
  },
  {
    "code": "COMP34212",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 70,
      "Written assignment (inc essay)": 30
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 76.0,
        "stdDev": null,
        "n": 69,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 67.1,
        "stdDev": null,
        "n": 128,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 69.9,
        "stdDev": null,
        "n": 69,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 74.5,
        "stdDev": null,
        "n": 80,
        "marks": null
      },
      {
        "year": "21/22",
        "mean": 0.0,
        "stdDev": null,
        "n": 0,
        "marks": null
      }
    ],
    "overallmean": 57.5,
    "title": "Cognitive Robotics",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP34312",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "COMP24112"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 80,
      "Written assignment (inc essay)": 20
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 74.6,
        "stdDev": null,
        "n": 130,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 71.7,
        "stdDev": null,
        "n": 96,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 69.7,
        "stdDev": null,
        "n": 130,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 0.0,
        "stdDev": null,
        "n": 0,
        "marks": null
      },
      {
        "year": "21/22",
        "mean": 71.9,
        "stdDev": null,
        "n": 81,
        "marks": null
      }
    ],
    "overallmean": 57.58,
    "title": "Mathematical Topics in Machine Learning",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP34612",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "COMP11120",
      "COMP13212",
      "COMP24112",
      "MATH11121"
    ],
    "corequisites_list": [
      "COMP34111"
    ],
    "assessment": {
      "Written exam": 50,
      "Written assignment (inc essay)": 50
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 74.4,
        "stdDev": null,
        "n": 172,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 69.9,
        "stdDev": null,
        "n": 98,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 67.8,
        "stdDev": null,
        "n": 160,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 70.7,
        "stdDev": null,
        "n": 89,
        "marks": null
      }
    ],
    "overallmean": 70.7,
    "title": "Computational Game Theory",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP34711",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "COMP24112"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 70,
      "Written assignment (inc essay)": 30
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 58.5,
        "stdDev": null,
        "n": 180,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 69.3,
        "stdDev": null,
        "n": 262,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 63.6,
        "stdDev": null,
        "n": 180,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 71.0,
        "stdDev": null,
        "n": 190,
        "marks": null
      },
      {
        "year": "21/22",
        "mean": 68.9,
        "stdDev": null,
        "n": 146,
        "marks": null
      }
    ],
    "overallmean": 66.26,
    "title": "Natural Language Processing",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": [
      "COMP34812"
    ]
  },
  {
    "code": "COMP34812",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "COMP34711"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 70,
      "Practical skills assessment": 30
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 71.8,
        "stdDev": null,
        "n": 33,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 62.3,
        "stdDev": null,
        "n": 28,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 73.7,
        "stdDev": null,
        "n": 39,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 69.6,
        "stdDev": null,
        "n": 30,
        "marks": null
      }
    ],
    "overallmean": 69.35,
    "title": "Natural Language Understanding",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP35112",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "COMP25212"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 70,
      "Written assignment (inc essay)": 30
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 62.5,
        "stdDev": null,
        "n": 60,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 60.3,
        "stdDev": null,
        "n": 117,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 58.2,
        "stdDev": null,
        "n": 34,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 64.8,
        "stdDev": null,
        "n": 70,
        "marks": null
      }
    ],
    "overallmean": 61.45,
    "title": "Chip Multiprocessors",
    "program_ids": [
      "G400"
    ],
    "required_by": []
  },
  {
    "code": "COMP36111",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "COMP11120",
      "COMP11212",
      "COMP26120",
      "MATH11121",
      "MATH10111",
      "MATH10101"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 80,
      "Set exercise": 20
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 64.2,
        "stdDev": null,
        "n": 126,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 65.8,
        "stdDev": null,
        "n": 147,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 68.8,
        "stdDev": null,
        "n": 174,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 65.4,
        "stdDev": null,
        "n": 71,
        "marks": null
      }
    ],
    "overallmean": 66.05,
    "title": "Algorithms and Complexity",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP36212",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "COMP11120"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written assignment (inc essay)": 100
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 66.7,
        "stdDev": null,
        "n": 169,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 67.9,
        "stdDev": null,
        "n": 152,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 66.3,
        "stdDev": null,
        "n": 243,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 70.9,
        "stdDev": null,
        "n": 84,
        "marks": null
      }
    ],
    "overallmean": 67.95,
    "title": "Mathematical Systems and Computation",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP37111",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "COMP27112"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Graphics & Virtual Environments",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP37212",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "COMP27112",
      "COMP11120"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 70,
      "Written assignment (inc essay)": 30
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 61.9,
        "stdDev": null,
        "n": 62,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 59.8,
        "stdDev": null,
        "n": 118,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 55.8,
        "stdDev": null,
        "n": 129,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 63.2,
        "stdDev": null,
        "n": 115,
        "marks": null
      }
    ],
    "overallmean": 60.17,
    "title": "Computer Vision",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP38311",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "COMP23111",
      "COMP28112"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": [
      {
        "year": "23/24",
        "mean": 54.1,
        "stdDev": null,
        "n": 44,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 59.9,
        "stdDev": null,
        "n": 35,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 59.9,
        "stdDev": null,
        "n": 49,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 56.1,
        "stdDev": null,
        "n": 26,
        "marks": null
      }
    ],
    "overallmean": 57.5,
    "title": "Advanced Distributed Systems",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "EEEN31001",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {},
    "gradestats": null,
    "overallmean": null,
    "title": "Independent Study and Technical Explanations",
    "program_ids": [
      "G400"
    ],
    "required_by": []
  },
  {
    "code": "MCEL30031",
    "credits": 10,
    "semester": "Variable teaching patterns",
    "level": 3,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {},
    "gradestats": null,
    "overallmean": null,
    "title": "Enterprise Management for Computer Scientists",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MCEL30032",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {},
    "gradestats": null,
    "overallmean": null,
    "title": "Managing Finance in Enterprises for Computer Scientists",
    "program_ids": [
      "G400",
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH11022",
    "credits": 20,
    "semester": "Semester 2",
    "level": 1,
    "prerequisites_list": [
      "MATH11121"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Linear Algebra",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "COMP21111",
      "MATH21120",
      "MATH24411",
      "MATH27711",
      "MATH32062",
      "MATH32091",
      "MATH35031",
      "MATH38171"
    ]
  },
  {
    "code": "MATH11121",
    "credits": 20,
    "semester": "Semester 1",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Mathematical Foundations & Analysis",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "COMP21111",
      "COMP24112",
      "COMP31311",
      "COMP34111",
      "COMP34612",
      "COMP36111",
      "MATH11022",
      "MATH21120",
      "MATH24411",
      "MATH29141",
      "MATH31010",
      "MATH32072",
      "MATH34011",
      "MATH37021"
    ]
  },
  {
    "code": "MATH11711",
    "credits": 10,
    "semester": "Semester 1",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Other": 10,
      "Written exam": 90
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Probability I",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "MATH27711",
      "MATH27712",
      "MATH27720",
      "MATH35031"
    ]
  },
  {
    "code": "MATH11412",
    "credits": 10,
    "semester": "Semester 2",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Introduction to Ordinary Differential Equations",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "MATH20521",
      "MATH24420",
      "MATH32091",
      "MATH35031",
      "MATH35041"
    ]
  },
  {
    "code": "MATH11712",
    "credits": 10,
    "semester": "Semester 2",
    "level": 1,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Other": 10,
      "Written exam": 80,
      "Report": 10
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Statistics I",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "MATH27711",
      "MATH27720"
    ]
  },
  {
    "code": "MATH21120",
    "credits": 20,
    "semester": "Full year",
    "level": 2,
    "prerequisites_list": [
      "MATH11022",
      "MATH11121"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Groups and Geometry",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "MATH21112",
      "MATH31061",
      "MATH31072",
      "MATH32010",
      "MATH32031",
      "MATH32052",
      "MATH32072"
    ]
  },
  {
    "code": "MATH20521",
    "credits": 10,
    "semester": "Semester 1",
    "level": 2,
    "prerequisites_list": [
      "MATH11411",
      "MATH11422",
      "MATH11412"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 40,
      "Written exam": 60
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Principles of Mathematical Modelling",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH20912",
    "credits": 10,
    "semester": "Semester 2",
    "level": 2,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Introduction to Financial Mathematics",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "MATH39032"
    ]
  },
  {
    "code": "MATH21111",
    "credits": 10,
    "semester": "Semester 1",
    "level": 2,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Metric Spaces",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "MATH31010"
    ]
  },
  {
    "code": "MATH21112",
    "credits": 10,
    "semester": "Semester 2",
    "level": 2,
    "prerequisites_list": [],
    "corequisites_list": [
      "MATH21120"
    ],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Rings & Fields",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "MATH32010",
      "MATH32062",
      "MATH32072"
    ]
  },
  {
    "code": "MATH24411",
    "credits": 10,
    "semester": "Semester 1",
    "level": 2,
    "prerequisites_list": [
      "MATH11022",
      "MATH11121"
    ],
    "corequisites_list": [
      "MATH24420"
    ],
    "assessment": {
      "Other": 0,
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Numerical Analysis 1",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "MATH36022",
      "MATH36160"
    ]
  },
  {
    "code": "MATH24412",
    "credits": 10,
    "semester": "Semester 2",
    "level": 2,
    "prerequisites_list": [],
    "corequisites_list": [
      "MATH24420"
    ],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Fluid Mechanics",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH24420",
    "credits": 20,
    "semester": "Full year",
    "level": 2,
    "prerequisites_list": [
      "MATH11411",
      "MATH11422",
      "MATH11412"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 80,
      "Portfolio": 20
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Partial Differential Equations & Vector Calculus",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "MATH24411",
      "MATH24412",
      "MATH34011",
      "MATH35012",
      "MATH35020",
      "MATH35041",
      "MATH35062",
      "MATH39032"
    ]
  },
  {
    "code": "MATH27711",
    "credits": 10,
    "semester": "Semester 1",
    "level": 2,
    "prerequisites_list": [
      "MATH11022",
      "MATH11711",
      "MATH11712"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Linear Regression Models",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "MATH38032",
      "MATH38171"
    ]
  },
  {
    "code": "MATH27712",
    "credits": 10,
    "semester": "Semester 2",
    "level": 2,
    "prerequisites_list": [
      "MATH11711"
    ],
    "corequisites_list": [
      "MATH27720"
    ],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Stochastic Processes",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH27720",
    "credits": 20,
    "semester": "Full year",
    "level": 2,
    "prerequisites_list": [
      "MATH11711",
      "MATH11712"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Probability and Statistics 2",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "MATH27712",
      "MATH37002",
      "MATH37011",
      "MATH37021",
      "MATH38032",
      "MATH38072",
      "MATH38161",
      "MATH38171"
    ]
  },
  {
    "code": "COMP30030",
    "credits": 30,
    "semester": "Full year",
    "level": 3,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {},
    "gradestats": [
      {
        "year": "23/24",
        "mean": 70.0,
        "stdDev": null,
        "n": 278,
        "marks": null
      },
      {
        "year": "23/24",
        "mean": 68.5,
        "stdDev": null,
        "n": 305,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 67.8,
        "stdDev": null,
        "n": 408,
        "marks": null
      },
      {
        "year": "22/23",
        "mean": 71.5,
        "stdDev": null,
        "n": 229,
        "marks": null
      }
    ],
    "overallmean": 69.45,
    "title": "Third Year Project Laboratory",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "COMP39112",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Quantum Computing",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH29141",
    "credits": 10,
    "semester": "Semester 1",
    "level": 2,
    "prerequisites_list": [
      "MATH11121"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "2P1: Complex Analysis",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH30002",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Other": 80,
      "Oral assessment/presentation": 20
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Mathematics Education",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH31010",
    "credits": 20,
    "semester": "Full year",
    "level": 3,
    "prerequisites_list": [
      "MATH21111",
      "MATH11121"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Topology and Analysis",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH31061",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "MATH21120",
      "MATH20111",
      "MATH20101"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Analysis and Geometry in Affine Space",
    "program_ids": [
      "GG14"
    ],
    "required_by": [
      "MATH31072"
    ]
  },
  {
    "code": "MATH31072",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "MATH31061",
      "MATH21120",
      "MATH20132"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 80,
      "Written assignment (inc essay)": 20
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Differential Geometry of Curves and Surfaces",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH32010",
    "credits": 20,
    "semester": "Full year",
    "level": 3,
    "prerequisites_list": [
      "MATH21120",
      "MATH21112",
      "MATH20201",
      "MATH20212"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Advanced Algebra",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH32031",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "MATH21120",
      "MATH20201"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Coding Theory",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH32052",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "MATH21120"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Hyperbolic Geometry",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH32062",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "MATH11022",
      "MATH21112",
      "MATH10202",
      "MATH10212",
      "MATH20212"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Algebraic Geometry",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH32072",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "MATH11121",
      "MATH21120",
      "MATH21112",
      "MATH20201"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Number Theory",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH32091",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "MATH11022",
      "MATH11422",
      "MATH11412"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 30,
      "Written exam": 70
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Combinatorics and Graph Theory",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH33021",
    "credits": 20,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Mathematical Logic",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH34011",
    "credits": 20,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "MATH11121",
      "MATH24420",
      "PHYS20171"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 10,
      "Written exam": 90
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Complex Analysis&Applications",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH35012",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "MATH24420",
      "PHYS20171",
      "MATH20401",
      "MATH20411"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Wave Motion",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH35020",
    "credits": 20,
    "semester": "Full year",
    "level": 3,
    "prerequisites_list": [
      "PHYS20171",
      "MATH24420",
      "MATH20401"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 10,
      "Written exam": 80,
      "Written assignment (inc essay)": 10
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Elasticity and Viscous Fluid Dynamics",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH35031",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "MATH11022",
      "MATH11411",
      "MATH11711",
      "MATH11422",
      "MATH11412",
      "PHYS10280"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Mathematical Biology",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH35041",
    "credits": 20,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "MATH11422",
      "MATH11412",
      "MATH24420",
      "PHYS20171",
      "MATH10222",
      "MATH10232",
      "MATH20401"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 80,
      "Report": 20
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Methods of Applied Mathematics",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH35062",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "MATH24420",
      "PHYS20171",
      "MATH20401",
      "MATH20411"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Report": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Mathematics of a Finite Planet",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH36022",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "MATH24411"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Numerical Analysis 2",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH36031",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [],
    "corequisites_list": [],
    "assessment": {},
    "gradestats": null,
    "overallmean": null,
    "title": "Problem Solving by Computer",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH36160",
    "credits": 20,
    "semester": "Full year",
    "level": 3,
    "prerequisites_list": [
      "MATH24411",
      "PHYS20161",
      "MATH20621",
      "COMP16321"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 10,
      "Written exam": 45,
      "Written assignment (inc essay)": 45
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Mathematics and Applications of Machine Learning",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH37002",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "MATH27720",
      "MATH20701"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Martingales with Applications to Finance",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH37011",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "MATH27720",
      "MATH20701"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Markov Processes",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH37021",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "MATH11121",
      "MATH27720",
      "MATH20101",
      "MATH20701"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Foundations of Modern Probability",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH38032",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "MATH27720",
      "MATH27711"
    ],
    "corequisites_list": [],
    "assessment": {},
    "gradestats": null,
    "overallmean": null,
    "title": "Time Series Analysis",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH38072",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "MATH27720"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Medical Statistics",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH38161",
    "credits": 10,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "MATH27720"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 30,
      "Written exam": 70
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Multivariate Statistics and Machine Learning",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH38171",
    "credits": 20,
    "semester": "Semester 1",
    "level": 3,
    "prerequisites_list": [
      "MATH11022",
      "MATH27720",
      "MATH27711",
      "MATH10202",
      "MATH10212",
      "MATH20701",
      "MATH20802"
    ],
    "corequisites_list": [],
    "assessment": {
      "Other": 20,
      "Written exam": 80
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Generalised Linear Models",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  },
  {
    "code": "MATH39032",
    "credits": 10,
    "semester": "Semester 2",
    "level": 3,
    "prerequisites_list": [
      "MATH20912",
      "MATH24420",
      "PHYS20171",
      "MATH20401",
      "MATH20411"
    ],
    "corequisites_list": [],
    "assessment": {
      "Written exam": 100
    },
    "gradestats": null,
    "overallmean": null,
    "title": "Mathematical Modelling in Finance",
    "program_ids": [
      "GG14"
    ],
    "required_by": []
  }
];
