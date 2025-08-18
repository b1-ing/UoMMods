# REPO CONTEXT
This file contains important context about this repo for [Tonkotsu](https://www.tonkotsu.ai) and helps it work faster and generate better code.

## Project Structure
This is a monorepo containing:
- Python scraping scripts at the root level
- Next.js web application in the `uommods/` directory

## Setup Commands

### Python Environment (Root Level)
```bash
# Create virtual environment (no specific convention in .gitignore)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Next.js Application (uommods/ directory)
```bash
cd uommods
npm install
```

## Build Commands
```bash
# Next.js application
cd uommods
npm run build
```

## Lint Commands
```bash
# Next.js application
cd uommods
npm run lint
```

## Test Commands
No test framework is currently configured in this repository.

## Dev Server Commands
```bash
# Next.js application
cd uommods
npm run dev
```