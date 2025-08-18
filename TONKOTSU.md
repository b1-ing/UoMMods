# REPO CONTEXT
This file contains important context about this repo for [Tonkotsu](https://www.tonkotsu.ai) and helps it work faster and generate better code.

## Project Structure
This is a mixed Python/Next.js project:
- Root directory contains Python scraping scripts for University of Manchester course data
- `uommods/` contains a Next.js web application

## Commands

### Initial Setup
1. Python environment setup (for scraping scripts):
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # Unix/macOS
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Next.js setup (for web application):
   ```bash
   cd uommods
   npm install
   ```

### Build
```bash
cd uommods
npm run build
```

### Lint
```bash
cd uommods
npm run lint
```

### Tests
No test framework is currently set up in this repository.

### Dev Server
```bash
cd uommods
npm run dev
```

## Python Scripts
- `marks_scraper.py` - PDF parsing for unit statistics
- `scrape_course_data.py` - Web scraping for course data with Supabase integration

## Environment Variables
The Next.js app requires environment variables in `uommods/.env` (see `uommods/.env.template`)