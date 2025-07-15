import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import pandas as pd
import os

# Uncomment these lines if you want to use Supabase
from supabase import create_client, Client

# ----------- CONFIG -----------

BASE_PAGE = "https://www.manchester.ac.uk/study/undergraduate/courses/2025/00560/bsc-computer-science/course-details/"
HEADERS = {"User-Agent": "Mozilla/5.0"}

# Supabase credentials from env variables (optional)
SUPABASE_URL = "https://lzrehbppjccwviclovpn.supabase.co"  # e.g. "https://your-project.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6cmVoYnBwamNjd3ZpY2xvdnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDM5NTYsImV4cCI6MjA2NTkxOTk1Nn0.qwck8XV1Pf04GWN0RFPdG80tO1aDccfciScO0bKoZ5M" # service role key

# Uncomment to initialize supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# ----------- FUNCTIONS -----------

def get_course_unit_links(main_url):
    response = requests.get(main_url, headers=HEADERS)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    units = []
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


def scrape_unit_details(unit_url):
    response = requests.get(unit_url + "#course-unit-details", headers=HEADERS)
    if response.status_code != 200:
            print(f"⚠️ Skipping {unit_url} — status {response.status_code}")
            return {}
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    data = {}

    # Course facts
    fact_table = soup.select_one("table.course-unit-fact-file")
    if fact_table:
        for row in fact_table.select("tr"):
            th = row.find("th")
            td = row.find("td")

            key = th.text
            value = td.text
            if key == ("Unit code"):
                continue
            elif key == ("Unit level"):
                print(value)
                if value.startswith("Level "):
                    value = value[len("Level "):].strip()
                    data[key] = value
                    print(value)
            elif key and value:
                data[key.strip()] = value.strip()

    # Description (Overview)
    desc_heading = soup.find("h3", string="Overview")
    if desc_heading:
        desc_text = desc_heading.find_next("div", class_="text")
        data["description"] = desc_text.get_text(separator=" ").strip() if desc_text else ""

    # Assessment methods
    assessment_heading = soup.find("h3", id="assessment-methods-desc")
    if assessment_heading:
        table = assessment_heading.find_next("table")
        if table:
            for row in table.select("tbody tr"):
                method = row.select_one("td:nth-child(1)").text.strip()
                weight = row.select_one("td:nth-child(2)").text.strip()
                percent = parse_percentage(weight)
                key = f"assessment_{method.lower().replace(' ', '_')}"
                data[key] = percent

    # Teaching hours
    teaching_hours_heading = soup.find("h3", string=lambda s: s and "Study hours" in s)
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
                key = f"scheduled_{activity.lower().replace(' ', '_')}"
                data[key] = round(hours, 0)
                print(round(hours, 0))

            # Independent hours
            for row in tables[1].select("tr")[1:]:
                activity = row.select_one("td:nth-child(1)").text.strip()
                hours = int(row.select_one("td:nth-child(2)").text.strip()) /12
                key = f"independent_{activity.lower().replace(' ', '_')}"
                data[key] = round(hours, 0)
                print(hours)

    return data

def insert_to_supabase(record):
#     Uncomment and use if supabase is configured
    if not supabase:
        print("Supabase client not configured.")
        return
    response = supabase.table("courses").insert(record).execute()
    if response.error:
        print("❌ Supabase insert failed:", response.error)
    else:
        print("✅ Inserted:", record.get("code"), "-", record.get("title"))

# ----------- MAIN SCRIPT -----------

def main():
    print("Fetching course unit links...")
    units = get_course_unit_links(BASE_PAGE)

    compiled_units = []
    all_keys = set()

    for unit in units:
        print(f"Scraping details for {unit['code']} - {unit['title']} ...")
        try:
            details = scrape_unit_details(unit["url"])
        except Exception as e:
            print(f"⚠️ Failed to scrape {unit['code']} - {unit['title']}: {e}")
            details = {}
        unit.update(details)
        compiled_units.append(unit)
        all_keys.update(unit.keys())

    # Define CSV column order: core fields + dynamic fields sorted
    core_cols = ["code", "title", "credits", "mandatory", "url", "description"]
    dynamic_cols = sorted(k for k in all_keys if k not in core_cols)
    columns = core_cols + dynamic_cols

    # Save compiled CSV
    df = pd.DataFrame(compiled_units, columns=columns)
    df.to_csv("manchester_compsci_units_compiled.csv", index=False)
    print("✅ Saved compiled data to manchester_compsci_units_compiled.csv")

    # Insert into Supabase (optional)
    for record in compiled_units:
        insert_to_supabase(record)

if __name__ == "__main__":
    main()
