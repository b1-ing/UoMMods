import traceback
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import pandas as pd
import os
from dotenv import load_dotenv
import string
# Uncomment these lines if you want to use Supabase
from supabase import create_client, Client

# ----------- CONFIG -----------

load_dotenv("uommods/.env")
BASE_PAGE = "https://www.manchester.ac.uk/study/undergraduate/courses/2025/00558/bsc-computer-science-and-mathematics/course-details/"
HEADERS = {"User-Agent": "Mozilla/5.0"}

# Supabase credentials from env variables (optional)
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") # e.g. "https://your-project.supabase.co"
SUPABASE_KEY =  os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") # service role key

# Uncomment to initialize supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# ----------- FUNCTIONS -----------


# Credit totals for each year
y1sem1cred = 0
y1sem2cred = 0
y1yearcred = 0

y2sem1cred = 0
y2sem2cred = 0
y2yearcred = 0

y3sem1cred = 0
y3sem2cred = 0
y3yearcred = 0


# Declare all global course arrays
firstyrfy = []
firstyrs1comp = []
firstyrs1op = []
firstyrs2comp = []
firstyrs2op = []

secondyrfy = []
secondyrs1comp = []
secondyrs1op = []
secondyrs2comp = []
secondyrs2op = []

thirdyrfy = []
thirdyrs1comp = []
thirdyrs1op = []
thirdyrs2comp = []
thirdyrs2op = []


course_title=""
course_code=""
course_duration=""


def get_course_unit_links(main_url):
    global course_title,course_code, course_duration
    response = requests.get(main_url, headers=HEADERS)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    units = []

    course_title = soup.find("h1").text.strip() if soup.find("h1") else None

    # Duration
    course_duration = soup.find("li", string=lambda t: t and "Duration" in t)
    if not course_duration:
        course_duration = soup.select_one("li:has(strong:contains('years'))")
    course_duration = course_duration.find("strong").text.strip() if course_duration else None

    # UCAS course code
    code_span = soup.find("span", string=lambda t: t and "UCAS course code" in t)
    if code_span is None:
        # try searching for span that contains this text within children
        for span in soup.find_all("span"):
            if "UCAS course code" in span.get_text():
                code_span = span
                break

    if code_span:
        strongs = code_span.find_all("strong")
        if strongs:
            course_code = strongs[0].text.strip()
            print("UCAS code:", course_code)
        else:
            print("No <strong> tag found.")
    else:
        print("UCAS span not found.")


    for row in soup.select("table.course-units tbody tr"):
        cols = row.find_all("td")
        if len(cols) == 4:
            title_tag = cols[0].find("a")
            if title_tag and title_tag.get("href"):
                url = urljoin(main_url, title_tag.get("href").split('#')[0])

                units.append({
                    "title": title_tag.text.strip(),
                    "code": cols[1].text.strip(),
                    "url": url,
                    "credits": cols[2].text.strip(),
                    "mandatory": cols[3].text.strip(),
                })
    return units


def parse_percentage(value: str) -> float:
    """Converts '20%' to 0.2. Returns None if invalid."""
    try:
        return float(value.strip('%')) / 100
    except (ValueError, AttributeError):
        return None


def ensure_assessment_type(name: str):


    # Check if the assessment type already exists
    existing = supabase.table("assessment_types").select("id").eq("name", name).execute()
    if existing.data:
        return existing.data[0]["id"]
    elif name == "":
        result = supabase.table("assessment_types").insert({"name": "No assessment"}).execute()
        return result.data[0]["id"]
    else:
        # Insert the new name if it doesn't exist
        result = supabase.table("assessment_types").insert({"name": name}).execute()
        return result.data[0]["id"]

def ensure_schedule_type(name: str):
    # Check if the assessment type already exists
    existing = supabase.table("schedule_types").select("id").eq("name", name).execute()
    if existing.data:
        return existing.data[0]["id"]
    elif name == "":
        result = supabase.table("schedule_types").insert({"name": "No schedule"}).execute()
        return result.data[0]["id"]
    else:
        # Insert the new name if it doesn't exist
        result = supabase.table("schedule_types").insert({"name": name}).execute()
        return result.data[0]["id"]

def scrape_unit_details(unit_url, unit_mandatory):
    global firstyrfy, firstyrs1comp, firstyrs1op, firstyrs2comp, firstyrs2op
    global secondyrfy, secondyrs1comp, secondyrs1op, secondyrs2comp, secondyrs2op
    global thirdyrfy, thirdyrs1comp, thirdyrs1op, thirdyrs2comp, thirdyrs2op
    global y1sem1cred, y1sem2cred, y1yearcred
    global y2sem1cred, y2sem2cred, y2yearcred
    global y3sem1cred, y3sem2cred, y3yearcred
    response = requests.get(unit_url + "#course-unit-details", headers=HEADERS)
    if response.status_code != 200:
            print(f"⚠️ Skipping {unit_url} — status {response.status_code}")
            return {}
    response.raise_for_status()
    soup = BeautifulSoup(response.content.decode("utf-8"), "html.parser", )

    data = {"mandatory": unit_mandatory}

    # Course facts
    fact_table = soup.select_one("table.course-unit-fact-file")
    if fact_table:
        for row in fact_table.select("tr"):
            th = row.find("th")
            td = row.find("td")

            key = th.text
            value = td.text
            if key == ("Unit code"):
                data["code"] = value
                continue
            elif key == "Credit rating":
                continue
            elif key == "Offered by":
                data["faculty"] = value.strip()
            elif key == "Teaching period(s)":
                data["semesters"] = value.strip()
            elif key == "Available as a free choice unit?":
                 if value == "Yes":
                     data["freechoice"] = True
                 if value == "No":
                     data["freechoice"] = False

            elif key == ("Unit level"):
                print(value)
                if value.startswith("Level "):
                    value = value[len("Level "):].strip()
                    data["level"] = value
                    print(value)
            elif key and value:
                data[key.strip()] = value.strip()
    print(data)
    if data["level"] == '1':
        if data["semesters"] == "Full year":
            if data["mandatory"] == "Mandatory":
                firstyrfy.append(data["code"])
        if data["semesters"] == "Semester 1":
            if data["mandatory"] == "Mandatory":
                firstyrs1comp.append(data["code"])
            else:
                firstyrs1op.append(data["code"])
        if data["semesters"] == "Semester 2":
            if data["mandatory"] == "Mandatory":
                firstyrs2comp.append(data["code"])
            else:
                firstyrs2op.append(data["code"])
    elif data["level"] == '2':
        if data["semesters"] == "Full year":
            if data["mandatory"] == "Mandatory":
                secondyrfy.append(data["code"])
        if data["semesters"] == "Semester 1":
            if data["mandatory"] == "Mandatory":
                secondyrs1comp.append(data["code"])
            else:
                secondyrs1op.append(data["code"])
        if data["semesters"] == "Semester 2":
            if data["mandatory"] == "Mandatory":
                secondyrs2comp.append(data["code"])
            else:
                secondyrs2op.append(data["code"])
    elif data["level"] == '3':
        if data["semesters"] == "Full year":
            if data["mandatory"] == "Mandatory":
                thirdyrfy.append(data["code"])
        if data["semesters"] == "Semester 1":
            if data["mandatory"] == "Mandatory":
                thirdyrs1comp.append(data["code"])
            else:
                thirdyrs1op.append(data["code"])
        if data["semesters"] == "Semester 2":
            if data["mandatory"] == "Mandatory":
                thirdyrs2comp.append(data["code"])
            else:
                thirdyrs2op.append(data["code"])

    credits = 0
    try:
        credits = int(unit_url.split("/")[-2].split("-")[-1])  # fallback if not found
    except:
        credits = 10  # default fallback

    # Try getting from the original `unit` dict if it's passed in
    if "credits" in data and data["credits"]:
        try:
            credits = int(data["credits"])
        except:
            pass

    if data["level"] == '1':
        if data["semesters"] == "Full year":
            y1yearcred += credits
        elif data["semesters"] == "Semester 1":
            y1sem1cred += credits
        elif data["semesters"] == "Semester 2":
            y1sem2cred += credits

    elif data["level"] == '2':
        if data["semesters"] == "Full year":
            y2yearcred += credits
        elif data["semesters"] == "Semester 1":
            y2sem1cred += credits
        elif data["semesters"] == "Semester 2":
            y2sem2cred += credits

    elif data["level"] == '3':
        if data["semesters"] == "Full year":
            y3yearcred += credits
        elif data["semesters"] == "Semester 1":
            y3sem1cred += credits
        elif data["semesters"] == "Semester 2":
            y3sem2cred += credits
    # Description (Overview)
    desc_heading = soup.find("h3", string="Overview")
    if desc_heading:
        desc_text = desc_heading.find_next("div", class_="text")
        data["description"] = desc_text.get_text(separator=" ").strip() if desc_text else ""

    # Assessment methods
    assessment_heading = soup.find("h3", id="assessment-methods-desc")
    assessment_data=[]
    if assessment_heading:
        table = assessment_heading.find_next("table")
        if table:

            for row in table.select("tbody tr"):
                method = row.select_one("td:nth-child(1)").text.strip()
                id = ensure_assessment_type(method)
                weight = row.select_one("td:nth-child(2)").text.strip()
                percent = parse_percentage(weight)
                assessment_record= {
                    "course_code": data["code"],
                    "assessment_type_id": id,
                    "percentage": percent,
                }
                assessment_data.append(assessment_record)

    else:
        assessment_record= {
                            "course_code": data["code"],
                            "assessment_type_id": 1,
                            "percentage": 1,
                        }
        assessment_data.append(assessment_record)
    print(assessment_data)
    data["assessment_data"] = assessment_data
    requirement_heading = soup.find("h3", id="requirements-desc")
    if requirement_heading:
        table = requirement_heading.find_next("table")
        if table:
            corequisites = []
            prerequisites = []
            for row in table.select("tbody tr"):
                cells = row.find_all("td")
                if len(cells) == 4:
                    unit_title = cells[0].text.strip()
                    unit_code = cells[1].text.strip()
                    req_type = cells[2].text.strip()
                    description = cells[3].text.strip()

                    if req_type == "Pre-Requisite":
                        prerequisites.append(unit_code)
                    if req_type == "Co-Requisite":
                        corequisites.append(unit_code)
        if prerequisites:
            data["prerequisites_list"] = ",".join(prerequisites) # Store full list as JSON-serializable object
        if corequisites:
            data["corequisites_list"] = ",".join(corequisites)

    # Teaching hours
    teaching_hours_heading = soup.find("h3", string=lambda s: s and "Study hours" in s)
    schedule_data=[]
    if teaching_hours_heading:
#         print(teaching_hours_heading)
        tables = teaching_hours_heading.find_next_siblings("table")
        if tables:

            # Scheduled hours
            for row in tables[0].select("tr")[1:]:
                activity = row.select_one("td:nth-child(1)").text.strip()
                hours = int(row.select_one("td:nth-child(2)").text.strip()) / 12
                if hours < 0.4:
                    continue
                id = ensure_schedule_type(activity)
                schedule_record= {
                                    "course_code": data["code"],
                                    "schedule_type_id": id,
                                    "hours": hours,
                                }
                schedule_data.append(schedule_record)


            # Independent hours
            for row in tables[1].select("tr")[1:]:
                activity = row.select_one("td:nth-child(1)").text.strip()
                hours = int(row.select_one("td:nth-child(2)").text.strip()) /12
                if hours < 0.4:
                    continue
                id = ensure_schedule_type(activity)
                schedule_record= {
                                    "course_code": data["code"],
                                    "schedule_type_id": id,
                                    "hours": hours,
                                }
                schedule_data.append(schedule_record)
        print(schedule_data)
        data["schedule_data"] = schedule_data
    return data

def insert_to_supabase(record, table, conflict_column=None):
    if not supabase:
        print("Supabase client not configured.")
        return

    if conflict_column:
        response = supabase.table(table).upsert(record, on_conflict=conflict_column).execute()
    else:
        response = supabase.table(table).insert(record).execute()





def compute_required_by(units):
    # Step 1: Index all courses by code
    code_to_unit = {unit["code"]: unit for unit in units}

    # Step 2: Add an empty required_by list to each course
    for unit in units:
        unit["required_by"] = []

    # Step 3: Loop through each course and find which others require it
    for unit in units:
        this_code = unit["code"]

        for other in units:
            if other["code"] == this_code:
                continue  # skip self

            prereqs = [x.strip() for x in (other.get("prerequisites_list") or "").split(",") if x.strip()]
            coreqs  = [x.strip() for x in (other.get("corequisites_list") or "").split(",") if x.strip()]

            if this_code in prereqs or this_code in coreqs:
                code_to_unit[this_code]["required_by"].append(other["code"])

    # Step 4: Convert lists to comma-separated strings for Supabase
    for unit in units:
        if unit["required_by"]:
            unit["required_by"] = ",".join(unit["required_by"])
        else:
            unit["required_by"] = None



    return units


# ----------- MAIN SCRIPT -----------

def main():
    print("Fetching course unit links...")
    units = get_course_unit_links(BASE_PAGE)

    compiled_units = []
    all_keys = set()

    for unit in units:
        print(f"Scraping details for {unit['code']} - {unit['title']} ...")
        try:
            details = scrape_unit_details(unit["url"], unit["mandatory"])
        except Exception as e:
            traceback.print_exc()
            print(f"⚠️ Failed to scrape {unit['code']} - {unit['title']}: {e}")
            continue  # Skip this unit entirely if an exception occurs

        if not details:
            print(f"⚠️ Skipping {unit['code']} - {unit['title']} due to missing details (likely 404).")
            continue  # Skip adding the row if 404 or details missing

        unit.update(details)
        compiled_units.append(unit)
        all_keys.update(unit.keys())


    course_data = {
    "program_id": course_code,               # e.g. "CompSci"
    "title": course_title,             # e.g. "BSc Computer Science"

    # Year 1
    "firstyrfy": firstyrfy,
    "firstyrs1comp": firstyrs1comp,
    "firstyrs1op": firstyrs1op,
    "firstyrs2comp": firstyrs2comp,
    "firstyrs2op": firstyrs2op,
    "y1yearcred": 20,
    "y1sem1cred": 40,
    "y1sem2cred": 40,

    # Year 2
    "secondyrfy": secondyrfy,
    "secondyrs1comp": secondyrs1comp,
    "secondyrs1op": secondyrs1op,
    "secondyrs2comp": secondyrs2comp,
    "secondyrs2op": secondyrs2op,
    "y2yearcred": 40,
    "y2sem1cred": 40,
    "y2sem2cred": 40,

    # Year 3
    "thirdyrfy": thirdyrfy,
    "thirdyrs1comp": thirdyrs1comp,
    "thirdyrs1op": thirdyrs1op,
    "thirdyrs2comp": thirdyrs2comp,
    "thirdyrs2op": thirdyrs2op,
    "y3yearcred": 40,
    "y3sem1cred": 40,
    "y3sem2cred": 40
    }
    print(course_data)

    insert_to_supabase(course_data, "programs", conflict_column="program_id")

    compiled_units = compute_required_by(compiled_units)

    core_cols = ["code", "title", "credits", "mandatory", "url", "description"]
    dynamic_cols = sorted(k for k in all_keys if k not in core_cols)
    columns = core_cols + dynamic_cols

# Now save to CSV or upload to Supabase

    # Save compiled CSV
    df = pd.DataFrame(compiled_units, columns=columns)
    df.to_csv("manchester_compsci_units_compiled.csv", index=False)
    print("✅ Saved compiled data to manchester_compsci_units_compiled.csv")

    # Insert into Supabase (optional)
    for record in compiled_units:
        insert_to_supabase(record, "courses", conflict_column="code")

    for record in compiled_units:
        assessment_data = record['assessment_data']
        print(assessment_data)
        insert_to_supabase(assessment_data, "course_assessments", conflict_column="course_code, assessment_type_id")
    for record in compiled_units:
        schedule_data = record['schedule_data']
        print(schedule_data)
        insert_to_supabase(schedule_data, "course_schedule", conflict_column="course_code, schedule_type_id")


    for record in compiled_units:
        insert_to_supabase({
                "course_code": record["code"],
                "program_id": course_code,
            }, "course_programs", conflict_column="course_code,program_id")

    # Invalidate server cache since we have just updated the database
    requests.put(os.getenv("APP_HOME_URL") + '/api/courses', timeout=1)

if __name__ == "__main__":
    main()
