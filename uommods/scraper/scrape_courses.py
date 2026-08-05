import os
import traceback
import requests
import pandas as pd

from dotenv import load_dotenv
from bs4 import BeautifulSoup
from supabase import Client, create_client

from agents.course_extraction_agent import CourseExtractionAgent
from models.unit_details import UnitDetails

# -------------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------------

load_dotenv(".env")

BASE_PAGE = os.getenv(
    "BASE_PAGE",
    "https://www.manchester.ac.uk/study/undergraduate/courses/2026/03389/beng-mechanical-engineering/",
)

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

SUPABASE_URL = (
    os.getenv("SUPABASE_URL")
    or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
)

SUPABASE_KEY = (
    os.getenv("SUPABASE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
)

USE_LOCAL_MODEL = os.getenv(
    "USE_LOCAL_MODEL",
    "false",
).lower() == "true"


# -------------------------------------------------------------------------
# Supabase
# -------------------------------------------------------------------------

if SUPABASE_URL and SUPABASE_KEY:

    supabase: Client = create_client(
        SUPABASE_URL,
        SUPABASE_KEY,
    )

    print(f"✅ Supabase initialised ({SUPABASE_URL})")

else:

    supabase = None

    print(
        "⚠️ No Supabase credentials found. "
        "Database writes will be skipped."
    )


# -------------------------------------------------------------------------
# LLM Agent
# -------------------------------------------------------------------------

extractor = CourseExtractionAgent(
    use_local=True,
)


# -------------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------------

def parse_program_information(
    soup: BeautifulSoup,
) -> tuple[str, str]:
    """
    Returns

    (program_title, ucas_code)
    """

    title = ""

    ucas = ""

    h1 = soup.find("h1")

    if h1:

        title = h1.get_text(strip=True)

    for span in soup.find_all("span"):

        text = span.get_text()

        if "UCAS course code" in text:

            strong = span.find("strong")

            if strong:

                ucas = strong.get_text(strip=True)

            break

    return title, ucas


def build_detail_url(
    code: str,
    entry_year: int,
) -> str:

    detail_year = entry_year

    return (
        "https://assets-dev.manchester.ac.uk/"
        f"cpip/phase-2/ug/{detail_year}/unit/"
        f"?unitcode={code}"
    )


def get_course_unit_links(
    main_url: str,
) -> tuple[str, str, list[dict]]:

    response = requests.get(
        main_url,
        headers=HEADERS,
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser",
    )

    program_title, course_code = parse_program_information(
        soup,
    )

    year = int(
        main_url.split("/courses/")[1].split("/")[0]
    )

    units = []

    rows = soup.select(
        "table.course-units tbody tr"
    )

    for row in rows:

        cols = row.find_all("td")

        if len(cols) != 4:
            continue

        button = row.find(
            "button",
            class_="open-unit-details",
        )

        if button is None:
            continue

        code = (
            button.get("data-contentid")
            or cols[1].get_text(strip=True)
        )

        units.append(
            {
                "title": button.get_text(strip=True),
                "code": code,
                "mandatory": cols[3].get_text(strip=True),
                "url": build_detail_url(
                    code,
                    year,
                ),
            }
        )

    return (
        program_title,
        course_code,
        units,
    )


def fetch_unit_html(
    url: str,
) -> str | None:
    """
    Downloads a unit page.

    Automatically retries using the previous academic
    year because Manchester occasionally stores unit
    pages there.
    """

    response = requests.get(
        url,
        headers=HEADERS,
    )

    if response.status_code == 200:

        return response.text

    previous = url.replace(
        "/ug/2026/",
        "/ug/2025/",
    )

    response = requests.get(
        previous,
        headers=HEADERS,
    )

    if response.status_code == 200:

        return response.text

    print(
        f"⚠️ Could not fetch {url}"
    )

    return None


def insert_to_supabase(
    record: dict,
    table: str,
    conflict_column: str | None = None,
) -> bool:

    if supabase is None:
        return False

    try:

        if conflict_column:

            supabase.table(table).upsert(
                record,
                on_conflict=conflict_column,
            ).execute()

        else:

            supabase.table(table).insert(
                record,
            ).execute()

        return True

    except Exception as exc:

        print(
            f"❌ {table}: {exc}"
        )

        return False


def assessment_rows(
    course: UnitDetails,
) -> list[dict]:

    rows = []

    for assessment in course.assessments:

        rows.append(
            {
                "course_code": course.code,
                "type": assessment.type,
                "weight": assessment.weight,
            }
        )

    return rows


def upsert_course(
    course: dict,
    program_code: str,
):

    tbl_courses = f"{program_code}_courses"

    tbl_assessments = f"{program_code}_assessments"

    # ---------------------------------------------------------
    # Global courses table
    # ---------------------------------------------------------

    insert_to_supabase(
        {
            "code": course["code"],
            "title": course["title"],
            "credits": course["credits"],
            "level": course["level"],
            "semester": course["semester"],
            "faculty": course["faculty"],
            "freechoice": course["freechoice"],
            "description": course["description"],
            "prerequisites_list": course["prerequisites_list"],
            "corequisites_list": course["corequisites_list"],
            "required_by": course.get("required_by"),
            "url": course["url"],
        },
        "courses",
        conflict_column="code",
    )

    # ---------------------------------------------------------
    # Program-specific table
    # ---------------------------------------------------------

    insert_to_supabase(
        {
            "code": course["code"],
            "title": course["title"],
            "credits": course["credits"],
            "level": course["level"],
            "semester": course["semester"],
            "faculty": course["faculty"],
            "freechoice": course["freechoice"],
            "description": course["description"],
            "mandatory": course["mandatory"],
            "required_by": course.get("required_by"),
            "corequisites_list": course["corequisites_list"],
            "prerequisites_list": course["prerequisites_list"],
            "url": course["url"],
            "program_id": program_code,
        },
        tbl_courses,
        conflict_column="code",
    )

    # ---------------------------------------------------------
    # Assessments
    # ---------------------------------------------------------

    try:
        supabase.table(tbl_assessments)\
            .delete()\
            .eq("course_code", course["code"])\
            .execute()
    except Exception:
        pass

    for assessment in course["assessment_data"]:

        insert_to_supabase(
            assessment,
            tbl_assessments,
        )
# -------------------------------------------------------------------------
# Extraction
# -------------------------------------------------------------------------
def fetch_and_extract_units(
    units: list[dict],
    course_code: str,
    batch_size: int = 2,
) -> list[dict]:

    compiled_units = []

    for unit in units:

        print(f"Scraping {unit['code']} — {unit['title']}")

        html = fetch_unit_html(unit["url"])

        if html is None:
            continue

        try:

            extracted: UnitDetails = extractor.extract(html)

        except Exception:

            traceback.print_exc()

            print(f"⚠️ Failed to extract {unit['code']}")

            continue

        course = {
            "code": extracted.code,
            "title": extracted.title or unit["title"],
            "credits": extracted.credits,
            "level": str(extracted.level),
            "semester": extracted.semester,
            "faculty": extracted.faculty,
            "freechoice": extracted.freechoice,
            "description": extracted.description,
            "mandatory": unit["mandatory"],
            "url": unit["url"],
            "prerequisites_list": ",".join(extracted.prerequisites),
            "corequisites_list": ",".join(extracted.corequisites),
            "assessment_data": [
                {
                    "course_code": extracted.code,
                    "type": assessment.type,
                    "weight": assessment.weight,
                }
                for assessment in extracted.assessments
            ],
        }

        compiled_units.append(course)

        # ---------------------------------------------------------
        # Upsert every batch_size courses
        # ---------------------------------------------------------

        if len(compiled_units) % batch_size == 0:

            print(f"\n💾 Saving batch of {batch_size} courses...\n")

            for c in compiled_units[-batch_size:]:
                upsert_course(
                            c,
                            course_code,
                        )

    return compiled_units
# -------------------------------------------------------------------------
# Dependency Graph
# -------------------------------------------------------------------------

def compute_required_by(
    units: list[dict],
) -> list[dict]:
    """
    Computes the reverse prerequisite relationships.

    Example

    COMP24412
        prerequisite of
    COMP30040

    becomes

    COMP24412.required_by = COMP30040
    """

    code_map = {
        course["code"]: course
        for course in units
    }

    for course in units:
        course["required_by"] = []

    for course in units:

        prerequisites = [
            x.strip()
            for x in (
                course.get("prerequisites_list", "")
            ).split(",")
            if x.strip()
        ]

        corequisites = [
            x.strip()
            for x in (
                course.get("corequisites_list", "")
            ).split(",")
            if x.strip()
        ]

        for dependency in prerequisites + corequisites:

            if dependency not in code_map:
                continue

            code_map[dependency]["required_by"].append(
                course["code"]
            )

    for course in units:

        course["required_by"] = ",".join(
            sorted(course["required_by"])
        ) or None

    return units


# -------------------------------------------------------------------------
# Scrape Program
# -------------------------------------------------------------------------

def scrape_program():

    print(
        f"Fetching course units from\n{BASE_PAGE}\n"
    )

    (
        program_title,
        course_code,
        units,
    ) = get_course_unit_links(
        BASE_PAGE,
    )

    print(
        f"Found {len(units)} units.\n"
    )

    compiled_units = fetch_and_extract_units(
        units,
        course_code
    )

    compiled_units = compute_required_by(
        compiled_units,
    )

    return (
        program_title,
        course_code,
        compiled_units,
    )
# -------------------------------------------------------------------------
# Database + CSV
# -------------------------------------------------------------------------

def save_program(
    program_title: str,
    course_code: str,
    compiled_units: list[dict],
):

    # -------------------------------------------------------------
    # Credits by year
    # -------------------------------------------------------------

    credits = {
        "1": 0,
        "2": 0,
        "3": 0,
    }

    for course in compiled_units:

        level = str(course["level"])

        credits[level] += course["credits"]

    # -------------------------------------------------------------
    # Semester buckets
    # -------------------------------------------------------------

    buckets = {
        "firstyrfy": [],
        "firstyrs1comp": [],
        "firstyrs1op": [],
        "firstyrs2comp": [],
        "firstyrs2op": [],

        "secondyrfy": [],
        "secondyrs1comp": [],
        "secondyrs1op": [],
        "secondyrs2comp": [],
        "secondyrs2op": [],

        "thirdyrfy": [],
        "thirdyrs1comp": [],
        "thirdyrs1op": [],
        "thirdyrs2comp": [],
        "thirdyrs2op": [],
    }

    for course in compiled_units:

        level = str(course["level"])

        semester = course["semester"]

        mandatory = course["mandatory"] == "Mandatory"

        code = course["code"]

        if level == "1":

            if semester == "Full year":
                buckets["firstyrfy"].append(code)

            elif semester == "Semester 1":

                if mandatory:
                    buckets["firstyrs1comp"].append(code)
                else:
                    buckets["firstyrs1op"].append(code)

            elif semester == "Semester 2":

                if mandatory:
                    buckets["firstyrs2comp"].append(code)
                else:
                    buckets["firstyrs2op"].append(code)

        elif level == "2":

            if semester == "Full year":
                buckets["secondyrfy"].append(code)

            elif semester == "Semester 1":

                if mandatory:
                    buckets["secondyrs1comp"].append(code)
                else:
                    buckets["secondyrs1op"].append(code)

            elif semester == "Semester 2":

                if mandatory:
                    buckets["secondyrs2comp"].append(code)
                else:
                    buckets["secondyrs2op"].append(code)

        elif level == "3":

            if semester == "Full year":
                buckets["thirdyrfy"].append(code)

            elif semester == "Semester 1":

                if mandatory:
                    buckets["thirdyrs1comp"].append(code)
                else:
                    buckets["thirdyrs1op"].append(code)

            elif semester == "Semester 2":

                if mandatory:
                    buckets["thirdyrs2comp"].append(code)
                else:
                    buckets["thirdyrs2op"].append(code)

    # -------------------------------------------------------------
    # Program record
    # -------------------------------------------------------------

    program_record = {

        "program_id": course_code,

        "title": program_title,

        "credits_year1": credits["1"],
        "credits_year2": credits["2"],
        "credits_year3": credits["3"],

        **buckets,
    }

    insert_to_supabase(
        program_record,
        "programs",
        conflict_column="program_id",
    )

    # -------------------------------------------------------------
    # Dynamic tables
    # -------------------------------------------------------------

    tbl_courses = f"{course_code}_courses"

    tbl_assessments = f"{course_code}_assessments"

    course_rows = []

    assessment_rows = []

    for course in compiled_units:

        course_rows.append({

            "code": course["code"],
            "title": course["title"],
            "credits": course["credits"],
            "level": course["level"],
            "semester": course["semester"],
            "faculty": course["faculty"],
            "freechoice": course["freechoice"],
            "description": course["description"],
            "prerequisites_list": course["prerequisites_list"],
            "corequisites_list": course["corequisites_list"],
            "required_by": course["required_by"],
            "url": course["url"],
        })

        assessment_rows.extend(
            course["assessment_data"]
        )

    # -------------------------------------------------------------
    # Courses
    # -------------------------------------------------------------

    print(
        f"Upserting {len(course_rows)} courses..."
    )

    for row in course_rows:

        insert_to_supabase(
            row,
            "courses",
            conflict_column="code",
        )

        insert_to_supabase(
            {
                "course_code": row["code"],
                "program_id": course_code,
            },
            tbl_courses,
            conflict_column="course_code",
        )

    # -------------------------------------------------------------
    # Assessments
    # -------------------------------------------------------------

    try:

        codes = list({

            row["course_code"]

            for row in assessment_rows

        })

        supabase.table(
            tbl_assessments
        ).delete().in_(

            "course_code",

            codes,

        ).execute()

    except Exception:

        pass

    print(
        f"Inserting {len(assessment_rows)} assessments..."
    )

    for row in assessment_rows:

        insert_to_supabase(
            row,
            tbl_assessments,
        )

    # -------------------------------------------------------------
    # CSV
    # -------------------------------------------------------------

    pd.DataFrame(
        course_rows
    ).to_csv(
        f"{course_code}_courses.csv",
        index=False,
    )

    pd.DataFrame(
        assessment_rows
    ).to_csv(
        f"{course_code}_assessments.csv",
        index=False,
    )

    print(
        f"\n✅ Saved {len(course_rows)} courses."
    )

    # -------------------------------------------------------------
    # Cache
    # -------------------------------------------------------------

    home = os.getenv(
        "APP_HOME_URL",
        "",
    )

    if home:

        try:

            requests.put(
                home.rstrip("/")
                + "/api/courses",
                timeout=3,
            )

            print(
                "Cache invalidated."
            )

        except Exception:

            pass


def main():

    (
        program_title,
        course_code,
        compiled_units,
    ) = scrape_program()

    save_program(
        program_title,
        course_code,
        compiled_units,
    )


if __name__ == "__main__":
    main()