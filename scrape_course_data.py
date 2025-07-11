import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_PAGE = "https://www.manchester.ac.uk/study/undergraduate/courses/2025/00560/bsc-computer-science/course-details/"

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

def get_course_unit_links(main_url):
    response = requests.get(main_url, headers=HEADERS)
    soup = BeautifulSoup(response.text, "html.parser")

    course_units = []
    for row in soup.select("table.course-units tbody tr"):
        columns = row.find_all("td")
        if len(columns) == 4:
            title_tag = columns[0].find("a")
            link = title_tag.get("href")
            full_link = urljoin(main_url, link.split('#')[0])  # Drop the fragment
            course_units.append({
                "title": title_tag.text.strip(),
                "url": full_link,
                "code": columns[1].text.strip(),
                "credits": columns[2].text.strip(),
                "mandatory": columns[3].text.strip()
            })
    return course_units

def scrape_unit_details(unit_url):
    response = requests.get(unit_url + "#course-unit-details", headers=HEADERS)
    soup = BeautifulSoup(response.text, "html.parser")

    data = {}

    # Get facts
    fact_table = soup.select_one("table.course-unit-fact-file")
    if fact_table:
        for row in fact_table.select("tr"):
            th = row.find("th").text.strip()
            td = row.find("td").text.strip()
            data[th] = td

    # Description
    desc_heading = soup.find("h3", string="Overview")
    if desc_heading:
        desc_text = desc_heading.find_next("div", class_="text")
        data["Description"] = desc_text.get_text(separator=" ").strip() if desc_text else ""

    # Assessment
    assessment_heading = soup.find("h3", id="assessment-methods-desc")
    if assessment_heading:
        table = assessment_heading.find_next("table")
        if table:
            for row in table.select("tbody tr"):
                method = row.select_one("td:nth-child(1)").text.strip()
                weight = row.select_one("td:nth-child(2)").text.strip()
                data[f"Assessment - {method}"] = weight

    # Teaching hours
    tables = soup.select("h3:contains('Study hours') + table")
    if len(tables) >= 2:
        # Scheduled
        for row in tables[0].select("tr")[1:]:
            activity = row.select_one("td:nth-child(1)").text.strip()
            hours = row.select_one("td:nth-child(2)").text.strip()
            data[f"Scheduled - {activity}"] = hours
        # Independent
        for row in tables[1].select("tr")[1:]:
            activity = row.select_one("td:nth-child(1)").text.strip()
            hours = row.select_one("td:nth-child(2)").text.strip()
            data[f"Independent - {activity}"] = hours

    return data

# ---- RUN SCRIPT ----

main_url = BASE_PAGE  # main course detail page
units = get_course_unit_links(main_url)

all_data = []
for unit in units:
    print(f"Scraping {unit['code']} - {unit['title']} ...")
    details = scrape_unit_details(unit["url"])
    unit.update(details)
    all_data.append(unit)

# Display or save to CSV
import pandas as pd
df = pd.DataFrame(all_data)
df.to_csv("manchester_compsci_course_units.csv", index=False)
print("✅ Saved to manchester_compsci_course_units.csv")
