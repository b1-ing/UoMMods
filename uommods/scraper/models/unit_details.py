from pydantic import BaseModel, Field
from typing import Literal


class Assessment(BaseModel):
    """
    A normalized assessment component for a course.
    """

    type: Literal[
        "Exam",
        "Coursework",
        "Project",
        "Practical",
        "Presentation",
        "Other",
    ]

    weight: float = Field(
        description="Assessment weighting expressed as a decimal (e.g. 0.5 = 50%)."
    )


class UnitDetails(BaseModel):
    """
    Structured information extracted from a university course page.
    """

    code: str

    title: str = ""

    credits: int = 0

    faculty: str = ""

    semester: str = ""

    level: int = 0

    description: str = ""

    freechoice: bool = False

    prerequisites: list[str] = Field(default_factory=list)

    corequisites: list[str] = Field(default_factory=list)

    assessments: list[Assessment] = Field(default_factory=list)