"""
UoMMods course scraper — refactored.

Changes from original:
  - assessment_types and schedule_types lookup tables removed;
    assessment type is stored as a normalised cluster string directly
    in course_assessments (type column).
  - Single course_assessments insert per course (no separate lookup table upsert).
  - ASSESSMENT_CLUSTER_MAP maps every raw UoM assessment name to one of:
      Exam | Coursework | Project | Practical | Presentation | Other
"""

import re
import traceback
import requests
from bs4 import BeautifulSoup
import pandas as pd
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# ----------- CONFIG -----------

load_dotenv(".env")

BASE_PAGE = os.getenv(
    "BASE_PAGE",
    "https://www.manchester.ac.uk/study/undergraduate/courses/2025/00560/bsc-computer-science/course-details/",
)
HEADERS = {"User-Agent": "Mozilla/5.0"}

SUPABASE_URL = (
    os.getenv("SUPABASE_URL")
    or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
)
SUPABASE_KEY = (
    os.getenv("SUPABASE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
)

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"✅ Supabase client initialised ({SUPABASE_URL})")
else:
    supabase = None
    print("⚠️  No Supabase credentials found — DB writes will be skipped. "
          "Set SUPABASE_URL and SUPABASE_KEY (or SUPABASE_ANON_KEY) in .env")

# ----------- ASSESSMENT CLUSTERING -----------

# Maps raw assessment method names (lowercased, stripped) → cluster label.
# Any unrecognised name falls back to "Other".
ASSESSMENT_CLUSTER_MAP: dict[str, str] = {
    # ── Exam ──────────────────────────────────────────────────────────────────
    "written exam":                             "Exam",
    "written examination":                      "Exam",
    "unseen examination":                       "Exam",
    "unseen written examination":               "Exam",
    "online examination":                       "Exam",
    "online exam":                              "Exam",
    "in-class test":                            "Exam",
    "in class test":                            "Exam",
    "timed in-class test":                      "Exam",
    "timed in class test":                      "Exam",
    "take-home exam":                           "Exam",
    "take home exam":                           "Exam",
    "open book examination":                    "Exam",
    "open book exam":                           "Exam",
    "multiple choice exam":                     "Exam",
    "multiple choice examination":              "Exam",
    "examination":                              "Exam",
    # ── Coursework ────────────────────────────────────────────────────────────
    "written assignment (inc essay)":           "Coursework",
    "written assignment":                       "Coursework",
    "essay":                                    "Coursework",
    "written essay":                            "Coursework",
    "report":                                   "Coursework",
    "written report":                           "Coursework",
    "coursework":                               "Coursework",
    "assignment":                               "Coursework",
    "problem sheet":                            "Coursework",
    "problem set":                              "Coursework",
    "homework":                                 "Coursework",
    "class test":                               "Coursework",
    # ── Project ───────────────────────────────────────────────────────────────
    "project output (not dissertation/thesis)": "Project",
    "project output":                           "Project",
    "project":                                  "Project",
    "group project":                            "Project",
    "individual project":                       "Project",
    "team project":                             "Project",
    "dissertation":                             "Project",
    "thesis":                                   "Project",
    "research project":                         "Project",
    "design project":                           "Project",
    "capstone project":                         "Project",
    # ── Practical ─────────────────────────────────────────────────────────────
    "practical skills assessment":              "Practical",
    "practical":                                "Practical",
    "laboratory report":                        "Practical",
    "lab report":                               "Practical",
    "lab work":                                 "Practical",
    "laboratory work":                          "Practical",
    "skills demonstration":                     "Practical",
    "demonstration":                            "Practical",
    "fieldwork":                                "Practical",
    "field work":                               "Practical",
    # ── Presentation ──────────────────────────────────────────────────────────
    "oral assessment/presentation":             "Presentation",
    "oral assessment":                          "Presentation",
    "oral examination":                         "Presentation",
    "oral exam":                                "Presentation",
    "presentation":                             "Presentation",
    "seminar performance":                      "Presentation",
    "seminar":                                  "Presentation",
    "viva":                                     "Presentation",
    "viva voce":                                "Presentation",
    "poster presentation":                      "Presentation",
    "verbal discussion":                        "Presentation",
    # ── Coursework (additional forms) ─────────────────────────────────────────
    "set exercise":                             "Coursework",
    "assessment task":                          "Coursework",
    "portfolio":                                "Coursework",
    # ── Project (abbreviated UoM form) ────────────────────────────────────────
    "project output (not diss/n)":              "Project",
    # ── Other (study-hour labels that occasionally appear in assessment rows) ─
    "lectures":                                 "Other",
    "tutorials":                                "Other",
}


def normalize_assessment_type(raw_name: str) -> str:
    """Return the cluster label for a raw assessment method name."""
    key = raw_name.strip().lower()
    # exact match first
    if key in ASSESSMENT_CLUSTER_MAP:
        return ASSESSMENT_CLUSTER_MAP[key]
    # substring match — pick the first mapping whose key appears in the raw name
    for pattern, cluster in ASSESSMENT_CLUSTER_MAP.items():
        if pattern in key:
            return cluster
    return "Other"


# ----------- PROGRAM-LEVEL STATE -----------

course_title = ""
course_code = ""

firstyrfy: list[str] = []
firstyrs1comp: list[str] = []
firstyrs1op: list[str] = []
firstyrs2comp: list[str] = []
firstyrs2op: list[str] = []

secondyrfy: list[str] = []
secondyrs1comp: list[str] = []
secondyrs1op: list[str] = []
secondyrs2comp: list[str] = []
secondyrs2op: list[str] = []

thirdyrfy: list[str] = []
thirdyrs1comp: list[str] = []
thirdyrs1op: list[str] = []
thirdyrs2comp: list[str] = []
thirdyrs2op: list[str] = []


# ----------- SCRAPING -----------

def get_course_unit_links(main_url: str) -> list[dict]:
    global course_title, course_code
    response = requests.get(main_url, headers=HEADERS)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    course_title = soup.find("h1").text.strip() if soup.find("h1") else None

    # UCAS course code
    code_span = soup.find("span", string=lambda t: t and "UCAS course code" in t)
    if code_span is None:
        for span in soup.find_all("span"):
            if "UCAS course code" in span.get_text():
                code_span = span
                break
    if code_span:
        strongs = code_span.find_all("strong")
        if strongs:
            course_code = strongs[0].text.strip()
            print(f"UCAS code: {course_code}")

    # Extract entry year from the URL (e.g. /courses/2025/...) for the unit detail endpoint
    year_match = re.search(r"/courses/(\d{4})/", main_url)
    entry_year = year_match.group(1) if year_match else "2025"

    # Prefer year+1 for the unit detail endpoint (Manchester publishes next-year
    # data under the incremented year path).  scrape_unit_details will fall back
    # to entry_year if the incremented year returns 404.
    detail_year = str(int(entry_year) + 1)

    units = []
    for row in soup.select("table.course-units tbody tr"):
        cols = row.find_all("td")
        if len(cols) == 4:
            # The course-details page uses <button class="open-unit-details">
            # with data-contentid holding the unit code.
            btn = cols[0].find("button", class_="open-unit-details")
            if btn:
                unit_code = btn.get("data-contentid") or cols[1].text.strip()
                detail_url = (
                    f"https://assets-dev.manchester.ac.uk/cpip/phase-2/ug"
                    f"/{detail_year}/unit/?unitcode={unit_code}"
                )
                units.append({
                    "title":     btn.text.strip(),
                    "code":      unit_code,
                    "url":       detail_url,
                    "credits":   cols[2].text.strip(),
                    "mandatory": cols[3].text.strip(),
                })
    return units


def parse_percentage(value: str) -> float | None:
    try:
        return float(value.strip("%")) / 100
    except (ValueError, AttributeError):
        return None


def _bucket_program_lists(data: dict) -> None:
    """Append the course code to the correct program year/semester lists."""
    global firstyrfy, firstyrs1comp, firstyrs1op, firstyrs2comp, firstyrs2op
    global secondyrfy, secondyrs1comp, secondyrs1op, secondyrs2comp, secondyrs2op
    global thirdyrfy, thirdyrs1comp, thirdyrs1op, thirdyrs2comp, thirdyrs2op

    level    = str(data.get("level", ""))
    semester = data.get("semester", "")
    mand     = data.get("mandatory", "") == "Mandatory"
    code     = data["code"]

    if level == "1":
        if   semester == "Full year":   firstyrfy.append(code)
        elif semester == "Semester 1":  (firstyrs1comp if mand else firstyrs1op).append(code)
        elif semester == "Semester 2":  (firstyrs2comp if mand else firstyrs2op).append(code)
    elif level == "2":
        if   semester == "Full year":   secondyrfy.append(code)
        elif semester == "Semester 1":  (secondyrs1comp if mand else secondyrs1op).append(code)
        elif semester == "Semester 2":  (secondyrs2comp if mand else secondyrs2op).append(code)
    elif level == "3":
        if   semester == "Full year":   thirdyrfy.append(code)
        elif semester == "Semester 1":  (thirdyrs1comp if mand else thirdyrs1op).append(code)
        elif semester == "Semester 2":  (thirdyrs2comp if mand else thirdyrs2op).append(code)


def scrape_unit_details(unit_url: str, unit_mandatory: str) -> dict:
    """
    Scrape a single course unit page and return a dict with:
      - core fields (code, level, semester, credits, …)
      - assessment_data: list of {course_code, type, weight}  ← clustered type, no FK
      - prerequisites_list, corequisites_list
    """
    # unit_url uses year+1 by default; fall back to year and year-1 on 404.
    response = requests.get(unit_url, headers=HEADERS)
    if response.status_code != 200:
        fallback_url = re.sub(r"/ug/(\d{4})/", lambda m: f"/ug/{int(m.group(1)) - 1}/", unit_url)
        response = requests.get(fallback_url, headers=HEADERS)
        if response.status_code != 200:
            print(f"  ⚠️  Skipping {unit_url} — HTTP {response.status_code} (both years tried)")
            return {}

    soup = BeautifulSoup(response.content.decode("utf-8"), "html.parser")
    data: dict = {"mandatory": unit_mandatory}

    # ── Fact-file table (code, level, semester, faculty, …) ──────────────────
    fact_table = soup.select_one("table.course-unit-fact-file")
    if fact_table:
        for row in fact_table.select("tr"):
            th = row.find("th")
            td = row.find("td")
            if not th or not td:
                continue
            key   = th.text.strip()
            value = td.text.strip()

            if key == "Unit code":
                data["code"] = value
            elif key == "Credit rating":
                try:
                    data["credits"] = int(value)
                except ValueError:
                    pass
            elif key == "Offered by":
                data["faculty"] = value
            elif key == "Teaching period(s)":
                data["semester"] = value
            elif key == "Available as a free choice unit?":
                data["freechoice"] = value == "Yes"
            elif key == "Unit level":
                lvl = value.removeprefix("Level ").strip()
                data["level"] = lvl

    print(f"  → {data.get('code')} | level {data.get('level')} | {data.get('semester')}")

    # ── Overview description ──────────────────────────────────────────────────
    # The fragment uses <h2> (not <h3>) for section headings.
    overview = soup.find("h2", string="Overview")
    if overview:
        desc_div = overview.find_next("div", class_="text")
        if desc_div:
            data["description"] = desc_div.get_text(separator=" ").strip()
        else:
            # Fallback: grab the next sibling paragraph/div if no .text div
            nxt = overview.find_next_sibling()
            data["description"] = nxt.get_text(separator=" ").strip() if nxt else ""

    # ── Assessment methods → clustered course_assessments rows ────────────────
    assessment_data: list[dict] = []
    assessment_heading = soup.find("h2", id="assessment-methods-desc")
    if assessment_heading:
        table = assessment_heading.find_next("table")
        if table:
            for row in table.select("tr"):
                cells = row.find_all("td")
                if len(cells) < 2:
                    continue
                raw_method = cells[0].text.strip()
                raw_weight = cells[1].text.strip()
                if not raw_method or not raw_weight:
                    continue
                clustered_type = normalize_assessment_type(raw_method)
                weight = parse_percentage(raw_weight)
                if weight is None:
                    continue
                # Merge rows that share the same cluster (e.g. two "Exam" entries
                # on the same page should sum their weights rather than duplicate)
                existing = next((r for r in assessment_data if r["type"] == clustered_type), None)
                if existing:
                    existing["weight"] = round(existing["weight"] + weight, 4)
                else:
                    assessment_data.append({
                        "course_code": data.get("code", ""),
                        "type":        clustered_type,
                        "weight":      weight,
                    })

    # Fallback: if the page has no assessment table, mark as 100% Other
    if not assessment_data:
        assessment_data.append({
            "course_code": data.get("code", ""),
            "type":        "Other",
            "weight":      1.0,
        })

    data["assessment_data"] = assessment_data

    # ── Prerequisites / corequisites ──────────────────────────────────────────
    req_heading = soup.find("h2", id="requirements-desc")
    if req_heading:
        table = req_heading.find_next("table")
        if table:
            prerequisites: list[str] = []
            corequisites:  list[str] = []
            for row in table.select("tbody tr"):
                cells = row.find_all("td")
                if len(cells) >= 3:
                    unit_code = cells[1].text.strip()
                    req_type  = cells[2].text.strip()
                    if req_type == "Pre-Requisite":
                        prerequisites.append(unit_code)
                    elif req_type == "Co-Requisite":
                        corequisites.append(unit_code)
            if prerequisites:
                data["prerequisites_list"] = ",".join(prerequisites)
            if corequisites:
                data["corequisites_list"] = ",".join(corequisites)

    # ── Bucket into program year/semester lists ───────────────────────────────
    _bucket_program_lists(data)

    return data


# ----------- SUPABASE HELPERS -----------

def insert_to_supabase(record, table: str, conflict_column: str | None = None) -> bool:
    """Upsert or insert a record. Returns True on success, False on failure."""
    if not supabase:
        return False
    try:
        if conflict_column:
            supabase.table(table).upsert(record, on_conflict=conflict_column).execute()
        else:
            supabase.table(table).insert(record).execute()
        return True
    except Exception as exc:
        print(f"  ❌ DB error on table '{table}': {exc}")
        return False


def compute_required_by(units: list[dict]) -> list[dict]:
    code_to_unit = {u["code"]: u for u in units}
    for u in units:
        u["required_by"] = []

    for unit in units:
        code = unit["code"]
        for other in units:
            if other["code"] == code:
                continue
            prereqs = [x.strip() for x in (other.get("prerequisites_list") or "").split(",") if x.strip()]
            coreqs  = [x.strip() for x in (other.get("corequisites_list")  or "").split(",") if x.strip()]
            if code in prereqs or code in coreqs:
                code_to_unit[code]["required_by"].append(other["code"])

    for unit in units:
        unit["required_by"] = ",".join(unit["required_by"]) or None

    return units


# ----------- MAIN -----------

def main() -> None:
    print(f"Fetching course unit links from:\n  {BASE_PAGE}\n")
    units = get_course_unit_links(BASE_PAGE)
    print(f"Found {len(units)} course units.\n")

    compiled_units: list[dict] = []

    for unit in units:
        print(f"Scraping {unit['code']} — {unit['title']} …")
        try:
            details = scrape_unit_details(unit["url"], unit["mandatory"])
        except Exception:
            traceback.print_exc()
            print(f"  ⚠️  Failed — skipping.\n")
            continue

        if not details:
            print(f"  ⚠️  No details returned — skipping.\n")
            continue

        unit.update(details)
        compiled_units.append(unit)

    compiled_units = compute_required_by(compiled_units)

    # ── Credits per year (sum of all units at each level) ─────────────────────
    credits_by_level: dict[str, int] = {}
    for u in compiled_units:
        lvl = str(u.get("level", "")).strip()
        credits_by_level[lvl] = credits_by_level.get(lvl, 0) + (u.get("credits") or 0)

    # ── Upsert program record ──────────────────────────────────────────────────
    program_record = {
        "program_id":    course_code,
        "title":         course_title,

        "credits_year1": credits_by_level.get("1", 0),
        "credits_year2": credits_by_level.get("2", 0),
        "credits_year3": credits_by_level.get("3", 0),

        "firstyrfy":      firstyrfy,
        "firstyrs1comp":  firstyrs1comp,
        "firstyrs1op":    firstyrs1op,
        "firstyrs2comp":  firstyrs2comp,
        "firstyrs2op":    firstyrs2op,

        "secondyrfy":     secondyrfy,
        "secondyrs1comp": secondyrs1comp,
        "secondyrs1op":   secondyrs1op,
        "secondyrs2comp": secondyrs2comp,
        "secondyrs2op":   secondyrs2op,

        "thirdyrfy":      thirdyrfy,
        "thirdyrs1comp":  thirdyrs1comp,
        "thirdyrs1op":    thirdyrs1op,
        "thirdyrs2comp":  thirdyrs2comp,
        "thirdyrs2op":    thirdyrs2op,
    }

    # Dynamic table names — scoped to this program so multiple programs can
    # be scraped into the same database without row collisions.
    tbl_courses     = f"{course_code}_courses"       # e.g. GG14_courses
    tbl_assessments = f"{course_code}_assessments"   # e.g. GG14_assessments
    # ── Collect assessments and course records (always, for CSV + DB) ───────────
    COURSE_COLS = {
        "code", "title", "credits", "level", "semester", "faculty",
        "freechoice", "description", "prerequisites_list", "corequisites_list",
        "required_by", "url",
    }

    all_assessments: list[dict] = []
    course_records: list[dict] = []

    for record in compiled_units:
        all_assessments.extend(record.get("assessment_data", []))
        course_records.append({k: v for k, v in record.items() if k in COURSE_COLS})

    # ── DB writes (skipped when no Supabase client) ──────────────────────────
    if not supabase:
        print("\n⚠️  Skipping all DB writes — no Supabase client.")
    else:
        print(f"\nUpserting program: {course_code} — {course_title}")
        insert_to_supabase(program_record, "programs", conflict_column="program_id")

        course_ok = course_fail = 0
        print(f"\nUpserting {len(course_records)} courses → '{tbl_courses}' …")
        for cr, record in zip(course_records, compiled_units):
            ok = insert_to_supabase(cr, "courses", conflict_column="code")
            if ok:
                course_ok += 1
            else:
                course_fail += 1

            insert_to_supabase(
                {"course_code": record["code"], "program_id": course_code},
                tbl_courses,
                conflict_column="course_code",
            )

        print(f"  ✅ {course_ok} upserted, ❌ {course_fail} failed")

        # ── Upsert assessments ─────────────────────────────────────────────────
        codes = list({r["course_code"] for r in all_assessments})
        if codes:
            try:
                supabase.table(tbl_assessments).delete().in_(
                    "course_code", codes
                ).execute()
            except Exception as exc:
                print(f"  ❌ Could not clear old assessment rows: {exc}")

        assess_ok = assess_fail = 0
        print(f"\nInserting {len(all_assessments)} assessment rows → '{tbl_assessments}' …")
        for row in all_assessments:
            if insert_to_supabase(row, tbl_assessments):
                assess_ok += 1
            else:
                assess_fail += 1
        print(f"  ✅ {assess_ok} inserted, ❌ {assess_fail} failed")

    # ── Save CSV for local inspection ─────────────────────────────────────────
    df_courses = pd.DataFrame([
        {k: v for k, v in u.items() if k not in ("assessment_data",)}
        for u in compiled_units
    ])
    csv_courses     = f"{course_code}_courses.csv"
    csv_assessments = f"{course_code}_assessments.csv"
    df_courses.to_csv(csv_courses, index=False)

    df_assessments = pd.DataFrame(all_assessments)
    df_assessments.to_csv(csv_assessments, index=False)

    print(
        f"\n✅ Done. {len(compiled_units)} courses scraped.\n"
        f"   credits — Y1: {credits_by_level.get('1',0)}  "
        f"Y2: {credits_by_level.get('2',0)}  "
        f"Y3: {credits_by_level.get('3',0)}\n"
        f"   {len(all_assessments)} assessment rows (types: "
        f"{sorted(df_assessments['type'].unique()) if not df_assessments.empty else '—'}).\n"
        f"   CSVs: {csv_courses}, {csv_assessments}"
    )

    # Invalidate server-side cache
    home = os.getenv("APP_HOME_URL", "")
    if home:
        try:
            requests.put(home.rstrip("/") + "/api/courses", timeout=3)
            print("   Cache invalidated.")
        except Exception:
            pass


if __name__ == "__main__":
    main()
