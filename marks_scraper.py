import re
import json
import csv
from pathlib import Path
from typing import List, Tuple, Dict
import PyPDF2

PDF_PATH = "67338768.pdf"  # change if needed
OUTPUT_CSV = "unit_stats_extracted.csv"
UNIT_NAME_MAP_PATH = "unit_name_map.json"  # optional: {"COMP22712": "Microcontrollers", ...}


def load_unit_name_map(path: str) -> Dict[str, str]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def infer_year_labels(tokens_before: str, count: int) -> List[str]:
    """
    Try to infer year labels like '23/24', '22/23', etc. from nearby text.
    If not enough info, default to descending academic years.
    """
    # common academic year pattern
    default = ["23/24", "22/23", "21/22", "20/21", "19/20"][:count]
    found = re.findall(r"(?:\b)(\d{2}/\d{2})(?:\b)", tokens_before)
    if len(found) >= count:
        return found[:count]
    # try to detect "curr 23/24 22/23 21/22" style
    m = re.search(r"curr\s+((?:\d{2}/\d{2}\s*){1,5})", tokens_before)
    if m:
        parts = m.group(1).strip().split()
        if len(parts) >= count:
            return parts[:count]
    return default[:count]


def parse_section(text: str, name_map: Dict[str, str]) -> List[Dict]:
    rows = []
    # Split on each unit block header; variants: "History of marks for this  unitCOMP22712: Microcontrollers"
    sections = re.split(r"History of marks for this\s+unit", text, flags=re.IGNORECASE)
    for sec in sections[1:]:
        # Extract code and name: formats vary, try a few
        header_match = re.match(r"\s*(COMP\d{5})[:\s\-–]*([^\n\r]+)?", sec)
        if not header_match:
            continue
        unit_code = header_match.group(1).strip()
        raw_name = (header_match.group(2) or "").strip()
        # clean truncated names heuristically (e.g., cut at double spaces)
        unit_name = raw_name.split("  ")[0]
        # override if mapping provided
        if unit_code in name_map:
            unit_name = name_map[unit_code]

        # Locate the block where Means and Ns appear: often "Mean ..." and later "N ..."
        # Grab a sliding window of text to search for those lines
        # We'll allow the possibility of mean/N with variable counts
        # First find all "Mean" occurrences with sequences of numbers
        mean_matches = list(re.finditer(r"Mean\s+((?:\d+\.\d+|\d+)(?:\s+(?:\d+\.\d+|\d+))*)", sec))
        n_matches = list(re.finditer(r"\bN\s+((?:\d+)(?:\s+\d+)*)", sec))
        if not mean_matches or not n_matches:
            continue  # can't parse this unit

        # Heuristic: pair the earliest mean with the earliest N that comes after it
        for mean_m in mean_matches:
            means = mean_m.group(1).strip().split()
            # Look ahead in a window for the closest N-match after this mean
            paired_n = None
            for n_m in n_matches:
                if n_m.start() > mean_m.end():
                    paired_n = n_m
                    break
            if not paired_n:
                continue
            ns = paired_n.group(1).strip().split()
            # Number of years is min of len(means), len(ns)
            count = min(len(means), len(ns))
            if count == 0:
                continue
            # Try to infer year labels from text preceding the mean line
            context_before = sec[: mean_m.start()]
            years = infer_year_labels(context_before, count)
            for i in range(count):
                try:
                    mean_val = float(means[i])
                except ValueError:
                    continue
                try:
                    n_val = int(ns[i])
                except ValueError:
                    continue
                rows.append({
                    "unit_code": unit_code,
                    "unit_name": unit_name,
                    "year": years[i],
                    "mean": mean_val,
                    "N": n_val,
                })
            # break after first successful pairing for this section to avoid duplicates
            break
    return rows


def main():
    name_map = load_unit_name_map(UNIT_NAME_MAP_PATH)
    all_rows = []

    with open(PDF_PATH, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        full_text = []
        for page in reader.pages:
            txt = page.extract_text() or ""
            full_text.append(txt)
        combined = "\n".join(full_text)

    parsed = parse_section(combined, name_map)
    if not parsed:
        print("No unit data parsed. Check PDF formatting or adjust regex heuristics.")
        return

    # Write to CSV
    fieldnames = ["unit_code", "unit_name", "year", "mean", "N"]
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as csvf:
        writer = csv.DictWriter(csvf, fieldnames=fieldnames)
        writer.writeheader()
        for row in parsed:
            writer.writerow(row)

    print(f"Extracted {len(parsed)} rows. Output written to {OUTPUT_CSV}.")


if __name__ == "__main__":
    main()
